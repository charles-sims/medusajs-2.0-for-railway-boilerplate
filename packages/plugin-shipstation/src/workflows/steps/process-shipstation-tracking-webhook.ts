import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { FulfillmentDTO, IFulfillmentModuleService, Logger } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export type ShipStationTrackingWebhookData = {
  label_url?: string | null
  tracking_number?: string | null
  status_code?: string | null
  status_description?: string | null
  carrier_status_code?: string | null
  carrier_status_description?: string | null
  carrier_code?: string | null
  carrier_detail_code?: string | null
  ship_date?: string | null
  estimated_delivery_date?: string | null
  actual_delivery_date?: string | null
  exception_description?: string | null
  shipment_id?: string | null
  label_id?: string | null
  events?: {
    occurred_at?: string | null
    carrier_occurred_at?: string | null
    city_locality?: string | null
    state_province?: string | null
    postal_code?: string | null
    country_code?: string | null
    event_code?: string | null
    event_description?: string | null
    status_code?: string | null
  }[]
}

export type ShipStationTrackingWebhookInput = {
  resource_url?: string
  resource_type?: string
  data?: ShipStationTrackingWebhookData
}

type ProcessShipStationTrackingWebhookResult = {
  processed: boolean
  reason?: string
  fulfillment_id?: string
  tracking_number?: string
  status_code?: string | null
}

const TRACKING_STATUSES_WITH_SHIP_DATE = new Set(["AC", "IT", "DE", "EX", "AT"])

const parseDate = (value?: string | null): Date | undefined => {
  if (!value) {
    return undefined
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return undefined
  }

  return date
}

const latestEvent = (events?: ShipStationTrackingWebhookData["events"]) => {
  if (!events?.length) {
    return undefined
  }

  return events.reduce((latest, event) => {
    const latestTime = Date.parse(latest.occurred_at || "")
    const eventTime = Date.parse(event.occurred_at || "")

    if (Number.isNaN(eventTime)) {
      return latest
    }

    if (Number.isNaN(latestTime) || eventTime > latestTime) {
      return event
    }

    return latest
  }, events[0])
}

export const processShipStationTrackingWebhookStep = createStep<
  ShipStationTrackingWebhookInput,
  ProcessShipStationTrackingWebhookResult,
  undefined
>(
  "process-shipstation-tracking-webhook",
  async (input: ShipStationTrackingWebhookInput, { container }) => {
    const logger = container.resolve<Logger>(ContainerRegistrationKeys.LOGGER)
    const fulfillmentModule: IFulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

    const tracking = input.data

    if (input.resource_type !== "API_TRACK" || !tracking?.tracking_number) {
      return new StepResponse({
        processed: false,
        reason: "unsupported_or_missing_tracking_number"
      })
    }

    const fulfillments: FulfillmentDTO[] = []
    const pageSize = 100
    const maxPages = 10

    for (let page = 0; page < maxPages; page += 1) {
      const pageFulfillments = await fulfillmentModule.listFulfillments(
        { provider_id: ["shipstation", "shipstation_shipstation"] },
        {
          relations: ["labels"],
          take: pageSize,
          skip: page * pageSize,
        }
      )

      fulfillments.push(...pageFulfillments)

      if (pageFulfillments.length < pageSize) {
        break
      }
    }

    const fulfillment = fulfillments.find((candidate) => {
      const data = candidate.data || {}
      const metadata = candidate.metadata || {}

      return data.shipment_id === tracking.shipment_id ||
        data.label_id === tracking.label_id ||
        data.tracking_number === tracking.tracking_number ||
        metadata.shipstation_tracking_number === tracking.tracking_number ||
        candidate.labels?.some((label) => label.tracking_number === tracking.tracking_number)
    })

    if (!fulfillment) {
      logger.warn(
        `ShipStation tracking webhook did not match a fulfillment for tracking number ${tracking.tracking_number}`
      )

      return new StepResponse({
        processed: false,
        reason: "fulfillment_not_found",
        tracking_number: tracking.tracking_number
      })
    }

    const event = latestEvent(tracking.events)
    const shippedAt = fulfillment.shipped_at ||
      parseDate(tracking.ship_date) ||
      (tracking.status_code && TRACKING_STATUSES_WITH_SHIP_DATE.has(tracking.status_code) ? new Date() : undefined)
    const deliveredAt = tracking.status_code === "DE"
      ? parseDate(tracking.actual_delivery_date) || parseDate(event?.occurred_at) || new Date()
      : fulfillment.delivered_at || undefined

    const labels = fulfillment.labels || []
    const labelExists = labels.some((label) => label.tracking_number === tracking.tracking_number)
    const nextLabels = labelExists || !tracking.tracking_number
      ? labels.map((label) => ({ id: label.id }))
      : [
          ...labels.map((label) => ({ id: label.id })),
          {
            tracking_number: tracking.tracking_number,
            tracking_url: "",
            label_url: tracking.label_url || "",
          },
        ]

    await fulfillmentModule.updateFulfillment(fulfillment.id, {
      shipped_at: shippedAt,
      delivered_at: deliveredAt,
      data: {
        ...(fulfillment.data || {}),
        tracking_number: tracking.tracking_number,
        tracking_status: tracking.status_code,
        tracking_status_description: tracking.status_description,
        tracking_resource_url: input.resource_url,
        label_url: tracking.label_url,
      },
      metadata: {
        ...(fulfillment.metadata || {}),
        shipstation_tracking_number: tracking.tracking_number,
        shipstation_tracking_status: tracking.status_code,
        shipstation_tracking_status_description: tracking.status_description,
        shipstation_carrier_status_code: tracking.carrier_status_code,
        shipstation_carrier_status_description: tracking.carrier_status_description,
        shipstation_estimated_delivery_date: tracking.estimated_delivery_date,
        shipstation_actual_delivery_date: tracking.actual_delivery_date,
        shipstation_exception_description: tracking.exception_description,
        shipstation_latest_event: event,
        shipstation_tracking_resource_url: input.resource_url,
        shipstation_tracking_event_count: tracking.events?.length || 0,
        shipstation_tracking_updated_at: new Date().toISOString(),
      },
      labels: nextLabels,
    })

    return new StepResponse({
      processed: true,
      fulfillment_id: fulfillment.id,
      tracking_number: tracking.tracking_number,
      status_code: tracking.status_code
    })
  }
)

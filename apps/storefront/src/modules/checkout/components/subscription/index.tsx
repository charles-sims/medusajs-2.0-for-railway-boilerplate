"use client"

import { Button, clx, Heading, Text } from "@medusajs/ui"
import { CheckCircleSolid } from "@medusajs/icons"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import Divider from "@modules/common/components/divider"
import Input from "@modules/common/components/input"
import NativeSelect from "@modules/common/components/native-select"
import { SubscriptionInterval, updateSubscriptionData } from "@lib/data/cart"

const SubscriptionForm = ({ cart }: { cart: any }) => {
  const [interval, setInterval] = useState<SubscriptionInterval>(
    (cart?.metadata?.subscription_interval as SubscriptionInterval) ||
      SubscriptionInterval.MONTHLY
  )
  const [period, setPeriod] = useState(
    Number(cart?.metadata?.subscription_period) || 1
  )
  const [isLoading, setIsLoading] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "subscription"

  const hasData =
    cart?.metadata?.subscription_interval && cart?.metadata?.subscription_period

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)
      return params.toString()
    },
    [searchParams]
  )

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "subscription"), {
      scroll: false,
    })
  }

  const handleSkip = () => {
    router.push(pathname + "?step=delivery", { scroll: false })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      await updateSubscriptionData(interval, period)
      router.push(pathname + "?step=delivery", { scroll: false })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-calilean-bg">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none": !isOpen,
            }
          )}
        >
          Subscription
          {!isOpen && hasData && <CheckCircleSolid />}
        </Heading>
        {!isOpen && hasData && (
          <Text>
            <button
              onClick={handleEdit}
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
            >
              Edit
            </button>
          </Text>
        )}
      </div>
      <div>
        <div className={isOpen ? "block" : "hidden"}>
          <p className="text-sm text-ui-fg-subtle mb-4">
            Set up a recurring subscription for this order, or skip to make a
            one-time purchase.
          </p>
          <div className="flex flex-col gap-4">
            <NativeSelect
              placeholder="Interval"
              value={interval}
              onChange={(e) =>
                setInterval(e.target.value as SubscriptionInterval)
              }
              required
            >
              <option value={SubscriptionInterval.MONTHLY}>Monthly</option>
              <option value={SubscriptionInterval.YEARLY}>Yearly</option>
            </NativeSelect>
            <Input
              label="Period"
              name="period"
              value={period}
              onChange={(e) => setPeriod(parseInt(e.target.value) || 1)}
              required
              type="number"
            />
            <p className="text-xs text-ui-fg-muted">
              {interval === SubscriptionInterval.MONTHLY
                ? `Renews every month for ${period} month${
                    period > 1 ? "s" : ""
                  }`
                : `Renews every year for ${period} year${
                    period > 1 ? "s" : ""
                  }`}
            </p>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              size="large"
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={!interval || !period || period < 1}
            >
              Continue to delivery
            </Button>
            <Button
              size="large"
              variant="secondary"
              onClick={handleSkip}
              disabled={isLoading}
            >
              One-time purchase
            </Button>
          </div>
        </div>

        {!isOpen && hasData && (
          <div className="flex items-start gap-x-1 w-full">
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Subscription
              </Text>
              <Text className="txt-medium text-ui-fg-subtle">
                {cart.metadata.subscription_interval === "monthly"
                  ? "Monthly"
                  : "Yearly"}{" "}
                &middot; {cart.metadata.subscription_period}{" "}
                {cart.metadata.subscription_interval === "monthly"
                  ? "month"
                  : "year"}
                {Number(cart.metadata.subscription_period) > 1 ? "s" : ""}
              </Text>
            </div>
          </div>
        )}
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default SubscriptionForm

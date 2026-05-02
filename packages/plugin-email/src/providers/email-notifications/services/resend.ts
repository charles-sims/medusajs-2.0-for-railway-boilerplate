import { Logger, NotificationTypes } from '@medusajs/framework/types'
import { AbstractNotificationProviderService, MedusaError } from '@medusajs/framework/utils'
import { Resend, CreateEmailOptions } from 'resend'
import { generateEmailTemplate } from '../templates'

type InjectedDependencies = {
  logger: Logger
}

interface ResendServiceConfig {
  apiKey: string
  from: string
}

export interface ResendNotificationServiceOptions {
  api_key: string
  from: string
}

type NotificationEmailOptions = Omit<
  CreateEmailOptions,
  'to' | 'from' | 'react' | 'html' | 'attachments'
>

/**
 * Service to handle email notifications using the Resend API.
 */
export class ResendNotificationService extends AbstractNotificationProviderService {
  static identifier = "resend"
  protected config_: ResendServiceConfig
  protected logger_: Logger
  protected resend: Resend

  constructor({ logger }: InjectedDependencies, options: ResendNotificationServiceOptions) {
    super()
    this.config_ = {
      apiKey: options.api_key,
      from: options.from
    }
    this.logger_ = logger
    this.resend = new Resend(this.config_.apiKey)
  }

  static validateOptions(options: Record<any, any>) {
    if (!options.api_key) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Option `api_key` is required in the provider's options."
      )
    }
    if (!options.from) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Option `from` is required in the provider's options."
      )
    }
  }

  protected getSubject(template: string, emailOptions: NotificationEmailOptions): string {
    if (emailOptions.subject) {
      return emailOptions.subject
    }

    switch (template) {
      case 'invite-user':
        return 'You have been invited'
      case 'order-placed':
        return 'Order Confirmation'
      case 'password-reset':
        return 'Password Reset'
      case 'shipping-confirmation':
        return 'Shipping Confirmation'
      case 'refund-confirmation':
        return 'Refund Confirmation'
      case 'abandoned-cart':
        return 'You left something in your cart'
      default:
        return 'New Notification'
    }
  }

  async send(
    notification: NotificationTypes.ProviderSendNotificationDTO
  ): Promise<NotificationTypes.ProviderSendNotificationResultsDTO> {
    if (!notification) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `No notification information provided`)
    }
    if (notification.channel === 'sms') {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `SMS notification not supported`)
    }

    let html: string
    try {
      html = generateEmailTemplate(notification.template, notification.data)
    } catch (error) {
      if (error instanceof MedusaError) throw error
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to generate email template "${notification.template}": ${error instanceof Error ? error.message : String(error)}`
      )
    }

    const emailOptions = (notification.data?.emailOptions ?? {}) as NotificationEmailOptions

    const message: CreateEmailOptions = {
      to: notification.to,
      from: notification.from?.trim() ?? this.config_.from,
      html,
      subject: this.getSubject(notification.template, emailOptions),
      headers: emailOptions.headers,
      replyTo: emailOptions.replyTo,
      cc: emailOptions.cc,
      bcc: emailOptions.bcc,
      tags: emailOptions.tags,
      text: emailOptions.text,
      attachments: Array.isArray(notification.attachments)
        ? notification.attachments.map((attachment) => ({
            content: attachment.content,
            filename: attachment.filename,
            content_type: attachment.content_type,
            disposition: attachment.disposition ?? 'attachment',
            id: attachment.id ?? undefined
          }))
        : undefined,
      scheduledAt: emailOptions.scheduledAt
    }

    try {
      const { data, error } = await this.resend.emails.send(message)
      if (error) {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          `Failed to send "${notification.template}" email to ${notification.to} via Resend: ${error.name} - ${error.message}`
        )
      }
      this.logger_.log(
        `Successfully sent "${notification.template}" email to ${notification.to} via Resend (id: ${data?.id})`
      )
      return { id: data?.id }
    } catch (error) {
      if (error instanceof MedusaError) throw error
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to send "${notification.template}" email to ${notification.to} via Resend: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
}

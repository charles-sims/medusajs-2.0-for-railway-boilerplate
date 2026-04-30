import { SubscriberArgs, type SubscriberConfig } from "@medusajs/medusa"
import { Modules } from "@medusajs/framework/utils"

export default async function resetPasswordTokenHandler({
  event: { data: { entity_id: email, token, actor_type } },
  container,
}: SubscriberArgs<{ entity_id: string; token: string; actor_type: string }>) {
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)

  // Determine URL prefix based on actor type
  const urlPrefix =
    actor_type === "customer"
      ? process.env.NEXT_PUBLIC_BASE_URL || "https://calilean.com"
      : process.env.MEDUSA_ADMIN_URL || "http://localhost:9000/app"

  await notificationModuleService.createNotifications({
    to: email,
    channel: "email",
    template: "password-reset",
    data: {
      reset_url: `${urlPrefix}/reset-password?token=${token}&email=${email}`,
      email,
      emailOptions: { subject: "Reset your CaliLean password" },
    },
  })
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
}

import { model } from "@medusajs/framework/utils"

const Dispute = model.define("dispute", {
  id: model.id().primaryKey(),
  status: model.enum(["open", "under_review", "won", "lost"]).default("open"),
  reason: model.text(),
  amount: model.bigNumber(),
  currency_code: model.text(),
  provider_dispute_id: model.text(),
  payment_provider: model.text(),
  evidence_submitted: model.boolean().default(false),
  resolved_at: model.dateTime().nullable(),
  metadata: model.json().nullable(),
})

export default Dispute

import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260503074032 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "dispute" ("id" text not null, "status" text check ("status" in ('open', 'under_review', 'won', 'lost')) not null default 'open', "reason" text not null, "amount" numeric not null, "currency_code" text not null, "provider_dispute_id" text not null, "payment_provider" text not null, "evidence_submitted" boolean not null default false, "resolved_at" timestamptz null, "metadata" jsonb null, "raw_amount" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "dispute_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_dispute_deleted_at" ON "dispute" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "dispute" cascade;`);
  }

}

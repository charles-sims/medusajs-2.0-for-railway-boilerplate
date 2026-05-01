import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260430233000 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      create table if not exists "qr_campaign" (
        "id" text not null,
        "code" text not null,
        "name" text not null,
        "destination_url" text not null,
        "utm_source" text not null default 'qr',
        "utm_medium" text not null,
        "utm_campaign" text not null,
        "utm_content" text null,
        "scan_count" numeric not null default 0,
        "raw_scan_count" jsonb not null default '{"value":"0","precision":20}',
        "is_active" boolean not null default true,
        "product_id" text null,
        "notes" text null,
        "metadata" jsonb null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "qr_campaign_pkey" primary key ("id")
      );
    `)
    this.addSql(
      'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_qr_campaign_code_unique" ON "qr_campaign" ("code") WHERE "deleted_at" IS NULL;'
    )
    this.addSql(
      'CREATE INDEX IF NOT EXISTS "IDX_qr_campaign_deleted_at" ON "qr_campaign" ("deleted_at") WHERE "deleted_at" IS NULL;'
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "qr_campaign" cascade;')
  }
}

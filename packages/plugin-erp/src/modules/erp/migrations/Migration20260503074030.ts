import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260503074030 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "erp_connection" ("id" text not null, "provider_id" text not null, "access_token" text not null default '', "refresh_token" text not null default '', "token_expires_at" timestamptz null, "realm_id" text null, "api_url" text null, "is_connected" boolean not null default false, "last_sync_at" timestamptz null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "erp_connection_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_erp_connection_deleted_at" ON "erp_connection" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "erp_connection" cascade;`);
  }

}

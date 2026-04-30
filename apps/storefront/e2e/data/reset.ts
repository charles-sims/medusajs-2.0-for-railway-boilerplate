import { Client, ClientConfig } from "pg"

async function getDatabaseClient() {
  testEnvChecks()
  const env = getEnv()
  const client = new Client(env.superuser)
  await client.connect()
  return client
}

function parseDatabaseUrl(url: string | undefined): Partial<ClientConfig> {
  if (!url) return {}
  try {
    const u = new URL(url)
    return {
      host: u.hostname,
      port: u.port ? Number(u.port) : 5432,
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      // Connect to the maintenance "postgres" DB by default — we need to
      // CREATE/DROP other DBs from this client.
      database: "postgres",
    }
  } catch {
    return {}
  }
}

function getEnv() {
  const fromUrl = parseDatabaseUrl(process.env.DATABASE_URL)
  return {
    host: process.env.TEST_POSTGRES_HOST || "localhost",
    port: process.env.TEST_POSTGRES_HOST
      ? Number(process.env.TEST_POSTGRES_HOST)
      : 5432,
    user: process.env.TEST_POSTGRES_USER || "test_medusa_user",
    testDatabase: process.env.TEST_POSTGRES_DATABASE || "test_medusa_db",
    testDatabaseTemplate:
      process.env.TEST_POSTGRES_DATABASE_TEMPLATE || "test_medusa_db_template",
    productionDatabase: process.env.PRODUCTION_POSTGRES_DATABASE || "medusa_db",
    superuser: {
      host: process.env.PGHOST || fromUrl.host || "localhost",
      port: process.env.PGPORT
        ? Number(process.env.PGPORT)
        : fromUrl.port || 5432,
      user: process.env.PGUSER || fromUrl.user || "postgres",
      password: process.env.PGPASSWORD || fromUrl.password || "password",
      database: process.env.PGDATABASE || fromUrl.database || "postgres",
    },
  }
}

// In CI we provision a single ephemeral Postgres for the job and there is no
// template-database reset cycle to run. The container is destroyed at job end.
// Skip the reset in that environment so we don't fail teardown trying to drop
// databases that were never created.
function shouldSkipReset(): boolean {
  if (process.env.E2E_SKIP_DB_RESET === "true") return true
  if (process.env.CI === "true" || process.env.CI === "1") {
    return !process.env.TEST_POSTGRES_DATABASE
  }
  return false
}

async function testEnvChecks() {
  const env = getEnv()
  if (!env.testDatabase.startsWith("test_")) {
    const msg =
      "Please make sure your test environment database name starts with test_"
    console.error(msg)
    throw new Error(msg)
  }
  if (env.testDatabase === env.productionDatabase) {
    const msg =
      "Please make sure your test environment database and production environment database names are not equal"
    console.error(msg)
    throw new Error(msg)
  }
}

async function createTemplateDatabase(client: Client) {
  const { user, testDatabase, testDatabaseTemplate } = getEnv()
  try {
    // close current connections
    await client.query(`
      ALTER DATABASE ${testDatabase} WITH ALLOW_CONNECTIONS false;
      SELECT pg_terminate_backend(pid) FROM pg_stat_activity
        WHERE datname='${testDatabase}';
    `)
    await client.query(`
      CREATE DATABASE ${testDatabaseTemplate} WITH
        OWNER=${user}
        TEMPLATE=${testDatabase}
        IS_TEMPLATE=true;
    `)
  } catch (e: any) {
    // duplicate database code
    if (e.code === "42P04") {
      return
    }
    throw e
  }
}

async function createTestDatabase(client: Client) {
  const { user, testDatabase, testDatabaseTemplate } = getEnv()
  const deleteDatabase = `${testDatabase}_del`
  // drop connections and alter database name
  await client.query(`
    SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname='${testDatabase}';
    ALTER DATABASE ${testDatabase}
      RENAME TO ${deleteDatabase};
  `)
  await client.query(`
    CREATE DATABASE ${testDatabase}
      WITH OWNER ${user}
      TEMPLATE=${testDatabaseTemplate};
  `)
  await client.query(`DROP DATABASE ${deleteDatabase}`)
}

export async function resetDatabase() {
  if (shouldSkipReset()) {
    console.log(
      "[e2e:reset] Skipping resetDatabase — CI uses a single ephemeral DB.",
    )
    return
  }
  const client = await getDatabaseClient()
  await createTemplateDatabase(client)
  await createTestDatabase(client)
  await client.end()
}

export async function dropTemplate() {
  if (shouldSkipReset()) {
    console.log(
      "[e2e:reset] Skipping dropTemplate — CI uses a single ephemeral DB.",
    )
    return
  }
  const client = await getDatabaseClient()
  const env = getEnv()
  await client.query(
    `ALTER DATABASE ${env.testDatabaseTemplate} is_template false`
  )
  await client.query(`DROP DATABASE ${env.testDatabaseTemplate}`)
  await client.end()
}

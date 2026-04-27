import axios, { AxiosError, AxiosInstance } from "axios"

const BACKEND_URL =
  process.env.CLIENT_SERVER ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "http://localhost:9000"

axios.defaults.baseURL = BACKEND_URL

let region: any = undefined
let cachedAdminClient: AxiosInstance | undefined
let cachedStoreClient: AxiosInstance | undefined

function getPublishableKey(): string {
  const key =
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
    process.env.MEDUSA_PUBLISHABLE_API_KEY
  if (!key) {
    throw new Error(
      "Missing publishable key. Set NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY (or MEDUSA_PUBLISHABLE_API_KEY) before running e2e seed.",
    )
  }
  return key
}

function getStoreClient(extraHeaders: Record<string, string> = {}): AxiosInstance {
  if (!cachedStoreClient && Object.keys(extraHeaders).length === 0) {
    cachedStoreClient = axios.create({
      baseURL: BACKEND_URL,
      headers: { "x-publishable-api-key": getPublishableKey() },
    })
    return cachedStoreClient
  }
  return axios.create({
    baseURL: BACKEND_URL,
    headers: { "x-publishable-api-key": getPublishableKey(), ...extraHeaders },
  })
}

export async function seedData() {
  return {
    user: await seedUser(),
  }
}

export async function seedUser(email?: string, password?: string) {
  const user = {
    first_name: "Test",
    last_name: "User",
    email: email || "test@example.com",
    password: password || "password",
  }

  // Step 1: mint a registration JWT for this email/password.
  // Medusa v2 splits identity (auth) from the customer record (store).
  let registerToken: string
  try {
    const resp = await getStoreClient().post("/auth/customer/emailpass/register", {
      email: user.email,
      password: user.password,
    })
    registerToken = resp.data?.token
  } catch (e) {
    if (isAxiosError(e) && (e.response?.status === 401 || e.response?.status === 400)) {
      // Identity already exists — that's fine for idempotent seeding.
      return user
    }
    throw e
  }

  if (!registerToken) {
    throw new Error("Customer register did not return a token")
  }

  // Step 2: create the customer record using the registration JWT.
  try {
    await getStoreClient({ Authorization: `Bearer ${registerToken}` }).post(
      "/store/customers",
      {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      },
    )
    return user
  } catch (e) {
    if (isAxiosError(e) && e.response?.status === 422) {
      // https://docs.medusajs.com/api/store#customers_postcustomers — duplicate
      return user
    }
    throw e
  }
}

async function loadRegion(client: AxiosInstance) {
  const resp = await client.get("/admin/regions")
  region = resp.data.regions.filter((r: any) => r.currency_code === "usd")[0]
}

async function getOrInitAxios(client?: AxiosInstance) {
  const adminClient = client || (await loginAdmin())
  if (!region) {
    await loadRegion(adminClient)
  }
  return adminClient
}

export async function seedGiftcard(client?: AxiosInstance) {
  const adminClient = await getOrInitAxios(client)
  const resp = await adminClient.post("/admin/gift-cards", {
    region_id: region.id,
    value: 10000,
  })
  resp.data.gift_card.amount = resp.data.gift_card.value.toString()
  return resp.data.gift_card as {
    id: string
    code: string
    value: number
    amount: string
    balance: string
  }
}

export async function seedDiscount(client?: AxiosInstance) {
  const adminClient = await getOrInitAxios(client)
  const amount = 2000
  const resp = await adminClient.post("/admin/discounts", {
    code: "TEST_DISCOUNT_FIXED",
    regions: [region.id],
    rule: {
      type: "fixed",
      value: amount,
      allocation: "total",
    },
  })
  const discount = resp.data.discount
  return {
    id: discount.id,
    code: discount.code,
    rule_id: discount.rule_id,
    amount,
  }
}

async function loginAdmin(): Promise<AxiosInstance> {
  if (cachedAdminClient) {
    return cachedAdminClient
  }
  // Medusa v2 admin auth: POST /auth/user/emailpass returns { token } JWT.
  const resp = await axios.post("/auth/user/emailpass", {
    email: process.env.MEDUSA_ADMIN_EMAIL || "admin@medusa-test.com",
    password: process.env.MEDUSA_ADMIN_PASSWORD || "supersecret",
  })
  const token = resp.data?.token
  if (!token) {
    throw new Error("Admin login did not return a token")
  }
  cachedAdminClient = axios.create({
    baseURL: BACKEND_URL,
    headers: { Authorization: `Bearer ${token}` },
  })
  return cachedAdminClient
}

function isAxiosError(e: unknown): e is AxiosError {
  return e instanceof AxiosError
}

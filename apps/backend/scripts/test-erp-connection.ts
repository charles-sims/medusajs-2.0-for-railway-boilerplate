import { ErpNextClient } from "../../../packages/plugin-erp/src/providers/erpnext/client";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

async function testConnection() {
  console.log("Testing ERPNext Connection...");
  console.log("URL:", process.env.ERPNEXT_API_URL);
  
  const client = new ErpNextClient({
    api_url: process.env.ERPNEXT_API_URL!,
    api_key: process.env.ERPNEXT_API_KEY!,
    api_secret: process.env.ERPNEXT_API_SECRET!,
  });

  try {
    const result = await client.getList("Company", {}, ["name"]);
    console.log("Success! Companies found:", result.data.length);
    console.log("First company:", result.data[0]?.name);
  } catch (error: any) {
    console.error("Connection Failed:", error.message);
  }
}

testConnection();

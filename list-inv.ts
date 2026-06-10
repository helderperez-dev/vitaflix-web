import { createAdminClient } from "@/lib/supabase/admin";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  const admin = createAdminClient();
  const { data: invoices } = await admin
    .from("billing_invoices")
    .select("stripe_invoice_id, status")
    .eq("status", "open");
  console.log(invoices);
}
run();

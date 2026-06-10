import { createAdminClient } from "@/lib/supabase/admin";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  const admin = createAdminClient();
  const { error } = await admin
    .from("billing_invoices")
    .update({ status: "void" })
    .eq("stripe_invoice_id", "in_1Tcyv7JPjfK3XvA9ai5W5RVY");
  console.log("Updated invoice in_1Tcyv7JPjfK3XvA9ai5W5RVY to void:", error || "success");
}
run();

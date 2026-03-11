
import { createClient } from "./src/lib/supabase/server";
import { deleteTags } from "./src/app/actions/tags";

async function test() {
    // This is just a dummy test to see if types and imports are okay
    console.log("Testing deleteTags import...");
    if (typeof deleteTags === 'function') {
        console.log("deleteTags is a function");
    } else {
        console.log("deleteTags is NOT a function");
    }
}

test().catch(console.error);

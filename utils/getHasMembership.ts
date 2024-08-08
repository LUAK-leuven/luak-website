import type { Database } from "~/types/database.types";

type hasMembership = "no_membership" | "unpaid_membership" | "paid_membership";

export default async function getHasMembership(): Promise<hasMembership> {
    const supabase = useSupabaseClient<Database>();
    const { data, error } = await supabase.rpc("has_membership");
    if (error) throw error;
    return parseString(data);
}

function parseString(str: string): hasMembership {
    if (
        str === "no_membership" || str === "unpaid_membership" ||
        str === "paid_membership"
    ) {
        return str;
    } else throw new Error("hasMembership string incorrect");
}

import type { Database } from "~/types/database.types";

export default async function hasMembership(): Promise<number> {
    const supabase = useSupabaseClient<Database>();
    const { data, error } = await supabase.rpc("get_luak_year");
    if (error) throw error;
    return data;
}

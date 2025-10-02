import { supabase } from "@/lib/supabaseClient"

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("date", { ascending: true })
      .order("time", { ascending: true })

    if (error) throw error

    return res.status(200).json(data)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Failed to fetch appointments" })
  }
}
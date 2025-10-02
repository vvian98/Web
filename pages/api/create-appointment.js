import { supabase } from "@/lib/supabaseClient"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { name, doctor, date, time } = req.body

    const { data, error } = await supabase
      .from("appointments")
      .insert([{ name, doctor, date, time }])
      .select()

    if (error) throw error

    return res.status(200).json(data[0])
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Failed to create appointment" })
  }
}
import { supabase } from "@/lib/supabaseClient"

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { id, name, doctor, date, time } = req.body

    const { data, error } = await supabase
      .from("appointments")
      .update({ name, doctor, date, time })
      .eq("id", id)
      .select()

    if (error) throw error
    if (data.length === 0) {
      return res.status(404).json({ error: "Appointment not found" })
    }

    return res.status(200).json(data[0])
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Failed to update appointment" })
  }
}
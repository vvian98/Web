import { supabase } from "@/lib/supabaseClient"

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { id } = req.body

    const { error } = await supabase
      .from("appointments")
      .delete()
      .eq("id", id)

    if (error) throw error

    return res.status(200).json({ message: "Appointment deleted successfully" })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Failed to delete appointment" })
  }
}
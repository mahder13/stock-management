import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Home() {
  // Check if the user is logged in
  const session = await getServerSession(authOptions)

  // If logged in, go to dashboard
  if (session) {
    redirect("/dashboard")
  }

  // If not logged in, go to login page
  redirect("/login")
}

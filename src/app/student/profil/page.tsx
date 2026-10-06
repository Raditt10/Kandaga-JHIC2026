import { redirect } from "next/navigation"

export default function StudentProfilRedirect() {
  redirect("/student?tab=profil")
}

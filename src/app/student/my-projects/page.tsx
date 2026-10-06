import { redirect } from "next/navigation";

export default function StudentMyProjectsRedirectPage() {
  redirect("/student?tab=karya-saya");
}

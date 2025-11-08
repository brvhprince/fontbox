import { redirect } from "next/navigation";

import { getSessionToken } from "../shared/api/fetcher";

export default function HomePage() {
  const session = getSessionToken();
  if (session) {
    redirect("/fonts");
  }
  redirect("/login");
}

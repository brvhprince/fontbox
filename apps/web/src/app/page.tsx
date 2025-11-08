import { redirect } from "next/navigation";

import { getSessionToken } from "../shared/api/server-utils";

export default function HomePage() {
  const session = getSessionToken();
  if (session) {
    redirect("/fonts");
  }
  redirect("/login");
}

import { auth } from "@/auth";

import { LandingPage } from "./landing-page/landing-hero";

export default async function Home() {
  const session = await auth();
  const ctaHref = session?.user ? "/home" : "/login";

  return <LandingPage ctaHref={ctaHref} />;
}

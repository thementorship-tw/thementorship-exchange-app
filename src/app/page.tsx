import { auth } from "@/auth";

import { LandingHero } from "./landing-hero";

export default async function Home() {
  const session = await auth();
  const ctaHref = session?.user ? "/home" : "/login";

  return <LandingHero ctaHref={ctaHref} />;
}

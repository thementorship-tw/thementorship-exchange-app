"use client";

import { useEffect } from "react";

import { registerAppServiceWorker } from "@/shared/app-service-worker";

/** Install the app-wide offline fallback before the user signs in. */
export function AppServiceWorkerRegistration() {
  useEffect(() => {
    void registerAppServiceWorker().catch((error: unknown) => {
      console.error("[service-worker] Failed to register", error);
    });
  }, []);

  return null;
}

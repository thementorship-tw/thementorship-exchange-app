"use client";

import { useEffect } from "react";

type VersionLoggerProps = {
  version: string;
};

export function VersionLogger({ version }: VersionLoggerProps) {
  useEffect(() => {
    console.info(`[The Mentorship Exchange] version ${version}`);
  }, [version]);

  return null;
}

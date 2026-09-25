export function buildContactLogTargetHref({
  profileId,
  applicationId,
}: {
  profileId: string;
  applicationId: string;
}): string {
  const params = new URLSearchParams({
    tab: "posts",
    profileId,
    applicationId,
  });
  return `/settings?${params}`;
}

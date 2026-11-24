export const DEPLOY_COOLDOWN_MS = 10_000;

export function isWithinCooldown(
  lastCreatedAt: string | Date | null | undefined,
  now = Date.now()
): boolean {
  if (!lastCreatedAt) return false;
  const then = new Date(lastCreatedAt).getTime();
  return now - then < DEPLOY_COOLDOWN_MS;
}

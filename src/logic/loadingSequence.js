export function buildLoadingSequence(loadPlan) {
  if (!loadPlan) return [];
  // Bottom deck first (slots 6-9), then top deck (slots 5 down to 1)
  const bottom = loadPlan.slots
    .filter((s) => s.deck === 'bottom')
    .sort((a, b) => b.slot - a.slot);
  const top = loadPlan.slots
    .filter((s) => s.deck === 'top')
    .sort((a, b) => b.slot - a.slot);
  return [...bottom, ...top];
}

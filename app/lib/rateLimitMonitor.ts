// In-memory monitoring for USDA API rate limiting
// Not persistent; resets on process restart.

interface UsdaStats {
  totalRequests: number;
  totalErrors: number;
  hits429: number;
  last429At: number | null;
}

const usdaStats: UsdaStats = {
  totalRequests: 0,
  totalErrors: 0,
  hits429: 0,
  last429At: null,
};

export function recordUsdaRequest(status: number) {
  usdaStats.totalRequests += 1;
  if (status >= 400) {
    usdaStats.totalErrors += 1;
  }
  if (status === 429) {
    usdaStats.hits429 += 1;
    usdaStats.last429At = Date.now();
  }
}

export function getUsdaStats() {
  return {
    ...usdaStats,
    last429At: usdaStats.last429At,
  };
}

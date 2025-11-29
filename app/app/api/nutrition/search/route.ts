import { NextResponse } from "next/server";

// Simple in-memory cache with TTL
const cache = new Map<string, { expires: number; data: any }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Basic rate-limit guard to avoid hammering USDA for same query concurrently
const inFlight = new Map<string, Promise<Response>>();

const USDA_API_KEY = process.env.USDA_API_KEY || "DEMO_KEY"; // DEMO_KEY works but has rate limits
const USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1";

interface USDAFood {
  fdcId: number;
  description: string;
  foodNutrients: Array<{
    nutrientId: number;
    nutrientName: string;
    value: number;
    unitName: string;
  }>;
  servingSize?: number;
  servingSizeUnit?: string;
}

interface SimplifiedFood {
  fdcId: string;
  name: string;
  servingSize?: number;
  servingUnit?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

function getRetryAfterMs(res: Response): number | null {
  const retry = res.headers.get("Retry-After");
  if (!retry) return null;
  const secs = Number(retry);
  if (!Number.isNaN(secs)) return secs * 1000;
  const dateMs = Date.parse(retry);
  if (!Number.isNaN(dateMs)) return Math.max(0, dateMs - Date.now());
  return null;
}

async function fetchWithBackoff(url: string, init?: RequestInit): Promise<Response> {
  const maxRetries = 3;
  let delay = 500;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, init);
    if (res.status !== 429) return res;
    const retryMs = getRetryAfterMs(res) ?? delay;
    if (attempt === maxRetries) return res;
    await new Promise((r) => setTimeout(r, retryMs));
    delay = Math.min(delay * 2, 4000);
  }
  // Fallback; should never reach due to returns above
  return fetch(url, init);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: "Query must be at least 2 characters" }, { status: 400 });
    }

    const cacheKey = `q=${query}`;
    const now = Date.now();
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > now) {
      return NextResponse.json(cached.data);
    }

    // Search USDA FoodData Central
    const searchUrl = `${USDA_BASE_URL}/foods/search?query=${encodeURIComponent(query)}&pageSize=10&api_key=${USDA_API_KEY}`;

    // Deduplicate concurrent requests for the same query
    if (!inFlight.has(cacheKey)) {
      inFlight.set(
        cacheKey,
        (async () => {
          const response = await fetchWithBackoff(searchUrl);
          if (!response.ok) {
            const msg = `USDA API error: ${response.status} ${response.statusText}`;
            console.error(msg);
            const retryMs = getRetryAfterMs(response);
            const payload = { error: "Failed to fetch from USDA API", retryAfterMs: retryMs ?? undefined };
            return NextResponse.json(payload, { status: response.status === 429 ? 503 : 500 });
          }

          const data = await response.json();

          // Transform USDA data to our simplified format
          const foods: SimplifiedFood[] = (data.foods || []).map((food: USDAFood) => {
            const nutrients = food.foodNutrients || [];
            const getNutrient = (name: string): number | undefined => {
              const nutrient = nutrients.find((n) => n.nutrientName?.toLowerCase().includes(name.toLowerCase()));
              return nutrient ? Math.round(nutrient.value) : undefined;
            };
            return {
              fdcId: food.fdcId.toString(),
              name: food.description,
              servingSize: food.servingSize || 100,
              servingUnit: food.servingSizeUnit || "g",
              calories: getNutrient("energy") || getNutrient("calorie"),
              protein: getNutrient("protein"),
              carbs: getNutrient("carbohydrate"),
              fat: getNutrient("total lipid") || getNutrient("fat"),
              fiber: getNutrient("fiber"),
            };
          });

          const result = { foods };
          cache.set(cacheKey, { expires: now + CACHE_TTL_MS, data: result });
          return NextResponse.json(result);
        })()
      );
    }

    const res = await inFlight.get(cacheKey)!;
    inFlight.delete(cacheKey);
    return res;
  } catch (error) {
    console.error("Error searching nutrition API:", error);
    return NextResponse.json({ error: "Failed to search nutrition database" }, { status: 500 });
  }
}

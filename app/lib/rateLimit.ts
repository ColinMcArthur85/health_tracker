/**
 * Rate Limiting Utility
 * 
 * Simple in-memory rate limiter for API routes.
 * Uses a sliding window approach to track request counts.
 * 
 * Note: For production at scale, use Redis or a dedicated rate limiting service.
 * This in-memory implementation works well for single-instance deployments.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// Key format: `${identifier}:${endpoint}`
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
    lastCleanup = now;
  }
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in seconds */
  windowSizeSeconds: number;
  /** Identifier for this rate limit (e.g., 'ai-chat', 'upload') */
  identifier: string;
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Number of remaining requests in the current window */
  remaining: number;
  /** Time when the rate limit resets (Unix timestamp in seconds) */
  resetAt: number;
  /** Number of requests made in the current window */
  current: number;
  /** Maximum requests allowed */
  limit: number;
}

/**
 * Check if a request should be rate limited
 * 
 * @param ip - Client IP address or user ID
 * @param config - Rate limit configuration
 * @returns Rate limit result with allowed status and headers
 */
export function checkRateLimit(
  ip: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanup();
  
  const now = Date.now();
  const key = `${ip}:${config.identifier}`;
  const windowMs = config.windowSizeSeconds * 1000;
  
  const entry = rateLimitStore.get(key);
  
  // No existing entry or window has expired
  if (!entry || now > entry.resetTime) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, newEntry);
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: Math.ceil(newEntry.resetTime / 1000),
      current: 1,
      limit: config.maxRequests,
    };
  }
  
  // Existing entry within window
  entry.count += 1;
  rateLimitStore.set(key, entry);
  
  const allowed = entry.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);
  
  return {
    allowed,
    remaining,
    resetAt: Math.ceil(entry.resetTime / 1000),
    current: entry.count,
    limit: config.maxRequests,
  };
}

/**
 * Generate rate limit headers for API response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetAt.toString(),
  };
}

/**
 * Pre-configured rate limiters for different endpoints
 */
export const rateLimiters = {
  /**
   * AI Chat endpoint - generous but protected
   * 30 requests per minute per IP
   */
  aiChat: (ip: string) => checkRateLimit(ip, {
    maxRequests: 30,
    windowSizeSeconds: 60,
    identifier: 'ai-chat',
  }),
  
  /**
   * Photo analysis endpoint - more restricted due to OpenAI costs
   * 10 requests per minute per IP
   */
  photoAnalysis: (ip: string) => checkRateLimit(ip, {
    maxRequests: 10,
    windowSizeSeconds: 60,
    identifier: 'photo-analysis',
  }),
  
  /**
   * File upload endpoint
   * 20 uploads per minute per IP
   */
  upload: (ip: string) => checkRateLimit(ip, {
    maxRequests: 20,
    windowSizeSeconds: 60,
    identifier: 'upload',
  }),
  
  /**
   * General API endpoint
   * 100 requests per minute per IP
   */
  general: (ip: string) => checkRateLimit(ip, {
    maxRequests: 100,
    windowSizeSeconds: 60,
    identifier: 'general',
  }),
  
  /**
   * Authentication attempts
   * 5 attempts per 15 minutes per IP
   */
  auth: (ip: string) => checkRateLimit(ip, {
    maxRequests: 5,
    windowSizeSeconds: 15 * 60,
    identifier: 'auth',
  }),
};

/**
 * Get client IP from request headers
 * Handles Vercel's x-forwarded-for and other common headers
 */
export function getClientIp(request: Request): string {
  // Vercel and most proxies
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP (client IP)
    return forwardedFor.split(',')[0].trim();
  }
  
  // Cloudflare
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  // Other common headers
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  // Fallback - in Vercel this should rarely happen
  return 'unknown';
}

/**
 * Apply rate limiting to a request and return appropriate response if limited
 * 
 * @example
 * ```ts
 * const rateLimitResponse = applyRateLimit(request, rateLimiters.aiChat);
 * if (rateLimitResponse) return rateLimitResponse;
 * // ... handle request normally
 * ```
 */
export function applyRateLimit(
  request: Request,
  limiter: (ip: string) => RateLimitResult
): Response | null {
  const ip = getClientIp(request);
  const result = limiter(ip);
  
  if (!result.allowed) {
    const headers = getRateLimitHeaders(result);
    return new Response(
      JSON.stringify({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Please try again in ${Math.ceil((result.resetAt * 1000 - Date.now()) / 1000)} seconds.`,
        retryAfter: result.resetAt,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((result.resetAt * 1000 - Date.now()) / 1000).toString(),
          ...headers,
        },
      }
    );
  }
  
  return null;
}

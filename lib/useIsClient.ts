import { NextRequest, NextResponse } from "next/server";
import dns from "node:dns/promises";
import net from "node:net";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Runs on the Node.js runtime (not edge) so we can do DNS resolution below.
export const runtime = "nodejs";

const MAX_REDIRECTS = 3;
const FETCH_TIMEOUT_MS = 8000;
const MAX_BYTES = 10 * 1024 * 1024; // 10MB — plenty for a listing photo
const RATE_LIMIT = 60; // images load in bursts on a page, so allow more headroom
const RATE_WINDOW_MS = 60_000;

function isDisallowedIpv4(ip: string): boolean {
  const [a, b] = ip.split(".").map(Number);
  if (a === 127) return true; // loopback
  if (a === 10) return true; // private
  if (a === 172 && b >= 16 && b <= 31) return true; // private
  if (a === 192 && b === 168) return true; // private
  if (a === 169 && b === 254) return true; // link-local incl. cloud metadata
  if (a === 0) return true;
  return false;
}

function isDisallowedIpv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::1") return true; // loopback
  if (lower.startsWith("fe80")) return true; // link-local
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique local
  if (lower === "::" || lower.startsWith("::ffff:127.")) return true;
  return false;
}

/**
 * True if the given IP address is loopback, private, link-local, or
 * otherwise not a "public internet" address. Used to block SSRF attempts
 * where a hostname resolves (directly or via redirect) to internal
 * infrastructure (e.g. 127.0.0.1, 169.254.169.254 cloud metadata, 10.0.0.0/8).
 */
function isDisallowedIp(ip: string): boolean {
  const version = net.isIP(ip);
  if (version === 4) return isDisallowedIpv4(ip);
  if (version === 6) return isDisallowedIpv6(ip);
  return true; // not a valid IP at all — treat as disallowed
}

/** Validates a URL is http(s), has a real hostname, and doesn't resolve to internal infra. */
async function assertSafeUrl(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("Invalid URL");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http/https URLs are allowed");
  }

  const hostname = parsed.hostname;

  // If the hostname is already a literal IP, check it directly.
  if (net.isIP(hostname)) {
    if (isDisallowedIp(hostname)) {
      throw new Error("Refusing to fetch an internal/private address");
    }
    return parsed;
  }

  // Otherwise resolve DNS ourselves and check every address returned —
  // this is what actually stops "hostname points at 169.254.169.254" attacks.
  let addresses;
  try {
    addresses = await dns.lookup(hostname, { all: true });
  } catch {
    throw new Error("Could not resolve hostname");
  }

  if (
    addresses.length === 0 ||
    addresses.some((a) => isDisallowedIp(a.address))
  ) {
    throw new Error("Refusing to fetch an internal/private address");
  }

  return parsed;
}

function enforceRateLimit(req: NextRequest): NextResponse | null {
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(
    `image-proxy:${ip}`,
    RATE_LIMIT,
    RATE_WINDOW_MS
  );
  if (rateLimit.allowed) return null;

  const retryAfterSec = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
  return new NextResponse("Too many requests", {
    status: 429,
    headers: { "Retry-After": String(retryAfterSec) },
  });
}

async function fetchHop(url: URL): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url.toString(), {
      redirect: "manual", // handle redirects ourselves so we can re-validate each hop
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        Referer: "https://www.google.com/",
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

type RedirectResult =
  | { kind: "redirect"; nextUrl: string }
  | { kind: "error"; response: NextResponse }
  | { kind: "none" };

/** Checks whether `response` is a redirect that should be followed, and to where. */
function resolveRedirect(
  response: Response,
  base: URL,
  redirectCount: number
): RedirectResult {
  if (response.status < 300 || response.status >= 400) {
    return { kind: "none" };
  }
  const location = response.headers.get("location");
  if (!location) {
    return {
      kind: "error",
      response: new NextResponse("Redirect with no location", { status: 502 }),
    };
  }
  if (redirectCount >= MAX_REDIRECTS) {
    return {
      kind: "error",
      response: new NextResponse("Too many redirects", { status: 502 }),
    };
  }
  return { kind: "redirect", nextUrl: new URL(location, base).toString() };
}

/** Validates and streams back a successful (non-redirect) upstream response. */
async function buildImageResponse(response: Response): Promise<NextResponse> {
  if (!response.ok) {
    return new NextResponse(`Failed to fetch image: ${response.statusText}`, {
      status: 502,
    });
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.startsWith("image/")) {
    return new NextResponse("Refusing to proxy non-image content", {
      status: 415,
    });
  }

  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength > MAX_BYTES) {
    return new NextResponse("Image too large", { status: 413 });
  }

  const arrayBuffer = await response.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_BYTES) {
    return new NextResponse("Image too large", { status: 413 });
  }

  const headers = new Headers();
  headers.set("Content-Type", contentType || "image/jpeg");
  headers.set("Cache-Control", "public, max-age=86400");

  return new NextResponse(Buffer.from(arrayBuffer), { status: 200, headers });
}

export async function GET(req: NextRequest) {
  const rateLimitResponse = enforceRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  const rawUrl = req.nextUrl.searchParams.get("url");
  if (!rawUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  let currentUrl = rawUrl;

  try {
    for (let redirectCount = 0; ; redirectCount++) {
      const safeUrl = await assertSafeUrl(currentUrl);
      const response = await fetchHop(safeUrl);

      const redirect = resolveRedirect(response, safeUrl, redirectCount);
      if (redirect.kind === "error") return redirect.response;
      if (redirect.kind === "redirect") {
        currentUrl = redirect.nextUrl;
        continue;
      }

      return await buildImageResponse(response);
    }
  } catch (error) {
    console.error("Image proxy error:", error);
    const message =
      error instanceof Error ? error.message : "Error fetching image";
    // 400 for validation failures (bad/unsafe URL), not 500 — these are expected client errors.
    return new NextResponse(message, { status: 400 });
  }
}

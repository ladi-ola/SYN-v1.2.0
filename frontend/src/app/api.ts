import type { ApiMarketsResponse } from "./types";

const API_BASE = "/api";

export async function fetchOpportunities(): Promise<ApiMarketsResponse> {
  const res = await fetch(`${API_BASE}/opportunities`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function fetchPlayers() {
  try {
    const res = await fetch(`${API_URL}/api/players/`);
    if (!res.ok) {
      throw new Error("Failed to fetch players");
    }
    const data = await res.json();
    return data.players; // assuming backend returns { players: [...] }
  } catch (err) {
    console.error(err);
    return [];
  }
}

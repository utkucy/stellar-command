import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const TEST_NET_BASE_URL = "https://horizon-testnet.stellar.org";
export const PUB_NET_BASE_URL = "https://horizon.stellar.org";

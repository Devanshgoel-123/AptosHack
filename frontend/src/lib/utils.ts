import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const APT_TOKEN_ADDRESS="0x1::aptos_coin::AptosCoin"
export const BTC_TOKEN_ADDRESS="0x68844a0d7f2587e726ad0579f3d640865bb4162c08a4589eeda3f9689ec52a3d"
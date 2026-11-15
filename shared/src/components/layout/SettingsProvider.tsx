"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_SETTINGS } from "@/lib/content/defaults";
import type { Settings } from "@/lib/content/schema";

const SettingsContext = createContext<Settings>(DEFAULT_SETTINGS as Settings);

/**
 * Makes Admin → Settings values (delivery fee, contact details, UPI discount…) available to client
 * components. Filled by StoreShell from getSettings(); falls back to the defaults outside a provider.
 */
export function SettingsProvider({ settings, children }: { settings: Settings; children: ReactNode }) {
  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

/** Current store settings on the client. */
export function useSettings(): Settings {
  return useContext(SettingsContext);
}

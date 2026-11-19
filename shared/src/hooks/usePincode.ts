"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "cartzee-pincode";
const EVENT = "cartzee:pincode";

/**
 * The shopper's delivery PIN code, remembered in this browser and shared live between the header
 * "Deliver to" pill, product delivery dates and the PIN checker. Works without storage (private mode).
 */
export function usePincode(): [string, (pin: string) => void] {
  const [pin, setPinState] = useState("");

  useEffect(() => {
    const read = () => {
      try {
        setPinState(localStorage.getItem(KEY) ?? "");
      } catch {
        /* storage unavailable */
      }
    };
    read();
    const onChange = (e: Event) => setPinState((e as CustomEvent<string>).detail ?? "");
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", read);
    };
  }, []);

  const setPin = useCallback((next: string) => {
    const value = next.trim();
    setPinState(value);
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* storage unavailable */
    }
    window.dispatchEvent(new CustomEvent(EVENT, { detail: value }));
  }, []);

  return [pin, setPin];
}

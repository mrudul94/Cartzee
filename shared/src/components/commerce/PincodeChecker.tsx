"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { MapPin, Truck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSettings } from "@/components/layout/SettingsProvider";
import { estimateDelivery, type DeliveryEstimate } from "@/lib/utils/delivery";
import { formatINR } from "@/lib/utils/format";

const KEY = "city-seller-pincode";

/** Delivery estimate by PIN code; remembers the last PIN for convenience. */
export function PincodeChecker({ className }: { className?: string }) {
  const id = useId();
  const { freeAbove } = useSettings().delivery;
  const [pin, setPin] = useState("");
  const [result, setResult] = useState<DeliveryEstimate | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) {
        setPin(saved);
        setResult(estimateDelivery(saved));
      }
    } catch {
      /* storage unavailable */
    }
  }, []);

  const check = (e: FormEvent) => {
    e.preventDefault();
    const est = estimateDelivery(pin.trim());
    if (!est) {
      setResult(null);
      setError("Enter a valid 6-digit PIN code");
      return;
    }
    setError(null);
    setResult(est);
    try {
      localStorage.setItem(KEY, pin.trim());
    } catch {
      /* ignore */
    }
  };

  return (
    <div className={className}>
      <form onSubmit={check} className="flex gap-2" aria-label="Check delivery date">
        <label htmlFor={id} className="sr-only">
          PIN code
        </label>
        <Input
          id={id}
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          placeholder="Enter PIN code"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          leadingIcon={<MapPin className="h-4 w-4" />}
          invalid={Boolean(error)}
          aria-describedby={`${id}-result`}
        />
        <Button type="submit" variant="outline">
          Check
        </Button>
      </form>
      <div id={`${id}-result`} aria-live="polite" className="mt-2 text-sm">
        {error && <p className="text-error">{error}</p>}
        {result && (
          <p className="flex items-start gap-2 text-text">
            <Truck aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <span>
              Estimated delivery <strong>{result.from}</strong> to <strong>{result.to}</strong> ({result.region}).{" "}
              <span className="text-text-muted">Free delivery above {formatINR(freeAbove)}.</span>
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

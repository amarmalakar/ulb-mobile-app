import { useEffect, useMemo, useState } from "react";

const DEFAULT_EXPIRY_SECONDS = 90;
const DEFAULT_URGENT_THRESHOLD_SECONDS = 10;

export interface UseOtpCountdownOptions {
  expiresInSeconds?: number;
  urgentThresholdSeconds?: number;
  onResend?: () => void;
  disabled?: boolean;
  resetKey?: string | number | null;
}

export interface UseOtpCountdownResult {
  secondsLeft: number;
  isExpired: boolean;
  isUrgent: boolean;
  formatted: string;
  handleResend: () => void;
  reset: () => void;
}

function formatCountdown(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = (safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function useOtpCountdown({
  expiresInSeconds = DEFAULT_EXPIRY_SECONDS,
  urgentThresholdSeconds = DEFAULT_URGENT_THRESHOLD_SECONDS,
  onResend,
  disabled = false,
  resetKey,
}: UseOtpCountdownOptions = {}): UseOtpCountdownResult {
  const [secondsLeft, setSecondsLeft] = useState(expiresInSeconds);

  useEffect(() => {
    setSecondsLeft(expiresInSeconds);
    if (expiresInSeconds <= 0) return;

    const id = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          clearInterval(id);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [expiresInSeconds, resetKey]);

  return useMemo<UseOtpCountdownResult>(() => {
    const reset = () => setSecondsLeft(expiresInSeconds);

    return {
      secondsLeft,
      isExpired: secondsLeft === 0,
      isUrgent: secondsLeft > 0 && secondsLeft <= urgentThresholdSeconds,
      formatted: formatCountdown(secondsLeft),
      handleResend: () => {
        if (disabled) return;
        onResend?.();
        reset();
      },
      reset,
    };
  }, [secondsLeft, urgentThresholdSeconds, expiresInSeconds, disabled, onResend]);
}

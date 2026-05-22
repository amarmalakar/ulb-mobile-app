import {
  AlertCircleIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
  Clock3Icon,
  RotateCcwIcon,
  TicketIcon,
  UserPenIcon
} from "lucide-react-native";
import { i18n } from '@/lib/i18n';
import type { iTicketStatus } from "../types";
import type { TranslationKey } from '@/locales/keys';
import {
  differenceInDays,
  differenceInHours,
  formatDistanceToNow,
  isBefore,
  isValid,
  parseISO,
} from "date-fns";

export function getCategoryIcon(category: "COMPLIANT" | null) {
  switch (category) {
    case "COMPLIANT":
      return UserPenIcon;
    default:
      return TicketIcon;
  }
}

function statusLabel(status: iTicketStatus): string {
  const key = `tickets.status.${status}` as TranslationKey;
  return i18n.isInitialized ? i18n.t(key) : status;
}

export function getTicketStatusConfig(status: iTicketStatus) {
  const label = statusLabel(status);

  switch (status) {
    case "TODO":
      return {
        icon: CircleDashedIcon,
        iconClassName: "text-yellow-500",
        titleClassName: "text-yellow-600",
        badge: {
          bgClassName: "bg-yellow-200",
          textClassName: "text-yellow-600",
        },
        label,
      };
    case "IN_PROGRESS":
      return {
        icon: Clock3Icon,
        iconClassName: "text-blue-500",
        titleClassName: "text-blue-600",
        badge: {
          bgClassName: "bg-blue-200",
          textClassName: "text-blue-600",
        },
        label,
      };
    case "COMPLETED":
      return {
        icon: CheckCircle2Icon,
        iconClassName: "text-green-500",
        titleClassName: "text-green-600",
        badge: {
          bgClassName: "bg-green-200",
          textClassName: "text-green-600",
        },
        label,
      };
    case "BLOCKED":
      return {
        icon: AlertCircleIcon,
        iconClassName: "text-red-500",
        titleClassName: "text-red-600",
        badge: {
          bgClassName: "bg-red-200",
          textClassName: "text-red-600",
        },
        label,
      };
    case "REOPENED":
      return {
        icon: RotateCcwIcon,
        iconClassName: "text-orange-500",
        titleClassName: "text-orange-600",
        badge: {
          bgClassName: "bg-orange-200",
          textClassName: "text-orange-600",
        },
        label,
      };
    default:
      return {
        icon: CheckCircle2Icon,
        iconClassName: "text-green-500",
        titleClassName: "text-green-600",
        badge: {
          bgClassName: "bg-green-200",
          textClassName: "text-green-600",
        },
        label: "Completed",
      };
  }
}

export function formatRelativeTime(iso: string) {
  const date = parseISO(iso);
  if (!isValid(date)) return "";
  return formatDistanceToNow(date, { addSuffix: false });
}

export function isOverdue(dueDateTime: string | null) {
  if (!dueDateTime) return false;
  const date = parseISO(dueDateTime);
  if (!isValid(date)) return false;
  return isBefore(date, new Date());
}

/** Compact overdue label, e.g. `2h`, `18h`, `2d`. */
export function formatOverdueDuration(dueDateTime: string | null): string | null {
  if (!dueDateTime) return null;
  const due = parseISO(dueDateTime);
  if (!isValid(due) || !isBefore(due, new Date())) return null;

  const now = new Date();
  const days = differenceInDays(now, due);
  if (days >= 1) return `${days}d`;

  const hours = differenceInHours(now, due);
  return `${Math.max(1, hours)}h`;
}
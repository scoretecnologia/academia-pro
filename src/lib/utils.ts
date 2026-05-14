import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export const number = new Intl.NumberFormat("pt-BR");

export function percentage(value: number) {
  return `${Math.round(value)}%`;
}

export function clamp(value: number, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}

export function formatDate(value: string | Date) {
  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, year, month, day] = match;
      return `${day}/${month}/${year}`;
    }
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export const monthNames = [
  "janeiro",
  "fevereiro",
  "marco",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export function formatMonthYear(month: number, year: number) {
  return `${monthNames[month - 1]}/${year}`;
}

export function parseMonthYear(value: string) {
  const [year, month] = value.split("-").map(Number);
  return { month, year };
}

export function addMonthsToPeriod(month: number, year: number, offset: number) {
  const date = new Date(year, month - 1 + offset, 1);
  return { month: date.getMonth() + 1, year: date.getFullYear() };
}

export function sameMonthYear(dateValue: string, month: number, year: number) {
  const match = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return Number(match[1]) === year && Number(match[2]) === month;
  const date = new Date(dateValue);
  return date.getFullYear() === year && date.getMonth() + 1 === month;
}

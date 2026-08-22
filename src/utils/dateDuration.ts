export type RelationshipDuration = {
  years: number;
  months: number;
  days: number;
  totalDays: number;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function normalizeDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getRelationshipDuration(startDateInput: string, endDateInput = new Date()): RelationshipDuration {
  const startDate = normalizeDate(new Date(startDateInput));
  const endDate = normalizeDate(endDateInput);

  if (Number.isNaN(startDate.getTime())) {
    throw new Error(`Invalid relationship start date: ${startDateInput}`);
  }

  if (endDate < startDate) {
    return { years: 0, months: 0, days: 0, totalDays: 0 };
  }

  let years = endDate.getFullYear() - startDate.getFullYear();
  let months = endDate.getMonth() - startDate.getMonth();
  let days = endDate.getDate() - startDate.getDate();

  if (days < 0) {
    months -= 1;
    const previousMonth = endDate.getMonth() === 0 ? 11 : endDate.getMonth() - 1;
    const previousMonthYear = endDate.getMonth() === 0 ? endDate.getFullYear() - 1 : endDate.getFullYear();
    days += daysInMonth(previousMonthYear, previousMonth);
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / MS_PER_DAY);

  return { years, months, days, totalDays };
}

export function getDaysUntil(dateInput: string, fromInput = new Date()): number {
  const target = normalizeDate(new Date(dateInput));
  const from = normalizeDate(fromInput);

  if (Number.isNaN(target.getTime())) {
    throw new Error(`Invalid target date: ${dateInput}`);
  }

  return Math.max(0, Math.ceil((target.getTime() - from.getTime()) / MS_PER_DAY));
}

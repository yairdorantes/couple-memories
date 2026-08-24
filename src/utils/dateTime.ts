export function toLocalDateTimeInputValue(dateInput: string | Date): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

  if (Number.isNaN(date.getTime())) {
    return typeof dateInput === "string" ? dateInput.slice(0, 16) : "";
  }

  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return offsetDate.toISOString().slice(0, 16);
}

export function toIsoStringFromLocalInput(dateTimeInput: string): string {
  return new Date(dateTimeInput).toISOString();
}

export function getLocalDateKey(dateInput: string | Date): string {
  if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return dateInput;
  }

  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

  if (Number.isNaN(date.getTime())) {
    return typeof dateInput === "string" ? dateInput.slice(0, 10) : "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseLocalDateKey(dateInput: string): Date {
  const [year, month, day] = dateInput.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getDateForDisplay(dateInput: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return parseLocalDateKey(dateInput);
  }

  return new Date(dateInput);
}

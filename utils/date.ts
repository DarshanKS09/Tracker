export function getDateString(date = new Date()) {
  return date.toISOString().split("T")[0];
}

export function formatDayLabel(dateString: string) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(new Date(`${dateString}T00:00:00`));
}

export function getLastNDates(days: number) {
  const result: string[] = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - index);
    result.push(getDateString(date));
  }

  return result;
}

export function getCurrentWeekDatesStartingSunday(referenceDate = new Date()) {
  const startOfWeek = new Date(referenceDate);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + index);
    return getDateString(date);
  });
}

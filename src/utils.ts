import { boxSize } from './store';

export function download(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function calculateRows(selectedYear: number, selectedMonth: number, firstDayOfWeek: number = 1) {
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayOfWeekIndex = new Date(selectedYear, selectedMonth, 1).getDay() - firstDayOfWeek;
  const rows = Math.ceil((daysInMonth + firstDayOfWeekIndex) / 7);

  return rows;
}

export function calculateCalendarHeight(size: number, selectedYear: number, selectedMonth: number, firstDayOfWeek: number = 1) {
  const rows = calculateRows(selectedYear, selectedMonth, 1);
  return size * (rows + 1);
}
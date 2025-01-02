import { drawCalendar } from './calendar-drawer';
import type { Month } from './types/month';

export interface DrawYearCalendarOptions {
  year: number;
  months: Month[],
  firstDayOfWeek: number;
  cellWidth: number;
  cellHeight: number;
  cellSpacing: number;
}

export function drawYearCalendar(options: DrawYearCalendarOptions): HTMLCanvasElement {
  const {
    year,
    months,
    firstDayOfWeek,
    cellWidth,
    cellHeight,
    cellSpacing,
  } = options;

  const canvas = document.createElement('canvas');
  // Adjust canvas width to fit one month per row
  canvas.width = cellWidth;
  // Adjust canvas height to fit 12 months
  canvas.height = (cellHeight + cellSpacing) * 12;
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;

  const monthCanvas = document.createElement('canvas');
  monthCanvas.width = cellWidth;
  monthCanvas.height = cellHeight;

  for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
    drawCalendar({
      monthIndex,
      month: months[monthIndex],
      year,
      canvas: monthCanvas,
      firstDayOfWeek,
    });

    // Always draw at the start of the row
    const x = 0;
    // The y position depends on the current month
    const y = monthIndex * (cellHeight + cellSpacing);

    context.drawImage(monthCanvas, x, y, cellWidth, cellHeight);
  }

  return canvas;
}
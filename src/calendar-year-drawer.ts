import { drawCalendar } from './calendar-drawer';
import type { Month } from './month';

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
  canvas.width = cellWidth * 3 + cellSpacing * 2;
  canvas.height = cellHeight * 4 + cellSpacing * 3;
  const context = canvas.getContext('2d');

  const monthCanvas = document.createElement('canvas');
  monthCanvas.width = cellWidth;
  monthCanvas.height = cellHeight;

  for (let quarter = 0; quarter < 4; quarter++) {
    for (let monthInQuarter = 0; monthInQuarter < 3; monthInQuarter++) {
      const monthIndex = quarter * 3 + monthInQuarter;

      drawCalendar({
        monthIndex,
        month: months[monthIndex],
        year,
        canvas: monthCanvas,
        firstDayOfWeek,
      });

      const x = monthInQuarter * (cellWidth + cellSpacing);
      const y = quarter * (cellHeight + cellSpacing);

      context.drawImage(monthCanvas, x, y, cellWidth, cellHeight);
    }
  }

  return canvas;
}
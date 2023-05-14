import type { ImageRect } from "./image-rect";
import type { BoxSize } from './box-size';

export interface DrawCalendarOptions {
  month: number;
  year: number;
  boxSize: BoxSize;
  backgroundImage: HTMLImageElement;
  canvas: HTMLCanvasElement;
  backgroundRect: ImageRect;
  calendarRect: ImageRect;
  firstDayOfWeek?: number;
  locale?: string;
  /**
   * Hex value
   */
  calendarColor?: string;
}

// Chat GPT says this is based off this: https://en.wikipedia.org/wiki/Rec._709
export function isColorDark(color: string): boolean {
  const rgb = parseInt(color.replace("#", ""), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma < 32;
}

export function drawCalendar(options: DrawCalendarOptions) {
  const {
    month,
    year,
    boxSize,
    backgroundImage,
    canvas,
    backgroundRect,
    calendarRect,
    calendarColor = "#ffffff",
  } = options;  // Clear canvas

  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (backgroundImage) {
    context.drawImage(backgroundImage, backgroundRect.x, backgroundRect.y, backgroundRect.width, backgroundRect.height);
  }

  //const shadowColor = isColorDark(calendarColor) ? "white" : "black";
  const shadowColor = 'black';
  // Set text style
  context.fillStyle = calendarColor;
  context.strokeStyle = calendarColor;
  context.textBaseline = 'middle';
  context.textAlign = 'center';
  context.shadowColor = shadowColor;
  context.shadowOffsetX = 1;
  context.shadowOffsetY = 0;
  context.shadowBlur = 4;

  // Calculate the starting day and number of days in the month
  let startDay = new Date(year, month, 1).getDay() - 1; // Subtract 1 to start from Monday
  startDay = startDay === -1 ? 6 : startDay; // If startDay is -1 (Sunday), set it to 6
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let date = 1;
  let x = 0;
  let y = 0;
  const numCols = 7;
  const totalCalendarWidth = boxSize.width * numCols;
  const startX = calendarRect.x;
  let startY = calendarRect.y;

  // Draw weekday names
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthYearText = `${monthNames[month]} - ${year}`;
  context.font = 'bold 20px Arial';
  const monthYearTextMeasure = context.measureText(monthYearText);
  const monthYearTextX = startX + totalCalendarWidth / 2;
  const monthYearHeight = monthYearTextMeasure.actualBoundingBoxAscent + monthYearTextMeasure.actualBoundingBoxDescent;
  context.fillText(monthYearText, monthYearTextX, startY + monthYearHeight);

  context.font = 'bold 16px Arial';
  startY += monthYearHeight * 1.5;
  const weekdaysHeight = monthYearHeight;

  for (let col = 0; col < 7; col++) {
    const x = startX + col * boxSize.width;
    context.fillText(weekdays[col], x + boxSize.width / 2, startY + weekdaysHeight);
  }

  startY += weekdaysHeight * 2;
  context.font = '16px Arial';
  // Iterate through weeks (rows)
  for (let week = 0; week < 6; week++) {
    y = week * boxSize.height + startY;

    // Iterate through days (columns)
    for (let day = 0; day < 7; day++) {
      x = startX + day * boxSize.width;

      if (week === 0 && day < startDay || date > daysInMonth) {
        // Skip empty cells before the start of the month or after the end of the month
        continue;
      }

      // Draw the date box
      context.strokeRect(x, y, boxSize.width, boxSize.height);

      // Draw the date number
      context.fillText(date.toString(), x + boxSize.width / 2, y + monthYearHeight);

      date++;
    }
  }
}
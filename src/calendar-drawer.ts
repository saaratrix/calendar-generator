import type { Month } from './month';
import { ImageFitOption } from './image-fit-option';

export interface DrawCalendarOptions {
  year: number;
  monthIndex: number;
  month: Month,
  canvas: HTMLCanvasElement;
  firstDayOfWeek?: number;
  locale?: string;
  /**
   * Hex value
   */
  calendarColor?: string;
}

const MINIMUM_BORDER_THICKNESS = 1;
const MAXIMUM_BORDER_THICKNESS = 5;

const MINIMUM_FONT = 16;
const MAXIMUM_FONT = 32;

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
    monthIndex,
    year,
    canvas,
  } = options;  // Clear canvas

  const {
    boxSize: {value: boxSize},
    calendarColor: {value: calendarColor = "#ffffff"},
    backgroundImage: {value: backgroundImage},
    backgroundRect: {value: backgroundRect},
    calendarRect: {value: calendarRect},
    imageFitOption: { value: imageFitOption },
  } = options.month;

  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (backgroundImage) {
    drawImageProportionally(context, backgroundImage, canvas.width, canvas.height, imageFitOption);
  }

  // Calculate border thickness based on box size
  const borderThickness = Math.max(Math.min(0.01 * boxSize.width, MAXIMUM_BORDER_THICKNESS), MINIMUM_BORDER_THICKNESS);
  const fontSize = MINIMUM_FONT;//Math.max(Math.min(boxSize.width / 100 * 16, MAXIMUM_FONT), MINIMUM_FONT);

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
  context.lineWidth = borderThickness;

  // Calculate the starting day and number of days in the month
  let startDay = new Date(year, monthIndex, 1).getDay() - 1; // Subtract 1 to start from Monday
  startDay = startDay === -1 ? 6 : startDay; // If startDay is -1 (Sunday), set it to 6
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

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

  const monthYearText = `${monthNames[monthIndex]} - ${year}`;
  context.font = `bold ${fontSize + 4}px Arial`;
  const monthYearTextMeasure = context.measureText(monthYearText);
  const monthYearTextX = startX + totalCalendarWidth / 2;
  const monthYearHeight = monthYearTextMeasure.fontBoundingBoxAscent + monthYearTextMeasure.fontBoundingBoxDescent;;
  context.fillText(monthYearText, monthYearTextX, startY + monthYearHeight);

  context.font = `bold ${fontSize}px Arial`;
  startY += monthYearHeight * 1.5;
  const weekdaysHeight = monthYearHeight;

  for (let col = 0; col < 7; col++) {
    const x = startX + col * boxSize.width;
    context.fillText(weekdays[col], x + boxSize.width / 2, startY + weekdaysHeight);
  }

  startY += weekdaysHeight * 2;
  context.font = `${fontSize}px Arial`;
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

function drawImageProportionally(
  context: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number,
  imageFitOption: ImageFitOption,
) {
  switch (imageFitOption) {
    case ImageFitOption.Fit:
      drawFitImage(context, img, canvasWidth, canvasHeight);
      break;
    case ImageFitOption.Fill:
      drawFillImage(context, img, canvasWidth, canvasHeight);
      break;
    case ImageFitOption.Stretch:
      drawStretchImage(context, img, canvasWidth, canvasHeight);
      break;
    default:
      break;
  }
}

function drawFitImage(context: CanvasRenderingContext2D, img: HTMLImageElement, canvasWidth: number,  canvasHeight: number) {
  const imageAspectRatio = img.width / img.height;
  const canvasAspectRatio = canvasWidth / canvasHeight;
  let drawWidth, drawHeight, drawX, drawY;

  if (canvasAspectRatio > imageAspectRatio) {
    drawHeight = canvasHeight;
    drawWidth = drawHeight * imageAspectRatio;
    drawX = (canvasWidth - drawWidth) / 2;
    drawY = 0;
  } else {
    drawWidth = canvasWidth;
    drawHeight = drawWidth / imageAspectRatio;
    drawX = 0;
    drawY = (canvasHeight - drawHeight) / 2;
  }

  context.drawImage(img, drawX, drawY, drawWidth, drawHeight);
}

function drawFillImage(context: CanvasRenderingContext2D, img: HTMLImageElement, canvasWidth: number,  canvasHeight: number) {
  const imageAspectRatio = img.width / img.height;
  const canvasAspectRatio = canvasWidth / canvasHeight;
  let drawWidth, drawHeight, drawX, drawY;

  if (canvasAspectRatio > imageAspectRatio) {
    drawWidth = canvasWidth;
    drawHeight = drawWidth / imageAspectRatio;
    drawX = 0;
    drawY = (canvasHeight - drawHeight) / 2;
  } else {
    drawHeight = canvasHeight;
    drawWidth = drawHeight * imageAspectRatio;
    drawX = (canvasWidth - drawWidth) / 2;
    drawY = 0;
  }

  context.drawImage(img, drawX, drawY, drawWidth, drawHeight);
}

function drawStretchImage(context: CanvasRenderingContext2D, img: HTMLImageElement, canvasWidth: number,  canvasHeight: number) {
  context.drawImage(img, 0, 0, canvasWidth, canvasHeight);
}
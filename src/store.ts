import { derived, get, writable } from 'svelte/store';
import type { ImageRect } from './image-rect';
import type { Month, MonthPropertyTypeMap } from './month';
import { initialCalendarRect } from './constants';

export const backgroundImageLoaded = writable<HTMLImageElement>();

export const currentSelectedImageStore = writable<ImageRect>(undefined);

export const canvasWidth = writable<number>(0);
export const canvasHeight = writable<number>(0);

function cloneDefaultMonthData(): Month {
  return {
    backgroundImage: { value: null, isDirty: false },
    backgroundRect: { value: { x: 0, y: 0, width: 0, height: 0, type: 'background' }, isDirty: false },
    calendarRect: { value: { ...initialCalendarRect }, isDirty: false },
    calendarColor: { value: "#ffffff", isDirty: false },
    boxSize: { value: { width: 100, height: 100 }, isDirty: false },
  };
}

export const months = writable<Month[]>(Array(12).fill(null).map(() => cloneDefaultMonthData()));
export const selectedMonth = writable<number>(new Date().getMonth());
export const selectedYear = writable<number>(new Date().getFullYear());

export const currentMonthItem = derived(
  [months, selectedMonth],
  ([$months, $selectedMonth]) => $months[$selectedMonth]
);

export function updateMonthProperty<T extends keyof MonthPropertyTypeMap>(
  property: T,
  value: MonthPropertyTypeMap[T]
): void {
  const currentMonthIndex = get(selectedMonth);

  months.update(months => {
    const currentMonth = months[currentMonthIndex];
    currentMonth[property].value = value;
    currentMonth[property].isDirty = true;

    months.forEach(month => {
      if (month[property].isDirty) {
        return;
      }
      month[property].value = value;
    });

    return months;
  });
}
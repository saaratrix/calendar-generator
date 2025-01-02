import { derived, get, writable } from 'svelte/store';
import type { ImageRect } from './types/image-rect';
import type { Month, MonthPropertyTypeMap } from './types/month';
import { initialCalendarRect } from './constants';
import { ImageFitOption } from './image-fit-option';
import { saveImageToIndexedDB, saveYearToLocalStorage } from './local-workspace-saver';
import type { LocalWorkspaceItem } from './types/local-workspace-item';

export const currentWorkspaceItem = writable<LocalWorkspaceItem>(undefined);

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
    imageFitOption: { value: ImageFitOption.Fill, isDirty: false },
  };
}

export const months = writable<Month[]>(Array(12).fill(null).map(() => cloneDefaultMonthData()));
export const selectedMonth = writable<number>(new Date().getMonth());
export const selectedYear = writable<number>(new Date().getFullYear());

export const currentMonthItem = derived(
  [months, selectedMonth],
  ([$months, $selectedMonth]) => {
    return $months[$selectedMonth]
  }
);

export function updateMonthProperty<T extends keyof MonthPropertyTypeMap>(
  property: T,
  value: MonthPropertyTypeMap[T]
): void {
  const currentMonthIndex = get(selectedMonth);

  months.update(months => {
    const currentMonth = months[currentMonthIndex];
    const year = get(selectedYear);

    currentMonth[property].value = value;
    currentMonth[property].isDirty = true;
    trySetBackgroundImage(property, value as HTMLImageElement, year, currentMonthIndex);

    for (let i = 0; i < months.length; i++) {
      const month = months[i];
      if (month[property].isDirty) {
        continue;
      }
      month[property].value = value;
      trySetBackgroundImage(property, value as HTMLImageElement, year, i);
    }

    const workspaceItem = get(currentWorkspaceItem);
    if (workspaceItem) { workspaceItem.months = months; }
    saveYearToLocalStorage(year.toString(), workspaceItem);

    return months;
  });
}

function trySetBackgroundImage(property: keyof Month, value: HTMLImageElement, year: number, month: number): void {
  if (property !== 'backgroundImage') {
    return;
  }

  saveImageToIndexedDB(year, month, value as HTMLImageElement);
}
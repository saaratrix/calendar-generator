import { writable } from 'svelte/store';
import type { ImageRect } from './image-rect';
import type { BoxSize } from './box-size';
import type { MonthData } from './month-data';

export const currentSelectedImageStore = writable<ImageRect>(undefined);

export const boxSize = writable<BoxSize>({
  width: 100,
  height: 100,
});

export function updateBoxSize(newSize: BoxSize) {
  boxSize.set(newSize);
}

const defaultMonthData: MonthData = {
  backgroundImage: { value: null, isDirty: false },
  backgroundRect: { value: { x: 0, y: 0, width: 0, height: 0, type: 'background' }, isDirty: false },
  calendarRect: { value: { x: 0, y: 0, width: 0, height: 0, type: 'calendar' }, isDirty: false },
  calendarColor: { value: "#ffffff", isDirty: false },
  boxSize: { value: { width: 100, height: 100 }, isDirty: false },
};

export const monthDataArray = writable<MonthData[]>(Array(12).fill(defaultMonthData));

export const selectedMonth = writable(new Date().getMonth());
export const selectedYear = writable(new Date().getFullYear());
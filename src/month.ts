import type { ImageRect } from './image-rect';
import type { BoxSize } from './box-size';

interface DirtyValue<T> {
  value: T;
  isDirty: boolean;
}

export type Month = {
  backgroundImage: DirtyValue<HTMLImageElement>;
  backgroundRect: DirtyValue<ImageRect>;
  calendarRect: DirtyValue<ImageRect>;
  calendarColor: DirtyValue<string>;
  boxSize: DirtyValue<BoxSize>;
}

export type MonthPropertyTypeMap = {
  backgroundImage: HTMLImageElement;
  backgroundRect: ImageRect;
  calendarRect: ImageRect;
  calendarColor: string;
  boxSize: BoxSize;
};
import type { ImageRect } from './image-rect';
import type { BoxSize } from './box-size';

interface DirtyValue<T> {
  value: T;
  isDirty: boolean;
}

export type MonthData = {
  backgroundImage: DirtyValue<HTMLImageElement>;
  backgroundRect: DirtyValue<ImageRect>;
  calendarRect: DirtyValue<ImageRect>;
  calendarColor: DirtyValue<string>;
  boxSize: DirtyValue<BoxSize>;
}
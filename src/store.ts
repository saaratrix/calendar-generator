import { writable } from 'svelte/store';
import type { ImageRect } from './image-rect';
import type { BoxSize } from './box-size';

export const currentSelectedImageStore = writable<ImageRect>(undefined);

export const boxSize = writable<BoxSize>({
  width: 100,
  height: 100,
});

export function updateBoxSize(newSize: BoxSize) {
  boxSize.set(newSize);
}
import { writable } from 'svelte/store';
import type { ImageRect } from './image-rect';

export const currentSelectedImageStore = writable<ImageRect>(undefined);

export const boxSize = writable(100);

export function updateBoxSize(newSize) {
  boxSize.set(newSize);
}
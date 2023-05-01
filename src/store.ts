import { writable } from 'svelte/store';
import type { ImageRect } from './image-rect';

export const currentSelectedImageStore = writable<ImageRect>(undefined);
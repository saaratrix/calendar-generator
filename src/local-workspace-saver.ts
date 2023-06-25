import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';
import type { Month } from './types/month';
import type { Writable } from 'svelte/store';
import type { LocalWorkspaceItem } from './types/local-workspace-item';
import { currentWorkspaceItem } from './store';

let dbPromise: Promise<IDBPDatabase>;

export function getLocalWorkspaceItem(year: string): LocalWorkspaceItem | null {
  const item = localStorage.getItem(year);
  return item ? JSON.parse(item) : null;
}

export async function tryLoadImagesForItem(year: number, item: LocalWorkspaceItem, months: Writable<Month[]>): Promise<void> {
  if (!item) {
    return;
  }

  // Now load the images from IndexedDB
  for (let monthIndex = 0; monthIndex < item.months.length; monthIndex++) {
    const savedImageBlob = await loadImageFromIndexedDB(year.toString(), monthIndex.toString());
    if (!savedImageBlob) {
      continue;
    }

    const image = new Image();

    image.onload = () => {
      // Update the i mage in the month data once it's loaded
      months.update((months) => {
        const monthToUpdate = months[monthIndex];
        monthToUpdate.backgroundImage.value = image;
        return months;
      });
    };

    image.src = URL.createObjectURL(savedImageBlob);
  }
}

async function getDb() {
  if (!dbPromise) {
    dbPromise = openDB('calendar-app-db', 1, {
      upgrade(db) {
        db.createObjectStore('images');
      },
    });
  }
  return dbPromise;
}

export async function saveImageToIndexedDB(year: number, month: number, image: HTMLImageElement) {
  const db = await getDb();

  const response = await fetch(image.src);
  const imageData = await response.blob();

  const yearMonthKey = `${year}_${month}`;
  console.log('trying to save', yearMonthKey);
  const tx = db.transaction('images', 'readwrite');
  tx.store.put(imageData, yearMonthKey);
  await tx.done;
}

export async function loadImageFromIndexedDB(year: string, month: string): Promise<Blob | undefined> {
  const db = await getDb();
  const tx = db.transaction('images', 'readonly');
  const yearMonthKey = `${year}_${month}`;
  return tx.store.get(yearMonthKey);
}

export function saveYearToLocalStorage(year: string, item: LocalWorkspaceItem): void {
  if (!item) {
    return;
  }

  // Here we keep the isDirty value but remove the image data
  const monthsWithoutImages = item.months?.map(month => {
    const {backgroundImage, ...rest} = month;
    return {
      ...rest,
      backgroundImage: {
        ...backgroundImage,
        value: null,
      }
    };
  }) ?? [];
  const itemToSave: LocalWorkspaceItem = {...item, months: monthsWithoutImages};
  localStorage.setItem(year, JSON.stringify(itemToSave));
  currentWorkspaceItem.set(itemToSave);
}
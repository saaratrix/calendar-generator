<script lang="ts">
  import { currentMonthItem, selectedYear, selectedMonth, updateMonthProperty } from './store';
  import type { ImageRect } from './types/image-rect';
  import type { BoxSize } from './types/box-size';
  import { calculateCalendarHeight, calculateRows } from './utils';

  export let imageRect: ImageRect;

  let resizing = false;
  let startX: number;
  let startY: number;
  let initialBoxSize: BoxSize;

  function handlePointerDown(event: PointerEvent) {
    resizing = true;
    startX = event.clientX;
    startY = event.clientY;
    initialBoxSize = { width: $currentMonthItem.boxSize.value.width, height: $currentMonthItem.boxSize.value.height };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  }

  function handlePointerMove(event: PointerEvent) {
    if (!resizing) return;

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    const newWidth = initialBoxSize.width * 7 + deltaX;
    const newBoxSizeWidth = newWidth / 7;

    const calendarHeight = calculateCalendarHeight(initialBoxSize.height, $selectedYear, $selectedMonth, 1) + deltaY;
    const rows = calculateRows($selectedYear, $selectedMonth, 1);
    const newBoxSizeHeight = calendarHeight / (rows + 1);

    updateMonthProperty('boxSize', {
      width: newBoxSizeWidth,
      height: newBoxSizeHeight,
    });
  }

  function handlePointerUp(event: PointerEvent) {
    resizing = false;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
    window.removeEventListener('pointercancel', handlePointerUp);
  }
</script>

<div
  class="resizer"
  on:pointerdown|stopPropagation="{handlePointerDown}"
  style="left: {imageRect.x + imageRect.width}px; top: {imageRect.y + imageRect.height}px;"
/>

<style>
  .resizer {
    position: absolute;
    width: 10px;
    height: 10px;
    /*background-color: #000;*/
    cursor: nwse-resize;
    z-index: 10;
    background-color: red;
  }
</style>


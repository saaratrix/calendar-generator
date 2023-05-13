<script lang="ts">
  import { updateBoxSize, boxSize } from './store';
  import type { ImageRect } from './image-rect';

  export let imageRect: ImageRect;

  let resizing = false;
  let startX: number;
  let startY: number;
  let initialBoxSize: number;

  function handlePointerDown(event: PointerEvent) {
    resizing = true;
    startX = event.clientX;
    startY = event.clientY;
    initialBoxSize = $boxSize;

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  }

  function handlePointerMove(event: PointerEvent) {
    if (!resizing) return;

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    const newWidth = initialBoxSize * 7 + deltaX;
    const newBoxSize = newWidth / 7;

    updateBoxSize(newBoxSize);
    console.log(deltaX, newBoxSize);
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


<script lang="ts">
  import { createEventDispatcher, onDestroy } from 'svelte';
  import type { ImageRect } from "./image-rect";
  import { currentSelectedImageStore } from './store';

  interface ImageMovedEvent {
    imageMoved: ImageRect;
  }

  const dispatch = createEventDispatcher<ImageMovedEvent>();

  export let currentSelectedImage: ImageRect | undefined;
  const unsubscribe = currentSelectedImageStore.subscribe((value) => {
    currentSelectedImage = value;
  });

  let rafInProgress = false;
  let startX = 0;
  let startY = 0;
  let isMoving = false;

  onDestroy(() => {
    unsubscribe();
  });

  function onPointerDown(event: PointerEvent) {
    if (!currentSelectedImage) return;
    startX = event.clientX;
    startY = event.clientY;
    isMoving = true;
  }

  function onPointerMove(event: PointerEvent) {
    if (!isMoving) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    currentSelectedImage.x += dx;
    currentSelectedImage.y += dy;
    startX = event.clientX;
    startY = event.clientY;

    if (rafInProgress) return;

    rafInProgress = true;
    requestAnimationFrame(() => {
      dispatch('imageMoved', currentSelectedImage);
      rafInProgress = false;
    });
  }

  function onPointerUp() {
    isMoving = false;
  }
</script>

{#if currentSelectedImage}
  <div
    class="bounding-box"
    style="left: {currentSelectedImage.x}px; top: {currentSelectedImage.y}px;"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="{currentSelectedImage.width}"
      height="{currentSelectedImage.height}"
    >
      <rect
        class="dashed-main"
        x="0"
        y="0"
        width="{currentSelectedImage.width}"
        height="{currentSelectedImage.height}"
        stroke="white"
        stroke-width="2"
        fill="none"
      />
      <rect
        class="dashed-alternate"
        x="0"
        y="0"
        width="{currentSelectedImage.width}"
        height="{currentSelectedImage.height}"
        stroke="black"
        stroke-width="2"
        fill="none"
      />
    </svg>
  </div>
{/if}

<style lang="scss">
  .bounding-box {
    position: absolute;
    pointer-events: none;
    z-index: 9999;
    --border-size: 4;
  }

  rect.dashed-main {
    stroke: black;
    fill: none;
    stroke-width: var(--border-size);
  }

  rect.dashed-alternate {
    stroke: white;
    fill: none;
    stroke-dasharray: var(--border-size),var(--border-size);
    stroke-width: var(--border-size);
  }
</style>
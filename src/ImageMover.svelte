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
  let hasMoved = false;
  let isOutsideWindow = false;
  let resetButtonRef: HTMLElement | undefined;

  $: {
    isOutsideWindow = currentSelectedImage && (currentSelectedImage.x + currentSelectedImage.width > window.innerWidth);
  }

  onDestroy(() => {
    unsubscribe();
  });

  function onPointerDown(event: PointerEvent) {
    if (!currentSelectedImage) return;
    startX = event.clientX;
    startY = event.clientY;
    isMoving = true;
    hasMoved = false;
  }

  function onPointerMove(event: PointerEvent) {
    if (!isMoving) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    currentSelectedImage.x += dx;
    currentSelectedImage.y += dy;
    startX = event.clientX;
    startY = event.clientY;

    if (dx !== 0 || dy !== 0) {
      hasMoved = true;
    }

    if (rafInProgress) return;

    rafInProgress = true;
    requestAnimationFrame(() => {
      rafInProgress = false;
      dispatch('imageMoved', currentSelectedImage);
    });
  }

  function onPointerUp(event: PointerEvent  ) {
    isMoving = false;
    if (hasMoved || resetButtonRef.contains(event.target as Node)) {
      event.stopPropagation();
    }
    hasMoved = false;
  }

  function resetImagePosition() {
    currentSelectedImage.x = 0;
    currentSelectedImage.y = 0;
    dispatch('imageMoved', currentSelectedImage);
  }

</script>


<style lang="scss">
  .bounding-box {
    position: absolute;
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

  .reset-button {
    position: absolute;
    cursor: pointer;
  }
  .right-aligned {
    right: 0;
  }
  .left-aligned {
    left: 0;
  }

  .reset-icon {
    font-size: 24px;
    color: white;
    text-shadow: 1px 1px 2px black;
    cursor: pointer;
    transition: color 0.3s;
  }

  .reset-icon:hover {
    color: silver;
  }
</style>

{#if currentSelectedImage}
  <div
    class="bounding-box"
    style="left: {currentSelectedImage.x}px; top: {currentSelectedImage.y}px;"
    on:pointerdown="{onPointerDown}"
    on:pointerup="{onPointerUp}"
    on:pointermove="{onPointerMove}"
  >
    <div
      class="reset-button"
      bind:this={resetButtonRef}
      class:left-aligned={isOutsideWindow}
      class:right-aligned={!isOutsideWindow}
      on:pointerup={resetImagePosition}
    >
      <span class="reset-icon">&#215;</span>
    </div>
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

<script lang="ts">
  import { onMount } from 'svelte';
  import { drawCalendar } from './calendar-drawer';
  import { drawYearCalendar } from './calendar-year-drawer';
  import type { ImageRect } from './image-rect';
  import ImageMover from './ImageMover.svelte';
  import {
    currentSelectedImageStore,
    selectedMonth,
    selectedYear,
    months,
    currentMonthItem,
    backgroundImageLoaded,
    canvasWidth,
    canvasHeight, updateMonthProperty,
  } from './store';
  import ImageResizer from './ImageResizer.svelte';
  import { initialCalendarRect, monthNames } from './constants';
  import MonthValuesEditor from './MonthValuesEditor.svelte';

  type SelectedResolution = `${number}x${number}` | 'auto';

  let canvas: HTMLCanvasElement;
  let selectedResolution: SelectedResolution | '' = 'auto';

  let currentSelectedImage: ImageRect | undefined = undefined;

  let drawRequested = false;

  $: {
    if (currentSelectedImage) {
      currentSelectedImageStore.set(currentSelectedImage);
    }
  }

  onMount(() => {
    const subscriptions = [
      selectedYear.subscribe(() => onMonthYearChange()),
      currentMonthItem.subscribe(() => {
        onMonthYearChange();
        updateCurrentSelectedImage();
      }),
      backgroundImageLoaded.subscribe(() => updateCanvasSize()),
      canvasWidth.subscribe(() => {
        const rect = $currentMonthItem.backgroundRect.value;
        rect.width = $canvasWidth;
        updateMonthProperty('backgroundRect', rect);
        requestDrawCalendar();
      }),
      canvasHeight.subscribe(() => {
        const rect = $currentMonthItem.backgroundRect.value;
        rect.height = $canvasHeight;
        updateMonthProperty('backgroundRect', rect);
        requestDrawCalendar();
      }),
    ];

    selectedMonth.set(new Date().getMonth());

    requestDrawCalendar();

    window.addEventListener('pointerup', trySelectImage);
    return () => {
      subscriptions.forEach(subscription => subscription());
      window.removeEventListener('pointerup', trySelectImage);
    };
  });

  function requestDrawCalendar() {
    if (!drawRequested) {
      drawRequested = true;
      requestAnimationFrame(() => {
        if ($canvasWidth !== 0 && $canvasHeight !== 0) {
          drawCalendar({
            monthIndex: $selectedMonth,
            year: $selectedYear,
            month: $currentMonthItem,
            canvas,
            firstDayOfWeek: 1,
            locale: 'en-GB',
          });
        }
        drawRequested = false;
      });
    }
  }

  function exportCalendar() {
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;

    // Generate the filename
    const filename = `${selectedYear}_${monthNames[selectedMonth]}.png`;
    link.download = filename;
    link.click();
  }

  function exportYear() {
    const result = drawYearCalendar({
      year: $selectedYear,
      months: $months,
      firstDayOfWeek: 1,
      cellHeight: $canvasHeight,
      cellWidth: $canvasWidth,
      cellSpacing: 5,
    });

    const dataUrl = result.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `calendar-${selectedYear}.png`;
    link.click();
  }

  function onMonthYearChange() {
    requestDrawCalendar();
  }

  function updateCurrentSelectedImage() {
    if (!currentSelectedImage) {
      currentSelectedImageStore.set(currentSelectedImage);
      return;
    }

    let newReference = currentSelectedImage.type === 'background' ? $currentMonthItem.backgroundRect.value : $currentMonthItem.calendarRect.value;
    currentSelectedImage = newReference;
    currentSelectedImageStore.set(currentSelectedImage);
  }

  function updateCanvasSize() {
    if (selectedResolution === "auto") {
      const backgroundImage = $currentMonthItem.backgroundImage.value;
      if (backgroundImage) {
        canvasWidth.set(backgroundImage.naturalWidth);
        canvasHeight.set(backgroundImage.naturalHeight);
      }
    } else {
      const [width, height] = selectedResolution.split("x").map(Number);
      canvasWidth.set(width);
      canvasHeight.set(height);
    }
  }

  function trySelectImage(event: MouseEvent) {
    const canvasRect = canvas.getBoundingClientRect();
    const calendarRect = $currentMonthItem.calendarRect.value;
    const backgroundRect = $currentMonthItem.backgroundRect.value;
    const x = event.pageX - canvasRect.left - window.scrollX;
    const y = event.pageY - canvasRect.top - window.scrollY;

    if (
      x < 0 || x > canvasRect.width
      || y < 0 || y > canvasRect.height
    ) {
      currentSelectedImage = undefined;
      return;
    }

    if (
      x >= calendarRect.x &&
      x <= calendarRect.x + calendarRect.width &&
      y >= calendarRect.y &&
      y <= calendarRect.y + calendarRect.height
    ) {
      currentSelectedImage = calendarRect;
      return;
    }

    if (
      x >= backgroundRect.x &&
      x <= backgroundRect.x + backgroundRect.width &&
      y >= backgroundRect.y &&
      y <= backgroundRect.y + backgroundRect.height
    ) {
      currentSelectedImage = backgroundRect;
      return;
    }

    currentSelectedImage = undefined;
  }

  function resetRects() {
    const calendarRect = $currentMonthItem.calendarRect.value;
    const backgroundRect = $currentMonthItem.backgroundRect.value;

    calendarRect.x = initialCalendarRect.x;
    calendarRect.y = initialCalendarRect.y;

    backgroundRect.x = 0;
    backgroundRect.y = 0;

    updateMonthProperty('calendarRect', calendarRect);
    updateMonthProperty('backgroundRect', backgroundRect);

    requestDrawCalendar();
  }

</script>

<style lang="scss">

  .settings {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .canvas-container {
    position: relative;
    box-sizing: border-box;
    border: 1px solid black;
    display: inline-flex;
  }

  canvas {
    z-index: 1;
  }

  .color-picker-container {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
  }

  .calendar-color-picker {
    display: none;
  }

  .color-display {
    width: 24px;
    height: 24px;
    border-width: 1px;
    border-style: solid;
    margin-left: 4px;
  }
</style>

<div class="settings">
  <input type="number" min="1" bind:value={$selectedYear} />
  <button on:click={exportCalendar}>Export Calendar</button>
  <button on:click={exportYear}>Export Year</button>
</div>
<div class="settings">
  <label for="canvasWidth">Canvas Width: </label>
  <input id="canvasWidth" type="number" min="300" bind:value={$canvasWidth} on:input={() => requestDrawCalendar()} />

  <label for="canvasHeight">Canvas Height: </label>
  <input id="canvasHeight" type="number" min="300" bind:value={$canvasHeight} on:input={() => requestDrawCalendar()} />

  <select bind:value={selectedResolution} on:change={() => updateCanvasSize()}>
    <option value="auto">Fit to background image</option>
    <option value="800x600">800x600</option>
    <option value="1024x768">1024x768</option>
    <option value="1280x720">1280x720 (720p)</option>
    <option value="1920x1080">1920x1080 (1080p)</option>
    <option value="2560x1440">2560x1440 (1440p)</option>
    <option value="3840x2160">3840x2160 (4K)</option>
    <option value="5120x2880">5120x2880 (5K)</option>
    <option value="7680x4320">7680x4320 (8K)</option>
  </select>

  <button on:click={resetRects}>Reset Rects</button>
</div>
<div class="settings">
  <MonthValuesEditor />
</div>

<div class="canvas-container">
  <ImageMover bind:currentSelectedImage="{currentSelectedImage}" on:imageMoved="{() => { requestDrawCalendar()}}" />
  {#if currentSelectedImage?.type === 'calendar'}
    <ImageResizer bind:imageRect={currentSelectedImage} />
  {/if}
  <canvas bind:this={canvas} width={$canvasWidth} height={$canvasHeight}></canvas>
</div>



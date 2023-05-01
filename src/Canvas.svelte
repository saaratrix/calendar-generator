<script lang="ts">
  import { onMount } from 'svelte';
  import type {ChangeEvent} from "rollup";
  import { drawCalendar } from './calendar-drawer';
  import type { ImageRect } from './image-rect';

  type SelectedResolution = `${number}x${number}` | 'auto';

  let backgroundImage: HTMLImageElement;
  let canvas: HTMLCanvasElement;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let selectedResolution: SelectedResolution | '' = 'auto';
  let ctx: CanvasRenderingContext2D;
  let selectedMonth = new Date().getMonth();
  let selectedYear = new Date().getFullYear();
  let boxSize = 100;

  let backgroundRect: ImageRect = { x: 0, y: 0, width: 0, height: 0 };
  let calendarRect: ImageRect = { x: 25, y: 0, width: 0, height: 0 };

  let drawRequested = false;

  $: {
    if (canvas && canvasWidth !== 0 && canvasHeight !== 0) {
      requestDrawCalendar();
    }
  }

  $: {
    if (canvas) {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      backgroundRect.height = canvasHeight;
      backgroundRect.width = canvasWidth;
    }
  }

  onMount(() => {
    // const initialResolution = findNearestResolution(window.innerWidth, window.innerHeight);
    // canvasWidth = initialResolution.width;
    // canvasHeight = initialResolution.height;
    // selectedResolution = `${canvasWidth}x${canvasHeight}` as SelectedResolution;
    // ctx = canvas.getContext('2d');
    requestDrawCalendar();
  });

  function requestDrawCalendar() {
    if (!drawRequested) {
      drawRequested = true;
      requestAnimationFrame(() => {
        drawCalendar({
          month: selectedMonth,
          year: selectedYear,
          boxSize,
          backgroundImage,
          canvas,
          calendarRect,
          backgroundRect,
          firstDayOfWeek: 1,
          locale: 'en-GB',
        });
        drawRequested = false;
      });
    }
  }

  function handleFileUpload(e: ChangeEvent) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      backgroundImage = new Image();
      backgroundImage.src = event.target.result as string;
      backgroundImage.onload = () => onBackgroundImageLoad();
    };

    reader.readAsDataURL(file);
  }

  // When the background image is loaded, update backgroundRect
  function onBackgroundImageLoad() {
    updateCanvasSize();
    backgroundRect.height = canvasHeight;
    backgroundRect.width = canvasWidth;
  }

  function exportCalendar() {
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'calendar.png';
    link.click();
  }

  function onMonthYearChange() {
    requestDrawCalendar();
  }

  function updateCanvasSize() {
    if (selectedResolution === "auto") {
      if (backgroundImage) {
        canvasWidth = backgroundImage.naturalWidth;
        canvasHeight = backgroundImage.naturalHeight;
      }
    } else {
      const [width, height] = selectedResolution.split("x").map(Number);
      canvasWidth = width;
      canvasHeight = height;
    }
  }

  function updateBoxSize() {
    calendarRect.width = boxSize * 7;
    calendarRect.height = boxSize * (6 + 1); // 6 weeks + 1 row for days of the week
    requestDrawCalendar();
  }

</script>

<style>

  .settings {
    display: flex;
  }

  canvas {
    border: 1px solid black;
  }
</style>
<div class="settings">
  <input type="file" accept="image/*" on:input={handleFileUpload} />

  <select bind:value={selectedMonth} on:change={onMonthYearChange}>
    <option value={0}>January</option>
    <option value={1}>February</option>
    <option value={2}>March</option>
    <option value={3}>April</option>
    <option value={4}>May</option>
    <option value={5}>June</option>
    <option value={6}>July</option>
    <option value={7}>August</option>
    <option value={8}>September</option>
    <option value={9}>October</option>
    <option value={10}>November</option>
    <option value={11}>December</option>
  </select>
  <select bind:value={selectedYear} on:change={onMonthYearChange}>
    {#each Array.from({length: 11}, (_, i) => new Date().getFullYear() - 5 + i) as year}
      <option value={year}>{year}</option>
    {/each}
  </select>
  <button on:click={exportCalendar}>Export Calendar</button>
</div>
<div class="settings">
  <label for="boxSize">Box Size: </label>
  <input id="boxSize" type="number" min="50" bind:value={boxSize} on:input={() => updateBoxSize()} />

  <label for="canvasWidth">Canvas Width: </label>
  <input id="canvasWidth" type="number" min="300" bind:value={canvasWidth} on:input={() => requestDrawCalendar()} />

  <label for="canvasHeight">Canvas Height: </label>
  <input id="canvasHeight" type="number" min="300" bind:value={canvasHeight} on:input={() => requestDrawCalendar()} />

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
</div>

<canvas bind:this={canvas} width={canvasWidth} height={canvasHeight}></canvas>


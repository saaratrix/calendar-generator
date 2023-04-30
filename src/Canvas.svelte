<script lang="ts">
  import { onMount } from 'svelte';
  import type {ChangeEvent} from "rollup";
  import { findNearestResolution } from './resolution-helper';

  type SelectedResolution = `${number}x${number}`

  let backgroundImage: HTMLImageElement;
  let canvas: HTMLCanvasElement;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let selectedResolution: SelectedResolution | '' = '';
  let ctx: CanvasRenderingContext2D;
  let selectedMonth = new Date().getMonth();
  let selectedYear = new Date().getFullYear();
  let boxSize = 100;

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
    }
  }

  onMount(() => {
    const initialResolution = findNearestResolution(window.innerWidth, window.innerHeight);
    canvasWidth = initialResolution.width;
    canvasHeight = initialResolution.height;
    ctx = canvas.getContext('2d');
    selectedResolution = `${canvasWidth}x${canvasHeight}` as SelectedResolution;
    requestDrawCalendar();
  });

  function requestDrawCalendar() {
  if (!drawRequested) {
    drawRequested = true;
    requestAnimationFrame(() => {
      drawCalendar(selectedMonth, selectedYear);
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

      backgroundImage.onload = () => {
        requestDrawCalendar();
      };
    };

    reader.readAsDataURL(file);
  }

  function drawCalendar(month: number, year: number) {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (backgroundImage) {
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }

    // Set text style
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'white';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'black';
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 4;

    // Calculate the starting day and number of days in the month
    let startDay = new Date(year, month, 1).getDay() - 1; // Subtract 1 to start from Monday
    startDay = startDay === -1 ? 6 : startDay; // If startDay is -1 (Sunday), set it to 6
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let date = 1;
    let x = 0;
    let y = 0;
    const numCols = 7;
    const totalCalendarWidth = boxSize * numCols;
    const startX = 25; //(canvas.width - gridWidth) / 2;
    let startY = 0;

    // Draw weekday names
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const monthYearText = `${monthNames[month]} - ${year}`;
    ctx.font = 'bold 20px Arial';
    const monthYearTextMeasure = ctx.measureText(monthYearText);
    const monthYearTextX = totalCalendarWidth / 2;
    const monthYearHeight = monthYearTextMeasure.actualBoundingBoxAscent + monthYearTextMeasure.actualBoundingBoxDescent;
    ctx.fillText(monthYearText, monthYearTextX, startY + monthYearHeight);

    ctx.font = 'bold 16px Arial';
    startY += monthYearHeight * 1.5;
    const weekdaysHeight = monthYearHeight;

    for (let col = 0; col < 7; col++) {
      const x = startX + col * boxSize;
      ctx.fillText(weekdays[col], x + boxSize / 2, startY + weekdaysHeight);
    }

    startY += weekdaysHeight * 2;
    ctx.font = '16px Arial';
    // Iterate through weeks (rows)
    for (let week = 0; week < 6; week++) {
      y = week * boxSize + startY;

      // Iterate through days (columns)
      for (let day = 0; day < 7; day++) {
        x = startX + day * boxSize;

        if (week === 0 && day < startDay || date > daysInMonth) {
          // Skip empty cells before the start of the month or after the end of the month
          continue;
        }

        // Draw the date box
        ctx.strokeRect(x, y, boxSize, boxSize);

        // Draw the date number
        ctx.fillText(date.toString(), x + boxSize / 2, y + monthYearHeight);

        date++;
      }
    }
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

  function updateSelectedResolution() {
    const [width, height] = selectedResolution.split('x').map(Number);
    canvasWidth = width;
    canvasHeight = height;
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
  <input id="boxSize" type="number" min="50" bind:value={boxSize} on:input={() => requestDrawCalendar()} />

  <label for="canvasWidth">Canvas Width: </label>
  <input id="canvasWidth" type="number" min="300" bind:value={canvasWidth} on:input={() => requestDrawCalendar()} />

  <label for="canvasHeight">Canvas Height: </label>
  <input id="canvasHeight" type="number" min="300" bind:value={canvasHeight} on:input={() => requestDrawCalendar()} />

  <select bind:value={selectedResolution} on:change={() => updateSelectedResolution()}>
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


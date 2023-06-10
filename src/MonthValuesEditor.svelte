<script lang="ts">
  import {
    selectedMonth,
    currentMonthItem,
    updateMonthProperty,
    selectedYear,
    backgroundImageLoaded, canvasWidth, canvasHeight
  } from './store';
  import {monthNames} from "./constants";
  import { onMount } from 'svelte';
  import { isColorDark } from './calendar-drawer';
  import type { BoxSize } from './box-size';
  import { calculateCalendarHeight } from './utils';
  import type { Month } from './month';

  let boxSize: BoxSize = { width: 100, height: 100 };
  let backgroundImage: HTMLImageElement;
  let calendarColor: string = "#FFFFFF";
  let borderColor: 'transparent' | 'black' | '' = '';

  $: {
    borderColor = isColorDark(calendarColor) ? 'transparent' : 'black';
  }

  onMount(() => {
    onCurrentMonthChanged($currentMonthItem);
    let lastUpdatedMonth = $currentMonthItem;

    const subscriptions = [
      currentMonthItem.subscribe(() => {
        if (lastUpdatedMonth !== $currentMonthItem) {
          onCurrentMonthChanged($currentMonthItem)
        }

        lastUpdatedMonth = $currentMonthItem;
      }),
    ];

    updateCalendarRect();

    return () => {
      subscriptions.forEach(subscription => subscription());
    };
  })

  function onCurrentMonthChanged(item: Month): void {
    calendarColor = item.calendarColor.value;
    boxSize = { ...item.boxSize.value };
    backgroundImage = item.backgroundImage.value;
  }

  function handleFileUpload(e: InputEvent) {
    const target = e.target as HTMLInputElement;
    const file = target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      backgroundImage = new Image();
      backgroundImage.src = event.target.result as string;
      backgroundImage.onload = () => onBackgroundImageLoad();
    };

    reader.readAsDataURL(file);
  }

  function onBackgroundImageLoad() {
    updateMonthProperty('backgroundImage', backgroundImage);
    // This will synchronously update canvasWidth.
    backgroundImageLoaded.set(backgroundImage);
    updateMonthProperty('backgroundRect', {
      ...$currentMonthItem.backgroundRect.value,
      width: $canvasWidth,
      height: $canvasHeight,
    });
  }

  function boxSizeChanged() {
    updateMonthProperty('boxSize', { ...boxSize });
    updateCalendarRect();
  };

  function updateCalendarRect() {
    const calendarRect = $currentMonthItem.calendarRect.value;

    calendarRect.width = boxSize.width * 7;
    calendarRect.height = calculateCalendarHeight(boxSize.height, $selectedYear, $selectedMonth, 1);

    updateMonthProperty('calendarRect', { ...calendarRect });
  }

</script>

<input type="file" accept="image/*" on:input={handleFileUpload} />

<select bind:value={$selectedMonth}>
  {#each monthNames as name, index}
    <option value={index}>{name}</option>
  {/each}
</select>

<label for="boxSizeWidth">Calendar Width: </label>
  <input id="boxSizeWidth" type="number" min="50" bind:value={boxSize.width} on:input={boxSizeChanged} />
  <label for="boxSizeHeight">Calendar Height: </label>
  <input id="boxSizeHeight" type="number" min="50" bind:value={boxSize.height} on:input={boxSizeChanged} />

  <label for="calendar-color-picker" class="color-picker-container">
    Color:
    <input
      type="color"
      bind:value="{calendarColor}"
      on:input="{() => updateMonthProperty('calendarColor', calendarColor)}"
      class="calendar-color-picker"
      id="calendar-color-picker"
    />
    <div
      class="color-display"
      style="background-color: {calendarColor}; border-color: {borderColor};"
    />
  </label>
<script lang="ts">
  import { selectedMonth } from './store';
  import {monthNames} from "./constants";

</script>

<select bind:value={$selectedMonth}>
  {#each monthNames as name, index}
    <option value={index}>{name}</option>
  {/each}
</select>
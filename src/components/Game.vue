<template>
  <table v-if="grid !== undefined">
    <tr v-for="row in rows">
      <td v-for="column in columns" :key="row">
        <button
          @click="() => playAt(row * 3 + column)"
          :key="row * 3 + column"
          :disabled="!(hasTurn && isNullAddress(grid[row * 3 + column]))"
        >
          {{
            grid[row * 3 + column] === self
              ? 'X'
              : isNullAddress(grid[row * 3 + column])
              ? '...'
              : 'O'
          }}
        </button>
      </td>
    </tr>
  </table>
  <p>It's {{ hasTurn ? 'your' : "the opponent's" }} turn!</p>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from '../store';
import { isNullAddress } from '../utils';
const store = useStore();
const grid = computed(() => store.state.grid);
const self = computed(() => store.state.account);
const hasTurn = computed(() => store.getters.hasTurn);
const rows = [0, 1, 2];
const columns = [0, 1, 2];
const playAt = (coord: number) => store.dispatch('playAt', coord);
</script>

<template>
  <div class="box" style="text-align: center">
    <h2>Your action will echo in eternity</h2>
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
                ? '&#10006;'
                : isNullAddress(grid[row * 3 + column])
                ? '&nbsp;'
                : '&#128903;'
            }}
          </button>
        </td>
      </tr>
    </table>
    <br /><br />
    <h2>It's {{ hasTurn ? 'your' : "the opponent's" }} turn...</h2>
  </div>
</template>

<style scoped>
button {
  font-size: 70px;
  height: 90px;
  width: 100px;
  padding: 0 10px;
}
table {
  display: inline-block;
}
</style>

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

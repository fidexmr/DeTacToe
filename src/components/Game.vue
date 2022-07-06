<template>
  <div class="box" style="text-align: center">
    <h2 class="head">It's {{ hasTurn ? 'your' : "the opponent's" }} turn...</h2>
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
    <p style="text-align: center">You are playing for 0.01 {{ getNetworkUnit(Number(network)) }}</p>
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
import { getNetworkUnit, isNullAddress } from '../utils';
const store = useStore();
const grid = computed(() => store.state.grid);
const network = computed(() => store.state.network);
const self = computed(() => store.state.account);
const hasTurn = computed(() => store.getters.hasTurn);
const rows = [0, 1, 2];
const columns = [0, 1, 2];
const playAt = (coord: number) => store.dispatch('playAt', coord);
</script>

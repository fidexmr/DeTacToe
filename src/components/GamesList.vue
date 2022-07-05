<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from '../store';
import { getNetworkUnit, shortenAddress } from '../utils';
const store = useStore();
const balance = computed(() => store.state.balance);
const network = computed(() => store.state.network);
const gamesList = computed(() => store.state.gamesList);
const join = (host: string) => store.dispatch('join', host);
</script>

<template>
  <p v-if="gamesList === undefined">Looking for game offers...</p>
  <ul v-else-if="gamesList.length > 0">
    <h2>Open</h2>
    <li v-for="game in gamesList" :key="game.host">
      <button :disabled="game.bet >= (balance! + 0.01)" @click="() => join(game.host)">
        JOIN {{ shortenAddress(game.host) }} FOR {{ game.bet }}
        {{ getNetworkUnit(Number(network)) }}
      </button>
    </li>
  </ul>
  <h2 v-else>No game :(</h2>
</template>

<style scoped>
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
button {
  text-transform: none;
}
h2 {
  text-align: left;
}
</style>

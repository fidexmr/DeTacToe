<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from '../store';
import { getNetworkUnit } from '../utils';
const store = useStore();
const balance = computed(() => store.state.balance);
const network = computed(() => store.state.network);
const gamesList = computed(() => store.state.gamesList);
const join = (host: string) => store.dispatch('join', host);
</script>

<template>
  <p v-if="gamesList === undefined">Looking for game offers...</p>
  <ul v-else-if="gamesList.length > 0">
    <p>Available games</p>
    <li v-for="game in gamesList" :key="game.host">
      <button :disabled="game.bet >= (balance! + 0.01)" @click="() => join(game.host)">
        Join {{ game.host }} for {{ game.bet }} {{ getNetworkUnit(Number(network)) }}
      </button>
    </li>
  </ul>
  <p v-else>No game offer from other players</p>
</template>

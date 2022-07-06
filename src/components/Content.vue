<script setup lang="ts">
import { computed } from 'vue';
import InvalidNetwork from '../InvalidNetwork.vue';
import { useStore } from '../store';
import { getNetworkUnit } from '../utils';
import CreateGame from './CreateGame.vue';
import CurrentOffer from './CurrentOffer.vue';
import Game from './Game.vue';
import GamesList from './GamesList.vue';
const store = useStore();
const network = computed(() => store.state.network);
const isValidNetwork = computed(() => store.getters.isValidNetwork);
const isPlaying = computed(() => store.getters.isPlaying);
const isWaiting = computed(() => store.getters.isWaiting);
const isIdle = computed(() => store.getters.isIdle);
const account = computed(() => store.state.account);
const balance = computed(() => store.state.balance);
const stats = computed(() => store.state.stats);
const connect = () => store.dispatch('connect');
</script>

<template>
  <InvalidNetwork v-if="!isValidNetwork" />
  <div v-else>
    <div class="box">
      <div v-if="account === undefined" class="flex">
        <h1 class="warn">Disconnected!</h1>
        <button @click="connect">connect</button>
      </div>
      <div v-else>
        <h2>{{ account ?? '...' }}</h2>
        <p v-if="stats !== undefined" class="flex">
          <p>STATS: </p><p>won {{ stats.won }} | lost {{ stats.lost }} | tie {{ stats.tie }}</p>
        </p>
        <p class="flex">
          <p>BALANCE:</p>
          <p>{{ balance }} {{ getNetworkUnit(Number(network)) }}</p>
        </p>
        <p v-if="balance! < 0.02" style="text-align:center">
          <br>
          Your balance is low. Time to <a href="https://goerlifaucet.com/" target="_blank">refuel</a>.
        </p>
      </div>
    </div>
    <Game v-if="isPlaying" />
    <div v-else-if="account!==undefined" class="box flex">
      <GamesList />
      <div>
        <CreateGame v-if="isIdle" />
        <CurrentOffer v-else-if="isWaiting" />
      </div>
    </div>
  </div>
</template>

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
    <button @click="connect" v-if="account === undefined">connect</button>
    <div v-else>
      <h1>{{ account ?? '...' }}</h1>
      <p>{{ balance }} {{ getNetworkUnit(Number(network)) }}</p>
      <p v-if="balance! < 0.02">
        Your balance is low. <a href="https://goerlifaucet.com/" target="_blank">Refuel!</a>
      </p>
      <p v-if="stats !== undefined">
        Won: {{ stats.won }}, lost: {{ stats.lost }}, tie: {{ stats.tie }}, created:
        {{ stats.created }}
      </p>
      <div v-if="!isPlaying">
        <CreateGame v-if="isIdle" />
        <CurrentOffer v-if="isWaiting" />
        <GamesList />
      </div>
      <Game v-else />
    </div>
  </div>
</template>

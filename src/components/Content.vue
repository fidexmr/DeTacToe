<script setup lang="ts">
import { computed } from 'vue';
import { CONTRACT_CHAIN, UNIT } from '../const';
import InvalidNetwork from '../InvalidNetwork.vue';
import { useStore } from '../store';

const store = useStore();
const account = computed(() => store.state.account);
const balance = computed(() => store.state.balance);
const network = computed(() => store.state.network);
// Can't get the updated network value...
const isInvalidNetwork = Number(network.value) !== CONTRACT_CHAIN;
console.log(isInvalidNetwork, network);
const connect = () => store.dispatch('connect');
</script>

<template>
  <InvalidNetwork v-if="isInvalidNetwork" />
  <div v-else>
    <h1>{{ account ?? '...' }}</h1>
    <p>{{ balance ?? '...' }} {{ UNIT }}</p>
    <button @click="connect">connect</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import InvalidNetwork from '../InvalidNetwork.vue';
import { useStore } from '../store';
import { getNetworkUnit } from '../utils';
const store = useStore();
const network = computed(() => store.state.network);
const isValidNetwork = computed(() => store.getters.isValidNetwork);
const account = computed(() => store.state.account);
const balance = computed(() => store.state.balance);
const connect = () => store.dispatch('connect');
</script>

<template>
  <InvalidNetwork v-if="!isValidNetwork" />
  <div>
    <button @click="connect" v-if="account === undefined">connect</button>
    <div v-else>
      <h1>{{ account ?? '...' }}</h1>
      <p>{{ balance === undefined ? '...' : balance }} {{ getNetworkUnit(Number(network)) }}</p>
    </div>
  </div>
</template>

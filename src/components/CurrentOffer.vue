<template>
  <h2>Your offer</h2>
  <h2>{{ bet }} {{ getNetworkUnit(Number(network)) }}</h2>
  <button @click="cancel">Cancel Offer</button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from '../store';
import { getNetworkUnit } from '../utils';
const store = useStore();
const cancel = () => store.dispatch('cancel');
const bet = computed(() => store.state.game?.bet);
const network = computed(() => store.state.network);
</script>

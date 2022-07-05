<template>
  <h2>Create</h2>
  <button @click="create">OFFER A GAME FOR 0.01 {{ getNetworkUnit(Number(network)) }}</button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from '../store';
import { getNetworkUnit } from '../utils';
const store = useStore();
const create = () => store.dispatch('create');
const network = computed(() => store.state.network);
</script>

<style scoped>
h2 {
  text-align: right;
}
button {
  text-transform: none;
}
</style>

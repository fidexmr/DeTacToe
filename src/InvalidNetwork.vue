<script setup lang="ts">
import { useStore } from './store';
const store = useStore();
const switchNetwork = () => store.dispatch('switchNetwork');
</script>

<template>
  <p>Invalid network</p>
  <button @click="switchNetwork">Switch to Goerli</button>
</template>

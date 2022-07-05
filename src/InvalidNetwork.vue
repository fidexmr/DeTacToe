<script setup lang="ts">
import { useStore } from './store';
const store = useStore();
const switchNetwork = () => store.dispatch('switchNetwork');
</script>

<template>
  <div class="box flex">
    <h1 class="warn">Invalid network !</h1>
    <button @click="switchNetwork">Switch to Goerli</button>
  </div>
</template>

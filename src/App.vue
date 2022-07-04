<script setup lang="ts">
import Content from './components/Content.vue';
import InstallMetamask from './InstallMetamask.vue';
import { useStore } from './store';
const hasMetamask = window.ethereum !== undefined;
hasMetamask && useStore().dispatch('init');
</script>

<template>
  <Content v-if="hasMetamask" />
  <InstallMetamask v-else />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
}
</style>

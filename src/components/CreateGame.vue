<template>
  <button @click="create">Create</button>
</template>

<script setup lang="ts">
import { useStore } from '../store';
const store = useStore();
const create = () => store.dispatch('create');
</script>

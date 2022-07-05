<script setup lang="ts">
import Content from './components/Content.vue';
import Welcome from './components/Welcome.vue';
import InstallMetamask from './InstallMetamask.vue';
import { useStore } from './store';
const hasMetamask = window.ethereum !== undefined;
hasMetamask && useStore().dispatch('init');
</script>

<template>
  <Welcome />
  <Content v-if="hasMetamask" />
  <InstallMetamask v-else />
</template>

<style>
body {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  background: rgb(0, 0, 0);
  margin: 0;
  text-shadow: 0 0 2px #000;
  overflow-x: hidden;
}
p,
h1,
h2 {
  margin: 0;
}
h1,
h2 {
  text-align: center;
  margin-bottom: 20px;
}
p {
  text-align: justify;
}
#app > div {
  left: 50%;
  position: relative;
  margin-left: -300px;
}
.box {
  border-radius: 15px;
  border: solid 3px #aaa;
  box-shadow: 0 0 20px #ff3e3e;
  margin-top: 20px;
  max-width: 600px;
  padding: 20px;
  background: #ff3e3e;
}
.flex {
  display: flex;
  justify-content: space-between;
  align-items: end;
}
button {
  border-radius: 10px;
  box-shadow: 0 0 10px #000;
  background: #b00;
  font-weight: bold;
  padding: 10px;
  text-transform: uppercase;
  border: solid 3px #000;
  cursor: pointer;
  transition: ease 300ms;
}
button:hover {
  background: #f00;
}
button:disabled {
  background: #800;
  color: #222;
}
button:disabled:hover {
  background: #800;
}
.warn {
  margin: 0;
}
</style>

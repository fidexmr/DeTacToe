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
  margin: 0;
  overflow-x: hidden;
  background: #7171b5;
}
a {
  color: #000;
}
p,
h1,
h2,
h3 {
  margin: 0;
}
h1,
h2,
h3 {
  text-align: center;
}
.head {
  position: relative;
  text-shadow: 0 0 1px #000;
  top: -20px;
  left: -20px;
  width: calc(100% + 40px);
  padding: 20px 0;
  background: #ffda37;
  border-bottom: solid 3px #000;
}
p {
  text-align: justify;
}
#app > div {
  left: 50%;
  position: relative;
  margin-left: -275px;
  box-sizing: border-box;
  width: 550px;
}
.box {
  background: #fff;
  border-radius: 15px;
  border: solid 3px #000;
  box-shadow: 5px 5px 0 #000;
  margin-top: 20px;
  padding: 20px;
  overflow: hidden;
}
.flex {
  display: flex;
  justify-content: space-between;
  align-items: end;
}
button {
  border-radius: 10px;
  box-shadow: 3px 3px 0 #000;
  background: #ffda37;
  font-weight: bold;
  padding: 10px;
  text-transform: uppercase;
  border: solid 3px #000;
  cursor: pointer;
  transition: ease 150ms;
}
button:hover {
  box-shadow: 0px 0px 0 #000;
  transform: translateX(3px) translateY(3px);
  background: #ff2d2d;
}
button:disabled {
  background: #ffc03a;
  color: #222;
  cursor: default;
  box-shadow: 0 0 0;
  border: none;
}
button:disabled:hover {
  transform: translateX(0) translateY(0);
}
.warn {
  margin: 0;
}
@media (max-width: 780px) {
  #app > div {
    margin-left: -188px;
    width: 375px;
  }
}
</style>

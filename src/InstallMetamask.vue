<script setup lang="ts">
const storeUrl =
  'https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn';
</script>

<template>
  <div class="flex box">
    <p>
      This application requires installing the browser extension
      <a :href="storeUrl" target="_blank"> Metamask</a>. <br />
      Be sure to be a on desktop computer and use Chrome, Brave or Firefox.
    </p>
  </div>
</template>

<style scoped>
p {
  text-align: center;
  width: 100%;
}
</style>

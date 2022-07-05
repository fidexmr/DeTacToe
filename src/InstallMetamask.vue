<script setup lang="ts">
const storeUrl =
  'https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn';
</script>
<template>
  <p>
    This application requires installing the browser extension
    <a :href="storeUrl" target="_blank"> Metamask</a>. <br />
    Be sure to be a on desktop computer and use Chrome, Brave or Firefox.
  </p>
</template>

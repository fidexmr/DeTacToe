<script setup lang="ts">
import { TicTacToeContract } from '../../types/truffle-contracts/TicTacToe';

const address = '0x0fed...fe21';
const balance = '33 GoEth';
const stats = 'won 3 lost 2 tie 0';
const contract = (await fetch('./build/contracts/TicTacToe.json').then((r) =>
  r.json(),
)) as TicTacToeContract;
const contractName = contract.contractName;
</script>

<template>
  <Suspense>
    <template #default>
      <p>{{ address }}</p>
      <p>{{ balance }}</p>
      <p>{{ stats }}</p>
      <p>{{ contractName }}</p>
    </template>
    <template #fallback>
      <p>Loading</p>
    </template>
  </Suspense>
</template>

<style scoped></style>

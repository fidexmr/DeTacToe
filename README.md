# DeTacToe
This repo contains the code for a WIP tic-tac-toe game to experiment with solidity and gamefi concepts.

## Description
The implementation runs as follows: 
1. an address sends a bet to the contract to tease another player. It can be renounced or cancelled.
1. another address can pick the game and the contract starts it if the bet is identical
1. The one winning the game gets the money.

## Todo
1. complete the game's core logic
1. deploy the contract and the website to prod platforms
1. add decent front-end

## Prospects
Game mechanic: started can win or tie, visitor can lose or tie
=> Should an oracle be added in order to have random first round?
=> What if no one joins?
=> What if a player stops playing when the scenario becomes obvious, should all scenarii be pre-encoded?
=> Can a player create a new game offer while being visitor to another one?
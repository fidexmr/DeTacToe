# DeTacToe

This repo contains the code for a tic-tac-toe game to experiment gamefi capabilities.

## Description

The implementation runs as follows:

1. an address sends a bet to the contract to tease another player. It can be renounced or cancelled.
1. another address can pick the game and the contract starts it if the bet is identical
1. The one winning the game gets the money.

## Todo

1. add decent front-end
1. add hardhat dev script capability
1. Try out on a faster network than EVM
1. Fix Microsoft Edge responsiveness
1. Improve the CI part
1. Fix player not finishing the game

## Prospects

Game mechanic: started can win or tie, visitor can lose or tie
=> Should an oracle be added in order to have random first round?
=> Can a player create a new game offer while being visitor to another one?

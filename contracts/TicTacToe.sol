// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract TicTacToe {

  event Created(address host, uint bet);
  event Started(address host, address visitor, uint bet);
  event Squared(address host, address visitor, address winner, uint bet);

  struct Game {
    address host;
    address visitor;
    uint bet;
  }

  mapping (address=>Game) public games;

  function create() public payable {
    Game storage g = games[msg.sender];
    // Requires a bet value and cancels if this player has already planned a game.
    require(msg.value > 0 && g.bet == 0);
    g.bet = msg.value;
    g.host = msg.sender;
    emit Created(msg.sender, g.bet);
  }

  function join(address host) public payable {
    Game storage g = games[host];
    // Bets must be identical
    require(msg.value == g.bet);
    g.visitor = msg.sender;
    emit Started(host, msg.sender, g.bet);
  }

  function claim(address host) public {
    Game storage g = games[host];
    require(g.bet > 0);
    msg.sender.call{value: g.bet * 2};
    g.bet = 0;
    emit Squared(host, g.visitor, msg.sender, g.bet);
  }
}

// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract TicTacToe {

  event Created(address host, uint bet);
  event Started(address host, address visitor, uint bet);
  event Squared(address host, address winner);

  struct Game {
    address host;
    address visitor;
    uint balance;
  }

  mapping (address=>Game) public games;

  function create() public payable returns (uint balance){
    Game storage g = games[msg.sender];
    // Requires a bet value and cancels if this player has already planned a game.
    require(msg.value > 0 && g.balance == 0);
    g.balance = msg.value;
    g.host = msg.sender;
    emit Created(msg.sender, g.balance);
    return address(this).balance;
  }

  function join(address host) public payable {
    Game storage g = games[host];
    require(msg.value == g.balance);
    g.balance += msg.value;
    g.visitor = msg.sender;
    emit Started(host, msg.sender, g.balance);
  }

  function claim(address host) public {
    require(games[host].balance > 0);
    msg.sender.call{value: games[host].balance};
    games[host].balance = 0;
    emit Squared(host, msg.sender);
  }
}

// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract TicTacToe {

  event Created(address host, uint bet);
  event Started(address host, address visitor, uint bet);

  struct Game {
    address visitor;
    uint balance;
  }

  mapping (address=>Game) games;

  function create() public payable returns (uint balance){
    require(msg.value > 0);
    Game storage g = games[msg.sender];
    g.balance = msg.value;
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
  }
}

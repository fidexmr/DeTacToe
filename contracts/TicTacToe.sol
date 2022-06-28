// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract TicTacToe {

  event Created(address host, uint bet);
  event Cancelled(address host);
  event Move(address host, address author, uint[2] coords);

  struct Game {
    address host;
    address visitor;
    uint bet;
  }

  struct Status {
    uint8 created;
    uint8 finished;
    uint8 won;
    uint8 lost;
    uint8 tie;
    address current;
  }

  mapping (address=>Game) public games;

  mapping (address=>Status) public status;

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
    bool isDraw = false;
    emit Squared(host, g.visitor, isDraw, msg.sender, g.bet);
  }
}

// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract TicTacToe {

  event Created(address host, uint bet);
  event Cancelled(address host);
  event Started(address host, address visitor);
  event Move(address host, address author, uint[2] coords);

  struct Game {
    address host;
    address visitor;
    uint bet;
  }

  struct Status {
    uint created;
    uint won;
    uint lost;
    uint tie;
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
    Status storage player = status[msg.sender];
    player.created += 1;
    player.current = msg.sender;
    emit Created(msg.sender, g.bet);
  }

  function cancel() public payable {
    Game storage g = games[msg.sender];
    require(g.bet > 0);
    Status storage player = status[msg.sender];
    // The require above should ensure that player.created > 0, and prevent underflow.
    player.created -= 1;
    player.current = address(0);
    // Recharge user.
    msg.sender.call{value: g.bet};
    g.bet = 0;
    emit Cancelled(msg.sender);
  }

  function join(address host) public payable {
    Game storage g = games[host];
    // Bets must be identical
    require(msg.value == g.bet);
    g.visitor = msg.sender;
    Status storage player = status[msg.sender];
    player.current = host;
    emit Started(host, msg.sender);
  }

  function claim(address host) public {
    Game storage g = games[host];
    require(g.bet > 0);
    msg.sender.call{value: g.bet * 2};
    g.bet = 0;
  }
}

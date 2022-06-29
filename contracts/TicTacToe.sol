// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract TicTacToe {

  event Created(address host, uint bet);
  event Cancelled(address host);
  event Started(address host, address visitor);
  event Move(address host, address author, uint[2] coords);
  event Squared(address host, address visitor, address winner, uint bet);

  struct Game {
    address host;
    address visitor;
    uint bet;
  }

  struct Status {
    uint16 created;
    uint16 won;
    uint16 lost;
    uint16 tie;
    address current;
  }

  mapping (address=>Game) public games;

  mapping (address=>Status) public status;

  function create() public payable {
    Game storage game = games[msg.sender];
    // Requires a bet value and cancels if this player has already planned a game.
    require(msg.value > 0 && game.bet == 0);
    game.bet = msg.value;
    game.host = msg.sender;
    Status storage player = status[msg.sender];
    player.created += 1;
    player.current = msg.sender;
    emit Created(msg.sender, game.bet);
  }

  function cancel() public {
    Game storage game = games[msg.sender];
    require(game.bet > 0 && game.visitor == address(0));
    Status storage player = status[msg.sender];
    // The require above should ensure that player.created > 0, and prevent underflow.
    player.created -= 1;
    player.current = address(0);
    // Recharge user.
    msg.sender.call{value: game.bet}("");
    game.bet = 0;
    emit Cancelled(msg.sender);
  }

  function join(address host) public payable {
    Game storage game = games[host];
    Status storage player = status[msg.sender];
    // Bets must be identical, addresses must be different, visitor must have no current game.
    require(msg.value == game.bet && msg.sender != host && player.current == address(0));
    game.visitor = msg.sender;
    player.current = host;
    emit Started(host, msg.sender);
  }

  function claim(address host) public {
    Game storage game = games[host];
    require(game.bet > 0);
    if(msg.sender != host){
      Status storage loser = status[host];
      loser.lost += 1;
      loser.current = address(0);
    }
    Status storage winner = status[msg.sender];
    msg.sender.call{value: game.bet * 2}("");
    emit Squared(host, game.visitor, msg.sender, game.bet);
    game.bet = 0;
    game.visitor = address(0);
    winner.won += 1;
    winner.current = address(0);
  }
}

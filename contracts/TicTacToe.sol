// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract TicTacToe {

  event Created(address host, uint bet);
  event Cancelled(address host);
  event Started(address host, address visitor);
  event Move(address host, address author, uint coords);
  event Squared(address host, address visitor, address winner, uint bet);

  uint[][] private scenarii = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

  struct Game {
    address host;
    address visitor;
    address[9] game;
    uint bet;
    bool hostTurn;
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

  function getGame(address host) public view returns (address[9] memory){
    return games[host].game;
  }

  function move(address host, uint cell) public {
    Game storage game = games[host];
    bool isHost = msg.sender == host;
    require(game.visitor != address(0) && game.hostTurn == isHost && game.game[cell] == address(0));
    game.hostTurn = !game.hostTurn;
    game.game[cell] = msg.sender;
    emit Move(host,msg.sender,cell);
    (bool hostWins, bool visitorWins, bool tie) = checkWinner(game.game, host, game.visitor );
    if(hostWins || visitorWins || tie){
      if(hostWins){
        pay(host, host);
      } else if(visitorWins){
        pay(host, game.visitor);
      } else if(tie){
        pay(host, address(0));
      }
    }
  }

  function pay(address host, address winner) private {
    Game storage game = games[host];
    uint bet = game.bet;
    address visitor = game.visitor;
    bool isTie = winner == address(0);
    if(isTie){
      host.call{value: bet}("");
      visitor.call{value: bet}("");
    }else{
      winner.call{value: bet * 2}("");
    }
    emit Squared(host, game.visitor, winner, game.bet);
    // Update players stats.
    status[host].won += winner == host ? 1 : 0;
    status[host].lost += winner == visitor ? 1 : 0;
    status[host].tie += isTie ? 1 : 0;
    status[host].current = address(0);
    status[visitor].won += winner == visitor ? 1 : 0;
    status[visitor].lost += winner == host ? 1 : 0;
    status[visitor].tie += isTie ? 1 : 0;
    status[visitor].current = address(0);
    // Reset game tracker.
    game.bet = 0;
    game.visitor = address(0);
  }

  function checkWinner(address[9] memory game, address host, address visitor) view private returns (bool hostWins, bool visitorWins, bool tie){
    // Check win scenarii.
    for (uint i=0; i < scenarii.length; i++){
      uint[] memory scenario = scenarii[i];
      hostWins = game[scenario[0]] == game[scenario[1]] && game[scenario[0]] == game[scenario[2]] && game[scenario[0]] == host;
      visitorWins = game[scenario[0]] == game[scenario[1]] && game[scenario[0]] == game[scenario[2]] && game[scenario[0]] == visitor;
      if(hostWins || visitorWins){
        return (hostWins,visitorWins,tie);
      }
    }
    // Check if the grid is finished
    for(uint i = 0; i< game.length; i++){
      if(game[i] == address(0)){
        return (hostWins, visitorWins,tie);
      }
    }
    tie = true;
    return (hostWins,visitorWins,tie);
  }

  function create() public payable {
    Game storage game = games[msg.sender];
    // Requires a bet value and cancels if this player has already planned a game.
    require(msg.value > 0 && game.bet == 0);
    game.bet = msg.value;
    game.host = msg.sender;
    game.hostTurn = false; // TODO: add randomness.
    for(uint i = 0; i < game.game.length; i++){
      game.game[i] = address(0);
    }
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
}

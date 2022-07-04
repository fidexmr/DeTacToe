const CONTRACT_CHAIN = '0x5';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS_GOERLI;
const DEPLOYMENT_BLOCK = process.env.DEPLOYMENT_BLOCK_GOERLI;
const UNIT = 'GoerliEth';

let web3, contract, currentAddress;
let isPlaying, isHosting, isHosted;
let networkIsValid = false;
let gamesList, cancelledGames, startedGames, squaredGames;
let currentBet = 0;
let currentBalance = 0;

const input = document.getElementById('bet');
const activeGame = document.getElementById('active-game');
const log = document.getElementById('log');
const stats = document.getElementById('stats');
const balance = document.getElementById('balance');
const create = document.getElementById('create');
const cancel = document.getElementById('cancel');
const offer = document.getElementById('offer');
const playerPanel = document.getElementById('player');
const join = document.getElementById('join');
const gamePanel = document.getElementById('game-panel');
const connect = document.getElementById('connect');
const gameLog = document.getElementById('game-log');
const table = document.getElementById('tictactoe');
const cells = table.querySelectorAll('td button');
const turn = document.getElementById('turn');

window.addEventListener('load', init);

function showActiveGame(gameHost) {
  contract.methods
    .games(gameHost)
    .call()
    .then((game) => {
      const gameIsStarted = !/^0x0+$/.test(game.visitor);
      cancel.style.display = gameIsStarted ? 'none' : 'block';
      activeGame.style.display = gameIsStarted ? 'block' : 'none';
      gameLog.style.display = gameIsStarted ? 'block' : 'none';
      gameLog.textContent = `You have ${
        isHosting ? 'initiated a game joined by' : 'joined a game with'
      } ${isHosting ? game.visitor : gameHost} for ${web3.utils.fromWei(
        game.bet,
        'ether',
      )} ${UNIT}`;
      const isHost = currentAddress === gameHost;
      const hasTurn = game.hostTurn === isHost;
      turn.textContent = hasTurn ? "It's your turn!" : "It's the other player's turn";
      drawGame(gameHost, hasTurn);
    });
}

function drawGame(gameHost, hasTurn) {
  contract.methods
    .getGame(gameHost)
    .call()
    .then((game) => {
      game.forEach((address, i) => {
        const button = cells[i];
        const free = /^0x0+$/.test(address);
        button.innerHTML = free ? '...' : address === currentAddress ? 'X' : '0';
        button.disabled = !(hasTurn && free);
        button.onclick = () =>
          contract.methods.move(gameHost, Number(button.id)).send({ from: currentAddress });
      });
      contract.events.Move().on('data', ({ returnValues }) => {
        const isAuthor = returnValues.author === currentAddress;
        cells[returnValues.coords].innerHTML = isAuthor ? 'X' : 'O';
        for (let i = 0; i < cells.length; i++) {
          if (isAuthor) {
            cells[i].disabled = true;
            turn.textContent = "It's the other player's turn";
          } else if (cells[i].innerHTML === '...') {
            cells[i].disabled = false;
            turn.textContent = "It's your turn";
          }
        }
      });
    });
}

function hideActiveGame() {
  activeGame.style.display = 'none';
}

function checkAccounts(accounts) {
  if (networkIsValid && accounts !== undefined && accounts.length > 0) {
    currentAddress = accounts[0];
    log.textContent = currentAddress;
    web3.eth.getBalance(currentAddress).then((amount) => {
      const amountInEth = web3.utils.fromWei(amount, 'ether');
      currentBalance = Number(amountInEth);
      bet.max = amountInEth - 0.01;
      balance.textContent = `Available: ${amountInEth} ${UNIT}`;
    });
    connect.style.display = 'none';
    if (contract !== undefined) {
      contract.methods
        .status(currentAddress)
        .call()
        .then((status) => {
          stats.textContent = `Created ${status.created}, won ${status.won}, lost ${status.lost}, tie ${status.tie}`;
          isPlaying = !/^0x0+$/.test(status.current);
          isHosting = isPlaying && status.current === currentAddress;
          isHosted = isPlaying && !isHosting;
          create.style.display = !isPlaying ? 'block' : 'none';
          bet.style.display = !isPlaying ? 'block' : 'none';
          if (isPlaying) {
            showActiveGame(status.current);
          } else {
            hideActiveGame();
            cancel.style.display = 'none';
          }
        });
    }
    updateGamePanel();
    showPlayerPanel();
  } else {
    log.textContent = 'Not connected';
    balance.textContent = '';
    stats.textContent = '';
    connect.style.display = 'block';
    hideGamePanel();
    hidePlayerPanel();
  }
}

function updateGamesList() {
  const p1 = contract.getPastEvents('Created', {
    fromBlock: DEPLOYMENT_BLOCK,
    toBlock: 'latest',
  });
  const p2 = contract.getPastEvents('Cancelled', {
    fromBlock: DEPLOYMENT_BLOCK,
    toBlock: 'latest',
  });
  const p3 = contract.getPastEvents('Started', {
    fromBlock: DEPLOYMENT_BLOCK,
    toBlock: 'latest',
  });
  Promise.all([p1, p2, p3]).then((values) => {
    gamesList = {};
    values[0].forEach((entry) => {
      gamesList[entry.returnValues.host] === undefined
        ? (gamesList[entry.returnValues.host] = [entry.returnValues.bet])
        : gamesList[entry.returnValues.host].push(entry.returnValues.bet);
    });
    cancelledGames = values[1].map((entry) => ({
      host: entry.returnValues.host,
    }));
    startedGames = values[2].map((entry) => ({
      host: entry.returnValues.host,
      visitor: entry.returnValues.visitor,
    }));
    cancelledGames.forEach((game) => gamesList[game.host].shift());
    startedGames.forEach((game) => gamesList[game.host].shift());
    if (gamesList[currentAddress] !== undefined && gamesList[currentAddress].length > 0) {
      offer.style.display = 'block';
      offer.textContent = `Waiting for a player to join for ${web3.utils.fromWei(
        gamesList[currentAddress][0],
        'ether',
      )} ${UNIT}`;
      delete gamesList[currentAddress];
    } else {
      offer.style.display = 'none';
    }
    join.innerHTML = '';
    Object.keys(gamesList).forEach((host) => {
      if (gamesList[host].length === 0) {
        return;
      }
      const betAmount = web3.utils.fromWei(gamesList[host][0], 'ether');
      const button = document.createElement('button');
      button.innerHTML = `Join ${host} for ${betAmount} ${UNIT}`;
      button.onclick = () =>
        contract.methods.join(host).send({ from: currentAddress, value: gamesList[host][0] });
      button.disabled = betAmount >= currentBalance + 0.01;
      join.appendChild(button);
    });
  });
}

function updateGamePanel() {
  if (networkIsValid && contract !== undefined && currentAddress !== undefined) {
    gamePanel.style.display = 'block';
    updateGamesList();
  }
}

function hideGamePanel() {
  gamePanel.style.display = 'none';
}

function hidePlayerPanel() {
  playerPanel.style.display = 'none';
}

function showPlayerPanel() {
  playerPanel.style.display = 'block';
}

function checkNetwork(chainId) {
  if (CONTRACT_CHAIN !== chainId) {
    networkIsValid = false;
    log.textContent = `Wrong network ${chainId}`;
    hideGamePanel();
    hidePlayerPanel();
  } else {
    networkIsValid = true;
    web3.eth.getAccounts().then(checkAccounts);
  }
}

function init() {
  if (window.ethereum === undefined) {
    log.textContent = 'Install Metamask';
    return;
  }
  web3 = new Web3(ethereum);

  // Network
  ethereum.on('connect', (e) => checkNetwork(e.chainId));
  ethereum.on('disconnect', (e) => {
    networkIsValid = false;
    log.textContent = 'Connectivity issue' + e;
  });
  ethereum.on('chainChanged', checkNetwork);

  // Account
  web3.eth.getAccounts().then(checkAccounts);
  ethereum.on('accountsChanged', () => checkAccounts(web3.eth.accounts[0])); // web3 accounts are checksum-ed.
  connect.onclick = () => {
    web3.eth.requestAccounts().then(checkAccounts);
  };

  // Contract
  fetch('./build/contracts/TicTacToe.json')
    .then((r) => r.json())
    .then((compiledContract) => {
      contract = new web3.eth.Contract(compiledContract.abi, CONTRACT_ADDRESS);
      handleContract();
    });

  create.innerHTML = `Start a game for ${String(currentBet)} ${UNIT}`;
  bet.addEventListener('input', ({ target }) => {
    currentBet = Number(target.value);
    create.innerHTML = `Start a game for ${String(currentBet)} ${UNIT}`;
  });
}

function handleContract() {
  create.onclick = () => {
    contract.methods.create().send({
      from: currentAddress,
      value: web3.utils.toWei(String(currentBet), 'ether'),
    });
  };
  cancel.onclick = () => {
    contract.methods.cancel().send({ from: currentAddress });
  };
  contract.events.Created().on('data', () => checkAccounts([currentAddress]));
  contract.events.Cancelled().on('data', () => checkAccounts([currentAddress]));
  contract.events.Started().on('data', () => checkAccounts([currentAddress]));
  contract.events.Squared().on('data', () => checkAccounts([currentAddress]));
  updateGamePanel();
}

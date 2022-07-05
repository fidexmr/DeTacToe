/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { InjectionKey } from 'vue';
import { createStore, Store, useStore as baseUseStore } from 'vuex';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { TicTacToeInstance } from '../types/truffle-contracts';
import { CONTRACT_ADDRESS, CONTRACT_CHAIN, DEPLOYMENT_BLOCK } from './const';
import { isNullAddress } from './utils';

let web3: Web3;
let contract: Contract;

interface IPlayersStats {
  won: number;
  lost: number;
  tie: number;
  created: number;
  current: string;
}

interface IGame {
  host: string;
  visitor: string;
  game: string[];
  bet: number;
  hostTurn: boolean;
}

interface IGameItem {
  host: string;
  bet: number;
}

export interface State {
  network?: string;
  account?: string;
  isConnected: boolean;
  balance?: number;
  stats?: IPlayersStats;
  game?: IGame;
  grid?: string[];
  gamesList?: IGameItem[];
}

export const key: InjectionKey<Store<State>> = Symbol();

export const store = createStore<State>({
  state: {
    isConnected: false,
  },
  getters: {
    isValidNetwork(state) {
      return state.network === undefined ? false : Number(state.network) === CONTRACT_CHAIN;
    },
    isPlaying(state) {
      return (
        (state.stats?.current !== undefined &&
          !isNullAddress(state.stats.current) &&
          state.stats?.current !== state.account) ||
        (state.game !== undefined && !isNullAddress(state.game.visitor))
      );
    },
    isWaiting(state) {
      return state.game !== undefined && state.game.bet > 0 && isNullAddress(state.game.visitor);
    },
    isIdle(state) {
      return state.stats !== undefined && isNullAddress(state.stats.current);
    },
    hasTurn(state) {
      return state.game?.hostTurn === (state.game?.host === state.account);
    },
  },
  mutations: {
    setAccount(state, accounts: string[]) {
      state.account = accounts[0];
      state.balance = undefined;
      state.stats = undefined;
      state.game = undefined;
    },
    setNetwork(state, chainId?: string) {
      state.network = chainId;
      state.account = undefined;
      state.balance = undefined;
      state.stats = undefined;
      state.game = undefined;
    },
    setBalance(state, balance: number) {
      state.balance = balance;
    },
    setStats(state, stats: IPlayersStats) {
      state.stats = stats;
    },
    setGame(state, game: IGame) {
      const bet = Number(web3.utils.fromWei(String(game.bet)));
      state.game = { ...game, bet };
    },
    setGames(state, games: { [address: string]: number[] }) {
      const list: IGameItem[] = [];
      Object.keys(games).forEach((host) =>
        list.push({ host, bet: Number(web3.utils.fromWei(String(games[host][0]))) }),
      );
      state.gamesList = list;
    },
    setGrid(state, grid: string[]) {
      state.grid = grid;
    },
    setGridCoords(state, change: { author: string; coords: number }) {
      if (state.grid === undefined) return;
      const grid = [...state.grid];
      grid[change.coords] = change.author;
      state.grid = grid;
    },
  },
  actions: {
    init({ dispatch }) {
      window.ethereum.on('connect', (e) =>
        dispatch('updateAll', (e as { [key: string]: string }).chainId),
      );
      window.ethereum.on('disconnect', () => {
        dispatch('updateAll');
      });
      window.ethereum.on('chainChanged', (e) => dispatch('updateAll', e as string));
      window.ethereum.on('accountsChanged', () => dispatch('getAccount'));
      web3 = new Web3(window.ethereum as any);
      web3.eth.getChainId((err, chainId) => dispatch('updateAll', String(chainId)));
    },
    updateAll({ dispatch, commit }, chainId: string) {
      commit('setNetwork', chainId);
      dispatch('getAccount');
      dispatch('getContract');
    },
    getAccount({ commit, dispatch, getters }) {
      if (!getters.isValidNetwork) return;
      web3.eth.getAccounts().then((accounts: string[]) => {
        commit('setAccount', accounts);
        dispatch('getBalance');
        if (contract !== undefined) {
          dispatch('updateData');
        }
      });
    },
    getBalance({ state, commit }) {
      if (state.account === undefined) return;
      web3.eth.getBalance(state.account).then((balance) => {
        commit('setBalance', Number(web3.utils.fromWei(balance, 'ether')));
      });
    },
    getContract({ dispatch, state, getters }) {
      if (!getters.isValidNetwork) return;
      fetch('./build/contracts/TicTacToe.json')
        .then((r) => r.json())
        .then((compiledContract: TicTacToeInstance) => {
          contract = new web3.eth.Contract(compiledContract.abi, CONTRACT_ADDRESS);
          const update = () => {
            if (state.account !== undefined) {
              dispatch('updateData');
            }
          };
          update();
          contract.events.Created().on('data', update);
          contract.events.Cancelled().on('data', update);
          contract.events.Started().on('data', update);
          contract.events.Squared().on('data', update);
          dispatch('getGamesList');
        });
    },
    updateData({ dispatch }) {
      dispatch('getStats');
      dispatch('getBalance');
      dispatch('getGamesList');
    },
    getStats({ commit, state, dispatch }) {
      contract.methods
        .status(state.account)
        .call()
        .then((stats: IPlayersStats) => {
          commit('setStats', stats);
          dispatch('getGame', stats.current);
          dispatch('getGrid');
        });
    },
    getGame({ commit }, host: string) {
      contract.methods
        .games(host)
        .call()
        .then((game: IGame) => commit('setGame', game));
    },
    getGrid({ commit, state, dispatch }) {
      contract.methods
        .getGame(state.stats?.current)
        .call()
        .then((grid: string[]) => {
          commit('setGrid', grid);
          contract.events.Move().on('data', (e: unknown) => {
            dispatch('getGame', e.returnValues.host);
            commit('setGridCoords', {
              coords: Number(e.returnValues.coords),
              author: e.returnValues.author as string,
            });
          });
        });
    },
    getGamesList({ commit, state }) {
      if (state.account === undefined) return;
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
        if (state.account === undefined) return;
        const gamesList: { [address: string]: number[] } = {};
        values[0].forEach((entry) => {
          gamesList[entry.returnValues.host] === undefined
            ? (gamesList[entry.returnValues.host] = [entry.returnValues.bet as number])
            : gamesList[entry.returnValues.host].push(entry.returnValues.bet as number);
        });
        const cancelledGames = values[1].map((entry) => ({
          host: entry.returnValues.host as string,
        }));
        const startedGames = values[2].map((entry) => ({
          host: entry.returnValues.host as string,
          visitor: entry.returnValues.visitor as string,
        }));
        cancelledGames.forEach((game) => gamesList[game.host].shift());
        startedGames.forEach((game) => gamesList[game.host].shift());
        Object.keys(gamesList).forEach((host) => {
          if (gamesList[host].length === 0 || host === state.account) {
            delete gamesList[host];
          }
        });
        commit('setGames', gamesList);
      });
    },
    connect({ commit }) {
      web3.eth.requestAccounts().then((accounts) => commit('setAccount', accounts));
    },
    switchNetwork() {
      window.ethereum
        .request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x5' }] })
        .catch((error) => {
          if ((error as { code: number }).code === 4902) {
            window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{ chainId: '0x5', rpcUrl: 'https://www.ethercluster.com/goerli' }],
            });
          }
        });
    },
    cancel({ state }) {
      if (state.account === undefined) return;
      contract.methods.cancel().send({ from: state.account });
    },
    create({ state }) {
      if (state.account === undefined) return;
      contract.methods.create().send({
        from: state.account,
        value: web3.utils.toWei('0.01', 'ether'),
      });
    },
    join({ state }, host: string) {
      const entry = state.gamesList?.find((entry) => entry.host === host);
      if (entry === undefined) return;
      const value = web3.utils.toWei(String(entry.bet), 'ether');
      contract.methods.join(host).send({ from: state.account, value });
    },
    playAt({ state }, coord: number) {
      if (state.stats === undefined || state.account === undefined) return;
      contract.methods.move(state.stats.current, coord).send({ from: state.account });
    },
  },
});

export function useStore() {
  return baseUseStore(key);
}

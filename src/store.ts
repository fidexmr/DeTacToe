import { InjectionKey } from 'vue';
import { createStore, Store, useStore as baseUseStore } from 'vuex';
import Web3 from 'web3';
import { TicTacToeContract, TicTacToeInstance } from '../types/truffle-contracts';
import { CONTRACT_ADDRESS, CONTRACT_CHAIN } from './const';

let web3: Web3;

export interface State {
  network?: string;
  account?: string;
  isConnected: boolean;
  balance?: number;
  contract?: TicTacToeContract;
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
  },
  mutations: {
    setAccount(state, accounts: string[]) {
      state.account = accounts[0];
      state.balance = undefined;
    },
    setNetwork(state, chainId?: string) {
      state.network = chainId;
      state.account = undefined;
      state.balance = undefined;
      state.contract = undefined;
    },
    setBalance(state, balance: number) {
      state.balance = balance;
    },
    setContract(state, contract: TicTacToeContract) {
      state.contract = contract;
    },
  },
  actions: {
    init({ commit, dispatch }) {
      window.ethereum.on('connect', (e) => commit('setNetwork', e.chainId));
      window.ethereum.on('disconnect', () => commit('setNetwork'));
      window.ethereum.on('chainChanged', (e) => commit('setNetwork', e as string));
      web3 = new Web3(window.ethereum as any);
      void dispatch('getAccount');
      void dispatch('getContract');
    },
    getAccount({ commit, dispatch }) {
      const getBalance = (accounts) => {
        commit('setAccount', accounts);
        void dispatch('getBalance');
      };
      const getAccount = () => void web3.eth.getAccounts().then(getBalance).catch(console.error);
      getAccount();
      window.ethereum.on('accountsChanged', getAccount);
    },
    getBalance({ commit, state }) {
      web3.eth
        .getBalance(state.account)
        .then((balance) => {
          const amountInEth = web3.utils.fromWei(balance, 'ether');
          commit('setBalance', Number(amountInEth));
          // bet.max = amountInEth - 0.01;
        })
        .catch(console.error);
    },
    getContract({ commit }) {
      void fetch('./build/contracts/TicTacToe.json')
        .then((r) => r.json())
        .then((compiledContract: TicTacToeInstance) => {
          commit('setContract', new web3.eth.Contract(compiledContract.abi, CONTRACT_ADDRESS));
        });
    },
    // button
    connect({ commit }) {
      web3.eth
        .requestAccounts()
        .then((accounts) => commit('setAccount', accounts))
        .catch(console.error);
    },
  },
});

export function useStore() {
  return baseUseStore(key);
}

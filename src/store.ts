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
    init({ dispatch }) {
      window.ethereum.on('connect', (e) =>
        dispatch('updateAll', (e as { [key: string]: string }).chainId),
      );
      window.ethereum.on('disconnect', () => dispatch('updateAll'));
      window.ethereum.on('chainChanged', (e) => dispatch('updateAll', e as string));
      web3 = new Web3(window.ethereum as any);
      web3.eth.getChainId((err, chainId) => dispatch('updateAll', String(chainId)));
      dispatch('getAccount');
      dispatch('getContract');
    },
    updateAll({ dispatch, commit }, chainId: string) {
      commit('setNetwork', chainId);
      dispatch('getAccount');
      dispatch('getContract');
    },
    getAccount({ commit }) {
      const getBalance = (accounts: string[]) => {
        commit('setAccount', accounts);
        web3.eth.getBalance(accounts[0]).then((balance) => {
          commit('setBalance', Number(web3.utils.fromWei(balance, 'ether')));
        });
      };
      const getAccount = () => web3.eth.getAccounts().then(getBalance);
      getAccount();
      window.ethereum.on('accountsChanged', getAccount);
    },
    getContract({ commit }) {
      fetch('./build/contracts/TicTacToe.json')
        .then((r) => r.json())
        .then((compiledContract: TicTacToeInstance) => {
          commit('setContract', new web3.eth.Contract(compiledContract.abi, CONTRACT_ADDRESS));
        });
    },
    connect({ commit }) {
      web3.eth.requestAccounts().then((accounts) => commit('setAccount', accounts));
    },
  },
});

export function useStore() {
  return baseUseStore(key);
}

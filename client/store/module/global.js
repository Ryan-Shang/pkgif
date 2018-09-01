import { SET_GLOBAL } from '../mutation-types';

const state = {
  global: {},
};

// getters
const getters = {
  getGlobal: state => state.global,
};

// mutations
const mutations = {
  [SET_GLOBAL](state, global) {
    state.global = global;
  },
};

// actions
const actions = {

};

export default {
  state,
  getters,
  actions,
  mutations,
};

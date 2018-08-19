import { SET_GLOBAL, SET_USER, SET_RESOURCE } from '../mutation-types';

const state = {
  global: {},
  user: {},
  resource: {},
};

// getters
const getters = {
  getGlobal: state => state.global,
  getUser: state => state.user,
  getResource: state => state.resource,
};

// mutations
const mutations = {
  [SET_GLOBAL](state, global) {
    state.global = global;
  },
  [SET_USER](state, user) {
    state.user = user;
  },
  [SET_RESOURCE](state, resource) {
    state.resource = resource;
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

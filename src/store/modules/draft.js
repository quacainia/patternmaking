export default {
  namespaced: true,
  state: {
    patterns: {
    },
  },
  mutations: {
    ADD_PATTERN(store, pattern) {
      let newPatterns = {};
      newPatterns[pattern.name] = pattern;
      store.patterns = Object.assign({}, store.patterns, newPatterns);
      console.log('store');
    },
  },
  actions: {
  },
  getters: {
    pattern:(state) => (id) => {
      // console.log(state.patterns, id, state.patterns[id]);
      return state.patterns[id]; //{title: "Foo", description: "bar"};
    }
  }
}

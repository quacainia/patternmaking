export default {
  namespaced: true,
  state: {
    displayPattern: null,
    patterns: {
    },
  },
  mutations: {
    ADD_PATTERN(store, pattern) {
      let newPatterns = {};
      newPatterns[pattern.name] = pattern;
      store.patterns = Object.assign({}, store.patterns, newPatterns);
    },
    PATTERN_DISPLAY(store, {patternName, displayPieces}) {
      let newPatterns = {};
      let newPattern = store.patterns[patternName] || {};
      newPattern.displayPieces = displayPieces;
      newPatterns[patternName] = newPattern;
      store.patterns = Object.assign({}, store.patterns, newPatterns);
    },
    SET_DISPLAY_PATTERN(store, {patternName}) {
      store.displayPattern = patternName;
    },
  },
  actions: {
  },
  getters: {
    displayPattern: (state) => {
      return state.patterns[state.displayPattern] || null;
    },
    pattern:(state) => (id) => {
      // console.log(state.patterns, id, state.patterns[id]);
      return state.patterns[id]; //{title: "Foo", description: "bar"};
    }
  }
}

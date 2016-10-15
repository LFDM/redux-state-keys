export const STATE_KEY_PROPERTY = '__reduxStateKey__';

function reduceObject(obj, reducer, initialMem) {
  return Object.keys(obj).reduce((mem, key) => reducer(mem, obj[key], key), initialMem);
}

export function bindStateKeyToActionCreator(stateKey, actionCreator) {
  return (...args) => {
    const action = actionCreator(...args);
    return { ...action, [STATE_KEY_PROPERTY]: stateKey };
  };
}

export function bindStateKeyToActionCreators(stateKey, actionCreators) {
  return reduceObject(actionCreators, (mem, actionCreator, name) => {
    mem[name] = bindStateKeyToActionCreator(stateKey, actionCreator);
    return mem;
  }, {});
}

export function bindStateKeyToSelector(stateKey, selector) {
  return (state, ...args) => selector(state, stateKey, ...args);
}

export function bindStateKeyToSelectors(stateKey, selectors) {
  return reduceObject(selectors, (mem, selector, name) => {
    mem[name] = bindStateKeyToSelector(stateKey, selector);
    return mem;
  }, {});
}

export function createSelectorWithStateKeyHandling(selector, initialSubstate = {}, sliceName = null) {
  return (state, stateKey, ...args) => {
    const slice = sliceName ? state[sliceName] : state;
    const substate = slice[stateKey] || initialSubstate;
    return selector(substate, ...args);
  };
}

export function createSelectorsWithStateKeyHandling(selectors, initialSubstate = {}, sliceName = null) {
  return reduceObject(selectors, (mem, selector, name) => {
    mem[name] = createSelectorWithStateKeyHandling(selector, initialSubstate, sliceName);
    return mem;
  }, {});
}

export function createReducerWithStateKeyHandling(reducer, initialSubstate = {}, initialState = {}) {
  return (state = initialState, action) => {
    const stateKey = action[STATE_KEY_PROPERTY];
    if (!stateKey) {
      return state;
    }
    const substate = state[stateKey] || initialSubstate;
    const newSubstate = reducer(substate, action);
    if (newSubstate === substate) {
      return state;
    }
    return { ...state, [stateKey]: newSubstate };
  };
}

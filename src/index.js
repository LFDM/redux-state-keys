export const STATE_KEY_PROPERTY = '__reduxForkStateKey';

const ERROR = {
  NO_STATE_KEY_IN_ACTION: `No stateKey found in action - did you call bindStateKeyToActionCreator(s)?`
};

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
  return (state) => selector(state, stateKey);
}

export function bindStateKeyToSelectors(stateKey, selectors) {
  return reduceObject(selectors, (mem, selector, name) => {
    mem[name] = bindStateKeyToSelector(stateKey, selector);
    return mem;
  }, {});
}

export function createSelectorWithSubstateHandling(selector, initialSubstate = {}, sliceName = null) {
  return (state, stateKey) => {
    const slice = sliceName ? state[sliceName] : state;
    const substate = slice[stateKey] || initialSubstate;
    return selector(substate);
  };
}

export function createSelectorsWithSubstateHandling(selectors, initialSubstate = {}, sliceName = null) {
  return reduceObject(selectors, (mem, selector, name) => {
    mem[name] = createSelectorWithSubstateHandling(selector, initialSubstate, sliceName);
    return mem;
  }, {});
}

export function createReducerWithSubstateHandling(reducer, initialSubstate = {}) {
  return (state, action) => {
    const stateKey = action[STATE_KEY_PROPERTY];
    checkStateKey(stateKey, ERROR.NO_STATE_KEY_IN_ACTION);
    const substate = state[stateKey] || initialSubstate;
    const newSubstate = reducer(substate, action);
    return { ...state, [stateKey]: newSubstate };
  };
}

function checkStateKey(stateKey, msg) {
  if (!stateKey) {
    throw new Error(msg);
  }
}

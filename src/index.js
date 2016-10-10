export const STATE_KEY_PROPERTY = '__reduxForkStateKey';

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

export function createSelectorWithSubstate(selector, initialSubstate = {}, sliceName = null) {
  return (state, stateKey) => {
    const slice = sliceName ? state[sliceName] : state;
    const substate = slice[stateKey] || initialSubstate;
    return selector(substate);
  };
}

export function createSelectorsWithSubstate(selectors, initialSubstate = {}, sliceName = null) {
  return reduceObject(selectors, (mem, selector, name) => {
    mem[name] = createSelectorWithSubstate(selector, initialSubstate, sliceName);
    return mem;
  }, {});
}

export function createReducerWithSubstate(reducer, initialSubstate = {}) {
  return (state, action) => {
    const stateKey = action[STATE_KEY_PROPERTY];
    // error here
    const substate = state[stateKey] || initialSubstate;
    const newSubstate = reducer(substate, action);
    return { ...state, [stateKey]: newSubstate };
  };
}

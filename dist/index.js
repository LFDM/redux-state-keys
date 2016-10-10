'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.bindStateKeyToActionCreator = bindStateKeyToActionCreator;
exports.bindStateKeyToActionCreators = bindStateKeyToActionCreators;
exports.bindStateKeyToSelector = bindStateKeyToSelector;
exports.bindStateKeyToSelectors = bindStateKeyToSelectors;
exports.createSelectorWithSubstateHandling = createSelectorWithSubstateHandling;
exports.createSelectorsWithSubstateHandling = createSelectorsWithSubstateHandling;
exports.createReducerWithSubstateHandling = createReducerWithSubstateHandling;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var STATE_KEY_PROPERTY = exports.STATE_KEY_PROPERTY = '__reduxForkStateKey';

var ERROR = {
  NO_STATE_KEY_IN_ACTION: 'No stateKey found in action - did you call bindStateKeyToActionCreator(s)?'
};

function reduceObject(obj, reducer, initialMem) {
  return Object.keys(obj).reduce(function (mem, key) {
    return reducer(mem, obj[key], key);
  }, initialMem);
}

function bindStateKeyToActionCreator(stateKey, actionCreator) {
  return function () {
    var action = actionCreator.apply(undefined, arguments);
    return _extends({}, action, _defineProperty({}, STATE_KEY_PROPERTY, stateKey));
  };
}

function bindStateKeyToActionCreators(stateKey, actionCreators) {
  return reduceObject(actionCreators, function (mem, actionCreator, name) {
    mem[name] = bindStateKeyToActionCreator(stateKey, actionCreator);
    return mem;
  }, {});
}

function bindStateKeyToSelector(stateKey, selector) {
  return function (state) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    return selector.apply(undefined, [state, stateKey].concat(args));
  };
}

function bindStateKeyToSelectors(stateKey, selectors) {
  return reduceObject(selectors, function (mem, selector, name) {
    mem[name] = bindStateKeyToSelector(stateKey, selector);
    return mem;
  }, {});
}

function createSelectorWithSubstateHandling(selector) {
  var initialSubstate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var sliceName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  return function (state, stateKey) {
    for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
      args[_key2 - 2] = arguments[_key2];
    }

    var slice = sliceName ? state[sliceName] : state;
    var substate = slice[stateKey] || initialSubstate;
    return selector.apply(undefined, [substate].concat(args));
  };
}

function createSelectorsWithSubstateHandling(selectors) {
  var initialSubstate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var sliceName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  return reduceObject(selectors, function (mem, selector, name) {
    mem[name] = createSelectorWithSubstateHandling(selector, initialSubstate, sliceName);
    return mem;
  }, {});
}

function createReducerWithSubstateHandling(reducer) {
  var initialSubstate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return function (state, action) {
    var stateKey = action[STATE_KEY_PROPERTY];
    checkStateKey(stateKey, ERROR.NO_STATE_KEY_IN_ACTION);
    var substate = state[stateKey] || initialSubstate;
    var newSubstate = reducer(substate, action);
    return _extends({}, state, _defineProperty({}, stateKey, newSubstate));
  };
}

function checkStateKey(stateKey, msg) {
  if (!stateKey) {
    throw new Error(msg);
  }
}

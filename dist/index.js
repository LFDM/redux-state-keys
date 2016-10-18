'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.bindStateKeyToActionCreator = bindStateKeyToActionCreator;
exports.bindStateKeyToActionCreators = bindStateKeyToActionCreators;
exports.bindStateKeyToSelector = bindStateKeyToSelector;
exports.bindStateKeyToSelectors = bindStateKeyToSelectors;
exports.createSelectorWithStateKeyHandling = createSelectorWithStateKeyHandling;
exports.createSelectorsWithStateKeyHandling = createSelectorsWithStateKeyHandling;
exports.createReducerWithStateKeyHandling = createReducerWithStateKeyHandling;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var STATE_KEY_PROPERTY = exports.STATE_KEY_PROPERTY = '__reduxStateKey__';

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

function createSelectorWithStateKeyHandling(selector) {
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

function createSelectorsWithStateKeyHandling(selectors) {
  var initialSubstate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var sliceName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  return reduceObject(selectors, function (mem, selector, name) {
    mem[name] = createSelectorWithStateKeyHandling(selector, initialSubstate, sliceName);
    return mem;
  }, {});
}

function createReducerWithStateKeyHandling(reducer) {
  var initialSubstate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var initialState = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments[1];

    var stateKey = action[STATE_KEY_PROPERTY];
    if (!stateKey) {
      return state;
    }
    var substate = state[stateKey] || initialSubstate;
    var newSubstate = reducer(substate, action);
    if (newSubstate === substate) {
      return state;
    }
    return _extends({}, state, _defineProperty({}, stateKey, newSubstate));
  };
}

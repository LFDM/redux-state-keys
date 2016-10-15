/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import { handleActions, createAction } from 'redux-actions';
import { combineReducers } from 'redux';

import {
  STATE_KEY_PROPERTY,
  bindStateKeyToActionCreator,
  bindStateKeyToActionCreators,
  bindStateKeyToSelector,
  bindStateKeyToSelectors,
  createSelectorWithStateKeyHandling,
  createSelectorsWithStateKeyHandling,
  createReducerWithStateKeyHandling,
} from '.';

const ACTION = {
  A: 'A',
  B: 'B',
};

describe('reduxFork', () => {
  describe('bindStateKeyToActionCreator', () => {

  });

  describe('bindStateKeyToActionCreators', () => {

  });

  describe('bindStateKeyToSelector', () => {

  });

  describe('bindStateKeyToSelectors', () => {

  });

  describe('createSelectorWithStateKeyHandling', () => {

  });

  describe('createSelectorsWithStateKeyHandling', () => {

  });

  describe('createReducerWithStateKeyHandling', () => {
    function setup(typePrefix = '') {
      function applyA(state, action) {
        return { ...state, a: action.payload };
      }

      function applyB(state, action) {
        return { ...state, b: action.payload };
      }

      function withPrefix(prefix, type) {
        return `${prefix}${type}`;
      }

      const INITIAL_STATE = {};

      const INITIAL_SUBSTATE = {
        a: 0,
        b: 1,
      };

      const actionTypeA = withPrefix(typePrefix, ACTION.A);
      const actionTypeB = withPrefix(typePrefix, ACTION.B);

      const reducer = handleActions({
        [actionTypeA]: applyA,
        [actionTypeB]: applyB,
      });

      const selectors = {
        getA: (state) => state.a,
        getB: (state) => state.b,
      };

      const actionCreators = {
        setA: (val) => createAction(actionTypeA)(val),
        setB: (val) => createAction(actionTypeB)(val),
      };

      const substateReducer = createReducerWithStateKeyHandling(reducer, INITIAL_SUBSTATE, INITIAL_STATE);
      const substateSelectors = createSelectorsWithStateKeyHandling(selectors, INITIAL_SUBSTATE);

      return {
        reducer: substateReducer,
        selectors: substateSelectors,
        actionCreators,
        INITIAL_STATE,
        INITIAL_SUBSTATE
      };
    }

    it('returns default initial substate when nothing es is present', () => {
      const stateKey = 'x';
      const { reducer, selectors, actionCreators, INITIAL_STATE, INITIAL_SUBSTATE } = setup();

      const boundSelectors = bindStateKeyToSelectors(stateKey, selectors);
      const boundActionCreators = bindStateKeyToActionCreators(stateKey, actionCreators);

      expect(boundSelectors.getA(INITIAL_STATE)).to.equal(INITIAL_SUBSTATE.a);
      expect(boundSelectors.getB(INITIAL_STATE)).to.equal(INITIAL_SUBSTATE.b);

      const actionA = boundActionCreators.setA(1);
      const actionB = boundActionCreators.setB(2);

      const stateAfterA = reducer(INITIAL_STATE, actionA);
      expect(boundSelectors.getA(stateAfterA)).to.equal(1);

      const stateAfterB = reducer(INITIAL_STATE, actionB);
      expect(boundSelectors.getB(stateAfterB)).to.equal(2);
    });

    it('updates substate when a bound action is dispatched', () => {
      const stateKey = 'x';
      const { reducer, selectors, actionCreators, INITIAL_STATE} = setup();

      const boundSelectors = bindStateKeyToSelectors(stateKey, selectors);
      const boundActionCreators = bindStateKeyToActionCreators(stateKey, actionCreators);

      const actionA = boundActionCreators.setA(1);
      const actionB = boundActionCreators.setB(2);

      const stateAfterA = reducer(INITIAL_STATE, actionA);
      expect(boundSelectors.getA(stateAfterA)).to.equal(1);

      const stateAfterB = reducer(INITIAL_STATE, actionB);
      expect(boundSelectors.getB(stateAfterB)).to.equal(2);
    });

    it('holds updates made to substates keyed by stateKeys', () => {
      const stateKeyX = 'x';
      const stateKeyY = 'y';
      const { reducer, selectors, actionCreators, INITIAL_STATE, INITIAL_SUBSTATE} = setup();

      const boundSelectorsX = bindStateKeyToSelectors(stateKeyX, selectors);
      const boundActionCreatorsX = bindStateKeyToActionCreators(stateKeyX, actionCreators);
      const boundSelectorsY = bindStateKeyToSelectors(stateKeyY, selectors);
      const boundActionCreatorsY = bindStateKeyToActionCreators(stateKeyY, actionCreators);

      let nextState = INITIAL_STATE;

      const nextAOfX = 1;
      const nextBOfY = 2;

      const actionAOfX = boundActionCreatorsX.setA(nextAOfX);
      const actionBOfY = boundActionCreatorsY.setB(nextBOfY);

      nextState = reducer(nextState, actionAOfX);
      nextState = reducer(nextState, actionBOfY);

      expect(boundSelectorsX.getA(nextState)).to.equal(nextAOfX);
      expect(boundSelectorsX.getB(nextState)).to.equal(INITIAL_SUBSTATE.b);

      expect(boundSelectorsY.getA(nextState)).to.equal(INITIAL_SUBSTATE.a);
      expect(boundSelectorsY.getB(nextState)).to.equal(nextBOfY);

      expect(nextState).to.deep.equal({
        [stateKeyX]: {
          a: nextAOfX,
          b: INITIAL_SUBSTATE.b
        },
        [stateKeyY]: {
          a: INITIAL_SUBSTATE.a,
          b: nextBOfY
        }
      });
    });

    it('does not update unrelated substates', () => {
      const duck1 = setup('1');
      const duck2 = setup('2');
      const stateKey = 'x';

      const reducer = combineReducers({ reducer1: duck1.reducer, reducer2: duck2.reducer });

      const boundActionCreatorsX1 = bindStateKeyToActionCreators(stateKey, duck1.actionCreators);
      const boundActionCreatorsX2 = bindStateKeyToActionCreators(stateKey, duck2.actionCreators);

      const nextAOfX1 = 1;
      const nextAOfX2 = 2;

      const initialState = {};
      const nextState1 = reducer(initialState, boundActionCreatorsX1.setA(nextAOfX1));
      expect(nextState1.reducer1).not.to.equal(duck1.INITIAL_STATE);
      expect(nextState1.reducer2).to.equal(duck2.INITIAL_STATE);
      const nextState2 = reducer(nextState1, boundActionCreatorsX2.setA(nextAOfX2));
      expect(nextState2.reducer1).to.equal(nextState1.reducer1);
      expect(nextState2.reducer2).not.to.equal(nextState2.reducer1);
    });
  });
});

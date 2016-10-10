/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import { handleActions, createAction } from 'redux-actions';

import {
  STATE_KEY_PROPERTY,
  bindStateKeyToActionCreator,
  bindStateKeyToActionCreators,
  bindStateKeyToSelector,
  bindStateKeyToSelectors,
  createSelectorWithSubstate,
  createSelectorsWithSubstate,
  createReducerWithSubstate,
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

  describe('createSelectorWithSubstate', () => {

  });

  describe('createSelectorsWithSubstate', () => {

  });

  describe('createReducerWithSubstate', () => {
    function setup() {
      function applyA(state, action) {
        return { ...state, a: action.payload };
      }

      function applyB(state, action) {
        return { ...state, b: action.payload };
      }

      const INITIAL_STATE = {};

      const INITIAL_SUBSTATE = {
        a: 0,
        b: 1,
      };

      const reducer = handleActions({
        [ACTION.A]: applyA,
        [ACTION.B]: applyB,
      }, INITIAL_STATE);

      const selectors = {
        getA: (state) => state.a,
        getB: (state) => state.b,
      };

      const actionCreators = {
        setA: (val) => createAction(ACTION.A)(val),
        setB: (val) => createAction(ACTION.B)(val),
      };

      const substateReducer = createReducerWithSubstate(reducer, INITIAL_SUBSTATE);
      const substateSelectors = createSelectorsWithSubstate(selectors, INITIAL_SUBSTATE);

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

    it('updates substate when a bound action is thrown', () => {
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
  });
});

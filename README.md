# Redux State Keys

This library tries to deal with the problem of writing a lot of repetitive boilerplate code, when you are trying to deal with several instances of a same type.

This is a common pattern which typically arises in a lot of places in your application: You want to save whether a modal is open or not, you want to modify a User which is stored in a Map<Id, User>, save several error states etc.

For a high level overview on this topic check out [Robin Wieruch's blog post about state keys](http://www.robinwieruch.de/redux-state-keys/).


## Example

Let's look at a simple module to handle loading states:

```javascript
  // the loading module

  const SLICE_NAME = 'loadingStates';

  const INITIAL_STATE = { isLoading: false };

  const SET_LOADING = 'SET_LOADING';

  const reducer = (state = INITIAL_STATE, action) => {
    if (action.type === SET_LOADING) {
      const isLoading = action.payload;
      return { ...state, isLoading };
    }
    return state;
  };

  const doSetIsLoading(isLoading) {
    return {
      type: SET_LOADING,
      payload: isLoading,
    };
  }

  const getLoadingState(state) {
    return state[SLICE_NAME].isLoading;
  }

  export default {
    reducers: {
      [SLICE_NAME]: reducer,
    },
    selectors: {
      getLoadingState,
    },
    actionCreators = {
      doSetIsLoading
    }
  };


  // in your store file

  import { createStore, combineReducers } from 'redux';
  import loadingModule from './loadingModule';

  const combinedReducer = combineReducer({
    ...loadingModule.reducers
  });

  export default createStore(combinedReducer);

```

This is not terribly useful, because we can handle only one global loading state across the whole application.
We therefore might need to introduce some kind of name property - a state key.

```javascript
  // the loading module

  const SLICE_NAME = 'loadingStates';

  const INITIAL_STATE = {};
  const INITIAL_SUBSTATE = { isLoading: false };

  const SET_LOADING = 'SET_LOADING';

  const reducer = (state = INITIAL_STATE, action) => {
    if (action.type === SET_LOADING) {
      const { name, isLoading } = action.payload;
      const namedState = state[name] || INITIAL_SUBSTATE;
      return { ...state, [name]: { ...namedState, isLoading };
    }
    return state;
  };

  const doSetIsLoading(name, isLoading) {
    return {
      type: SET_LOADING,
      payload: { name, isLoading },
    };
  }

  const getLoadingState(state, name) {
    const namedState = state[SLICE_NAME][name] || INITIAL_SUBSTATE;
    return namedState.isLoading;
  }

  export default {
    reducers: {
      [SLICE_NAME]: reducer,
    },
    selectors: {
      getLoadingState,
    },
    actionCreators = {
      doSetIsLoading
    }
  };

```

This makes our code immediately more complicated as every function now needs to deal with another level of indirection.

The helper functions in `redux-state-keys` allow to hide this complexity - our module can stay as simple as if we only had to deal with ONE loading state across the whole application.


```javascript
  import {
    createReducerWithStateKeyHandling,
    createSelectorsWithStateKeyHandling
  } from 'redux-state-keys';

  const SLICE_NAME = 'loadingStates';

  const INITIAL_SUBSTATE = { isLoading: false };

  const SET_LOADING = 'SET_LOADING';

  const reducer = (state, action) => {
    if (action.type === SET_LOADING) {
      const isLoading = action.payload;
      return { ...state, isLoading };
    }
    return state;
  };

  const doSetIsLoading(isLoading) {
    return {
      type: SET_LOADING,
      payload: isLoading,
    };
  }

  const getLoadingState(state) {
    return state.isLoading;
  }

  export default {
    reducers: {
      [SLICE_NAME]: createReducerWithStateKeyHandling(reducer, INITIAL_SUBSTATE),
    },
    selectors: createSelectorsWithStateKeyHandling({
      getLoadingState,
    }, INITIAL_SUBSTATE, SLICE_NAME),
    actionCreators = {
      doSetIsLoading
    }
  };
```

Consuming containers can use further helper methods to shield you away from dealing with state keys manually

```javascript
// a simple presenter in a presenter.js file

export default ({ isLoading, setLoading }) => {
  return (
    <div>
      <button type="button" onClick={ () => setLoading(!isLoading) } />
      <div>
        { isLoading ? 'We are loading!' : '' }
      </div>
    </div>
  );
};


// container without redux-state-keys helper

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { selectors, actionCreators } from '../loadingModule';
import presenter from './presenter';

function mapStateToProps(state, props) {
  const { name } = props;
  const isLoading = selectors.isLoading(state, name);
  return { isLoading };
}

function mapDispatchToProps(dispatch, props) {
  const { name } = props;
  const setLoading = (isLoading) => actionCreators.doSetIsLoading(name, isLoading);
  return bindActionCreators({ setLoading }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(presenter);


// container with redux-state-keys helper

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { bindStateKeyToActionCreators, bindStateKeyToSelectors } from 'redux-state-keys';
import { selectors, actionCreators } from '../loadingModule';
import presenter from './presenter';

function mapStateToProps(state, props) {
  const { name } = props;
  const boundSelectors = bindStateKeyToSelectors(name, selectors);
  const isLoading = boundSelectors.isLoading(state);
  return { isLoading };
}

function mapDispatchToProps(dispatch, props) {
  const { name } = props;
  const boundActionCreators = bindStateKeyToActionCreators(name, {
    setLoading: actionCreators.doSetIsLoading
  });
  return bindActionCreators(boundActionCreators, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(presenter);


// render our container component like this

<LoadingDemo name="someKindOfIdentifier" />

```


## API Documentation

tbd
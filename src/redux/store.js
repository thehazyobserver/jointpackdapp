import { applyMiddleware, compose, createStore, combineReducers } from "redux";
import thunk from "redux-thunk"; // Default import
import blockchainReducer from "./blockchain/blockchainReducer";
import dataReducer from "./data/dataReducer";

// Combine Reducers
const rootReducer = combineReducers({
  blockchain: blockchainReducer,
  data: dataReducer,
});

// Middleware and Enhancers
const middleware = [thunk];
const composeEnhancers = 
  (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

// Configure Store
const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(...middleware))
);

export default store;
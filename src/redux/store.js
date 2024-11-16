import { applyMiddleware, compose, createStore, combineReducers } from "redux";
import { thunk } from "redux-thunk"; // Named import
import blockchainReducer from "./blockchain/blockchainReducer";
import dataReducer from "./data/dataReducer";

// Combine Reducers
const rootReducer = combineReducers({
  blockchain: blockchainReducer,
  data: dataReducer,
});

// Middleware and Enhancers
const middleware = [thunk];
const composeEnhancers = compose(applyMiddleware(...middleware));

// Configure Store
const configureStore = () => {
  return createStore(rootReducer, composeEnhancers);
};

const store = configureStore();

export default store;

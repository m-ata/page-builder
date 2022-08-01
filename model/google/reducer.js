import {combineReducers} from 'redux'
import {
    SET_GOOGLE_USER_INFO,
    DELETE_GOOGLE_USER_INFO,
    SET_GOOGLE_IS_INITIALIZING,
    SET_GOOGLE_IS_INITIALIZED,
    SET_GOOGLE_AUTH_INFO,
    DELETE_GOOGLE_AUTH_INFO
} from './actionTypes';

function currentUser(state = null, action) {
    switch (action.type) {
        case SET_GOOGLE_USER_INFO:
            return action.payload;
        case DELETE_GOOGLE_USER_INFO:
            return null;
        default:
            return state
    }
}

function isInitializing(state = false, action) {
    switch (action.type) {
        case SET_GOOGLE_IS_INITIALIZING:
            return action.isInitializing;
        default:
            return state
    }
}

function isInitialized(state = null, action) {
    switch (action.type) {
        case SET_GOOGLE_IS_INITIALIZED:
            return action.isInitialized;
        default:
            return state
    }
}

function authInfo(state = null, action) {
    switch (action.type) {
        case SET_GOOGLE_AUTH_INFO:
            return action.authInfo;
        case DELETE_GOOGLE_AUTH_INFO:
            return null
        default:
            return state
    }
}

export const googleLogin = combineReducers({currentUser, authInfo, isInitializing, isInitialized});

export default googleLogin
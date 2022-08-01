import {
    SET_GOOGLE_USER_INFO,
    DELETE_GOOGLE_USER_INFO,
    SET_GOOGLE_IS_INITIALIZING,
    SET_GOOGLE_IS_INITIALIZED,
    SET_GOOGLE_AUTH_INFO,
    DELETE_GOOGLE_AUTH_INFO
} from './actionTypes';

export function setGoogleUserInfo(userInfo) {
    const payload = Object.assign({}, userInfo);
    
    return {type: SET_GOOGLE_USER_INFO, payload}
}

export function deleteGoogleUserInfo() {
    return {type: DELETE_GOOGLE_USER_INFO}
}

export function setGoogleIsInitializing(isInitializing) {
    return {type: SET_GOOGLE_IS_INITIALIZING, isInitializing}
}

export function setGoogleIsInitialized(isInitialized) {
    return {type: SET_GOOGLE_IS_INITIALIZED, isInitialized}
}

export function setGoogleAuthInfo(authInfo) {
    return {type: SET_GOOGLE_AUTH_INFO, authInfo}
}

export function deleteGoogleAuthInfo() {
    return {type: DELETE_GOOGLE_AUTH_INFO}
}
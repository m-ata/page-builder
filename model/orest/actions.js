import {
    DELETE_OREST_CURRENT_USER_INFO,
    DELETE_OREST_WIKI_LIST,
    RESET_OREST_STATE,
    SET_OREST_IS_INITIALIZING,
    SET_OREST_STATE,
    SET_OREST_USER_INFO,
    SET_OREST_WIKI_LIST,
} from './actionTypes'
import { LOCAL_STORAGE_OREST_TOKEN_TEXT } from './constants'

export function setOrestUserInfo(userInfo) {
    const payload = Object.assign({}, userInfo)

    return { type: SET_OREST_USER_INFO, payload }
}

export function deleteOrestCurrentUserInfo() {
    localStorage.removeItem(LOCAL_STORAGE_OREST_TOKEN_TEXT)

    return { type: DELETE_OREST_CURRENT_USER_INFO }
}

export function setOrestIsInitializing(isInitializing) {
    return { type: SET_OREST_IS_INITIALIZING, isInitializing }
}

export function setOrestWikiList(wikiList) {
    return { type: SET_OREST_WIKI_LIST, payload: wikiList }
}

export function deleteOrestWikiList() {
    return { type: DELETE_OREST_WIKI_LIST }
}

export function setOrestState(stateName, value) {
    return {
        type: SET_OREST_STATE,
        payload: {
            stateName,
            value,
        },
    }
}

export function resetOrestState() {
    return { type: RESET_OREST_STATE }
}

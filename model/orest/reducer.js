import { combineReducers } from 'redux'
import {
    DELETE_OREST_CURRENT_USER_INFO,
    DELETE_OREST_WIKI_LIST,
    RESET_OREST_STATE,
    SET_OREST_IS_INITIALIZING,
    SET_OREST_STATE,
    SET_OREST_USER_INFO,
    SET_OREST_WIKI_LIST,
} from './actionTypes'
import { loadLocalStorageItem } from '../../state/utils'
import { LOCAL_STORAGE_OREST_TOKEN_TEXT } from './constants'

function currentUser(state = loadLocalStorageItem(LOCAL_STORAGE_OREST_TOKEN_TEXT) || null, action) {
    switch (action.type) {
        case SET_OREST_USER_INFO:
            return action.payload
        case DELETE_OREST_CURRENT_USER_INFO:
            return null
        default:
            return state
    }
}

function isInitializing(state = false, action) {
    switch (action.type) {
        case SET_OREST_IS_INITIALIZING:
            return action.isInitializing
        default:
            return state
    }
}

function wikiList(state = null, action) {
    switch (action.type) {
        case SET_OREST_WIKI_LIST:
            return action.payload
        case DELETE_OREST_WIKI_LIST:
            return null
        default:
            return state
    }
}

function state(state = null, action) {
    switch (action.type) {
        case SET_OREST_STATE:
            if (action.payload.stateName.length === 1) {
                return {
                    ...state,
                    [action.payload.stateName[0]]: action.payload.value,
                }
            } else if (action.payload.stateName.length === 2) {
                return {
                    ...state,
                    [action.payload.stateName[0]]: {
                        ...state[action.payload.stateName[0]],
                        [action.payload.stateName[1]]: action.payload.value,
                    },
                }
            } else if (action.payload.stateName.length === 3) {
                return {
                    ...state,
                    [action.payload.stateName[0]]: {
                        ...state[action.payload.stateName[0]],
                        [action.payload.stateName[1]]: {
                            ...state[action.payload.stateName[0]][action.payload.stateName[1]],
                            [action.payload.stateName[2]]: action.payload.value,
                        },
                    },
                }
            } else if (action.payload.stateName.length === 4) {
                return {
                    ...state,
                    [action.payload.stateName[0]]: {
                        ...state[action.payload.stateName[0]],
                        [action.payload.stateName[1]]: {
                            ...state[action.payload.stateName[0]][action.payload.stateName[1]],
                            [action.payload.stateName[2]]: {
                                ...state[action.payload.stateName[0]][action.payload.stateName[1]][
                                    action.payload.stateName[2]
                                ],
                                [action.payload.stateName[3]]: action.payload.value,
                            },
                        },
                    },
                }
            }
        case RESET_OREST_STATE:
            return null
        default:
            return state
    }
}

export const oRestLogin = combineReducers({ currentUser, isInitializing, state })

export default oRestLogin

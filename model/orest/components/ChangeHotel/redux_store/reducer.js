import { combineReducers } from 'redux'
import {
    loadLocalStorageSingleItem
} from '../../../../../state/utils';
import {
    LOCAL_STORAGE_OREST_HOTELNAME_TEXT,
    LOCAL_STORAGE_OREST_HOTELREFNO_TEXT
} from '../../../constants';
import {
    DELETE_HOTEL_NAME,
    DELETE_HOTEL_REF_NO,
    DELETE_LICENCE_MENU_STATUS,
    SET_HOTEL_NAME,
    SET_HOTEL_REF_NO,
    SET_HOTEL_REF_NO_IS_INITIALIZING,
    SET_LICENCE_MENU_STATUS,
    UPDATE_HOTEL_NAME,
    UPDATE_HOTEL_REF_NO,
    UPDATE_LICENCE_MENU_STATUS
} from './actionTypes';


function currentHotelRefNo(state = loadLocalStorageSingleItem(LOCAL_STORAGE_OREST_HOTELREFNO_TEXT) || null, action){
    switch (action.type){
        case SET_HOTEL_REF_NO:
            return action.payload
        case UPDATE_HOTEL_REF_NO:
            return action.payload
        case DELETE_HOTEL_REF_NO:
            return null
        default:
            return state
    
    }
}


function currentHotelName(state = loadLocalStorageSingleItem(LOCAL_STORAGE_OREST_HOTELNAME_TEXT) || null, action){
    switch (action.type){
        case SET_HOTEL_NAME:
            return action.payload
        case UPDATE_HOTEL_NAME:
            return action.payload
        case DELETE_HOTEL_NAME:
            return null
        default:
            return state
        
    }
}

function isInitializing(state = false, action) {
    switch (action.type) {
        case SET_HOTEL_REF_NO_IS_INITIALIZING:
            return action.isInitializing;
        default:
            return state
    }
}

function licenceMenuStatus(state = loadLocalStorageSingleItem("licenceMenuStatus") || false, action){
    switch (action.type){
        case SET_LICENCE_MENU_STATUS:
            return action.payload
        case UPDATE_LICENCE_MENU_STATUS:
            return action.payload
        case DELETE_LICENCE_MENU_STATUS:
            return null
        default:
            return state
        
    }
}


export const HotelRefNoInfo = combineReducers( {currentHotelRefNo, currentHotelName, isInitializing, licenceMenuStatus})

export default  HotelRefNoInfo;
import {
    DELETE_CURRENT_HOTEL_INFO,
    DELETE_LICENCE_MENU_STATUS,
    SET_HOTEL_NAME,
    SET_HOTEL_REF_NO,
    SET_HOTEL_REF_NO_IS_INITIALIZING,
    SET_LICENCE_MENU_STATUS,
    UPDATE_HOTEL_NAME,
    UPDATE_HOTEL_REF_NO,
    UPDATE_LICENCE_MENU_STATUS
} from './actionTypes';
import {
    LOCAL_STORAGE_OREST_HOTELNAME_TEXT,
    LOCAL_STORAGE_OREST_HOTELREFNO_TEXT
} from '../../../constants';

export function setHotelRefNo(hotelRefNo) {
    const payload = hotelRefNo.toString();
    
    return { type: SET_HOTEL_REF_NO, payload }
}

export function updateHotelRefNo(hotelRefNo) {
    const payload = hotelRefNo.toString();
    
    return { type: UPDATE_HOTEL_REF_NO, payload }
}

export function setHotelName(hotelName){
    const payload = hotelName;
    
    return { type: SET_HOTEL_NAME, payload }
}

export function updateHotelName(hotelName){
    const payload = hotelName.toString()
    
    return { type: UPDATE_HOTEL_NAME, payload }
    
}

export function setHotelRefNoIsInitializing(isInitializing) {
    return {type: SET_HOTEL_REF_NO_IS_INITIALIZING, isInitializing}
}


export function setLicenceMenuStatus(licenceMenuStatus) {
    return {type: SET_LICENCE_MENU_STATUS, licenceMenuStatus}
}

export function updateLicenceMenuStatus(licenceMenuStatus) {
    const payload = licenceMenuStatus.toString();
    
    return { type: UPDATE_LICENCE_MENU_STATUS, payload }
}

export function deleteLicenceMenuStatus() {
    localStorage.removeItem("licenceMenuStatus");
    
    return {type: DELETE_LICENCE_MENU_STATUS}
}

export function deleteCurrentHotelInfo(){
    
    localStorage.removeItem(LOCAL_STORAGE_OREST_HOTELNAME_TEXT);
    localStorage.removeItem(LOCAL_STORAGE_OREST_HOTELREFNO_TEXT);
    
    return { type: DELETE_CURRENT_HOTEL_INFO }
    
}
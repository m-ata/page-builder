import axios from "axios";
import {SLASH} from '../../../globals';
import {
    OREST_CHANGEHOTEL_PARAM,
    OREST_TOOLS_PARAM
} from '../../constants';


export function PutChangeHotel(orestUrl, token, selectedHotelRefNo){
    const url = orestUrl +  OREST_TOOLS_PARAM +  OREST_CHANGEHOTEL_PARAM;
    
    const params = {
        hotelrefno:selectedHotelRefNo
    }
    
    const options = {
        url:url,
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`
        },
        params
    }
    
    return axios(options).then(response => {
        return response
    }).catch(error => {
        return error.response || {status: 0};
    })
    
}
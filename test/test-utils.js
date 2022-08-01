import React from 'react'
import { render as rtlRender } from '@testing-library/react'
import { Provider } from 'react-redux'
import initStore from "../state/store";
import WebCmsGlobal from 'components/webcms-global';

//static GENERAL_SETTINGS for temporary purpose
const GENERAL_SETTINGS = {
    HOTELREFNO: 999984,
    BASE_URL: "http://demo.localhost:3000/",
    GUESTAPP_FOOTER: false,
    HCMLANG_FILE: false,
    HOTELMID: 135363,
    HOTELPID: 999980,
    HOTEL_CHAIN_LIST: false,
    ISCHAIN: false,
    ISPORTAL: false,
    OREST_URL: "https://dev.hotech.dev/orest",
    PORTAL_URL: "localhost:3000",
    STATIC_URL: "https://dev.hotech.dev",
    WEBKEY: "demo",
    hotelCountryIso: "TR",
    hotelLocalLang: "TMPLANG",
    hotelLocalLangGCode: "en",
    hotelLocation: {
        lat: false,
        lng: false
    },
    hotelSettings: {
        chatenable: true,
        cichkallcards: true,
        cienable: true,
        faqshow: true,
        foliopayment: true,
        folioshow: true,
        from_email: "info@hotech.com.tr",
        from_name: "Hotech",
        hasemail: true,
        hasreserv: true,
        hasroom: true,
        hastel: true,
        ibeenable: true,
        loginshow: true,
        logintype: 15,
        loginwithci: false,
        maxroom: 1,
        notifemail_conf: "web@hotech.systems",
        notifemail_epay: "web@hotech.systems",
        notifemail_upd: "web@hotech.systems",
        product: false,
        productprice: true,
        profileupdate: true,
        regbirthdate: true,
        regenable: true,
        reghealthcode: false,
        remark: false,
        room_assign_hours: 12,
        transport: 0,
    },
    useFilterLangs: ['en', 'tr'],
    useHotelRefno: 999980
}

const render= (ui) => {
    return rtlRender(<Provider store={initStore()}>
        <WebCmsGlobal.Provider value={{ GENERAL_SETTINGS }}>
            {ui}
        </WebCmsGlobal.Provider>
    </Provider>)
}

// re-export everything
export * from '@testing-library/react'
// override render method
export { render }
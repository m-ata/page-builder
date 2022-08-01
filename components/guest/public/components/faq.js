import React, { useState, useEffect, useContext } from 'react'
import { connect } from 'react-redux'
import { setToState, updateState } from 'state/actions'
import axios from 'axios'
import WebCmsGlobal from 'components/webcms-global'

const Faq = (props) => {
    const { state, setToState, isPortal, chainId} = props
    const { GENERAL_SETTINGS, locale } = useContext(WebCmsGlobal)
    const [isLoading, setIsLoading] = useState(false)

    let clientParams = {}
    clientParams.langcode = locale

    useEffect(() => {
        let active = true

        let isChainHotelChange = false
        if (GENERAL_SETTINGS.ISCHAIN && state.changeHotelRefno !== false || isPortal) {
            clientParams.ischain = true
            clientParams.chainid = chainId || state.changeHotelRefno
            clientParams.hotelrefno = GENERAL_SETTINGS.HOTELREFNO

            if(clientParams.chainid !== state.hotelFaq.chainid){
                isChainHotelChange = true
            }

        } else {
            clientParams.ischain = false
            clientParams.chainid = false
        }

        let isLangChange = false
        if (state.hotelFaq.langcode !== locale) {
            isLangChange = true
            setToState('guest', ['hotelFaq', 'langcode'], locale)
            clientParams.langcode = locale
        }

        let isRequest
        if (GENERAL_SETTINGS.ISCHAIN) {
            isRequest = state.hotelFaq.data === false && GENERAL_SETTINGS.ISCHAIN && state.changeHotelRefno !== false
        } else {
            isRequest = state.hotelFaq.data === false && GENERAL_SETTINGS.ISCHAIN === false
        }

        if (active && (isRequest || isLangChange || isChainHotelChange) && isLoading === false) {
            setIsLoading(true)
            axios({
                url: GENERAL_SETTINGS.BASE_URL + 'api/guestweb/faq',
                method: 'post',
                params: clientParams
            }).then((hotelFaqResponse) => {
                if (active || isPortal) {
                    const hotelFaqData = hotelFaqResponse.data
                    if (hotelFaqData.success) {
                        if(Object.keys(hotelFaqData.data).length > 0){
                            setToState('guest', ['hotelFaq', 'data'], hotelFaqData.data)
                            setToState('guest', ['hotelFaq', 'langcode'], locale)
                            setToState('guest', ['hotelFaq', 'chainid'], clientParams.chainid)
                            setIsLoading(false)
                        }else{
                            setToState('guest', ['hotelFaq', 'data'], null)
                            setToState('guest', ['hotelFaq', 'langcode'], null)
                            setToState('guest', ['hotelFaq', 'chainid'], clientParams.chainid)
                            setIsLoading(false)
                        }
                    } else {
                        setToState('guest', ['hotelFaq', 'data'], null)
                        setToState('guest', ['hotelFaq', 'langcode'], null)
                        setToState('guest', ['hotelFaq', 'chainid'], clientParams.chainid)
                        setIsLoading(false)
                    }
                }
            })
        }

        return () => {
            active = false
        }
    },[state.changeHotelRefno, locale])

    return (
        props.children
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Faq)

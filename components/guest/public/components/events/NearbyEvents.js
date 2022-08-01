import React, { useState, useEffect, useContext } from 'react'
import { connect, useSelector } from 'react-redux'
import axios from 'axios'
import { setToState, updateState } from 'state/actions'
import { Box, Container, Typography } from '@material-ui/core'
import useTranslation from 'lib/translations/hooks/useTranslation'
import CardSlider from '@webcms-ui/core/card-slider'
import Divider from '@material-ui/core/Divider'
import WebCmsGlobal from 'components/webcms-global'
import { useRouter } from 'next/router'
import LoadingSpinner from 'components/LoadingSpinner'
import { jsonGroupBy } from 'model/orest/constants'
import { FALSE, NULL } from 'model/globals'
import { defaultLocale } from 'lib/translations/config'
import BusinessIcon from '@material-ui/icons/Business'
import Button from  '@material-ui/core/Button'
import { LocaleContext } from 'lib/translations/context/LocaleContext'

const NearbyEvents = (props) => {
    const { state, setToState, onlyRes } = props
    const router = useRouter()
    const { t } = useTranslation()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { locale } = useContext(LocaleContext)
    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)
    const changeHotelRefno = useSelector((state) => state.formReducer.guest.changeHotelRefno && state.formReducer.guest.changeHotelRefno)

    let clientParams = {}
    clientParams.hotelrefno = loginfo && loginfo.hotelrefno || GENERAL_SETTINGS.HOTELREFNO

    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {

        let isChainHotelChange = false
        if(GENERAL_SETTINGS.ISCHAIN && changeHotelRefno !== false){
            clientParams.ischain = true
            clientParams.chainid = changeHotelRefno
            clientParams.hotelrefno = GENERAL_SETTINGS.HOTELREFNO

            if(clientParams.chainid !== state.nearbyList.chainid){
                isChainHotelChange = true
            }

        }else if(GENERAL_SETTINGS.ISCHAIN && changeHotelRefno === false){
            return;
        }else{
            clientParams.ischain = false
        }

        let isLangChange = false
        if(state.nearbyList.langcode !== locale){
            isLangChange = true
            setToState('guest', ['nearbyList', 'langcode'], locale)
        }

        clientParams.langcode = locale || defaultLocale

        let isRequest
        if(GENERAL_SETTINGS.ISCHAIN){
            isRequest = state.nearbyList.data === false && GENERAL_SETTINGS.ISCHAIN && changeHotelRefno !== false
        }else {
            isRequest = state.nearbyList.data === false && GENERAL_SETTINGS.ISCHAIN === false
        }

        if ((isRequest || isLangChange || isChainHotelChange) && isLoading === false) {
            setIsLoading(true)
            axios({
                url: GENERAL_SETTINGS.BASE_URL + 'api/guestweb/event/nearby',
                method: 'post',
                params: clientParams
            }).then((nearbyResponse) => {
                const nearbyData = nearbyResponse.data

                if (nearbyData.success && nearbyData.data.length > 0) {
                    let useData = nearbyData.data
                    if(onlyRes){
                        useData = useData.filter(item => item.lochasres === true)
                    }

                    setToState('guest', ['nearbyList', 'data'], useData.length > 0 ?  jsonGroupBy(useData, 'eventypedesc') : null)
                    setToState('guest', ['nearbyList', 'langcode'], locale)
                    setToState('guest', ['nearbyList', 'chainid'], clientParams.chainid)
                    setIsLoading(false)
                } else {
                    setToState('guest', ['nearbyList', 'data'], null)
                    setToState('guest', ['nearbyList', 'langcode'], locale)
                    setToState('guest', ['nearbyList', 'chainid'], clientParams.chainid)
                    setIsLoading(false)
                }
            })
        }

    },[changeHotelRefno,locale])

    if (state.nearbyList.data === false || isLoading === true) {
        return (
            <Container maxWidth='lg'>
                <Box p={4}>
                    <LoadingSpinner size={40} />
                </Box>
            </Container>
        )
    }

    if (state.nearbyList.data === null) {
        return (
            <Container maxWidth='lg'>
                <Box p={4}>
                    <Typography variant='h6' align='center' gutterBottom>
                        {t('str_eventNotFound')}
                    </Typography>
                    {GENERAL_SETTINGS.ISCHAIN && (
                        <Typography variant='h6' align='center' gutterBottom>
                            {t('str_ifYouWishYouCanChangeTheHotelAndTryAgain')}<br />
                            <Button startIcon={<BusinessIcon />}
                                    onClick={() => setToState('guest', ['isHotelListOpen'], true)}>
                                {changeHotelRefno ? state.changeHotelName : t('str_chooseHotel')}
                            </Button>
                        </Typography>
                    )}
                </Box>
            </Container>
        )
    }

    return (
        <React.Fragment>
            <Container maxWidth='lg'>
                {state.nearbyList.data &&
                Object.keys(state.nearbyList.data).map((groupName, index) => {
                    return (
                        <React.Fragment key={index}>
                            <CardSlider
                                title={groupName}
                                openId={Number(router.query.eventlocid) || NULL}
                                slideData={state.nearbyList.data[groupName]}
                                type='event'
                            />
                            <Divider style={{ marginBottom: 30 }} light />
                        </React.Fragment>
                    )
                })}
            </Container>
        </React.Fragment>
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

export default connect(mapStateToProps, mapDispatchToProps)(NearbyEvents)

import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { connect, useSelector } from 'react-redux'
import { setToState, updateState } from 'state/actions'
import { Container, Divider, Box, Typography } from '@material-ui/core'
import CardSlider from '@webcms-ui/core/card-slider'
import { DEFAULT_OREST_TOKEN, jsonGroupBy } from 'model/orest/constants'
import { useRouter } from 'next/router'
import WebCmsGlobal from 'components/webcms-global'
import { FALSE, NULL } from 'model/globals'
import LoadingSpinner from 'components/LoadingSpinner'
import useTranslation from 'lib/translations/hooks/useTranslation'
import SelectHotel from './SelectHotel'
import { defaultLocale } from 'lib/translations/config'
import BusinessIcon from '@material-ui/icons/Business'
import Button from  '@material-ui/core/Button'
import { LocaleContext } from 'lib/translations/context/LocaleContext'

const Info = (props) => {
    const router = useRouter()
    const { t } = useTranslation()
    const { state, setToState, onlyRes } = props
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { locale } = useContext(LocaleContext)
    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)
    const changeHotelRefno = useSelector((state) => state.formReducer.guest.changeHotelRefno && state.formReducer.guest.changeHotelRefno)
    const [isLoading, setIsLoading] = useState(false)
    const catIdParam = router?.query?.catid || false

    let clientParams = {}
    clientParams.hotelrefno = loginfo && loginfo.hotelrefno || GENERAL_SETTINGS.HOTELREFNO

    useEffect(() => {
        if (!Boolean(catIdParam)) {
            setToState('guest', ['infoListOneGroup', 'id'], false)
            setToState('guest', ['infoListOneGroup', 'groupName'], false)
            setToState('guest', ['infoListOneGroup', 'data'], false)
            setToState('guest', ['infoListOneGroup', 'langcode'], false)
            setToState('guest', ['infoListOneGroup', 'chainid'], false)
        }

        let isChainHotelChange = false
        if (GENERAL_SETTINGS.ISCHAIN && changeHotelRefno !== false) {
            clientParams.ischain = true
            clientParams.chainid = changeHotelRefno
            clientParams.hotelrefno = GENERAL_SETTINGS.HOTELREFNO

            if (clientParams.chainid !== state.infoList.chainid) {
                isChainHotelChange = true
            }

        } else if (GENERAL_SETTINGS.ISCHAIN && changeHotelRefno === false) {
            return
        } else {
            clientParams.ischain = false
            clientParams.chainid = false
        }

        let isLangChange = false
        if (state.infoList.langcode !== locale) {
            isLangChange = true
            setToState('guest', ['infoList', 'langcode'], locale)
        }

        let isRequest
        if (GENERAL_SETTINGS.ISCHAIN) {
            isRequest = state.infoList.data === false && GENERAL_SETTINGS.ISCHAIN && changeHotelRefno !== false
        } else {
            isRequest = state.infoList.data === false && GENERAL_SETTINGS.ISCHAIN === false
        }

        if ((isRequest || isLangChange || isChainHotelChange || String(catIdParam) !== String(state.infoListOneGroup.id)) && isLoading === false) {
            setIsLoading(true)
            axios({
                url: GENERAL_SETTINGS.BASE_URL + 'api/guestweb/hotel-info',
                method: 'post',
                params: {
                    onlyres: onlyRes || false,
                    langcode: locale || defaultLocale,
                    chainid: clientParams.chainid,
                    hotelrefno: clientParams.hotelrefno,
                    ischain: clientParams.ischain,
                },
            }).then((infoResponse) => {
                const infoData = infoResponse.data
                if (infoData.success && infoData.data.length > 0) {
                    let useData = infoData.data
                    if (onlyRes) {
                        useData = useData.filter(item => item.islocres && item.isorsactive)
                    } else {
                        useData = useData.filter(item => item.isorsactive)
                    }
                    setToState('guest', ['infoList', 'data'], useData.length > 0 ? jsonGroupBy(useData, 'localcatdesc') : null)
                    setToState('guest', ['infoList', 'langcode'], locale)
                    setToState('guest', ['infoList', 'chainid'], clientParams.chainid)
                    setIsLoading(false)
                    if (catIdParam) {
                        let getGrpData, catId, catDesc
                        getGrpData = useData.find(item => Number(item.catid) === Number(catIdParam))

                        if(getGrpData?.catid){
                            catId = getGrpData.catid
                            catDesc = t(getGrpData.localcatdesc)
                        }else{
                            getGrpData = useData.find(item => Number(item.locid) === Number(catIdParam))
                            catId = getGrpData.locid
                            catDesc = t(getGrpData.localdesc)
                        }

                        if (getGrpData) {
                            setToState('guest', ['infoListOneGroup', 'id'], catId)
                            setToState('guest', ['infoListOneGroup', 'groupName'], catDesc)
                        }
                    }
                } else {
                    setToState('guest', ['infoList', 'data'], null)
                    setToState('guest', ['infoList', 'langcode'], locale)
                    setToState('guest', ['infoList', 'chainid'], clientParams.chainid)
                    setIsLoading(false)
                }
            })
        }

    }, [router.query.catid, changeHotelRefno, locale])

    useEffect(() => {
        let isChainHotelChange = false
        if (GENERAL_SETTINGS.ISCHAIN && changeHotelRefno !== false) {
            clientParams.ischain = true
            clientParams.chainid = changeHotelRefno
            clientParams.hotelrefno = GENERAL_SETTINGS.HOTELREFNO

            if(clientParams.chainid !== state.infoListOneGroup.chainid){
                isChainHotelChange = true
            }

        } else if(GENERAL_SETTINGS.ISCHAIN && changeHotelRefno === false){
            return;
        }else {
            clientParams.ischain = false
            clientParams.chainid = false
        }

        clientParams.catid = state.infoListOneGroup.id

        let isLangChange = false
        if (state.infoListOneGroup.langcode !== locale) {
            isLangChange = true
            setToState('guest', ['infoList', 'langcode'], locale)
            clientParams.langcode = locale || defaultLocale
        }

        let isRequest
        if (GENERAL_SETTINGS.ISCHAIN) {
            isRequest = state.infoListOneGroup.data === false && GENERAL_SETTINGS.ISCHAIN && changeHotelRefno !== false
        } else {
            isRequest = state.infoListOneGroup.data === false && GENERAL_SETTINGS.ISCHAIN === false
        }

        if (state.infoListOneGroup.id && (isRequest || isLangChange || isChainHotelChange) && isLoading === false) {
            setIsLoading(true)
            axios({
                url: GENERAL_SETTINGS.BASE_URL + 'api/guestweb/hotel-info',
                method: 'post',
                params: clientParams,
            }).then((infoResponse) => {
                const infoData = infoResponse.data

                if (infoData.success && infoData.data.length > 0) {
                    let useData = infoData.data
                    if(onlyRes){
                        useData = useData.filter(item => item.islocres && item.isorsactive)
                    }else{
                        useData = useData.filter(item => item.isorsactive)
                    }

                    setToState('guest', ['infoListOneGroup', 'data'], useData.length > 0 ? useData : null)
                    setToState('guest', ['infoListOneGroup', 'langcode'], locale)
                    setToState('guest', ['infoListOneGroup', 'chainid'], clientParams.chainid)
                    setIsLoading(false)
                } else {
                    setToState('guest', ['infoListOneGroup', 'data'], null)
                    setToState('guest', ['infoListOneGroup', 'langcode'], locale)
                    setToState('guest', ['infoListOneGroup', 'chainid'], clientParams.chainid)
                    setIsLoading(false)
                }
            })
        }

    }, [state.infoListOneGroup.id, locale])

    if ((GENERAL_SETTINGS.ISCHAIN && changeHotelRefno === false) || (GENERAL_SETTINGS.ISCHAIN && state.infoList.chainid === null)) {
        if(state.clientReservIsLoading){
            return (
                <Container maxWidth="lg" style={{ padding: 0 }}>
                    <Box p={4}>
                        <LoadingSpinner size={40} />
                    </Box>
                </Container>
            )
        }

        return (
            <Container maxWidth="lg" style={{ padding: 0 }}>
                <Box p={4}>
                    <SelectHotel/>
                </Box>
            </Container>
        )
    }

    if (state.infoList.data === false || isLoading === true) {
        return (
            <Container maxWidth="lg" style={{ padding: 0 }}>
                <Box p={4}>
                    <LoadingSpinner size={40} />
                </Box>
            </Container>
        )
    }

    if (state.infoList.data === null) {
        return (
            <Container maxWidth="lg" style={{ padding: 0 }}>
                <Box p={4}>
                    <Typography variant="h6" align="center" gutterBottom>
                        {t('str_noDataAvailable')}
                    </Typography>
                    {GENERAL_SETTINGS.ISCHAIN && (
                        <Typography variant="h6" align="center" gutterBottom>
                            {t('str_ifYouWishYouCanChangeTheHotelAndTryAgain')}<br/>
                            <Button startIcon={<BusinessIcon />} onClick={()=> setToState("guest", ["isHotelListOpen"], true)}>
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
            <Container maxWidth="lg">
                {(state.infoListOneGroup.id && state.infoListOneGroup.data && state.infoListOneGroup.data.length > 0) ? (
                    <CardSlider
                        title={state.infoListOneGroup.groupName}
                        openId={Number(router.query.eventlocid) || NULL}
                        slideData={state.infoListOneGroup.data}
                        type='infoOneGroup'
                    />
                ): state.infoListOneGroup.id && state.infoListOneGroup.data === null? (
                    <React.Fragment>
                        <Box p={3} style={{ textAlign: 'center' }}>
                            <Typography variant="h5" align="center" gutterBottom>
                                {t('str_noRecordsToDisplay')}
                            </Typography>
                            <Button variant="outlined" color="primary" onClick={()=> {
                                setToState('guest', ['infoListOneGroup', 'id'], false)
                                setToState('guest', ['infoListOneGroup', 'groupName'], false)
                                setToState('guest', ['infoListOneGroup', 'data'], false)
                                setToState('guest', ['infoListOneGroup', 'langcode'], false)
                                setToState('guest', ['infoListOneGroup', 'chainid'], false)
                            }}>
                                {t('str_back')}
                            </Button>
                        </Box>
                    </React.Fragment>
                ): null}
                {!state.infoListOneGroup.id && state.infoList.data &&
                    Object.keys(state.infoList.data).map((groupName, index) => {
                        return (
                            <React.Fragment key={index}>
                                <CardSlider
                                    title={groupName}
                                    openId={Number(router.query.eventlocid) || NULL}
                                    slideData={state.infoList.data[groupName]}
                                    type="info"
                                />
                            </React.Fragment>
                        )
                    },)}
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

export default connect(mapStateToProps, mapDispatchToProps)(Info)

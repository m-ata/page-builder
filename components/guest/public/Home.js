import React, { useEffect, useContext, useState } from 'react'
import axios from 'axios'
import { connect } from 'react-redux'
import { setToState, updateState } from 'state/actions'
import { Grid, Container, IconButton } from '@material-ui/core'
import useTranslation from 'lib/translations/hooks/useTranslation'
import Carousel from '@webcms-ui/core/carousel'
import Collapse from '@material-ui/core/Collapse'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Box from '@material-ui/core/Box'
import {useSelector} from 'react-redux'
import { useSnackbar } from 'notistack'
import Divider from '@material-ui/core/Divider'
import Chip from '@material-ui/core/Chip'
import Button from '@material-ui/core/Button'
import WebCmsGlobal from 'components/webcms-global'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import LoadingSpinner from 'components/LoadingSpinner'
import {LocaleContext} from "lib/translations/context/LocaleContext"
import HotelTypeSelect from './components/HotelTypeSelect'
import OfferSales from '../account/Offers/OfferSales'
import { getHyperlinkParser } from 'model/orest/constants'
import Link from '@material-ui/core/Button'
import Router from 'next/router'
import ExpandMore from '@material-ui/icons/ExpandMore'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ClearIcon from '@material-ui/icons/Clear';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import PopupState, {
    bindMenu,
    bindTrigger
} from 'material-ui-popup-state';

const Home = (props) => {

    const { enqueueSnackbar, closeSnackbar } = useSnackbar()
    const hideSnackbarLocalStorage = localStorage.getItem('hideSnackbar')

    const { state, setToState } = props
        , { t } = useTranslation()
        , { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
        , { locale } = useContext(LocaleContext)
        , infoLogin = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)
        , defOfferLimit = 4
        , [offerLimit, setOfferLimit] = useState(defOfferLimit)
        , [offerTopn, setOfferTopn] = useState(defOfferLimit)
        , [isLoadingOffers, setIsLoadingOffers] = useState(false)
        , [isLoadMoreButtonShow, setIsLoadMoreButtonShow] = useState(false)

    let clientParams = {}
    clientParams.clientid = infoLogin?.accid || 0

    useEffect(() => {
        let isLangChange = false

        if (state.homeList.langcode !== locale) {
            isLangChange = true
            setToState('guest', ['homeList', 'langcode'], locale)
        }

        clientParams.langcode = locale

        if (isLangChange && !state.homeList.isLoading) {
            setToState('guest', ['homeList', 'isLoading'], true)

            async function loadHomePage() {
                await getHomeSlider()
                await getHomeTypes()
                await getHomeOffers(defOfferLimit)
            }

            loadHomePage().then(() => {
                setToState('guest', ['homeList', 'langcode'], locale)
                setToState('guest', ['homeList', 'isLoading'], false)
            })
        }
    }, [locale])

    useEffect(() => {
        clientParams.langcode = locale
        if (!state.homeList.isLoading) {
            setToState('guest', ['homeList', 'isLoading'], true)

            async function loadOffer() {
                await getHomeOffers(offerTopn)
            }

            loadOffer().then(() => {
                setToState('guest', ['homeList', 'langcode'], locale)
                setToState('guest', ['homeList', 'isLoading'], false)
            })
        }
    }, [offerTopn])

    async function getHomeSlider() {
        return axios({
            url: GENERAL_SETTINGS.BASE_URL + 'api/home/slider',
            method: 'post',
            params: clientParams,
        }).then((homeSliderResponse) => {
            const homeSliderData = homeSliderResponse.data
            if (homeSliderData.success && homeSliderData.data.length > 0) {
                if (homeSliderData?.data) {
                    setToState('guest', ['homeSlider', 'data'], homeSliderData.data)
                    return true
                } else {
                    setToState('guest', ['homeSlider', 'data'], null)
                    return true
                }
            } else {
                setToState('guest', ['homeSlider', 'data'], null)
                return true
            }
        }).catch(() => {
            setToState('guest', ['homeSlider', 'data'], null)
            return true
        })
    }

    async function getHomeTypes() {
        return axios({
            url: GENERAL_SETTINGS.BASE_URL + 'api/home/types',
            method: 'post',
            params: clientParams,
        }).then((hotelTypeResponse) => {
            const homeTypesData = hotelTypeResponse.data
            if (homeTypesData.success && homeTypesData.data.length > 0) {
                if (homeTypesData?.data) {
                    setToState('guest', ['hotelType', 'data'], homeTypesData.data)
                    return true
                } else {
                    setToState('guest', ['hotelType', 'data'], null)
                    return true
                }
            } else {
                setToState('guest', ['hotelType', 'data'], null)
                return true
            }
        }).catch(() => {
            setToState('guest', ['hotelType', 'data'], null)
            return true
        })
    }

    async function getHomeOffers(topn = defOfferLimit) {
        setIsLoadingOffers(true)
        clientParams.topn = topn
        return axios({
            url: GENERAL_SETTINGS.BASE_URL + 'api/home/offers',
            method: 'post',
            params: clientParams,
        }).then((homeOffersResponse) => {
            const homeOffersData = homeOffersResponse.data
            if (homeOffersData.success && homeOffersData.data.length > 0) {
                if(homeOffersData.data.length >= defOfferLimit){
                    setIsLoadMoreButtonShow(true)
                }else {
                    setIsLoadMoreButtonShow(false)
                }

                if (homeOffersData?.data) {
                    setOfferLimit(homeOffersData.data.length)
                    setToState('guest', ['offers', 'data'], homeOffersData.data)
                    setIsLoadingOffers(false)
                    return true
                } else {
                    setOfferLimit(defOfferLimit)
                    setToState('guest', ['offers', 'data'], null)
                    setIsLoadingOffers(false)
                    return true
                }
            } else {
                setIsLoadMoreButtonShow(false)
                setOfferLimit(defOfferLimit)
                setToState('guest', ['offers', 'data'], null)
                setIsLoadingOffers(false)
                return true
            }
        }).catch(() => {
            setOfferLimit(defOfferLimit)
            setToState('guest', ['offers', 'data'], null)
            setIsLoadingOffers(false)
            return true
        })
    }

    const HomeSlider = () => {
        if (state.homeSlider.data === false || state.homeList.isLoading) {
            return (
                <Box p={4}>
                    <LoadingSpinner size={40} />
                </Box>
            )
        }

        if (state.homeSlider.data === null) {
            return (
                <Box p={4}>
                    <Typography variant='h6' align='center' gutterBottom>
                        {t('str_noDataAvailable')}
                    </Typography>
                </Box>
            )
        }

        return <Carousel slideData={state.homeSlider.data || []} />
    }

    const HomeSections = () => {
        if (state.offers.data === false || state.offers.isLoading) {
            return (
                <Box p={4}>
                    <LoadingSpinner size={40}/>
                </Box>
            )
        }

        if (state.offers.data === null) {
            return (
                <Box p={4}>
                    <Typography variant="h6" align="center" gutterBottom>
                        {t('str_noDataAvailable')}
                    </Typography>
                </Box>
            )
        }

        const renderButton = (cta) => {
            if (cta) {
                let link = getHyperlinkParser(cta)
                if(link === false){
                    return
                }

                let href = link.href
                let text = link?.text?.replace(/ /g,'') || ''
                let host = window.location.host

                let isExternalLink = false
                if(href.includes('http') && !href.includes(host)){
                    isExternalLink = true
                }

                if(!isExternalLink){

                    if((!infoLogin) && href.includes('profile') || href.includes('history')){
                        let destinationLink = encodeURIComponent(link.href)
                        href = '/guest/login?refurl='+destinationLink
                    }

                    return (
                        <Link id="slick-button"  variant="outlined" color="primary" href={href}>
                            {t(text?.removeHtmlTag())}
                        </Link>
                    )
                }

                return (
                    <Link id="slick-button"  variant="outlined" color="primary" target="_blank" href={href}>
                        {t(text?.removeHtmlTag())}
                    </Link>
                )
            }
        }

        return (
            <React.Fragment>
                {state.offers.data.map((item, i) =>
                    <Paper elevation={3} key={i} style={{ marginBottom: 25 }}>
                        <Grid container direction={i % 2 ? 'row-reverse' : 'row'}>
                            <Grid item xs={12} sm={5}>
                                <img style={{ width: '100%', height: '100%', maxHeight: 342 }} src={GENERAL_SETTINGS.STATIC_URL + item.url}  alt=""/>
                            </Grid>
                            <Grid item xs={12} sm={7}>
                                <Grid container  direction="row" justify="space-around" alignItems="stretch">
                                    <Grid item xs={12}>
                                        <Box p={3}>
                                            <Typography variant='h5' gutterBottom>
                                                {t(item?.localtitle?.removeHtmlTag())}
                                            </Typography>
                                            <Typography variant='body1' gutterBottom align="justify" style={{minHeight: 145}}>
                                                {t(item?.localdesc?.removeHtmlTag())}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Grid container justify={i % 2 ? 'flex-start' : 'flex-end'} alignItems="stretch">
                                            <Grid item>
                                                <Box p={3}>
                                                    {renderButton(item.cta)}
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Paper>,
                )}
            </React.Fragment>
        )
    }

    return (
        <Container maxWidth='lg'>
            <Collapse in={Boolean(state.hotelType.chosenId)}>
                <Chip
                    color='primary'
                    style={{
                        height: 'auto',
                        borderRadius: 6,
                        boxShadow: '0px 3px 3px -2px rgb(0 0 0 / 20%), 0px 3px 4px 0px rgb(0 0 0 / 14%), 0px 1px 8px 0px rgb(0 0 0 / 12%)'
                    }}
                    label={<Typography style={{ padding: 5 }} variant='h5'>{state?.hotelType?.chosenTitle && t(state?.hotelType?.chosenTitle.removeHtmlTag()) || ''}</Typography>}
                    onDelete={() => setToState('guest', ['hotelType', 'chosenId'], false)}
                />
                <Divider style={{ marginTop: 20, marginBottom: 50 }} />
                <Grid container spacing={3}>
                    <OfferSales catCode={state?.hotelType?.chosenCode}/>
                </Grid>
                <Divider style={{ marginTop: 50, marginBottom: 50 }} />
            </Collapse>
            <Collapse in={!Boolean(state.hotelType.chosenId)}>
                <HomeSlider />
                <div style={{ marginTop: 50, marginBottom: 50 }} />
                {state?.hotelType?.data && state?.hotelType?.data.length > 0 ? (
                    <HotelTypeSelect />
                ) : null}
                {state.offers.data && state.offers.data.length > 0 ? (
                    <Grid container spacing={3} direction="row" justify="space-between" alignItems="center">
                        <Grid item>
                            <Typography variant='h5' color='primary'>
                                {t('str_memberClub')}
                            </Typography>
                        </Grid>
                        <Grid item>
                            {!infoLogin ? (
                                <Button variant="contained" color="primary" disableElevation onClick={() => Router.push('/guest/register')}>
                                    {t('str_becomeAMember')}
                                </Button>
                            ): null}
                        </Grid>
                        <Grid item xs={12}>
                            <HomeSections />
                        </Grid>
                        {isLoadMoreButtonShow ? (
                            <Grid item xs={12} style={{textAlign: 'center'}}>
                                {offerTopn > offerLimit  ? (
                                    <Button disabled={isLoadingOffers} color='primary' onClick={() => setOfferTopn(defOfferLimit)}>
                                        {isLoadingOffers ? (
                                            <LoadingSpinner size={30} />
                                        ) : (
                                            <React.Fragment>
                                                <Typography variant='h6'>
                                                    {t('str_showLess')}
                                                </Typography>
                                                <ExpandLess />
                                            </React.Fragment>
                                        )}
                                    </Button>
                                ): (
                                    <Button disabled={isLoadingOffers} color='primary' onClick={() => setOfferTopn(offerLimit + 1)}>
                                        {isLoadingOffers ? (
                                            <LoadingSpinner size={30} />
                                        ) : (
                                            <React.Fragment>
                                                <Typography variant='h6'>
                                                    {t('str_showMore')}
                                                </Typography>
                                                <ExpandMore />
                                            </React.Fragment>
                                        )}
                                    </Button>
                                )}
                            </Grid>
                        ): null}
                    </Grid>
                ): null}
            </Collapse>
        </Container>
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

export default connect(mapStateToProps, mapDispatchToProps)(Home)
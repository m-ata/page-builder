import React, { useEffect, useContext, useState } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import { setToState, updateState } from 'state/actions'
import WebCmsGlobal from 'components/webcms-global'
import {Typography, Grid} from '@material-ui/core'
import Button from '@material-ui/core/Button'
import OfferCard from './OfferCard'
import useTranslation from 'lib/translations/hooks/useTranslation'
import LoadingSpinner from 'components/LoadingSpinner'
import { LocaleContext } from 'lib/translations/context/LocaleContext'
import ExpandMore from '@material-ui/icons/ExpandMore'
import ExpandLess from '@material-ui/icons/ExpandLess'

const OfferSales = ({catCode}) => {
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
        , { locale } = useContext(LocaleContext)
        , { t } = useTranslation()
        , [offerList, setOfferList] = useState(false)
        , defLimit = 4
        , [limit, setLimit] = useState(defLimit)
        , [isLoadingOffers, setIsLoadingOffers] = useState(false)
        , [isLoadMoreButton, setIsLoadMoreButton] = useState(false)

    useEffect(() => {
        if (catCode) {
            async function loadOffer() {
                await getHomeOffers()
            }

            loadOffer().then(() => {
                return true
            })
        }
    }, [catCode, locale])

    async function getHomeOffers() {
        setIsLoadingOffers(true)
        return axios({
            url: GENERAL_SETTINGS.BASE_URL + 'api/home/offers',
            method: 'post',
            params: {
                catcode: catCode,
                langcode: locale
            },
        }).then((homeOfferResponse) => {
            const homeOffersData = homeOfferResponse.data
            if (homeOffersData.success && homeOffersData.data.length > 0) {
                setIsLoadMoreButton(homeOffersData.data.length >= limit)
                setOfferList(homeOffersData.data)
                setIsLoadingOffers(false)
            } else {
                setOfferList([])
                setIsLoadingOffers(false)
            }
        }).catch(() => {
            setOfferList([])
            setIsLoadingOffers(false)
        })
    }

    if(!isLoadingOffers && offerList && offerList.length === 0){
        return (
            <Typography variant='h6' align='center' color='textSecondary' style={{width: '100%'}} gutterBottom>
                {t('str_noRecords')}
            </Typography>
        )
    }

    if(isLoadingOffers){
        return (
            <Grid item xs={12} style={{ textAlign: 'center' }}>
                <LoadingSpinner size={30} />
            </Grid>
        )
    }

    return (
        <React.Fragment>
            {offerList && offerList.length > 0 && offerList
                .sort((a, b) => a.orderno - b.orderno)
                .slice(0, limit)
                .map((offer, itemKey) => (
                        <OfferCard
                            key={itemKey}
                            offer={offer}
                        />
                    ),
                )
            }
            <Grid item xs={12} style={{ textAlign: 'center' }}>
                {isLoadMoreButton ? (offerList.length > limit ? (
                    <Button color='primary' onClick={() => setLimit(offerList.length)}>
                        <React.Fragment>
                            <Typography variant='h6'>
                                {t('str_showMore')}
                            </Typography>
                            <ExpandMore />
                        </React.Fragment>
                    </Button>
                ) : (
                    <Button disabled={isLoadingOffers} color='primary' onClick={() => setLimit(defLimit)}>
                        <React.Fragment>
                            <Typography variant='h6'>
                                {t('str_showLess')}
                            </Typography>
                            <ExpandLess />
                        </React.Fragment>
                    </Button>
                )) : null}
            </Grid>
        </React.Fragment>
    )

}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(OfferSales)

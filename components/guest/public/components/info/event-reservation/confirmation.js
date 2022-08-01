import React, { useContext, useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { connect, useSelector } from 'react-redux'
import { setToState, updateState } from 'state/actions'
import { Container, Grid, Box, Divider } from '@material-ui/core'
import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import EventReservationCard from 'components/guest/account/Reservations/EventReservationCard'
import FrameCheckbox from '@webcms-ui/core/frame-checkbox'
import WebCmsGlobal from 'components/webcms-global'
import useTranslation from 'lib/translations/hooks/useTranslation'
import * as global from '@webcms-globals'
import getSymbolFromCurrency from 'model/currency-symbol'

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        backgroundColor: theme.palette.background.paper,
        position: 'relative',
        overflow: 'auto',
        maxHeight: 300,
    },
    listItem: {
        padding: theme.spacing(1, 0),
    },
    total: {
        fontWeight: 700,
    },
    title: {
        marginTop: theme.spacing(2),
    },
}))

const Confirmation = (props) => {
    const classes = useStyles()
    const { state, event, eventLocData, updateState, showDetail } = props
    const { GENERAL_SETTINGS, locale } = useContext(WebCmsGlobal)
    const { t } = useTranslation()
    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)
    let hotelRefno = loginfo && loginfo.hotelrefno || GENERAL_SETTINGS.HOTELREFNO
    const isPortal = GENERAL_SETTINGS.ISPORTAL;

    const handleConfirm = (e) => {
        updateState('guest', 'isRestaurantResTermsConfirm', e)
    }

    const productTotal = (productList) => {
        let productTotalPrice = 0,
            curr = ''

        productList.map((product) => {
            if(GENERAL_SETTINGS.hotelSettings.productprice && product.showprice){
                productTotalPrice += product.amount * product.price
            }

            if (curr === '') {
                curr += product.pricecurr
            }
        })

        return {
            total: productTotalPrice,
            pricecurr: curr,
        }
    }

    return (
        <React.Fragment>
            <Grid container spacing={0}>
                {showDetail ? (
                    <React.Fragment>
                        {!eventLocData.isposmain ? (
                            <Grid item xs={12}>
                                v
                                <EventReservationCard event={event} fullWidth={global.base.isTrue} hideStatus={true}/>
                            </Grid>
                        ): null}
                        <Grid item xs={12}>
                            <Box p={0}>
                                {GENERAL_SETTINGS.hotelSettings.productprice && state.selectGuestProductList && state.selectGuestProductList.length > 0 ? (
                                    <Typography variant="h6" gutterBottom>
                                        {t('str_orderSummary')}
                                    </Typography>
                                ): null}
                                <List disablePadding className={classes.root}>
                                    {GENERAL_SETTINGS.hotelSettings.productprice && state.selectGuestProductList ? state.selectGuestProductList.map((product) => (
                                        <React.Fragment key={product.title}>
                                            <ListItem className={classes.listItem}>
                                                <ListItemText
                                                    primary={product.title}
                                                    secondary={`${product.amount} ${t('str_unit')} ${GENERAL_SETTINGS.hotelSettings.productprice && product.showprice ? ' x '+ (product.price > 0 ? global.helper.formatPrice(product.price) : ' - ') + ' ' + getSymbolFromCurrency(product.pricecurr) : ''}`}
                                                />
                                                <Typography variant="body2">
                                                    {GENERAL_SETTINGS.hotelSettings.productprice && product.showprice && ((product.price > 0) ? (global.helper.formatPrice(product.amount * product.price)) : ' - ') + ' ' + getSymbolFromCurrency(product.pricecurr)}
                                                </Typography>
                                            </ListItem>
                                            <Divider variant="fullWidth" component="li" />
                                        </React.Fragment>
                                    )): null}
                                </List>
                                {(GENERAL_SETTINGS.hotelSettings.productprice && productTotal(state.selectGuestProductList).total > 0) ? (
                                    <Typography variant='body1' align='right' style={{ marginTop: 10 }} gutterBottom>
                                        {t('str_total')}: {(productTotal(state.selectGuestProductList).total > 0) ? global.helper.formatPrice(productTotal(state.selectGuestProductList).total) : ' - '} {productTotal(state.selectGuestProductList, locPriceData).pricecurr ? getSymbolFromCurrency(productTotal(state.selectGuestProductList).pricecurr) : locPriceData[0]?.currcode ? getSymbolFromCurrency(locPriceData[0].currcode) : ''}
                                    </Typography>
                                ): null}
                            </Box>
                        </Grid>
                    </React.Fragment>
                ) : null}
                <Grid item xs={12}>
                    <Box p={showDetail ? 2 : 0}>
                        <FrameCheckbox
                            value={state.isRestaurantResTermsConfirm}
                            title="str_termsAndConditions"
                            linkText="str_iAcceptLinkAndDesc"
                            linkTextADesc="str_termsAndConditions"
                            ifamePageUrl={
                                GENERAL_SETTINGS.BASE_URL +
                                `info/${locale}/${
                                    global.guestWeb.strEventTerms
                                }/${eventLocData.locmid}/${hotelRefno}?iframe=true`
                            }
                            isCheck={(e) => handleConfirm(e)}
                        />
                    </Box>
                </Grid>
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

export default connect(mapStateToProps, mapDispatchToProps)(Confirmation)

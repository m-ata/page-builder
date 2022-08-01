import axios from 'axios'
import React, { memo, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { connect, useSelector } from 'react-redux'
import { setToState, updateState } from 'state/actions'
import moment from 'moment'
import MomentAdapter from '@date-io/moment'
import { Button, CircularProgress, Container, Grid, MenuItem, Paper, TextField, InputLabel, ListSubheader, FormControl, Select } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import useTranslation from 'lib/translations/hooks/useTranslation'
import WebCmsGlobal from 'components/webcms-global'
import useNotifications from 'model/notification/useNotifications'
import {
    DateRangeDelimiter,
    DesktopDateRangePicker,
    LocalizationProvider,
} from '@material-ui/pickers'
import { jsonGroupBy } from 'model/orest/constants'
import { useSnackbar } from 'notistack'

const useStyles = makeStyles((theme) => ({
    availabilityWrapper: {
        position: 'relative',
    },
    availabilityProgress: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
}))

const WidgetBooking = (props) => {
    const { state, updateState } = props

    const classes = useStyles()
        , Router = useRouter()
        , { t } = useTranslation()
        , { enqueueSnackbar } = useSnackbar()
        , { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
        , loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)
        , useChildSelect = state.maxChild > 0 && state.maxChildAge > 0 || false
        , useChainHotel =  GENERAL_SETTINGS.ISCHAIN && GENERAL_SETTINGS?.HOTEL_CHAIN_LIST?.length > 0 || false
        , chainHotels = useChainHotel && jsonGroupBy(GENERAL_SETTINGS.HOTEL_CHAIN_LIST, 'countryAndCity') || false
        , [selectedHotel, setSelectedHotel] = useState('')

    let clientParams = {}
    clientParams.hotelrefno = loginfo && loginfo.hotelrefno || GENERAL_SETTINGS.HOTELREFNO

    if(loginfo && loginfo.hotelgidstr){
        clientParams.hoteltoken = loginfo && loginfo.hotelgidstr
    }

    //2. options temp fix
    let countryIsoCode = GENERAL_SETTINGS.hotelCountryIso || 'TR'

    useEffect(() => {
        let active = true
        if (active) {
            if (!state.hotelinfo.length > 0) {
                axios({
                    url: GENERAL_SETTINGS.BASE_URL + 'api/ors/hotel/book/info',
                    method: 'post',
                    params: Object.assign(clientParams,{
                        langcode: countryIsoCode,
                    })
                }).then((hotelinfoResponse) => {
                    if (active) {
                        const hotelinfoData = hotelinfoResponse.data
                        if (hotelinfoData.success) {
                            if (hotelinfoData.data.agencyid !== 0 && hotelinfoData.data.agencyid !== null) {
                                updateState('ibe', 'agencyid', hotelinfoData.data.agencyid)
                            }

                            if (hotelinfoData.data.currencyid !== 0 && hotelinfoData.data.currencyid !== null) {
                                updateState('ibe', 'currencyid', hotelinfoData.data.currencyid)
                            }

                            if (hotelinfoData.data.minstay !== 0 && hotelinfoData.data.minstay !== null) {
                                updateState('ibe', 'minStay', hotelinfoData.data.minstay)
                            }

                            if (hotelinfoData.data.maxpax !== 0 && hotelinfoData.data.maxpax !== null) {
                                const maxPax = hotelinfoData.data.maxpax || 0
                                    , defPax = GENERAL_SETTINGS?.hotelSettings?.defpax || 0
                                    , usePax = (maxPax >= defPax) ? defPax : maxPax
                                updateState('ibe', 'adult', usePax)
                                updateState('ibe', 'maxAdult', hotelinfoData.data.maxpax)
                            }

                            if (hotelinfoData.data.maxchd !== 0 && hotelinfoData.data.maxchd !== null) {
                                updateState('ibe', 'maxChild', hotelinfoData.data.maxchd)
                            }

                            if (hotelinfoData.data.maxchdage !== 0 && hotelinfoData.data.maxchdage !== null) {
                                updateState('ibe', 'maxChildAge', hotelinfoData.data.maxchdage)
                            }

                            if (hotelinfoData.data.langid !== 0 && hotelinfoData.data.langid !== null) {
                                updateState('ibe', 'langid', hotelinfoData.data.langid)
                            }

                            if (hotelinfoData.data.marketid !== 0 && hotelinfoData.data.marketid !== null) {
                                updateState('ibe', 'marketid', hotelinfoData.data.marketid)
                            }

                            updateState('ibe', 'guestInfoFormStatus', true)
                        } else {
                            updateState('ibe', 'guestInfoFormStatus', false)
                        }
                    }
                })
            }
        }

        return () => {
            active = false
        }
    }, [])

    const CHECKIN_DATE = moment()
        , CHECKOUT_DATE = moment(CHECKIN_DATE).add(state.minStay, 'days')

    if (state.selectedDate[0] === null && state.selectedDate[1] === null) {
        updateState('ibe', 'selectedDate', [CHECKIN_DATE, CHECKOUT_DATE])
    }

    const handleDate = (date) => {
        if (date && date[0] && date[0]._d && date[1] && date[1]._d) {
            const checkInDateTime = date[0]._d.getTime()
                , checkOutDateTime = date[1]._d.getTime()
                , dateDiff = Math.abs(checkInDateTime - checkOutDateTime)
                , totalNight = Math.ceil(dateDiff / (1000 * 3600 * 24))

            if (state.minStay > totalNight) {
                enqueueSnackbar(`${t('str_chooseMinError')} ${state.minStay} ${t('str_days')}`, { variant: 'error' });
                updateState('ibe', 'selectedDate', [moment(state.selectedDate[0]), moment(state.selectedDate[1])])
            } else {
                updateState('ibe', 'selectedDate', date)
                updateState('ibe', 'night', totalNight)
            }
        }
    }

    const handleAdult = (e) => {
        updateState('ibe', 'adult', e.target.value)
    }

    const handleChd = (e) => {
        updateState('ibe', 'child', e.target.value)
    }

    const handleCheck = () => {
        updateState('ibe', 'ibeWidgetListInitialized', true)
        let query = {
            ci: moment(state.selectedDate[0]).format('DD-MM-YYYY'),
            co: moment(state.selectedDate[1]).format('DD-MM-YYYY'),
            adult: state.adult,
            child: state.child,
        }

        if (Router.query.lang) {
            query.lang = Router.query.lang
        }

        if (useChainHotel) {
            if(selectedHotel){
                const urlSearchParams = new URLSearchParams(query)
                    , params = Object.fromEntries(urlSearchParams.entries())
                    , paramStr = new URLSearchParams(params).toString()
                    , hotelItem = GENERAL_SETTINGS.HOTEL_CHAIN_LIST.find(item => String(item.id) === String(selectedHotel))
                    , hotelWebKey = hotelItem ? hotelItem.webkey : false

                if(hotelWebKey){
                    let useHotelUrl
                    if (!hotelWebKey.includes('.')) {
                        useHotelUrl = `${hotelWebKey}.vimahotels.com`
                    } else {
                        useHotelUrl = hotelWebKey
                    }
                    updateState('ibe', 'ibeWidgetListInitialized', false)
                    window.open(`https://${useHotelUrl}/booking/rooms?${paramStr}`)
                }
            }else{
                updateState('ibe', 'ibeWidgetListInitialized', false)
                enqueueSnackbar(t('str_pleaseSelectAHotel'), { variant: 'info' })
            }
        } else {
            updateState('ibe', 'ibeWidgetListInitialized', true)
            Router.push({
                pathname: '/booking/rooms',
                query: query,
            })
        }
    }

    const handleSelectHotel = (e) => {
        setSelectedHotel(e.target.value)
    }

    const renderSelectGroup = (groupName) => {
        const items = chainHotels[groupName].map(hotel => {
            return (
                <MenuItem key={hotel.id} value={hotel.id}>
                    {hotel.code}
                </MenuItem>
            )
        })
        return [<ListSubheader>{groupName}</ListSubheader>, items]
    }

    return (
        <React.Fragment>
            <Container maxWidth="lg">
                <Paper elevation={3} style={{ padding: 30 }}>
                    <Grid container spacing={3}>
                        {useChainHotel ? (
                            <Grid item xs={12} sm={3}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel htmlFor="chainHotelSelect">{t('str_hotels')}</InputLabel>
                                    <Select
                                        fullWidth
                                        value={selectedHotel || ""}
                                        onChange={handleSelectHotel}
                                        defaultValue=""
                                        label={t('str_hotels')}
                                    >
                                        {Object.keys(chainHotels).sort().reverse()?.map(groupName => renderSelectGroup(groupName))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        ): null}
                        <Grid item xs={12} sm={useChainHotel ? useChildSelect ? 4 : 5 : useChildSelect ? 5 : 6}>
                            <LocalizationProvider dateLibInstance={moment} dateAdapter={MomentAdapter}>
                                <DesktopDateRangePicker
                                    startText={t('str_checkinDate')}
                                    endText={t('str_checkoutDate')}
                                    size="small"
                                    fullWidth={true}
                                    minDate={moment()}
                                    onChange={handleDate}
                                    value={state.selectedDate}
                                    inputFormat="DD/MM/YYYY"
                                    renderInput={(startProps, endProps) => (
                                        <React.Fragment>
                                            <TextField {...startProps} fullWidth size="medium" helperText={''}/>
                                            <br/><DateRangeDelimiter>{' '}</DateRangeDelimiter>
                                            <TextField {...endProps} fullWidth size="medium" helperText={''}/>
                                        </React.Fragment>
                                    )}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sm={useChainHotel ? useChildSelect ? 1 : 2 : useChildSelect ? 2 : 3}>
                            <TextField
                                size="medium"
                                fullWidth={true}
                                select
                                id="guest"
                                label={t('str_guest')}
                                variant="outlined"
                                value={state.adult}
                                onChange={(e) => handleAdult(e)}
                            >
                                {Array.from({ length: state.maxAdult }).map((adult, i) => {
                                    let adultNo = i + 1
                                    return (
                                        <MenuItem key={i} value={adultNo}>
                                            {adultNo}
                                        </MenuItem>
                                    )
                                })}
                            </TextField>
                        </Grid>
                        {useChildSelect ? (
                            <Grid item xs={12} sm={useChainHotel ? 1 : 2}>
                                <TextField
                                    size="medium"
                                    fullWidth={true}
                                    select
                                    id="child"
                                    onChange={(e) => handleChd(e)}
                                    label={t('str_child')}
                                    variant="outlined"
                                    value={state.child || 0}
                                >
                                    <MenuItem value={0}>
                                       0
                                    </MenuItem>
                                    {Array.from({ length: state.maxChild }).map((chd, i) => {
                                        let chdNo = i + 1
                                        return (
                                            <MenuItem key={i} value={chdNo}>
                                                {chdNo}
                                            </MenuItem>
                                        )
                                    })}
                                </TextField>
                            </Grid>
                        ): null}
                        <Grid item xs={12} sm={useChainHotel ? useChildSelect ? 3 : 2 : 3}>
                            <div className={classes.availabilityWrapper}>
                                <Button
                                    style={{ marginTop: 5, padding: 10}}
                                    disabled={state.ibeWidgetListInitialized}
                                    onClick={handleCheck}
                                    fullWidth={true}
                                    variant="contained"
                                    color="primary"
                                    size="medium"
                                >
                                    {t('str_checkRates')}
                                </Button>
                                {state.ibeWidgetListInitialized && (
                                    <CircularProgress
                                        size={24}
                                        className={classes.availabilityProgress}
                                        color="inherit"
                                    />
                                )}
                            </div>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.ibe,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

const memorizedWidgetBooking = memo(WidgetBooking)

export default connect(mapStateToProps, mapDispatchToProps)(memorizedWidgetBooking)

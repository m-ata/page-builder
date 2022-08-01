import React from 'react'
import moment from 'moment'
import MomentAdapter from '@date-io/moment'
import { Badge, TextField, Tooltip } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { LocalizationProvider, StaticDatePicker, PickersDay } from '@material-ui/pickers'
import getSymbolFromCurrency from 'model/currency-symbol'
import { formatMoney } from 'model/orest/constants'
import clsx from 'clsx'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { getTotalPrice} from 'lib/helpers/useFunction'

const usePriceDayStyles = makeStyles((theme) => ({
    priceDay: {
        top: 25,
        left: -13,
        color: '#767676',
        width: 36,
        display: 'block',
        padding: '3px 0 1px 0',
        position: 'relative',
        fontSize: '6.6px',
        textAlign: 'center',
        fontWeight: 800,
        borderRadius: 0
    },
    priceDayDisc: {
        top: 25,
        left: -13,
        color: '#28a745',
        width: 36,
        display: 'block',
        padding: '3px 0 1px 0',
        position: 'relative',
        fontSize: '6.6px',
        textAlign: 'center',
        fontWeight: 800,
        borderRadius: 0,
        cursor: 'pointer'
    },
    highlight: {
        color: '#727272!important',
        borderRadius: 0,
        backgroundColor: '#f9f9f9!important',
        borderLeft: '1px solid #ebebeb',
        alignItems: 'flex-start',
        justifyContent: 'end',
        padding: '2px 6px 4px 4px',
        '&:hover, &:focus': {
            backgroundColor: theme.palette.primary.dark,
        },
        '& span': {
            zIndex: 2
        }
    },
    firstHighlight: {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        backgroundColor: 'transparent!important',
        borderLeft: 'none',
        '&:before': {
            content: '\'\'',
            width: 0,
            height: 0,
            borderStyle: 'solid',
            borderWidth: '0 0 36px 36px',
            position: 'absolute',
            top: 0,
            left: -1,
            borderColor: 'transparent transparent #cdcdcd52 transparent',
        },
        '& span': {
            zIndex: 2
        }
    },
    endHighlight: {
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        '&:after': {
            content: '\'\'',
            width: 0,
            height: 0,
            borderStyle: 'solid',
            borderWidth: '36px 36px 0 0',
            position: 'absolute',
            top: 0,
            left: 1,
            borderColor: '#cdcdcd52 transparent transparent transparent',
        },
        '& span': {
            zIndex: 2
        }
    },
    priceCalender: {
        padding: 0,
        maxHeight: 340,
        width: 300
    }
}))

function makeJSDateObject(date) {
    if (date) {
        return date.clone().toDate();
    }

    if (moment.isMoment(date)) {
        return date.clone().toDate();
    }

    if (date) {
        return date.toJSDate();
    }

    if (date) {
        return new Date(date.getTime());
    }

    return date;
}

function isMatchDay(date1, date2){
    return moment(date1, 'YYYY-MM-DD').format('YYYY-MM-DD') === moment(date2).format('YYYY-MM-DD')
}

function getPriceInfo(useDate, priceList){
    return priceList.find(info => isMatchDay(info.startdate, useDate))
}

function PriceDay(props){
    const classes = usePriceDayStyles()
    const { t } = useTranslation()
    const { discdesc, priceItem, adult, chdAges, agencyChdAges } = props
    const { pricecurr, discrate } = priceItem
    const { totalPrice, discTotalPrice } = getTotalPrice(priceItem, adult, chdAges, agencyChdAges)

    if(discTotalPrice > 0){
        return (
            <Tooltip title={discdesc && t(discdesc) || t('str_withDiscount', {discount: discrate})} arrow>
                <span className={classes.priceDayDisc}>{getSymbolFromCurrency(pricecurr || '')} {formatMoney(discTotalPrice)}</span>
            </Tooltip>
        )
    }else {
        return <span className={classes.priceDay}>{getSymbolFromCurrency(pricecurr || '')} {formatMoney(totalPrice)}</span>
    }
}

function PriceCalendar(props) {
    const classes = usePriceDayStyles()
    const { checkin, checkout, priceList, adult, chdAges, agencyChdAges  } = props

    return (
        <LocalizationProvider dateLibInstance={moment} dateAdapter={MomentAdapter}>
            <StaticDatePicker
                className={classes.priceCalender}
                onChange={()=> {}}
                disablePast
                disableHighlightToday
                displayStaticWrapperAs='desktop'
                value={checkin}
                minDate={checkin}
                maxDate={moment(checkout).subtract(1,'days')}
                renderInput={(props) => <TextField {...props} />}
                renderLoading={() => ""}
                renderDay={(day, value, DayComponentProps) => {
                    const date = makeJSDateObject(day ?? new Date())
                        , useData =   getPriceInfo(date, priceList)
                        , isSelected = DayComponentProps.inCurrentMonth && useData
                        , isFirstDay =  isMatchDay(checkin, date)
                        , isLastDay = isMatchDay(checkout, date)

                    return (
                        <Badge key={date.toString()} overlap='circle' badgeContent={isSelected ? <PriceDay priceItem={useData} adult={adult} chdAges={chdAges} agencyChdAges={agencyChdAges} /> : undefined}>
                            <PickersDay
                                {...DayComponentProps}
                                disableMargin
                                className={clsx({
                                    [classes.highlight]: isSelected,
                                    [classes.firstHighlight]: isFirstDay,
                                    [classes.endHighlight]: isLastDay,
                                })}
                            />
                        </Badge>
                    )
                }}
            />
        </LocalizationProvider>
    )
}

export default PriceCalendar;

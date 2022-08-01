import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import { withStyles, makeStyles } from '@material-ui/core/styles'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { formatMoney } from 'model/orest/constants'
import getSymbolFromCurrency from 'model/currency-symbol'
import Tooltip from '@material-ui/core/Tooltip'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'
import PriceCalendar from '../booking/components/PriceCalendar'

const useStyles = makeStyles((theme) => ({
    priceDesc: {
        display: 'block',
    },
    onlyPriceStyle: {
        '& ins': {
            marginRight: -4,
            color: '#333333',
            fontSize: 24,
            textDecoration: 'none',
            padding: '.5em 0 0 .5em',
        },
    },
    onlyPriceStyleTooltip: {
        padding: theme.spacing(0.5),
        '& ins': {
            color: '#333333',
            fontSize: 16,
            textDecoration: 'none',
            marginLeft: -13
        },
    },
    discountDescription: {
        position: 'absolute',
        background: '#ffc107',
        color: '#303030',
        fontSize: 9,
        padding: ' 0.9px 4px 0.6px 4px',
        borderRadius: 3,
        top: -10,
        left: 5,
        lineHeight: 1.6,
        fontWeight: 'bolder',
        display: 'inline-block'
    },
    discountDescriptionTooltip: {
        padding: '2px 2.5px 2px 3px',
        lineHeight: 1.4,
        fontSize: 8,
        top: 3,
        right: 0,
        left: 5
    },
    discountStyle: {
        padding: theme.spacing(0.5),
        marginLeft: 4,
        position: 'relative',
        height: 40,
        '& ins': {
            color: '#38903c',
            fontSize: 22,
            fontWeight: 700,
            textDecoration: 'none',
            padding: '.5em 0 0 .5em',
            position: 'absolute',
            right: -5,
            top: -10
        },
        '& del': {
            color: 'rgba(128, 128, 128, 0.5)',
            textDecoration: 'none',
            position: 'absolute',
            top: 8,
            left: 0,
            '&::before': {
                content: "' '",
                display: 'block',
                width: '100%',
                borderTop: '3px solid #ffc10775',
                height: 12,
                position: 'absolute',
                top: 6,
                left: 1,
                bottom: 0,
                transform: 'rotate(-7deg)',
            },
        },
    },
    discountStyleTooltip: {
        '& ins': {
            fontSize: 16,
        }
    },
    nightlyInfoBadge: {
        background: '#218242',
        color: '#ffffff',
        fontSize: 9,
        padding: '0.9px 4px 0.6px 4px',
        borderRadius: 3,
        display: 'inline-block',
        position: 'absolute',
        top: -10,
        right: -5,
        lineHeight: 1.6,
        fontWeight: 'bolder',
        '&::before': {
            content: "' '",
            width: 0,
            height: 0,
            display: 'block',
            position: 'absolute',
            borderColor: 'rgba(0,0,0,0)',
            borderStyle: 'solid',
            bottom: -5,
            borderWidth: '5px 0px 2px 5px',
            right: 0,
            borderTopColor: '#238242',
        },
    },
    priceWrapper: {
        width: '100%',
        display: 'inline-block',
        position: 'relative',
        marginTop: 20,
        textAlign: 'end',
        paddingTop: 2,
        paddingRight: 1,
        marginLeft: -10,
        maxWidth: 185,
        [theme.breakpoints.down("xs")]: {
            maxWidth: '100%',
        },
    }
}))

const NightlyPriceListTooltip = withStyles((theme) => ({
    tooltip: {
        backgroundColor: '#f5f5f9',
        color: 'rgba(0, 0, 0, 0.87)',
        maxWidth: 420,
        fontSize: theme.typography.pxToRem(12),
        border: '2px solid #dadde9',
        marginTop: -4,
        padding: 0
    },
}))(Tooltip)

const RoomPriceWrap = (props) => {
    const classes = useStyles()
        , { t } = useTranslation()
        , { checkin, checkout, totalPaxPrice, currency, discTotalPaxPrice, discountDescription, discRate, adult, chdAges, priceList, agencyChdAges, disabledPriceList, isTooltip } = props

    return (
        <React.Fragment>
            {totalPaxPrice && discTotalPaxPrice ? (
                <NightlyPriceListTooltip
                    disableHoverListener={disabledPriceList}
                    arrow
                    interactive
                    title={
                        <PriceCalendar
                            checkin={checkin}
                            checkout={checkout}
                            priceList={priceList}
                            adult={adult}
                            chdAges={chdAges}
                            agencyChdAges={agencyChdAges}
                        />
                    }
                >
                    <div className={classes.priceWrapper}>
                    {discTotalPaxPrice > 0 ? (
                        discountDescription ? (
                            <span className={clsx(classes.discountDescription, { [classes.discountDescriptionTooltip]: isTooltip })}>{t(discountDescription, { discount: discRate })}</span>
                        ) : (
                            <span className={clsx(classes.discountDescription, { [classes.discountDescriptionTooltip]: isTooltip })}>{t('str_withDiscount', { discount: discRate })}</span>
                        )
                    ) : null}
                    {!isTooltip ? <span className={classes.nightlyInfoBadge}><InfoOutlinedIcon style={{fontSize: '0.75rem', marginTop: -1}} /> {t('str_totalPrice')}</span> : null}
                        <div className={clsx(classes.discountStyle, { [classes.discountStyleTooltip]: isTooltip })}>
                            <del>
                            <span className='amount'>
                                {getSymbolFromCurrency(currency) || ''}{formatMoney(totalPaxPrice)}
                            </span>
                            </del>
                            <ins>
                            <span className='amount'>
                                {getSymbolFromCurrency(currency) || ''}{formatMoney(discTotalPaxPrice)}
                            </span>
                            </ins>
                        </div>
                </div>
                </NightlyPriceListTooltip>
            ) : (
                <NightlyPriceListTooltip
                    disableHoverListener={disabledPriceList}
                    arrow
                    interactive
                    title={
                        <PriceCalendar
                            checkin={checkin}
                            checkout={checkout}
                            priceList={priceList}
                            adult={adult}
                            chdAges={chdAges}
                            agencyChdAges={agencyChdAges}
                        />
                    }
                >
                    <div className={classes.priceWrapper}>
                    {!isTooltip ? <span className={classes.nightlyInfoBadge}><InfoOutlinedIcon style={{fontSize: '0.75rem', marginTop: -1}} /> {t('str_totalPrice')}</span> : null}
                        <div className={clsx(classes.onlyPriceStyle, { [classes.onlyPriceStyleTooltip]: isTooltip })}>
                            <ins>
                            <span className='amount'>
                                {getSymbolFromCurrency(currency) || ''}
                                {formatMoney(totalPaxPrice)}
                            </span>
                            </ins>
                        </div>
                </div>
                </NightlyPriceListTooltip>
            )}
        </React.Fragment>
    )
}

RoomPriceWrap.propTypes = {
    price: PropTypes.string,
    currency: PropTypes.string,
    discount: PropTypes.string,
}

export default RoomPriceWrap

import React, { useContext } from 'react'
import { connect } from 'react-redux'
import { pushToState, setToState, updateState } from 'state/actions'
import { makeStyles } from '@material-ui/core/styles'
import {
    Avatar,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    Typography,
} from '@material-ui/core'
import { Face, NightsStay, Person } from '@material-ui/icons'
import DeleteRoom from 'components/ibe/DeleteRoom'
import useTranslation from 'lib/translations/hooks/useTranslation'
import WebCmsGlobal from 'components/webcms-global'
import { formatMoney } from 'model/orest/constants'
import getSymbolFromCurrency from 'model/currency-symbol'

const useStyles = makeStyles((theme) => ({
    appBar: {
        position: 'relative',
    },
    title: {
        marginLeft: theme.spacing(2),
        flex: 1,
    },
    paper: {
        padding: theme.spacing(2),
    },
    listItem: {
        padding: theme.spacing(1, 0),
    },
    total: {
        fontWeight: 700,
    },
    thankYouReservation: {
        textAlign: 'center',
        padding: 25,
    },
    thankYouReservationTitle: {
        marginLeft: 10,
    },
    thankYouReservationDescription: {
        paddingTop: 10,
        paddingBottom: 15,
    },
    infoChip: {
        marginRight: 5,
    },
    infoPriceChip: {
        marginLeft: 4,
    },
}))

const ReservationSummary = (props) => {
    const classes = useStyles()
    const { t } = useTranslation()
    const { state, updateState, onlyTotal } = props
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    const infoTotal = () => {
        let total = 0
        let curr = ''

        state.listOfSelectedRooms.roomList.map((item) => {
            if (curr === '') {
                curr += getSymbolFromCurrency(item.pricecurr)
            }
            total = total + item.totalprice
        })

        return {
            totalprice: total,
            pricecurr: curr,
        }
    }

    return (
        <List disablePadding>
            {state.listOfSelectedRooms.roomList.map((item) => (
                <React.Fragment key={item.reservno}>
                    <ListItem className={classes.listItem}>
                        <ListItemText
                            primary={item.roomtypename || ''}
                            secondary={
                                <Typography component={'span'} variant={'body2'}>
                                    <Chip
                                        size="small"
                                        color="default"
                                        className={classes.infoChip}
                                        label={item.totalpax}
                                        icon={<Person fontSize="small" />}
                                    />
                                    <Chip
                                        size="small"
                                        color="default"
                                        className={classes.infoChip}
                                        label={item.totalchd}
                                        icon={<Face fontSize="small" />}
                                    />
                                    <Chip
                                        size="small"
                                        color="default"
                                        className={classes.infoChip}
                                        label={item.totalnight}
                                        icon={<NightsStay fontSize="small" />}
                                    />
                                    {' x '}
                                    <Typography component="span" variant="body2" color="textPrimary">
                                        <Chip
                                            className={classes.infoPriceChip}
                                            color="default"
                                            variant="outlined"
                                            size="small"
                                            avatar={<Avatar>{getSymbolFromCurrency(item.pricecurr)}</Avatar>}
                                            label={formatMoney(item.totalprice)}
                                        />
                                    </Typography>
                                </Typography>
                            }
                        />
                        <ListItemSecondaryAction>
                            <DeleteRoom gid={item.gid} />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <Divider component="li" />
                </React.Fragment>
            ))}
            <ListItem className={classes.listItem}>
                <ListItemText primary={t('str_total')} />
                <Typography variant="subtitle1" className={classes.total}>
                    {infoTotal().pricecurr}
                    {formatMoney(infoTotal().totalprice)}
                </Typography>
            </ListItem>
        </List>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.ibe,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    pushToState: (stateType, stateName, value) => dispatch(pushToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ReservationSummary)

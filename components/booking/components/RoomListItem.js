import React, { useContext, useEffect, useState, useRef } from 'react'
import axios from 'axios'
import moment from 'moment'
import {
    ListItem,
    Typography,
    Icon,
    Chip,
    Avatar,
    Tooltip
} from '@material-ui/core'
import { withStyles, makeStyles } from '@material-ui/core/styles'
import { setToState } from 'state/actions'
import { connect } from 'react-redux'
import WebCmsGlobal from 'components/webcms-global'
import ProgressIconButton from './ProgressIconButton'
import { useSnackbar } from 'notistack'
import useTranslation from 'lib/translations/hooks/useTranslation'
import getSymbolFromCurrency from 'model/currency-symbol'
import { formatMoney } from 'model/orest/constants'
import TagManager from '@webcms-globals/tag-manager'
import * as global from '@webcms-globals'
import { useRouter } from 'next/router'

const useStyles = makeStyles(() => ({
    infoChip: {
        marginRight: 5,
        backgroundColor: '#ffffff',
        borderRadius: 0,
        boxShadow: 'inset 0 0 0px 1px #c8c8c8'
    },
    infoPriceChip: {
        backgroundColor: '#ffffff',
        borderRadius: 0,
        marginLeft: 5,
        boxShadow: 'inset 0 0 0px 1px #c8c8c8',
        position: 'absolute',
        right: 10
    },
    listItemContainer: {
        boxShadow: 'inset 0 0 1px 1px #f3f3f3',
    },
    listItemRoot: {
        paddingTop: 0,
        paddingBottom: 0,
        marginTop: 10,
        marginBottom: 10,
    },
    listItemParent: {
        display: 'flex',
        alignItems: 'flex-start',
        width: '100%',
        textAlign: 'center',
        padding: 0,
        boxShadow: '0 0 0 1px #d2d2d26b'
    },
    listItemBox:{
      flexGrow: 11,
      textAlign: 'start',
      padding: 10
    },
    listItemAction:{
        flexGrow: 1,
        padding: '1px 10px 0px 0px',
        '& button[aria-label="close"]:not([disabled])': {
            color: '#a6a6a6',
            '-webkit-transition': 'color 0.4s',
            '-ms-transition': 'color 0.4s',
            transition: 'color 0.4s',
        },
        "&:hover": {
            '& button[aria-label="close"]:not([disabled])': {
                color: '#4d4d4d',
                '-webkit-transition': 'color 0.4s',
                '-ms-transition': 'color 0.4s',
                transition: 'color 0.4s',
            },
        }
    },
    infoChipTooltipLabel: {
        fontSize: 12,
        fontWeight: 600
    },
    infoChipTooltipValue: {
        fontSize: 12
    }
}))

const HtmlTooltip = withStyles((theme) => ({
    tooltip: {
        backgroundColor: '#f5f5f9',
        color: 'rgba(0, 0, 0, 0.87)',
        maxWidth: 220,
        fontSize: theme.typography.pxToRem(12),
        border: '1px solid #dadde9',
    },
}))(Tooltip)

const RoomListItem = (props) =>{
    const classes = useStyles()
        , { GENERAL_SETTINGS, WEBCMS_DATA } = useContext(WebCmsGlobal)
        , { state, setToState, roomtypeId, roomName, checkin, checkout, pax, child, night, price, pricecurr, gid, reservno, dailyrate } = props
        , [ isRoomDelete, setIsRoomDelete ] = useState(false)
        , { enqueueSnackbar } = useSnackbar()
        , { t } = useTranslation()
        , router = useRouter()

    useEffect(() => {
        return () => setIsRoomDelete(false);
    }, [])

    const handleRemoveRoom = (gid, reservno) => {
        setToState('ibe', ['bookingIsDisable'], true)
        setIsRoomDelete(true)
        return axios({
            url: GENERAL_SETTINGS.BASE_URL + 'api/ors/room/delete',
            method: 'post',
            params: {
                gid: gid,
                reservno: reservno
            },
        }).then((deleteRoomResponse) => {
            const roomResponse = deleteRoomResponse.data
            if (roomResponse.status) {
                let selectedRooms = state.selectedRooms
                const roomIndex = selectedRooms.findIndex((item) => item.gid === String(gid))
                if (roomIndex > -1) {
                    let newRoomData = state.selectedRooms
                    newRoomData.splice(roomIndex, 1)
                    setToState('ibe', ['selectedRooms'], newRoomData)
                    setToState('ibe', ['bookingIsDisable'], false)
                    setIsRoomDelete(false)
                    enqueueSnackbar(t('str_deleteRoomSuccess'), { variant: 'success', autoHideDuration: 3000 })

                    if(WEBCMS_DATA?.assets?.meta?.googleTag){
                        TagManager.booking.setRemoveRoom({
                            eventLabel: 'Remove to Cart',
                            hotelName: WEBCMS_DATA?.assets?.meta?.title,
                            hotelId: GENERAL_SETTINGS.HOTELREFNO,
                            ciDate: checkin,
                            coDate: checkout,
                            adult: pax,
                            child: child,
                            currencyCode: pricecurr,
                            removeToCartData: {
                                reservNo: reservno,
                                id: roomtypeId,
                                name: roomName,
                                price: global.helper.formatPrice(price),
                                qty: 1,
                                category: 'Room',
                            }
                        })
                    }

                }

                if (selectedRooms.length === 0) {
                    router.push ({
                        pathname: '/booking/rooms',
                        query: router.query
                    })
                }
            }else{
                setIsRoomDelete(false)
                setToState('ibe', ['bookingIsDisable'], false)
                enqueueSnackbar(t('str_deleteRoomError'), { variant: 'warning', autoHideDuration: 3000 })
            }
        })
    }

    return (
        <ListItem alignItems="flex-start" button classes={{ container: classes.listItemContainer, root: classes.listItemRoot, button: classes.litemItemButton }} disableGutters>
            <div className={classes.listItemParent}>
                <div className={classes.listItemBox}>
                    <Typography variant='body1' className={classes.inline} color='textPrimary'>
                        {roomName}
                    </Typography>
                    <Typography
                        style={{
                            padding: '2px 0 10px 0',
                        }}
                        variant='body2'
                        className={classes.inline}
                        color='textSecondary'
                    >
                        {moment(checkin, 'YYYY-MM-DD').format('dd, MMM DD, YYYY')} - {moment(checkout, 'YYYY-MM-DD').format('dd, MMM DD, YYYY')}
                    </Typography>
                    <span>
                      <Chip
                          size='small'
                          color='default'
                          className={classes.infoChip}
                          label={pax}
                          icon={<Icon fontSize='small'>person</Icon>}
                      />
                      <Chip
                          size='small'
                          color='default'
                          className={classes.infoChip}
                          label={child}
                          icon={<Icon fontSize='small'>face</Icon>}
                      />
                      <HtmlTooltip
                          arrow
                          title={
                              <React.Fragment>
                                  <span className={classes.infoChipTooltipLabel}>{t('str_perNight')}:</span> <span className={classes.infoChipTooltipValue}>{formatMoney(dailyrate)} {getSymbolFromCurrency(pricecurr) || ''}</span>
                              </React.Fragment>
                          }
                      >
                      <Chip
                          size='small'
                          color='default'
                          className={classes.infoChip}
                          label={night}
                          icon={<Icon fontSize='small'>nights_stay</Icon>}
                      />
                     </HtmlTooltip>
                     <HtmlTooltip
                         arrow
                         title={<span className={classes.infoChipTooltipLabel}>{t('str_totalPrice')}</span>}
                     >
                         <Chip
                             className={classes.infoPriceChip}
                             color='default'
                             size='small'
                             avatar={<Avatar>{getSymbolFromCurrency(pricecurr) || ''}</Avatar>}
                             label={formatMoney(price)}
                         />
                     </HtmlTooltip>
                   </span>
                </div>
                <div className={classes.listItemAction}>
                    <ProgressIconButton edge='end' ariaLabel='close' isLoading={isRoomDelete} onClick={() => !state.bookingIsDisable && handleRemoveRoom(gid, reservno)}>
                        <Icon fontSize='small'>close</Icon>
                    </ProgressIconButton>
                </div>
            </div>
        </ListItem>
    )
}


const mapStateToProps = (state) => {
    return {
        state: state.formReducer.ibe,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(RoomListItem)

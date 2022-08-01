import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { Box, CircularProgress, Tooltip } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import WebCmsGlobal from 'components/webcms-global'
import { connect, useSelector } from 'react-redux'
import { setToState, updateState } from 'state/actions'
import useNotifications from 'model/notification/useNotifications'
import useTranslation from 'lib/translations/hooks/useTranslation'
import Icon from '@material-ui/core/Icon'
import { withStyles } from '@material-ui/core/styles'
import HairDryerIcon from 'public/imgs/icons/ibe/hair-dryer.svg'
import KettleIcon from 'public/imgs/icons/ibe/kettle.svg'
import IronIcon from 'public/imgs/icons/ibe/iron.svg'
import WaterParkIcon from 'public/imgs/icons/ibe/water-park.svg'
import SunbedIcon from 'public/imgs/icons/ibe/sunbed.svg'

const LightTooltip = withStyles((theme) => ({
    tooltip: {
        backgroundColor: theme.palette.common.white,
        color: 'rgba(0, 0, 0, 0.87)',
        boxShadow: theme.shadows[1],
        fontSize: 11,
    },
}))(Tooltip)

const useStyles = makeStyles((theme) => ({
    facilityItem: {
        margin: '0 3px',
        display: 'inline-block',
        backgroundColor: '#ffffff',
        border: '1px solid #eee',
        padding: 5,
        height: 35,
    },
    attributeList: {
        display: 'inline-flex',
        padding: 0,
    },
    attributeItem: {
        position: 'relative',
        listStyleType: 'none',
        padding: '15px',
        borderRight: '1px solid #ababab59',
        '&:last-child': {
            borderRight: 'none',
        },
    },
    attributeIcon: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        '-ms-transform': 'translate(-50%, -50%)',
        transform: 'translate(-50%, -50%)',
    },
}))

const RoomTypeAttributes = (props) => {
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const classes = useStyles()
    const { t } = useTranslation()
    const { showSuccess, showError } = useNotifications()
    const [roomAttrLoading, setRoomAttrLoading] = useState(false)
    const { roomtypeid, roomgid, state, setToState, updateState } = props

    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)

    let clientParams = {}
    clientParams.hotelrefno = loginfo && loginfo.hotelrefno || GENERAL_SETTINGS.HOTELREFNO

    if(loginfo && loginfo.hotelgidstr){
        clientParams.hoteltoken = loginfo && loginfo.hotelgidstr
    }

    useEffect(() => {
        let active = true
        if (active) {
            const roomTypeIndex = state.roomTypeAttrList.findIndex(
                (item) => Number(item.roomtypeid) === Number(roomtypeid)
            )
            if (roomTypeIndex === -1) {
                setRoomAttrLoading(true)
                axios({
                    url: GENERAL_SETTINGS.BASE_URL + 'api/ors/room/attributes',
                    method: 'post',
                    params:Object.assign({
                        gid: roomgid,
                    }, clientParams)
                }).then((roomAttrResponse) => {
                    if (active) {
                        const roomAttrResponseData = roomAttrResponse.data
                        if (roomAttrResponseData.success) {
                            let newRoomTypeAttr = state.roomTypeAttrList
                            let newRoomTypeAttrData = []
                            roomAttrResponseData.data.map((item, i) => {
                                newRoomTypeAttrData.push({
                                    attrcode: item.attrcode,
                                    attrdesc: item.attrdesc,
                                })
                            })

                            let roomTypeAttrFullList = {
                                roomtypeid: roomtypeid,
                                roomTypeAttrList: newRoomTypeAttrData,
                            }
                            newRoomTypeAttr.push(roomTypeAttrFullList)
                            setToState('ibe', ['roomTypeAttrList'], newRoomTypeAttr)
                            setRoomAttrLoading(false)
                        } else {
                            setRoomAttrLoading(false)
                        }
                    }
                })
            }
        }
        return () => {
            active = false
            setRoomAttrLoading(false)
        }
    }, [])

    let roomAttrIcon = {
        'SAFE': 'account_balance_wallet',
        'MINIBAR': 'kitchen',
        'JACUZZI': 'hot_tub',
        'AIRCONDITIONING': 'ac_unit',
        'FLATSCREENTV': 'tv',
        'GARDEN_VIEW': 'local_florist',
        'POOL_VIEW': 'pool',
        'HANDICAP': 'accessible',
        'BALCONY': 'deck',
        'LARG_BALC': 'deck',
        'NON_SMOKING': 'smoke_free',
        'SMOKING': 'smoking_rooms',
        'MOUNTAIN_VIEW': 'terrain',
        'SILENT': 'meeting_room',
        'SEA_VIEW': 'waves',
        'RIVER_VIEW': 'sailing',
        'PHONE CHARGER': 'charging_station',
        'TELEPHONE': 'phone',
        'WIFI': 'wifi',
        'HAIR_DRYER': 'hair_dryer',
        'KETTLE': 'kettle',
        'BREAKFAST': 'restaurant',
        'WATER_PARK': 'water_park',
        'SUNBED': 'sunbed',
        'DEFAULT': 'local_offer',
    }

    const getCustomIcon = (icon) => {
        switch (icon) {
            case 'hair_dryer':
                return HairDryerIcon
            case 'kettle':
                return KettleIcon
            case 'iron':
                return IronIcon
            case 'water_park':
                return WaterParkIcon
            case 'sunbed':
                return SunbedIcon
            default:
                return false
        }
    }

    if (roomAttrLoading) {
        return <CircularProgress size={24} className={classes.confirmButtonProgress} color="inherit" />
    } else {
        if (
            state.roomTypeAttrList &&
            state.roomTypeAttrList.findIndex((item) => Number(item.roomtypeid) === Number(roomtypeid)) > -1
        ) {
            const attrIndex = state.roomTypeAttrList.findIndex((item) => Number(item.roomtypeid) === Number(roomtypeid))
            return (
                <ul className={classes.attributeList}>
                    {state.roomTypeAttrList[attrIndex].roomTypeAttrList.slice(0, 10).map((item, index) => (
                        <li className={classes.attributeItem} key={index}>
                            <LightTooltip key={item.attrdesc} title={item.attrdesc}>
                                {roomAttrIcon[item.attrcode] ? (
                                    getCustomIcon(roomAttrIcon[item.attrcode])
                                        ? <img className={classes.attributeIcon} src={getCustomIcon(roomAttrIcon[item.attrcode])} /> :
                                        <Icon className={classes.attributeIcon}>{roomAttrIcon[item.attrcode]}</Icon>
                                ) : (
                                    <Icon className={classes.attributeIcon}>{roomAttrIcon['DEFAULT']}</Icon>
                                )}
                            </LightTooltip>
                        </li>
                    ))}
                </ul>
            )
        } else {
            return null
        }
    }
}

RoomTypeAttributes.propTypes = {}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.ibe,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(RoomTypeAttributes)

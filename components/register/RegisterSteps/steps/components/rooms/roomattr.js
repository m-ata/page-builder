import React, { useContext, useEffect, useState } from 'react'
import { UseOrest, Insert, Delete } from '@webcms/orest'
import { useRouter } from 'next/router'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import Grid from '@material-ui/core/Grid'
import { setToState, updateState } from 'state/actions'
import { connect } from 'react-redux'
import Typography from '@material-ui/core/Typography'
import WebCmsGlobal from 'components/webcms-global'
import LoadingSpinner from 'components/LoadingSpinner'
import useTranslation from 'lib/translations/hooks/useTranslation'

const RoomAttrList = (props) => {
    const { roomGid } = props
    const { t } = useTranslation()
    const router = useRouter()
    const token = router.query.authToken
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    const [roomAttrList, setRoomAttrList] = useState(false)

    useEffect(() => {
        let active = true
        if (active) {
            if (roomGid) {
               UseOrest({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: 'room/full/roomattr',
                    token,
                    params: {
                        gid: roomGid,
                        hotelrefno: GENERAL_SETTINGS.HOTELREFNO
                    },
                }).then((roomAttrResponse) => {
                    if (active) {
                        const roomAttrResponseData = roomAttrResponse.data
                        if (roomAttrResponseData.success && roomAttrResponseData.count > 1) {
                            setRoomAttrList(roomAttrResponseData.data)
                        }else {
                            setRoomAttrList(null)
                        }
                    }
                }).catch(()=> setRoomAttrList(null))
            }
        }

        return () => {
            active = false
        }
    }, [roomGid])

    const handleChange = (item) => {
        if (!item.ischk) {
            Insert({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: 'roomprop',
                token: token,
                data: {
                    roomid: item.locid,
                    roomattrid: item.attrid,
                    hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
                },
            }).then((roomAttrInsResponse) => {
                const roomAttrInsResponseData = roomAttrInsResponse.data
                if (roomAttrInsResponseData.success && roomAttrInsResponseData.count > 0) {
                    roomAttrList.map(listItem => Number(listItem.attrid) === Number(roomAttrInsResponseData.data.roomattrid) && ([listItem.ischk = true, listItem.gid = roomAttrInsResponseData.data.gid]))
                    setRoomAttrList([...roomAttrList], roomAttrList)
                }
            }).catch((error) => console.log(error))
        } else {
            Delete({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: 'roomprop',
                token,
                gid: item.gid,
                params: {
                    hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
                },
            }).then((roomAttrDelResponse) => {
                const roomAttrDelResponseData = roomAttrDelResponse.data
                if (roomAttrDelResponseData.count > 0) {
                    roomAttrList.map(listItem => String(listItem.gid) === String(item.gid) && (listItem.ischk = false))
                    setRoomAttrList([...roomAttrList], roomAttrList)
                }
            }).catch((error) => console.log(error))
        }
    }

    return (
        <React.Fragment>
            {roomGid ? roomAttrList === false ?  <LoadingSpinner size={40} /> :
                roomAttrList === null ? t('str_noDefaultRecord') :
                 <Grid container spacing={1}>
                    {roomAttrList && roomAttrList.length > 0 && roomAttrList.map((item, i) => {
                        return (
                            <Grid item xs={3} sm={2} key={item.attrcode}>
                                <FormControlLabel
                                    control={<Switch checked={item.ischk} onChange={()=> handleChange(item)} name={item.attrcode}/>} label={item.attrdesc}
                                />
                            </Grid>
                        )
                    })}
                </Grid> :
                <Typography variant="subtitle1" gutterBottom align="center">
                    No selection can be made.
                </Typography>
            }
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.registerStepper,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(RoomAttrList)

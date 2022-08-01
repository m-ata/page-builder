import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { connect, useSelector } from 'react-redux'
import { setToState, updateState } from 'state/actions'
import Box from '@material-ui/core/Box'
import { DEFAULT_OREST_TOKEN, jsonGroupBy } from 'model/orest/constants'
import { FALSE, NULL } from 'model/globals'
import WebCmsGlobal from 'components/webcms-global'
import ProductMenuList from './product-menu-list'
import LoadingSpinner from 'components/LoadingSpinner'
import useTranslation from 'lib/translations/hooks/useTranslation'
import {makeStyles} from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import BackIcon from "@material-ui/icons/KeyboardBackspace";
import { LocaleContext } from '../../../../../../lib/translations/context/LocaleContext'

const useStyles = makeStyles((theme) => ({
    boxRoot: {
        maxHeight: '60vh',
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
            width: '4px',
            height: 4,
            background: '#0000000a',
        },
        '&::-webkit-scrollbar-track': {
            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
            webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(12, 12, 12, 0.17)',
            outline: '1px solid #29609747',
        },
    },
    backButtonContainer: {
        zIndex: 1,
        position: 'static',
        paddingLeft: '16px',
        backgroundColor: '#FFF',
        width: '100%'
    }
}))

const EventMenuList = (props) => {
    const classes = useStyles()
        , { state, updateState, departId, isAddActive, isSpaRes, resEventDef } = props
        , { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
        , {locale} = useContext(LocaleContext)
        , { t } = useTranslation()
        , isLogin = !!useSelector((state) => state.orest.currentUser && state.orest.currentUser.auth)
        , loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)
        , token = useSelector((state) => state.orest.currentUser !== null ? state.orest.currentUser.auth.access_token : DEFAULT_OREST_TOKEN)
        , [isLoading, setIsLoading] = useState(false)
        , [sPGroupName, setSPGroupName] = useState(null)

    let clientParams = {}
    clientParams.hotelrefno = loginfo && loginfo.hotelrefno || GENERAL_SETTINGS.HOTELREFNO

    if(loginfo && loginfo.hotelgidstr){
        clientParams.hoteltoken = loginfo && loginfo.hotelgidstr
    }

    clientParams.departid = departId
    if(isLogin){
        clientParams.clienttoken = token
    }

    useEffect(() => {

        let isChainHotelChange = false
        if (GENERAL_SETTINGS.ISCHAIN && state.changeHotelRefno !== false) {
            clientParams.ischain = true
            clientParams.chainid = state.changeHotelRefno
            clientParams.hotelrefno = GENERAL_SETTINGS.HOTELREFNO

            if(clientParams.chainid !== state.infoList.chainid){
                isChainHotelChange = true
            }

        } else {
            clientParams.ischain = false
            clientParams.chainid = false
        }

        clientParams.langcode = locale

        if ((state.menuGroupAndProductList === FALSE || isChainHotelChange) && !isLoading) {
            setIsLoading(true)
            axios({
                url: GENERAL_SETTINGS.BASE_URL + 'api/products/product-list',
                method: 'post',
                params: clientParams
            }).then((productListResponse) => {
                const productListData = productListResponse.data
                if (productListData.success && productListData.data.length > 0) {
                    updateState('guest', 'menuGroupAndProductList', jsonGroupBy(productListData.data, 'localspgroupdesc'))
                    setIsLoading(false)
                } else {
                    updateState('guest', 'menuGroupAndProductList', null)
                    setIsLoading(false)
                }
            }).catch(()=> {
                updateState('guest', 'menuGroupAndProductList', null)
                setIsLoading(false)
            })
        }
    }, [state.changeHotelRefno, departId])

    if (state.menuGroupAndProductList === FALSE || isLoading) {
        return (
            <Box p={2}>
                <LoadingSpinner />
            </Box>
        )
    }

    if (state.menuGroupAndProductList === NULL) {
        return <Box p={2}>{t('str_noMenusAvailable')}</Box>
    }

    return (
        <React.Fragment>
            {sPGroupName ? (
                    <div style={{position: 'relative', paddingTop: 10}}>
                        <div className={classes.backButtonContainer}>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={()=> {
                                    setSPGroupName(null)
                                }}
                                startIcon={<BackIcon />}
                            >
                                {t('str_menu')}
                            </Button>
                        </div>
                    </div>
            ): null}
            <Box className={classes.boxRoot} p={2}>
                <ProductMenuList
                    isAddActive={isAddActive}
                    menuGroupAndProductList={state.menuGroupAndProductList}
                    isSpaRes={isSpaRes}
                    sPGroupName={sPGroupName}
                    setSPGroupName={setSPGroupName}
                    resEventDef={resEventDef}
                />
            </Box>
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

export default connect(mapStateToProps, mapDispatchToProps)(EventMenuList)

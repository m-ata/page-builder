import React, { useContext, useEffect, useState } from "react";
import { makeStyles } from '@material-ui/core/styles'
import {
    Card,
    CardContent,
} from '@material-ui/core'
import WebCmsGlobal from "../../../../../webcms-global";
import {ViewList} from "@webcms/orest";
import {connect, useSelector} from "react-redux";
import {setToState, updateState} from "../../../../../../state/actions";
import {OREST_ENDPOINT} from "../../../../../../model/orest/constants";
import LoadingSpinner from "../../../../../LoadingSpinner";
import ProductMenuList from "./product-menu-list";

const useStyles = makeStyles((theme) => ({
    menuRoot: {
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
    }

}))

function SpaMenu(props) {
    const classes = useStyles();

    const { state, setToState } = props

    const token = useSelector(state => state?.orest?.currentUser?.auth?.access_token || false)
    const hotelRefNo = useSelector((state) => state?.hotelinfo?.currentHotelRefNo || GENERAL_SETTINGS.HOTELREFNO || false)


    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    const [loading, setLoading] = useState(false)
    const [selectedGroupOrItem, setSelectedGroupOrItem] = useState(false)



    useEffect(() => {
        if(!state.menuGroupAndProductList) {
            setLoading(true)
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: 'sptype',
                params: {
                    query: `isactive:true,isspares:true`,
                    hotelrefno: hotelRefNo
                },
                token
            }).then(res => {
                if(res.status === 200) {
                    const spaProductType = res.data.data[0] || false
                    if(spaProductType) {
                        getSpaProductList(spaProductType?.id)
                    }
                }
            })
        }
    }, [])

    const getSpaProductList = (typeId) => {
        if(typeId) {
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.SPRODUCT,
                token,
                params: {
                    query: `isactive:true,producttypeid:${typeId}`,
                    hotelrefno: hotelRefNo,
                }
            }).then(res => {
                if(res.status === 200) {
                    setToState('guest', ['menuGroupAndProductList'], res.data.data)
                }
                setLoading(false)
            })
        }
    }


    return(
        <div className={classes.menuRoot} style={!selectedGroupOrItem ? {maxHeight: '70vh', overflowY: 'auto'} : {}}>
            <Card>
                <CardContent className={classes.menuRoot}>
                    {loading ? (
                        <LoadingSpinner />
                    ) : (
                        <ProductMenuList
                            isAddActive={true}
                            menuGroupAndProductList={state.menuGroupAndProductList}
                            isOnlyProduct
                            getSelectedGroupOrItem={(e) => setSelectedGroupOrItem(e)}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(SpaMenu)
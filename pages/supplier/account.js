import React, {useContext, useEffect, useState} from 'react'
import UserPortalWrapper from '../../components/user-portal/UserPortalWrapper'
import useTranslation from '../../lib/translations/hooks/useTranslation'
import WebCmsGlobal from '../../components/webcms-global'
import {useSnackbar} from 'notistack'
import {connect, useSelector} from 'react-redux'
import {setToState, updateState} from '../../state/actions'
import {useOrestAction} from "../../model/orest";


function AccountPage(props) {
    const {t} = useTranslation()
    const {GENERAL_SETTINGS} = useContext(WebCmsGlobal);

    const {state, setToState} = props;

    const {enqueueSnackbar} = useSnackbar();

    //redux
    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo);
    const token = useSelector((state) => state?.orest?.currentUser?.auth.access_token || false);
    const hotelRefNo = useSelector(state => state?.hotelinfo?.currentHotelRefNo || GENERAL_SETTINGS.HOTELREFNO || null);

    //orest state
    const {setOrestState} = useOrestAction()

    return (
        <UserPortalWrapper isSupplierPortal>
            Account Page
        </UserPortalWrapper>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.supplierPortal,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(AccountPage)
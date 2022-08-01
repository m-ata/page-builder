import React, { useContext } from "react";
import { connect, useSelector } from 'react-redux'
import WebCmsGlobal from "../../../webcms-global";
import CommonNotes from "../../../CommonNotes";


function Notes() {
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    const client = useSelector((state) => state?.orest?.state?.client || false)
    const hotelRefNo = useSelector(state => state?.hotelinfo?.currentHotelRefNo || null);

    return(
        <CommonNotes
            initialIncDone
            mid={client.mid}
            dataHotelRefNo={hotelRefNo || GENERAL_SETTINGS.HOTELREFNO}
        />
    );
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

export default connect(mapStateToProps, mapDispatchToProps)(Notes)
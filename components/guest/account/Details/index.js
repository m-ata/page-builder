import React, { useState } from 'react'
import { connect, useSelector } from 'react-redux'
import { clientInitialState } from './clientInitialState'
import ClientBase from './ClientBase'
import {employeeInitialState} from "../../../emp-portal/employeeInitialState";

const Details = ({state, isEmpPortal, isGuest}) =>{

    //For Guest
    const [useClientInitialState, setUseClientInitialState] = useState(isEmpPortal ? employeeInitialState : clientInitialState)
    const useClientOrestState = useSelector((state) => isEmpPortal ? (state?.orest?.state?.emp || false) : (state?.orest?.state?.client || false))
    const useClientReservation = state.clientReservation || false

    return (
        <ClientBase
            isGuest={isGuest}
            isEmpPortal={isEmpPortal}
            isPrimaryGuest={true}
            useClientInitialState={useClientInitialState}
            setUseClientInitialState={setUseClientInitialState}
            useClientOrestState={useClientOrestState}
            useClientReservation={useClientReservation}
            usePrimaryClientReservation={useClientReservation}
        />
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

export default connect(mapStateToProps, null)(Details)
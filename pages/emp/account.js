import React from 'react'
import UserPortalWrapper from '../../components/user-portal/UserPortalWrapper'
import AccountCards from '../../components/user-portal/components/AccountCards/AccountCards'

import { connect, useSelector } from 'react-redux'
import { setToState, updateState } from '../../state/actions'




function HomePage() {


    return(
        <UserPortalWrapper isEmpPortal>
            <AccountCards isEmpPortal isProfileEditActive/>
        </UserPortalWrapper>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.employeePortal,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomePage)
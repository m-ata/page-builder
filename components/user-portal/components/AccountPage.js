import React from 'react';
import { connect } from 'react-redux'
import AccountCards from './AccountCards/AccountCards';


function AccountPage() {
    
    return(
        <React.Fragment>
            <AccountCards />
        </React.Fragment>
    );
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.userPortal,
    }
}

export default connect(mapStateToProps, null)(AccountPage)
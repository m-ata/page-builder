import React from 'react';
import { connect } from 'react-redux'
import BillingList from './BillingList/BillingList';

function BillingPage(){
    
    return(
        <React.Fragment>
            <BillingList />
        </React.Fragment>
        
    );
    
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.userPortal,
    }
}

export default connect(mapStateToProps, null)(BillingPage)
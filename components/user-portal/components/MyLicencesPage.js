import React from 'react';
import { connect } from 'react-redux'
import MyLicenceList from './MyLicenceList/MyLicenceList';


function MyLicencesPage(){
    
    return(
        <React.Fragment>
            <MyLicenceList />
        </React.Fragment>
    
    );
    
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.userPortal,
    }
}

export default connect(mapStateToProps, null)(MyLicencesPage)
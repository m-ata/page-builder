import React from 'react';
import { connect } from 'react-redux'
import DashboardOverview from './DashboardOverview/DashboardOverview';
import DashboardCarousel from './DashboardCarousel/DashboardCarousel';
import DashboardSpecialOffers from './DashboardSpecialOffers/DashboardSpecialOffers';
import DashboardVideos from './DashboardVideos/DashboardVideos';




function DashboardPage(){
    
    return(
        <React.Fragment>
            <DashboardCarousel />
            <DashboardOverview />
            <DashboardSpecialOffers />
            <DashboardVideos />
        </React.Fragment>
    );
    
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.userPortal,
    }
}

export default connect(mapStateToProps, null)(DashboardPage)

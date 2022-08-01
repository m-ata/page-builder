import React from 'react'
import { connect } from 'react-redux'
import UserPortalWrapper from 'components/user-portal/UserPortalWrapper'
import { NextSeo } from 'next-seo'
import DashboardPage from '../../components/user-portal/components/DashboardPage';

const Dashboard = () => {
    return (
        <React.Fragment>
            <NextSeo title={'Hotech - User Portal'} />
            <UserPortalWrapper>
                <DashboardPage />
            </UserPortalWrapper>
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.userPortal,
    }
}

export default connect(mapStateToProps, null)(Dashboard)

import React from 'react'
import { connect } from 'react-redux'
import MyRequests from 'components/user-portal/components/MyRequests'
import UserPortalWrapper from 'components/user-portal/UserPortalWrapper'
import { NextSeo } from 'next-seo'

const Request = () => {
    return (
        <React.Fragment>
            <NextSeo title={'Hotech - User Portal'} />
            <UserPortalWrapper>
                <MyRequests />
            </UserPortalWrapper>
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.userPortal,
    }
}

export default connect(mapStateToProps, null)(Request)

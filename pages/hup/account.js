import React from 'react';
import { connect } from 'react-redux'
import UserPortalWrapper from 'components/user-portal/UserPortalWrapper'
import { NextSeo } from 'next-seo'
import useTranslation from '../../lib/translations/hooks/useTranslation';
import AccountPage from '../../components/user-portal/components/AccountPage';

const Account = () => {
    
    const { t } = useTranslation();
    
    return(
        <React.Fragment>
            <NextSeo title={`${t('str_account')} - ${t('str_userPortal')}` } />
            <UserPortalWrapper>
                <AccountPage />
            </UserPortalWrapper>
        </React.Fragment>
    );
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.userPortal,
    }
}

export default connect(mapStateToProps, null)(Account)
import React from 'react';
import { connect } from 'react-redux'
import UserPortalWrapper from 'components/user-portal/UserPortalWrapper'
import { NextSeo } from 'next-seo'
import useTranslation from '../../lib/translations/hooks/useTranslation';
import MyLicencesPage from '../../components/user-portal/components/MyLicencesPage';

const MyLicences = () => {
    
    const { t } = useTranslation();
    
    return(
        <React.Fragment>
            <NextSeo title={`My Licences - ${t('str_userPortal')}` } />
            <UserPortalWrapper>
                <MyLicencesPage />
            </UserPortalWrapper>
        </React.Fragment>
    );
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.userPortal,
    }
}

export default connect(mapStateToProps, null)(MyLicences)
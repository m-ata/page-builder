import React from 'react';
import { connect } from 'react-redux'
import UserPortalWrapper from 'components/user-portal/UserPortalWrapper'
import { NextSeo } from 'next-seo'
import BillingPage from '../../components/user-portal/components/BillingPage';
import useTranslation from '../../lib/translations/hooks/useTranslation';

const Billing = () => {
    
    const { t } = useTranslation();
    
    return(
      <React.Fragment>
          <NextSeo title={`${t('str_billing')} - ${t('str_userPortal')}` } />
          <UserPortalWrapper>
              <BillingPage />
          </UserPortalWrapper>
      </React.Fragment>
    );
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.userPortal,
    }
}

export default connect(mapStateToProps, null)(Billing)
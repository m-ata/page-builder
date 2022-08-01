import React, {useState, useEffect, useContext} from 'react';
import {connect, useSelector} from 'react-redux';
import { makeStyles } from '@material-ui/core/styles'
import {setToState} from '../../../../state/actions';
import { Button, Typography, Grid, Card, CardContent, CardActions, Avatar, Divider } from '@material-ui/core'
import WebCmsGlobal from '../../../webcms-global';
import useTranslation from '../../../../lib/translations/hooks/useTranslation';
import {DEFAULT_OREST_TOKEN} from '../../../../model/orest/constants';
import ProfileInfoCard from './ProfileInfoCard';
import CompanyInfoCard from './CompanyInfoCard';
import PaymentSettingsCard from './PaymentSettingsCard';
import PasswordAndSecurityCard from './PasswordAndSecurityCard';

const useStyles = makeStyles(theme => ({
    mainTitle: {
        paddingBottom: "48px",
        fontSize: "42px",
        fontWeight: "600",
        color: theme.palette.text.ultraDark
    },
    subTitle: {
        paddingBottom:"8px",
        fontSize: "25px",
        fontWeight: "600",
        color: theme.palette.text.light
    },
    space48: {
        paddingBottom: "48px",
        [theme.breakpoints.down("sm")]: {
            paddingBottom: "24px",
        },
    }
}))


function AccountCards(props) {


    const { isEmpPortal, isProfileEditActive } = props;
    const { t } = useTranslation()


    const classes = useStyles();


    const cardList = [
        {
            title: t("str_profileInfo"),
            renderChild: <ProfileInfoCard isEmpPortal={isEmpPortal} isEditActive={isProfileEditActive} />
        },
        {
            title: t("str_companyInfo"),
            renderChild: <CompanyInfoCard isEmpPortal={isEmpPortal} />
        },
       /* {
            title: t("str_paymentSettings"),
            renderChild: <PaymentSettingsCard />
        },*/
        {
            title: t("str_passwordAndSecurity"),
            renderChild: <PasswordAndSecurityCard isEmpPortal={isEmpPortal} />
        }
    ]

    
    return(
        <>
            
            <Grid container>
                <Grid item xs={12}>
                    <Typography className={classes.mainTitle}>{t("str_account")}</Typography>
                </Grid>
                {
                    cardList.map((item,i) => (
                        <Grid item xs={12} key={`grid-${i}`}>
                            <Typography key={`title-${i}`} className={classes.subTitle}>{item.title}</Typography>
                            <Divider key={`divider-${i}`} color={'primary'} />
                            <div key={`padding-div-${i}`} style={{paddingBottom: "24px"}}/>
                            {item.renderChild}
                            <div key={`padding-div-child${i}`} className={classes.space48}/>
                        </Grid>
                    ))
                }
            </Grid>
        </>
    );
    
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.userPortal,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(AccountCards)
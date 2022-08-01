import React, { useState, useEffect, useContext } from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {setToState} from '../../../../state/actions';
import { connect, useSelector } from 'react-redux';
import { Grid, Typography } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import CustomProductCard from '../CustomProductCard/CustomProductCard';
import useTranslation from '../../../../lib/translations/hooks/useTranslation';
import { List } from '@webcms/orest'
import WebCmsGlobal from '../../../webcms-global';
import { DEFAULT_OREST_TOKEN, isErrorMsg, OREST_ENDPOINT } from '../../../../model/orest/constants';
import {SLASH} from '../../../../model/globals';



const useStyles = makeStyles(theme => ({
    dividerStyle: {
        width:"calc(100% - 30px)",
        color:"#CECECE",
        [theme.breakpoints.down('xs')]: {
            width:"100%",
        },
    },
    allProductText: {
        textDecoration: "underline",
        fontSize: "20px",
        color:"#2697D4",
        textAlign: "right"
    },
    mainTitle: {
        paddingBottom:"48px",
        fontSize:"28px",
        fontWeight: "500",
        color:"#4D4F5C"
    },
    productLink: {
        textAlign: "right",
        paddingTop:"16px"
    },
    space16: {
        paddingBottom: "16px"
    },
    space64: {
        paddingBottom: "64px"
    }
}))

function DashboardSpecialOffers() {
    const classes = useStyles();
    
    const {t} = useTranslation();
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal);
    const token = useSelector((state) =>
        state.orest.currentUser !== null ? state.orest.currentUser.auth.access_token : DEFAULT_OREST_TOKEN
    )
    const hotelRefNo = useSelector(state =>
        state.hotelinfo.currentHotelRefNo !== null ? state.hotelinfo.currentHotelRefNo : null);
    
    const [offerList, setOfferList] = useState([]);
    
    useEffect(() => {
        List({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: `${OREST_ENDPOINT.HOTEL}${SLASH}${OREST_ENDPOINT.PRODUCT}`,
            token: token,
            params: {
                hotelid: hotelRefNo,
                islic: false
            }
        }).then(res => {
            if(res.status === 200) {
                setOfferList(res.data.data);
            } else {
                const retErr = isErrorMsg(res)
                showError(retErr.errorMsg)
                setOfferList([]);
            }
        }).catch(err => {
            console.log(err);
            setOfferList([]);
        })
    }, [hotelRefNo])
    
    
    return(
        <React.Fragment>
            {
                offerList.length > 0 ?
                <>
                    <Typography className={classes.mainTitle}>{t("str_specialOffersForYou")}</Typography>
                    <Grid container spacing={8}>
                        {
                            offerList.map((item,i) => {
                                return(
                                    <Grid
                                        item
                                        xs={12}
                                        sm={6}
                                        md={6}
                                        lg={4}
                                        xl={3}
                                        key={`product-${i}`}
                                    >
                                        <CustomProductCard
                                            isProdType={true}
                                            productName={item.slidertitle || item.description}
                                            productType={item.typecode}
                                            productShortDesc={item.sliderdesc || item.moduletext}
                                            productIcon={item.imageurl}
                                            productPageLink={item.productPageLink}
                                            price={item.price}
                                            priceCurrencyCode={item.pricecurrcode}
                                        />
                                    </Grid>
                                );
                            })
                        }
                    </Grid>
                    <div className={classes.productLink}>
                        <a className={classes.allProductText}
                           href={"https://hotech.systems/products"}
                           target={"_blank"}
                        >
                            {t("str_seeAllProducts")}
                        </a>
                    </div>
                    <div className={classes.space16}/>
                    <Divider className={classes.dividerStyle} />
                    <div className={classes.space64}/>
                </>
                    : null
            }
            
        </React.Fragment>
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

export default connect(mapStateToProps, mapDispatchToProps)(DashboardSpecialOffers)
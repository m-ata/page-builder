import React, {useState, useEffect, useContext} from 'react';
import {connect, useSelector} from 'react-redux';
import axios from 'axios';
import { ViewList } from '@webcms/orest'
import { makeStyles } from '@material-ui/core/styles'
import AddIcon from '@material-ui/icons/Add';
import { Button, Typography, Grid, Card, CardContent, CardActions, Dialog } from '@material-ui/core'
import useTranslation from '../../../../lib/translations/hooks/useTranslation';
import {setToState} from '../../../../state/actions';
import CustomRadioButton from '../CustomRadioButton/CustomRadioButton';
import NewPaymentDialog from './NewPaymentDialog/NewPaymentDialog';
import PaymentForm from '../../../payment/credit-card/form';
import PaymentInformation from '../../../booking/components/PaymentInformation';
import useNotifications from '../../../../model/notification/useNotifications';



const useStyles = makeStyles(theme => ({
    subText: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#43425D",
    },
    cardContent: {
        padding: "24px 48px",
        "&.MuiCardContent-root:last-child": {
            paddingBottom: "24px"
        }
    },
    logoStyle: {
        verticalAlign: "middle",
        alignSelf: "center",
        [theme.breakpoints.down("md")]: {
            textAlign: "center",
        },
    },
    gridStyle: {
        alignSelf: "center",
        [theme.breakpoints.down("md")]: {
            textAlign: "center",
        },
        
    },
    editButton: {
        border: "1px solid #3C4C6E",
        borderRadius: "8px",
        fontSize: "14px",
        textTransform: "none",
        [theme.breakpoints.down("md")]: {
            width: "92px"
        },
    },
    addButton: {
        marginTop: "16px",
        fontSize: "14px",
        fontWeight: "600",
        float: "right",
        textTransform: "none",
        color: "#43425D"
    },
    textFieldStyle: {
        "& .MuiOutlinedInput-root": {
            "& fieldset": {
                //border: "none",
            },
            "&:hover fieldset": {
                border: "1px solid #4666B0",
            },
            "&.Mui-focused fieldset": {
                border: "1px solid #4666B0",
            },
        },
        "& .MuiFormLabel-root.Mui-focused": {
            color:"#43425D",
        }
    },
    cancelButton: {
        //fontSize: "20px",
        fontWeight: "500",
        color: "#43425D",
        textTransform: "none"
    },
    saveButton: {
        //fontSize: "20px",
        fontWeight: "500",
        color: "#FFF",
        textTransform: "none",
        backgroundColor: "#4666B0",
        "&:hover": {
            backgroundColor: "#4666B0",
        }
    },
    textFieldLabel: {
        color:"#43425D"
    }
    
}))



function PaymentSettingsCard(props) {
    const classes = useStyles();
    
    const {setToState, state } = props;
    
    const { t } = useTranslation();
    const { showSuccess, showError } = useNotifications();
   
    const [dialogOpen, setDialogOpen] = useState(false);
    const [creditCardInfo, setCreditCardInfo] = useState(false);
    const [creditCardIsValid, setCreditCardIsValid] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editCardInfo, setEditCardInfo] = useState(null);
    const [arrayIndex, setArrayIndex] = useState(undefined);
    const [isCCPayment, setIsCCPayment] = useState(false)
    const [ccInfo, setCcInfo] = useState(false)
    const [ccInfoData, setCcInfoData] = useState(false)
    const [ccValid, setCcValid] = useState(false)
    
    const handleClickDialogClose = () => {
        setDialogOpen(false);
    };
    
    const handleEditCardInfo = (item, i) => {
        setEditCardInfo(item);
        setArrayIndex(i);
        setDialogOpen(true);
        setIsEdit(true);
    }
    
    const handleEditComplete = () => {
        setIsEdit(false);
    }
    
    const convertCartNumber = (cardNumber) => {
        let lastFourNumber = "";
        for(let i = (cardNumber.length - 4); i < cardNumber.length; i++) {
            lastFourNumber = lastFourNumber + cardNumber.charAt(i);
        }
        return lastFourNumber;
    }
    const handleCancel = () => {
        setDialogOpen(false);
        handleEditComplete();
    }
    
    const handleSave = () => {
        if( creditCardInfo.cardOwner !== '' && creditCardInfo.cardNumber !== '' &&
            creditCardInfo.cardExpiry !== '' && creditCardInfo.cardCvc !== '') {
            if(creditCardInfo.cardIsValid) {
                let array = state.account.paymentList;
                if(isEdit) {
                    array[arrayIndex] = creditCardInfo;
                    handleEditComplete();
                    setDialogOpen(false);
                } else {
                    array.push(creditCardInfo);
                    setToState("userPortal", ['account' , 'paymentList'], array)
                    if(array.length > 0) {
                    
                    }
                }
            } else {
                showError("Please enter a valid card number")
            }
        } else {
            showError(t('str_pleaseCheckMandatoryFields'))
        }
        
    }
    
    useEffect(() => {
    },[state.account.paymentList])
    
    return(
        <>
            <Dialog
                open={dialogOpen}
                onClose={handleClickDialogClose}
                fullWidth
                maxWidth={'md'}
            >
                {/*
                 <NewPaymentDialog
                 isEdit={isEdit}
                 handleEditComplete={handleEditComplete}
                 arrayIndex={arrayIndex}
                 editCardInfo={editCardInfo}
                 dialogClose={handleClickDialogClose}
                 onChange={(e) => setCreditCardInfo(e)}
                 isValid={(e) => setCreditCardIsValid(e)}
                 />
                */}
                {
                    <div style={{padding:"24px"}}>
                        <Grid container>
                            <Grid item xs={12}>
                                <PaymentInformation
                                    isCcPay={(e) => setIsCCPayment(e)}
                                    ccInfo={(e) => setCcInfo(e)}
                                    ccValid={(e) => setCcValid(e)}
                                    textFieldsClass={classes.textFieldStyle}
                                    iconColor={'#4666B0'}
                                    onChange={(e) => setCreditCardInfo(e)}
                                    isEdit={isEdit}
                                    editCardInfo={editCardInfo}
                                    customRadioButton={<CustomRadioButton />}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <div style={{paddingTop:"16px", textAlign:"right"}}>
                                    <Button className={classes.cancelButton} onClick={handleCancel}>{t('str_cancel')}</Button>
                                    <Button className={classes.saveButton} onClick={handleSave}>{t('str_save')}</Button>
                                </div>
                            </Grid>
                        </Grid>
                    </div>
                }
            </Dialog>
            {
                state.account.paymentList.length > 0 ? (
                    state.account.paymentList.map((item,i) => {
                        return(
                            <Card key={`card-${i}`}>
                                <CardContent className={classes.cardContent}>
                                    <Grid container spacing={2}>
                                        <Grid className={classes.gridStyle} item xs={12} sm={12} md={12} lg={2}>
                                            {item.cardIssuer === 'visa' ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="120px" height="83px" viewBox="0 0 256 83" version="1.1" preserveAspectRatio="xMidYMid">
                                                    <defs>
                                                        <linearGradient x1="45.9741966%" y1="-2.00617467%" x2="54.8768726%" y2="100%" id="linearGradient-1">
                                                            <stop stopColor="#222357" offset="0%"/>
                                                            <stop stopColor="#254AA5" offset="100%"/>
                                                        </linearGradient>
                                                    </defs>
                                                    <g>
                                                        <path d="M132.397094,56.2397455 C132.251036,44.7242808 142.65954,38.2977599 150.500511,34.4772086 C158.556724,30.5567233 161.262627,28.0430004 161.231878,24.5376253 C161.17038,19.1719416 154.805357,16.804276 148.847757,16.7120293 C138.454628,16.5505975 132.412467,19.5178668 127.607952,21.7625368 L123.864273,4.24334875 C128.684163,2.02174043 137.609033,0.084559486 146.864453,-7.10542736e-15 C168.588553,-7.10542736e-15 182.802234,10.7236802 182.879107,27.3511501 C182.963666,48.4525854 153.69071,49.6210438 153.890577,59.05327 C153.959762,61.912918 156.688728,64.964747 162.669389,65.7411565 C165.628971,66.133205 173.800493,66.433007 183.0636,62.1665965 L186.699658,79.11693 C181.718335,80.931115 175.314876,82.6684285 167.343223,82.6684285 C146.895202,82.6684285 132.512402,71.798691 132.397094,56.2397455 M221.6381,81.2078555 C217.671491,81.2078555 214.327548,78.8940005 212.836226,75.342502 L181.802894,1.24533061 L203.511621,1.24533061 L207.831842,13.1835926 L234.360459,13.1835926 L236.866494,1.24533061 L256,1.24533061 L239.303345,81.2078555 L221.6381,81.2078555 M224.674554,59.6067505 L230.939643,29.5804456 L213.781755,29.5804456 L224.674554,59.6067505 M106.076031,81.2078555 L88.9642665,1.24533061 L109.650591,1.24533061 L126.754669,81.2078555 L106.076031,81.2078555 M75.473185,81.2078555 L53.941265,26.7822953 L45.2316377,73.059396 C44.2092367,78.2252115 40.1734431,81.2078555 35.6917903,81.2078555 L0.491982464,81.2078555 L0,78.886313 C7.22599245,77.318119 15.4359498,74.7890215 20.409585,72.083118 C23.4537265,70.4303645 24.322383,68.985166 25.3217224,65.0569935 L41.8185094,1.24533061 L63.68098,1.24533061 L97.1972855,81.2078555 L75.473185,81.2078555" fill="url(#linearGradient-1)" transform="translate(128.000000, 41.334214) scale(1, -1) translate(-128.000000, -41.334214) "/>
                                                    </g>
                                                </svg>
                                            ) : item.cardIssuer === 'mastercard' ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width={"120px"} viewBox="0 0 146.8 120.41">
                                                    <defs>
                                                        <style>{".cls-1{fill:none;}.cls-2{fill:#231f20;}.cls-3{fill:#ff5f00;}.cls-4{fill:#eb001b;}.cls-5{fill:#f79e1b;}"}</style>
                                                    </defs>
                                                    <title>mastercard</title>
                                                    <g id="Layer_2" data-name="Layer 2">
                                                        <g id="Layer_1-2" data-name="Layer 1">
                                                            <rect className="cls-1" width="146.8" height="120.41"/>
                                                            <path className="cls-2"
                                                                  d="M36.35,105.26v-6a3.56,3.56,0,0,0-3.76-3.8,3.7,3.7,0,0,0-3.36,1.7,3.51,3.51,0,0,0-3.16-1.7,3.16,3.16,0,0,0-2.8,1.42V95.7H21.19v9.56h2.1V100a2.24,2.24,0,0,1,2.34-2.54c1.38,0,2.08.9,2.08,2.52v5.32h2.1V100a2.25,2.25,0,0,1,2.34-2.54c1.42,0,2.1.9,2.1,2.52v5.32ZM67.42,95.7H64V92.8h-2.1v2.9H60v1.9h1.94V102c0,2.22.86,3.54,3.32,3.54a4.88,4.88,0,0,0,2.6-.74l-.6-1.78a3.84,3.84,0,0,1-1.84.54c-1,0-1.38-.64-1.38-1.6V97.6h3.4Zm17.74-.24a2.82,2.82,0,0,0-2.52,1.4V95.7H80.58v9.56h2.08V99.9c0-1.58.68-2.46,2-2.46a3.39,3.39,0,0,1,1.3.24l.64-2a4.45,4.45,0,0,0-1.48-.26Zm-26.82,1a7.15,7.15,0,0,0-3.9-1c-2.42,0-4,1.16-4,3.06,0,1.56,1.16,2.52,3.3,2.82l1,.14c1.14.16,1.68.46,1.68,1,0,.74-.76,1.16-2.18,1.16a5.09,5.09,0,0,1-3.18-1l-1,1.62a6.9,6.9,0,0,0,4.14,1.24c2.76,0,4.36-1.3,4.36-3.12s-1.26-2.56-3.34-2.86l-1-.14c-.9-.12-1.62-.3-1.62-.94s.68-1.12,1.82-1.12a6.16,6.16,0,0,1,3,.82Zm55.71-1a2.82,2.82,0,0,0-2.52,1.4V95.7h-2.06v9.56h2.08V99.9c0-1.58.68-2.46,2-2.46a3.39,3.39,0,0,1,1.3.24l.64-2a4.45,4.45,0,0,0-1.48-.26Zm-26.8,5a4.83,4.83,0,0,0,5.1,5,5,5,0,0,0,3.44-1.14l-1-1.68a4.2,4.2,0,0,1-2.5.86,3.07,3.07,0,0,1,0-6.12,4.2,4.2,0,0,1,2.5.86l1-1.68a5,5,0,0,0-3.44-1.14,4.83,4.83,0,0,0-5.1,5Zm19.48,0V95.7h-2.08v1.16a3.63,3.63,0,0,0-3-1.4,5,5,0,0,0,0,10,3.63,3.63,0,0,0,3-1.4v1.16h2.08Zm-7.74,0a2.89,2.89,0,1,1,2.9,3.06,2.87,2.87,0,0,1-2.9-3.06Zm-25.1-5a5,5,0,0,0,.14,10A5.81,5.81,0,0,0,78,104.16l-1-1.54a4.55,4.55,0,0,1-2.78,1,2.65,2.65,0,0,1-2.86-2.34h7.1c0-.26,0-.52,0-.8,0-3-1.86-5-4.54-5Zm0,1.86a2.37,2.37,0,0,1,2.42,2.32h-5a2.46,2.46,0,0,1,2.54-2.32ZM126,100.48V91.86H124v5a3.63,3.63,0,0,0-3-1.4,5,5,0,0,0,0,10,3.63,3.63,0,0,0,3-1.4v1.16H126Zm3.47,3.39a1,1,0,0,1,.38.07,1,1,0,0,1,.31.2,1,1,0,0,1,.21.3.93.93,0,0,1,0,.74,1,1,0,0,1-.21.3,1,1,0,0,1-.31.2.94.94,0,0,1-.38.08,1,1,0,0,1-.9-.58.94.94,0,0,1,0-.74,1,1,0,0,1,.21-.3,1,1,0,0,1,.31-.2A1,1,0,0,1,129.5,103.87Zm0,1.69a.71.71,0,0,0,.29-.06.75.75,0,0,0,.23-.16.74.74,0,0,0,0-1,.74.74,0,0,0-.23-.16.72.72,0,0,0-.29-.06.75.75,0,0,0-.29.06.73.73,0,0,0-.24.16.74.74,0,0,0,0,1,.74.74,0,0,0,.24.16A.74.74,0,0,0,129.5,105.56Zm.06-1.19a.4.4,0,0,1,.26.08.25.25,0,0,1,.09.21.24.24,0,0,1-.07.18.35.35,0,0,1-.21.09l.29.33h-.23l-.27-.33h-.09v.33h-.19v-.88Zm-.22.17v.24h.22a.21.21,0,0,0,.12,0,.1.1,0,0,0,0-.09.1.1,0,0,0,0-.09.21.21,0,0,0-.12,0Zm-11-4.06a2.89,2.89,0,1,1,2.9,3.06,2.87,2.87,0,0,1-2.9-3.06Zm-70.23,0V95.7H46v1.16a3.63,3.63,0,0,0-3-1.4,5,5,0,0,0,0,10,3.63,3.63,0,0,0,3-1.4v1.16h2.08Zm-7.74,0a2.89,2.89,0,1,1,2.9,3.06A2.87,2.87,0,0,1,40.32,100.48Z"/>
                                                            <g id="_Group_" data-name="&lt;Group&gt;">
                                                                <rect className="cls-3" x="57.65" y="22.85" width="31.5" height="56.61"/>
                                                                <path id="_Path_" data-name="&lt;Path&gt;" className="cls-4"
                                                                      d="M59.65,51.16A35.94,35.94,0,0,1,73.4,22.85a36,36,0,1,0,0,56.61A35.94,35.94,0,0,1,59.65,51.16Z"/>
                                                                <path className="cls-5" d="M131.65,51.16A36,36,0,0,1,73.4,79.46a36,36,0,0,0,0-56.61,36,36,0,0,1,58.25,28.3Z"/>
                                                                <path className="cls-5"
                                                                      d="M128.21,73.46V72.3h.47v-.24h-1.19v.24H128v1.16Zm2.31,0v-1.4h-.36l-.42,1-.42-1H129v1.4h.26V72.41l.39.91h.27l.39-.91v1.06Z"/>
                                                            </g>
                                                        </g>
                                                    </g>
                                                </svg>
                                            ) : null
                                            }
                                        </Grid>
                                        <Grid className={classes.gridStyle} item xs={12} sm={6} md={6} lg={2}>
                                            <Typography className={classes.subText} style={{opacity: ".7"}}>
                                                {t("str_paymentType")}
                                            </Typography>
                                            <Typography className={classes.subText}>
                                                {t(item.paymentType)}
                                            </Typography>
                                        </Grid>
                                        <Grid className={classes.gridStyle} item xs={12} sm={6} md={6} lg={2}>
                                            <Typography className={classes.subText} style={{opacity: ".7"}}>
                                                {t("str_cardNo")}
                                            </Typography>
                                            <Typography className={classes.subText}>
                                                { "**** **** **** " + convertCartNumber(item.cardNumber)}
                                            </Typography>
                                        </Grid>
                                        <Grid className={classes.gridStyle} item xs={12} sm={6} md={6} lg={3}>
                                            <Typography className={classes.subText} style={{opacity: ".7"}}>
                                                {t("str_firstCashOut")}
                                            </Typography>
                                            <Typography className={classes.subText}>
                                                {}
                                            </Typography>
                                        </Grid>
                                        <Grid className={classes.gridStyle} item xs={12} sm={6} md={6} lg={2}>
                                            <Typography className={classes.subText} style={{opacity: ".7"}}>
                                                {t("str_lastCashOut")}
                                            </Typography>
                                            <Typography className={classes.subText}>
                                                {}
                                            </Typography>
                                        </Grid>
                                        <Grid className={classes.gridStyle} item xs={12} sm={12} md={12} lg={1}>
                                            <Button fullWidth className={classes.editButton} onClick={() => handleEditCardInfo(item, i)}>{t("str_edit")}</Button>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        );
                    })
                    ) : null
            }
            <Button className={classes.addButton} startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>Add Payment Method</Button>
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

export default connect(mapStateToProps, mapDispatchToProps)(PaymentSettingsCard)
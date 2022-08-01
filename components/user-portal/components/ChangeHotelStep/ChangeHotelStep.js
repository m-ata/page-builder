import React, {useEffect, useState, useContext } from 'react';
import WebCmsGlobal from '../../../../components/webcms-global';
import useTranslation from '../../../../lib/translations/hooks/useTranslation';
import styles from '../../../../assets/jss/components/changeHotelStepStyle';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import {connect, useSelector} from 'react-redux';
import CloseIcon from '@material-ui/icons/Close'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { List } from '@webcms/orest';
import IconButton from '@material-ui/core/IconButton';
import {makeStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import {
    LOCAL_STORAGE_OREST_HOTELNAME_TEXT,
    LOCAL_STORAGE_OREST_HOTELREFNO_TEXT,
    OREST_ENDPOINT
} from '../../../../model/orest/constants';
import { resetState, setToState, updateState } from '../../../../state/actions';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import useHotelInfoAction from '../../../../model/orest/components/ChangeHotel/redux_store/useHotelInfoAction';
import {PutChangeHotel} from '../../../../model/orest/components/ChangeHotel';
import {SLASH} from '../../../../model/globals';

const useStyles = makeStyles(styles);


function ChangeHotelStep(props){
    const classes = useStyles();
    
    const { dialogCloser, setToState, state } = props;
    
    let hotelName = "";
    const { t } = useTranslation();
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal);
    const { updateHotelRefNo, updateHotelName, setHotelRefNoIsInitializing } = useHotelInfoAction();
    const token = useSelector((state) =>
        state.orest.currentUser !== null ? state.orest.currentUser.auth.access_token : DEFAULT_OREST_TOKEN
    );
    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo);
    const [hotelList, setHotelList] = useState([]);
    const [selectedHotelInfo, setSelectedHotelInfo] = useState(null);
    const [selectedHotelName, setSelectedHotelName] = useState("");
    const [selectedHotelRefNo, setSelectedHotelRefNo] = useState("");
    const [searchName, setSearchName] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorDialog, setErrorDialog] = useState(false);
    const [successDialog, setSuccessDialog] = useState(false);
    
    const successDialogHandler = () => {
        setSuccessDialog(false);
        dialogCloser();
    }
    
    const searchNameChanger = (event) => {
        if(event.target.value.length === 0) {
            setSearchName(event.target.value);
        }
        setTimeout(() => {
            setSearchName(event.target.value);
        }, 1000)
    }
    
    function saveChangeHotel() {
        if(selectedHotelInfo !== null) {
            setHotelRefNoIsInitializing(true);
            PutChangeHotel(GENERAL_SETTINGS.OREST_URL, token, selectedHotelRefNo).then(res => {
                if(res.status === 200) {
                    hotelName = selectedHotelName.split("-");
                    hotelName = hotelName[1].toString();
                    hotelName = hotelName.trim();
                    updateHotelRefNo(res.data.data.res);
                    updateHotelName(hotelName);
                    localStorage.setItem(LOCAL_STORAGE_OREST_HOTELNAME_TEXT, hotelName);
                    localStorage.setItem(LOCAL_STORAGE_OREST_HOTELREFNO_TEXT, res.data.data.res);
                    setHotelRefNoIsInitializing(false);
                    setSuccessDialog(true);
                    setToState('userPortal', ['panelStatus'], state.panels.requestList)
                }
        
            })
        } else {
            setErrorDialog(true);
        }
    }
    
    useEffect(() => {
        setLoading(true);
        List({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.TOOLS + SLASH + OREST_ENDPOINT.USER + SLASH + OREST_ENDPOINT.HOTEL,
            token,
            params: {
                empid:loginfo.id,
                hotelname:`${searchName.toUpperCase()}`,
                start:"0",
                limit: "25",
            },
        }).then((r) => {
            if(r.status === 200) {
                setHotelList(r.data.data);
                setLoading(false);
            }
           
        
        })
        
    },[searchName])
    
    
    return(
        <div>
            <Dialog
                className={classes.dialogRoot}
                open={successDialog}
                maxWidth={'md'}
            >
                <DialogTitle className={classes.dialogTitle}>{t("str_info")}</DialogTitle>
                <DialogContentText className={classes.dialogText}>
                    {"Hotel successfully selected"}
                </DialogContentText>
                <DialogActions>
                    <div style={{padding:"12px"}}>
                        <Button className={classes.buttonStyle} onClick={successDialogHandler}>
                            {t("str_ok")}
                        </Button>
                    </div>
                </DialogActions>
            </Dialog>
            <Dialog
                className={classes.dialogRoot}
                open={errorDialog}
                maxWidth={'md'}
            >
                <DialogTitle className={classes.dialogTitle}>{"WARNING"}</DialogTitle>
                <DialogContentText className={classes.dialogText}>
                    {"Please select a hotel"}
                </DialogContentText>
                <DialogActions>
                    <div style={{padding:"12px"}}>
                        <Button className={classes.buttonStyle} onClick={() =>  setErrorDialog(false)}>
                            {t("str_ok")}
                        </Button>
                    </div>
                </DialogActions>
            </Dialog>
            <Grid container>
                <Grid item xs={12}>
                    <div className={classes.closeIconDiv}>
                        <IconButton onClick={dialogCloser}>
                            <CloseIcon />
                        </IconButton>
                    </div>
                </Grid>
                <Grid item xs={12}>
                    <Typography className={classes.title}>{t("str_changeHotel")}</Typography>
                </Grid>
                <Grid item xs={12}>
                    <div style={{padding: '12px 24px'}}>
                        <Autocomplete
                            loading={loading}
                            loadingText={t("str_loading")}
                            noOptionsText={t("str_notFound")}
                            value={selectedHotelInfo}
                            onChange={(event, newValue) => {
                                if(newValue !== null) {
                                    setSearchName("");
                                    setSelectedHotelInfo(newValue);
                                    setSelectedHotelRefNo(newValue.hotelrefno);
                                } else {
                                    setSearchName("");
                                    setSelectedHotelRefNo("");
                                    setSelectedHotelInfo(null);
                                }
                                
                            }}
                            inputValue={selectedHotelName === "" ? searchName : selectedHotelName}
                            onInputChange={(event, newInputValue) => {
                                if(newInputValue !== "") {
                                    setSelectedHotelName(newInputValue);
                                    setSearchName(newInputValue);
                                } else {
                                    setSearchName("");
                                    setSelectedHotelName("");
                                    setSelectedHotelInfo(null);
                                }
                                
                            }}
                            options={hotelList}
                            getOptionLabel={(option) =>
                                option.hotelrefno + ' - ' + option.hotelname
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    fullWidth={true}
                                    required
                                    InputLabelProps={{shrink: false}}
                                    variant="outlined"
                                />
                            )}
                        />
                    </div>
                </Grid>
                <Grid item xs={12}>
                    <div style={{padding:'12px 24px', textAlign:"right"}}>
                        <Button className={classes.buttonStyle} color={'primary'} variant={'contained'} onClick={saveChangeHotel}>{t("str_save")}</Button>
                    </div>
                </Grid>
            </Grid>
            <div style={{paddingBottom:"24px"}}/>
        </div>
    );
    
}


const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    resetState: () => dispatch(resetState()),
})

const mapStateToProps = state => {
    return {
        state: state.formReducer.userPortal,
    }
}

export default connect(mapStateToProps, mapDispatchToProps,)(ChangeHotelStep)

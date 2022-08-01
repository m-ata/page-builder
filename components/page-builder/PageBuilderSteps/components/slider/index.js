//react imports
import React, {useContext, useState, useEffect} from 'react';
//material ui imports
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import BorderColorSharpIcon from "@material-ui/icons/BorderColorSharp";
import DeleteIcon from "@material-ui/icons/Delete";
import { makeStyles } from '@material-ui/core/styles';
//redux imports
import { connect } from 'react-redux';
import {updateState} from "../../../../../state/actions";
//custom imports
import SliderModal from "./SliderModal";
import Slider from "../page/sections/slider/Slider";
import AlertDialog from "./AlertDialog";
//service related imports
import {Delete, UseOrest, ViewList} from "@webcms/orest";
import WebCmsGlobal from "components/webcms-global";
import {isErrorMsg, OREST_ENDPOINT, REQUEST_METHOD_CONST} from "../../../../../model/orest/constants";
import {toast} from "react-toastify";
import {COLORS, DELETE_SUCCESS} from "../../constants";
import {useRouter} from "next/router";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles(theme => ({
    centreContent: {
        display: 'flex',
        justifyContent: 'center',
    },
    cursorPointer: {
        cursor: 'pointer',
        color: 'silver'
    },
    typography: {
        display: 'flex',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'silver',
        fontWeight: 'bold'
    },
    actionButton: {
        borderRadius: 20,
        float: 'right',
        margin: 8,
        // marginTop: 8,
        // marginBottom: 8
    },
    disableAction: {
        pointerEvents: "none",
        opacity: 0.5
    },
    paageBuilderTypeText: {
        color: COLORS?.secondary,
        marginLeft: theme.spacing(1),
        marginTop: theme.spacing(2),
    },
    closeButton: {
        borderRadius: 20,
        float: 'right',
        marginTop: theme.spacing(3),
        marginRight: theme.spacing(1),
    },
}));

const defaultProps = {
    bgcolor: 'background.paper',
    m: 1,
    border: 2,
    borderColor: 'silver',
};

const GenericSlider = (props) => {

    const { state, updateState } = props

    const classes = useStyles();

    //local state
    const [isRenderDialog, setRenderDialog] = useState(false);
    const [dialogType, setDialogType] = useState('');
    const [dialogTitle, setDialogTitle] = useState('');
    const [isSaving, setSaving] = useState(false);
    const [isAlert, setAlert] = React.useState(false);

    const router = useRouter();
    const companyId = router.query.companyID;
    const {GENERAL_SETTINGS, token} = useContext(WebCmsGlobal);
    const authToken = token || router.query.authToken;

    useEffect(() => {

        if (router.query.masterid) {
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMSLD,
                token: authToken,
                params: {
                    query: `masterid:${router.query.masterid}`,
                    hotelrefno: Number(companyId),
                },
            }).then(res => {
                if (res?.status === 200 && res?.data?.data?.length > 0) {
                    const slider = {
                        title: res.data.data[0]?.title,
                        description: res.data.data[0]?.description,
                        cta: res.data.data[0]?.cta,
                        gid: res.data.data[0]?.gid,
                        textColor: state?.assets?.colors?.slider?.main,
                        buttonColor: state?.assets?.colors?.button?.main,
                    }
                    updateState('pageBuilder', 'slider', slider);
                }
            })
        }
        if (router.query.gid) {
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMSLD,
                token: authToken,
                params: {
                    query: `gid:${router.query.gid}`,
                    hotelrefno: Number(companyId),
                },
            }).then(res => {
                if (res?.status === 200 && res?.data?.data?.length > 0) {
                    const slider = {
                        title: res.data.data[0]?.title,
                        description: res.data.data[0]?.description,
                        cta: res.data.data[0]?.cta,
                        gid: res.data.data[0]?.gid,
                        textColor: state?.assets?.colors?.slider?.main,
                        buttonColor: state?.assets?.colors?.button?.main,
                    }
                    updateState('pageBuilder', 'slider', slider);
                }
            })
        }
    }, []);

    const resetRenderDialog = () => {
        setRenderDialog(false);
    }

    const handleDeleteSlider = () => { //delete slider from hcmitemsld
        setSaving(true);
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.HCMITEMSLD,
            token: authToken,
            params: {
                query: `gid:${state.slider.gid}`,
                hotelrefno:  Number(companyId)
            }
        }).then(res => {
            if (res.status === 200 && res.data && res.data.data && res.data.data.length > 0) {
                ViewList({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.HCMITEMIMG,
                    token: authToken,
                    params: {
                        query: `sliderid:${res.data.data[0].id}`,
                        hotelrefno:  Number(companyId)
                    }
                }).then(res1 => {
                    setSaving(false);
                    if (res1.status === 200) {
                        if (res1?.data?.data?.length > 0) {
                            const gids = [];
                            for (let gid in res1.data.data) {
                                gids.push({ gid: res1.data.data[gid].gid })
                            }
                            UseOrest({
                                apiUrl: GENERAL_SETTINGS.OREST_URL,
                                endpoint: OREST_ENDPOINT.HCMITEMIMG + '/' + OREST_ENDPOINT.LIST + '/' + OREST_ENDPOINT.DEL,
                                token: authToken,
                                method: REQUEST_METHOD_CONST.DELETE,
                                data: gids,
                                params: {
                                    hotelrefno: Number(companyId)
                                },
                            }).then(r1 => {
                                if (r1.status === 200) {
                                    Delete({
                                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                                        endpoint: OREST_ENDPOINT.HCMITEMSLD,
                                        token: authToken,
                                        gid: state.slider.gid,
                                        params: {
                                            hotelrefno: Number(companyId)
                                        }
                                    }).then(r2 => {
                                        if (r2.status === 200) {
                                            setSaving(false);
                                            const updatedSliderObj = {
                                                title: '',
                                                description: '',
                                                cta: '',
                                                gid: ''
                                            }
                                            updateState('pageBuilder', 'slider', updatedSliderObj)
                                            toast.success(DELETE_SUCCESS, {
                                                position: toast.POSITION.TOP_RIGHT
                                            });
                                        } else {
                                            const retErr = isErrorMsg(res);
                                            toast.error(retErr.errorMsg, {
                                                position: toast.POSITION.TOP_RIGHT
                                            });
                                        }
                                    })
                                } else {
                                    const retErr = isErrorMsg(res);
                                    toast.error(retErr.errorMsg, {
                                        position: toast.POSITION.TOP_RIGHT
                                    });
                                }
                            });
                        } else {
                            Delete({
                                apiUrl: GENERAL_SETTINGS.OREST_URL,
                                endpoint: OREST_ENDPOINT.HCMITEMSLD,
                                token: authToken,
                                gid: state.slider.gid,
                                params: {
                                    hotelrefno: Number(companyId)
                                }
                            }).then(r2 => {
                                if (r2.status === 200) {
                                    setSaving(false);
                                    const updatedSliderObj = {
                                        title: '',
                                        description: '',
                                        cta: '',
                                        gid: ''
                                    }
                                    updateState('pageBuilder', 'slider', updatedSliderObj)
                                    toast.success(DELETE_SUCCESS, {
                                        position: toast.POSITION.TOP_RIGHT
                                    });
                                } else {
                                    const retErr = isErrorMsg(res);
                                    toast.error(retErr.errorMsg, {
                                        position: toast.POSITION.TOP_RIGHT
                                    });
                                }
                            })
                        }
                    }
                })
            }
        })
    }

    const handleDelete = (isDelete) => {
        if (isDelete) {
            handleDeleteSlider();
        }
        setAlert(false)
    }

    const handleClose = () => {
        window?.top?.postMessage("closePageBuilder", "*");
    }

    return(
        <Container>
            <Grid container>
                <Grid item xs={6}>
                    <Typography className={classes.paageBuilderTypeText} variant="h4">
                        Slider
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        aria-label="close"
                        className={classes.closeButton}
                        onClick={handleClose}
                    >
                        CLOSE
                    </Button>
                </Grid>
            </Grid>
            <Box {...defaultProps} className={isSaving ? classes.disableAction : ''} >
                {
                    state.slider.gid ?
                        <Typography component={'div'} style={{overflow: 'auto'}}>
                            <IconButton
                                aria-label="Edit item"
                                color="primary"
                                onClick={() => {
                                    setDialogType('edit-slider');
                                    setDialogTitle('Edit Slider')
                                    setRenderDialog(true);
                                }}
                            >
                                <BorderColorSharpIcon color="primary"/>
                            </IconButton>
                            {
                                !router.query.gid && <IconButton
                                    aria-label="Delete item"
                                    color="primary"
                                    onClick={() => setAlert(true)}
                                >
                                    <DeleteIcon color="primary"/>
                                </IconButton>
                            }
                            <Slider sliderComponent={state.slider}/>
                        </Typography>  :
                        <>
                        <Typography component={'div'} style={{height: 'auto', overflow: 'auto'}}>
                            <h3 className={classes.centreContent}>
                                <span
                                    className={classes.cursorPointer}
                                    style={{marginTop: 8}}
                                    onClick={() => {
                                        setDialogType('add-slider');
                                        setDialogTitle('Add Slider')
                                        setRenderDialog(true);
                                    }}
                                >
                                    Click to define Slider
                                </span>
                            </h3>
                        </Typography>
                        <Divider style={{border: 'none', height: 2, backgroundColor: 'silver'}} />
                        <Typography component={'div'} style={{minHeight: 500}}></Typography>
                    </>
                }
            </Box>
            {
                isRenderDialog && <SliderModal
                    type={dialogType}
                    title={dialogTitle}
                    resetRenderDialog={resetRenderDialog}
                />
            }
            {
                isAlert && <AlertDialog handleDelete={handleDelete} />
            }
        </Container>
    )
};

const mapStateToProps = state => {
    return {
        state: state.formReducer.pageBuilder
    }
};

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GenericSlider);

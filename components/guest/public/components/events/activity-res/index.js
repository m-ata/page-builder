import React, { useState, useContext } from "react";
import { makeStyles } from '@material-ui/core/styles'
import { connect, useSelector } from 'react-redux'
import { AppBar, Button, Container, Dialog, DialogContent, Grid, IconButton, Step, Stepper, StepConnector, StepLabel, Toolbar, Typography } from '@material-ui/core'
import ListAltIcon from '@material-ui/icons/ListAlt';
import { setToState } from "../../../../../../state/actions";
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import useTranslation from "../../../../../../lib/translations/hooks/useTranslation";
import { ViewList } from "@webcms/orest";
import clsx from "clsx";
import ActivityResInfo from "./ActivityResInfo";
import { CustomToolTip } from "../../../../../user-portal/components/CustomToolTip/CustomToolTip";
import WebCmsGlobal from "../../../../../webcms-global";


const useStyles = makeStyles((theme) => ({
    stepperRoot: {
        '& .MuiStep-horizontal': {
            paddingLeft: 0,
            paddingRight: 0
        },
        backgroundColor: 'transparent'
    },
    stepRoot: {
        '& .MuiStepLabel-iconContainer': {
            paddingRight: 0
        }
    },
    dialogKiosk: {
        marginTop: -285
    },
    appBarSpacer: theme.mixins.toolbar,
}))

const useColorlibStepIconStyles = makeStyles(theme => ({
    root: {
        backgroundColor: '#ccc',
        zIndex: 1,
        padding: 10,
        color: '#fff',
        display: 'flex',
        borderRadius: '50%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    active: {
        backgroundImage: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.main,
        boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
    },
    completed: {
        backgroundColor: theme.palette.primary.main,
        backgroundImage: theme.palette.primary.main,
    },
}));

const connectorStyle = makeStyles(theme => ({
    alternativeLabel: {
        top: 22,
    },
    active: {
        '& .MuiStepConnector-lineHorizontal': {
            backgroundImage: 'linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)',
            borderColor: theme.palette.primary.main,
        },
    },
    completed: {
        '& .MuiStepConnector-lineHorizontal': {
            backgroundImage: 'linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)',
            borderColor: theme.palette.primary.main,
        },
    },
    line: {
        height: 3,
        border: 0,
        backgroundColor: '#eaeaf0',
        borderRadius: 1,
    },
}))

function ActivityRes(props) {
    const classes = useStyles()

    const { state, setToState } = props

    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { t } = useTranslation()

    //redux
    const token = useSelector((state) => state?.orest?.currentUser?.auth?.access_token || false)
    const hotelRefNo = useSelector((state) => state?.formReducer?.guest?.changeHotelRefno || state?.hotelinfo?.currentHotelRefNo || GENERAL_SETTINGS.HOTELREFNO)

    const [openTooltip, setOpenTooltip] = useState(false)

    const steps = {
        str_reservation: 0,
        str_confirm: 1,
    }

    const handleNext = () => {

    }

    const handleSave = async () => {
        const resEventMaster = await handleGetResEventMaster()
        console.log(resEventMaster)
    }

    const handleGetResEventMaster = () => {
        return ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'reseventmaster',
            params: {
                chkselfish: false,             
                hotelrefno: hotelRefNo
            },
            token
        }).then(res => {
            if(res.status === 200) {
                return res.data.data
            } else {
                return false
            }
        })
    }

    const handleClose = () => {
        setToState('guest', ['activityRes', 'openDialog'], false)
    }

    const ColorlibConnector = (props) => {
        const classes = connectorStyle()
        const { active, completed } = props


        return (
            <StepConnector
                className={clsx('', {
                    [classes.active]: active,
                    [classes.completed]: completed,
                })}
            />
        )
    }

    const ColorLibStepIcon = (props) => {
        const classes = useColorlibStepIconStyles();
        const { active, completed } = props;

        const icons = {
            1: <ListAltIcon />,
            2: <CheckIcon />,         
        };

        return (
            <div
                className={clsx(classes.root, {
                    [classes.active]: active,
                    [classes.completed]: completed,
                })}
            >
                {icons[String(props.icon)]}
            </div>
        );
    }

    return(
        <Dialog
            open={state.openDialog}
            fullScreen
        >
            <DialogContent style={{ backgroundColor: 'rgb(241, 241, 241)' }}>
                <AppBar>
                    <Toolbar>
                        <Typography>
                            {state.selectedActivity?.localtitle || state.selectedActivity?.title}
                        </Typography>
                        <Typography style={{ marginLeft: 'auto' }}>
                            <IconButton
                                style={{ color: 'inherit' }}
                                onClick={() => handleClose()}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Typography>
                    </Toolbar>
                </AppBar>
                <div className={classes.appBarSpacer} />
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Container maxWidth={'md'}>
                            <Stepper className={classes.stepperRoot} activeStep={state.activeStep}
                                connector={<ColorlibConnector />}>
                                {Object.keys(steps).map((label) => (
                                    <Step className={classes.stepRoot} key={label}>
                                        <StepLabel StepIconComponent={ColorLibStepIcon}/>
                                    </Step>
                                ))}
                            </Stepper>
                        </Container>                       
                    </Grid>
                    <Grid item xs={12}>
                        <Container maxWidth={'xl'}>
                            {
                                state.activeStep === steps.str_reservation && (
                                    <ActivityResInfo />
                                )
                            }
                        </Container>                       
                    </Grid>
                    <Grid item xs={12}>
                        <Typography align='right'>
                            <CustomToolTip
                                open={openTooltip}
                                onOpen={() => (!state.selectedDate || !state.selectedTime) && setOpenTooltip(true)}
                                onClose={() => setOpenTooltip(false)}
                                title={
                                    <div>
                                        {
                                            !state.selectedDate ? (
                                                <Typography style={{ fontSize: "inherit" }}>{t("str_pleaseSelectDate")}</Typography>
                                            ) : null
                                        }
                                        {
                                            !state.selectedTime ? (
                                                <Typography style={{ fontSize: "inherit" }}>{t("str_pleaseSelectTime")}</Typography>
                                            ) : null
                                        }
                                    </div>
                                }
                            >
                                <span>
                                    <Button
                                        disabled={state.activeStep === steps.str_reservation && (!state.selectedDate || !state.selectedTime)}
                                        color='primary'
                                        variant='contained'
                                        startIcon={<CheckIcon />}
                                        onClick={() => state.activeStep === steps.str_reservation ? (state.selectedDate && state.selectedTime) ? handleSave() : {} : handleNext()}
                                    >
                                        {state.activeStep === steps.str_reservation ? t('str_confirm') : t('str_next')}
                                    </Button>
                                </span>
                            </CustomToolTip>
                        </Typography>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest.activityRes,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ActivityRes)
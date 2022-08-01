import React, { useContext, useEffect, useState } from 'react'
import styles from './style/RemarkGroup.style'
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state'
import LoadingSpinner from '../../../LoadingSpinner'
import Grid from '@material-ui/core/Grid'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'
import FormGroup from '@material-ui/core/FormGroup'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import Typography from '@material-ui/core/Typography'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import RadioGroup from '@material-ui/core/RadioGroup'
import { ViewList, List, Insert, UseOrest } from '@webcms/orest'
import { DEFAULT_OREST_TOKEN, isErrorMsg, OREST_ENDPOINT } from '../../../../model/orest/constants'
import WebCmsGlobal from '../../../webcms-global'
import { connect, useSelector } from 'react-redux'
import RemarkRadio from './RemarkRadio'
import RemarkCheckbox from './RemarkCheckbox'
import CheckIcon from '@material-ui/icons/Check'
import { makeStyles } from '@material-ui/core/styles'
import stylesTabPanel from '../style/TabPanel.style'
import useTranslation from 'lib/translations/hooks/useTranslation'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { CustomToolTip } from '../../../user-portal/components/CustomToolTip/CustomToolTip'
import AddIcon from '@material-ui/icons/Add'
import ClearIcon from '@material-ui/icons/Clear'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import { useSnackbar } from 'notistack'
import RemarkChild from './RemarkChild'
import { setToState, updateState } from '../../../../state/actions'
import { SLASH } from '../../../../model/globals'
import TrackedChangesDialog from '../../../TrackedChangesDialog'

const useStyles = makeStyles(styles)
const useStylesTabPanel = makeStyles(stylesTabPanel)

function RemarkGroup(props) {
    const { t } = useTranslation()
    const { state, setToState, updateState, remarkGroup, index, isDisabled, isSuperUser } = props
    const classes = useStyles()
    const classesTabPanel = useStylesTabPanel()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { enqueueSnackbar } = useSnackbar()

    //redux
    const token = useSelector((state) => state?.orest?.currentUser?.auth?.access_token || false)
    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)
    const isClient = loginfo.roletype === '6500310'
    const hotelRefNo = useSelector(state => state?.hotelinfo?.currentHotelRefNo || null);


    //state
    const [isLoading, setIsLoading] = useState(false)
    const [isInitialized, setIsInitialized] = useState(false)
    const [remarks, setRemarks] = useState(null)
    const [radioGroupValue, setRadioGroupValue] = useState('')
    const [isRadioGroupLoading, setIsRadioGroupLoading] = useState(false)
    const [expanded, setExpanded] = useState(index === 0 ? "panel1" : false);
    const [openToolTip, setOpenToolTip] = useState(false);
    const [openAddRemarkDialog, setOpenAddRemarkDialog] = useState(false);
    const [openTrackedDialog, setOpenTrackedDialog] = useState(false);



    const [remarkData, setRemarkData] = useState(null);
    const [isRemarkSaving, setIsRemarkSaving] = useState(false);
    const [remarkGroupId, setRemarkGroupId] = useState(-1);
    const [remarkDesc, setRemarkDesc] = useState({
        value: '',
        isError: false,
        errorType: ''
    });



    useEffect(() => {
        let active = true
        if (active) {
            if (isLoading) {
                return undefined
            }

            getRemarkList(active)

        }

        return () => {
            active = false
        }
    }, [])

    useEffect(() => {
        if(remarkDesc.value.length > 0 && remarkDesc.value.length < 2) {
            setRemarkDesc({
                ...remarkDesc,
                value: remarkDesc.value,
                isError: true,
                errorType: 'lengthError'
            })
        } else {
            setRemarkDesc({
                ...remarkDesc,
                value: remarkDesc.value,
                isError: false,
                errorType: ''
            })
        }

        if(remarkDesc.value.length > 0){
            const timer = setTimeout(() => {
                List({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.REMARK,
                    token,
                    params: {
                        query: `code::${remarkDesc.value?.toUpperCase()}`,
                        hotelrefno: remarkGroup.hotelrefno || hotelRefNo
                    }
                }).then(res => {
                    if(res.status === 200) {
                        if(res.data.count > 0) {
                            setRemarkDesc({
                                ...remarkDesc,
                                value: remarkDesc.value,
                                isError: true,
                                errorType: 'invalidCode'
                            })
                        }
                    }
                })
            }, 700)
            return () =>  clearTimeout(timer)
        }

    },[remarkDesc.value])

    if (!remarkGroup) {
        return <LoadingSpinner />
    }

    const getRemarkList = (active) => {
        setIsLoading(true)
        if (remarkGroup) {
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.REMARK,
                token: token,
                params: {
                    query: `isactive:true,remarkgrid:${remarkGroup.id}`,
                    sort: 'orderno',
                    chkselfish: false,
                    allhotels: true
                },
            }).then((r) => {
                if (active) {
                    if (r.status === 200) {
                        setRemarks(r.data.data)
                        setIsInitialized(true)
                        setIsLoading(false)
                    } else {
                        setIsInitialized(true)
                        setIsLoading(false)
                    }
                }
            })
        } else {
            setIsInitialized(true)
            setIsLoading(false)
        }
    }

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const handleOpenToolTip = () => {
        if(remarkDesc.value.length <= 0 || remarkDesc.isError) {
            setOpenToolTip(true)
        }

    }

    const handleCloseToolTip = () => {
        setOpenToolTip(false);
    }

    const handleRemarkDef = () => {
        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.REMARK + SLASH + OREST_ENDPOINT.DEF,
            token,
            params: {
                hotelrefno: hotelRefNo || GENERAL_SETTINGS.HOTELREFNO
            }
        }).then(res => {
            if(res.status === 200) {
                setRemarkData(res.data.data)
            } else {
                const err = isErrorMsg(res);
                enqueueSnackbar(t(err.errorMsg), {variant: 'error'})
            }

        })
    }



    const handleRemarkSave = () => {
        setIsRemarkSaving(true);
        if(remarkGroupId !== -1) {
            if(remarkDesc !== '') {
                const data = remarkData
                data.code = remarkDesc.value?.length > 50 ? remarkDesc.value?.toUpperCase().substring(0, 50) : remarkDesc.value?.toUpperCase();
                data.description = remarkDesc.value;
                data.remarkgrid = remarkGroupId;
                data.isorsactive = true;
                Insert({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.REMARK,
                    token,
                    params: {
                        hotelrefno: remarkGroup.hotelrefno || hotelRefNo
                    },
                    data: data
                }).then(res => {
                    setIsRemarkSaving(false);
                    if(res.status === 200){
                        enqueueSnackbar(t('str_processCompletedSuccessfully'), {variant: 'success'})
                        setOpenAddRemarkDialog(false);
                        getRemarkList(true)
                        handleReset()
                    } else {
                        const error = isErrorMsg(res)
                        enqueueSnackbar(error.errorMsg, {variant: 'error'})
                    }
                })
            }
        }
    }

    const handleCloseAddRemarkDialog = () => {
        if(remarkDesc.value !== '') {
            setOpenTrackedDialog(true);
        } else {
            setOpenAddRemarkDialog(false);
            handleReset();
        }

    }

    const handleReset = () => {
        setRemarkDesc({
            value: '',
            isError: false,
            errorType: ''
        })
    }


    return (
        <React.Fragment>
            <Grid item xs={12}>
                {
                    isClient ? (
                        <FormControl component="fieldset">
                            <FormLabel component="legend" focused={false} className={classes.formLabel}>
                                <span className={classes.number}>{index + 1}.</span>
                                {t(remarkGroup?.description)}
                            </FormLabel>
                            {isInitialized  ? (
                                remarks && remarks.length > 0 ? (
                                    <RemarkChild
                                        remarkGroup={remarkGroup}
                                        isClient={isClient}
                                        isHorizontal={remarkGroup?.ishoriz || false}
                                        isDisabled={isDisabled}
                                        remarks={remarks}
                                        radioGroupValue={radioGroupValue}
                                        setRadioGroupValue={setRadioGroupValue}
                                    />
                                ) : (
                                    <Typography component="h3" className={classesTabPanel.nothingToShow}>
                                        {t('No option to show.')}
                                    </Typography>
                                )
                            ) : (
                                <LoadingSpinner size={30} />
                            )}
                        </FormControl>
                    ) : (
                        <Accordion
                            className={classes.accordionSummaryStyle}
                            expanded={expanded === "panel1"}
                            onChange={handleChange("panel1")}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <div className={classes.summaryContainer}>
                                    <Typography className={classes.formLabel}>
                                        <span className={classes.number}>{index + 1}.</span>
                                        {t(remarkGroup?.description)}
                                    </Typography>
                                    <div className={classes.addRemarkDiv}>
                                        <CustomToolTip title={t('str_addNewRemark')}>
                                            <IconButton
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setOpenAddRemarkDialog(true)
                                                    setRemarkGroupId(remarkGroup.id)
                                                    handleRemarkDef();
                                                }}
                                            >
                                                <AddIcon />
                                            </IconButton>
                                        </CustomToolTip>
                                    </div>
                                </div>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container>
                                    <Grid item xs>
                                        {isInitialized  ? (
                                            remarks && remarks.length > 0 ? (
                                                <RemarkChild
                                                    remarkGroup={remarkGroup}
                                                    isClient={isClient}
                                                    isHorizontal={remarkGroup?.ishoriz || false}
                                                    isDisabled={isDisabled}
                                                    remarks={remarks}
                                                    radioGroupValue={radioGroupValue}
                                                    setRadioGroupValue={setRadioGroupValue}
                                                />
                                            ) : (
                                                <Typography component="h3" className={classesTabPanel.nothingToShow}>
                                                    {t('No option to show.')}
                                                </Typography>
                                            )
                                        ) : (
                                            <LoadingSpinner size={30} />
                                        )}
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    )
                }
            </Grid>
            <Dialog
                open={openAddRemarkDialog}
                maxWidth={"sm"}
                fullWidth
            >
                <div style={{padding: "24px"}}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography style={{fontSize: '24px', fontWeight: 'bold'}}>{t('str_newRemark')}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                error={remarkDesc.isError}
                                id={"remark-desc"}
                                name={"remark-desc"}
                                variant={"outlined"}
                                fullWidth
                                label={t("str_description")}
                                required
                                FormHelperTextProps={{
                                    style:  {opacity: remarkDesc.isError  ? '1' : '0'}
                                }}
                                helperText={remarkDesc.isError ? remarkDesc.errorType === 'lengthError' ? 'Length must be between 2 and 50' : remarkDesc.errorType === 'required' ? t('str_mandatory') : remarkDesc.errorType === 'invalidCode' ? t('str_thereIsAlreadyExistUniqueValue') + remarkDesc.value : '' : 'null'}
                                onChange={(e) => {
                                    setRemarkDesc({
                                        ...remarkDesc,
                                        value: e.target.value,
                                        isError: e.target.value === '' ? true : remarkDesc.isError,
                                        errorType: e.target.value === '' ? 'required' : remarkDesc.errorType
                                    })
                                }}
                                onBlur={() => {
                                    setRemarkDesc({
                                        ...remarkDesc,
                                        value: remarkDesc.value,
                                        isError: remarkDesc.value === '' ? true : remarkDesc.isError,
                                        errorType: remarkDesc.value === '' ? 'required' : remarkDesc.errorType
                                    })
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <div style={{textAlign: "right"}}>
                                <Button
                                    disabled={isRemarkSaving}
                                    color={'primary'}
                                    variant={'outlined'}
                                    startIcon={<ClearIcon />}
                                    onClick={handleCloseAddRemarkDialog}
                                >
                                    {t("str_cancel")}
                                </Button>
                                <CustomToolTip
                                    open={openToolTip}
                                    onOpen={handleOpenToolTip}
                                    onClose={handleCloseToolTip}
                                    title={
                                        <React.Fragment>
                                            {
                                                remarkDesc.value.length <= 0 || remarkDesc.isError ? (
                                                    <Typography style={{fontSize: "inherit", fontWeight: "bold"}}>{t("str_invalidFields")}:</Typography>
                                                ) : null
                                            }
                                            {
                                                remarkDesc.value.length <= 0 || remarkDesc.isError ?  (
                                                    <Typography style={{fontSize: "inherit"}}>{t("str_description")}</Typography>
                                                ) : null
                                            }
                                        </React.Fragment>
                                    }
                                >
                                    <div style={{display: "inline"}}>
                                        <Button
                                            style={{marginLeft: '8px'}}
                                            startIcon={isRemarkSaving ? <LoadingSpinner size={24}/> : <CheckIcon />}
                                            disabled={isRemarkSaving || remarkDesc.value.length <= 0 || remarkDesc.isError}
                                            color={"primary"}
                                            variant={"contained"}
                                            onClick={() => handleRemarkSave()}
                                        >
                                            {t("str_save")}
                                        </Button>
                                    </div>
                                </CustomToolTip>
                            </div>
                        </Grid>
                    </Grid>
                </div>
            </Dialog>
            <TrackedChangesDialog
                open={openTrackedDialog}
                onPressNo={(e) => setOpenTrackedDialog(e)}
                onPressYes={(e) => {
                    setOpenTrackedDialog(e);
                    setOpenAddRemarkDialog(false);
                    setTimeout(() => {
                        handleReset();
                    }, 50)
                }}
            />
        </React.Fragment>

    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(RemarkGroup)

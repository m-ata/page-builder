import React, { useContext, useEffect, useState } from 'react'
import { connect, useSelector } from 'react-redux'
import styles from './style/Preferences.style'
import stylesTabPanel from '../style/TabPanel.style'
import { NextSeo } from 'next-seo'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Menu from '@material-ui/core/Menu'
import Dialog from '@material-ui/core/Dialog'
import MenuItem from '@material-ui/core/MenuItem'
import InputAdornment from '@material-ui/core/InputAdornment'
import Grid from '@material-ui/core/Grid'
import Tooltip from '@material-ui/core/Tooltip'
import EditIcon from '@material-ui/icons/Edit'
import { Button, IconButton, Checkbox, FormControlLabel } from '@material-ui/core'
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import { UseOrest, ViewList, Patch, List, Insert } from '@webcms/orest'
import SaveIcon from '@material-ui/icons/Save'
import CheckIcon from '@material-ui/icons/Check'
import ClearIcon from '@material-ui/icons/Clear'
import {
    DEFAULT_OREST_TOKEN,
    isErrorMsg, isObjectEqual, jsonGroupBy,
    OREST_ENDPOINT, OREST_TOOLS_USER_HASRIGHT, REQUEST_METHOD_CONST,
} from '../../../../model/orest/constants'
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state'
import useNotifications from '../../../../model/notification/useNotifications'
import WebCmsGlobal from '../../../webcms-global'
import LoadingSpinner from '../../../LoadingSpinner'
import RemarkGroup from './RemarkGroup'
import { makeStyles } from '@material-ui/core/styles'
import TabHeader from '../../../layout/components/TabHeader'
import { TITLE_LOYALTY } from '../../../../assets/const'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { MAX_MINUTE_VALUE, SLASH, TRUE } from '../../../../model/globals'
import { useSnackbar } from 'notistack'
import { CustomToolTip } from '../../../user-portal/components/CustomToolTip/CustomToolTip'
import { useOrestAction } from '../../../../model/orest'
import { setToState, updateState } from '../../../../state/actions'
import { sendGuestChangeNotifyMail } from '../Base/helper'
import TrackedChangesDialog from '../../../TrackedChangesDialog'
import utfTransliteration from '../../../../@webcms-globals/utf-transliteration'

const useStyles = makeStyles(styles)
const useStylesTabPanel = makeStyles(stylesTabPanel)

function Preferences(props) {
    const classes = useStyles()
        , { t } = useTranslation()
        , classesTabPanel = useStylesTabPanel()
        , { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
        , {state, setToState } = props

    //redux
    const { showError } = useNotifications()
        , { setOrestState } = useOrestAction()
        , { transliteration } = utfTransliteration()
        , token = useSelector((state) => state?.orest?.currentUser?.auth?.access_token || false)
        , clientBase = useSelector((state) => state?.orest?.state?.client || false)
        , hotelRefNo = useSelector(state => state?.hotelinfo?.currentHotelRefNo || null)
        , loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)
        , reservBase = state.clientReservation || false
        , isClient = loginfo.roletype === '6500310'
        , { enqueueSnackbar } = useSnackbar()
        , radioGroupAllGid = useSelector((state) => state?.formReducer?.guest?.profile?.radioGroupAllGid || false)
        , checkboxGroupAll = useSelector((state) => state?.formReducer?.guest?.profile?.checkboxGroupAll || false)

    //state
    const [isLoading, setIsLoading] = useState(false)
        , [isInitialized, setIsInitialized] = useState(false)
        , [remarkGroups, setRemarkGroups] = useState(null)
        , [isDisabled, setIsDisabled] = useState(isClient)
        , [remarkNote, setRemarkNote] = useState(clientBase ? clientBase.remarknote : '')
        , [isSuperUser, setIsSuperUser] = useState(false)
        , [isLoad, setIsLoad] = useState(true)
        , [isSaving, setIsSaving] = useState(false)
        , [openAddRemarkGroupDialog, setOpenAddRemarkGroupDialog] = useState(false)
        , [openTrackedDialog, setOpenTrackedDialog] = useState(false)
        , [openToolTip, setOpenToolTip] = useState(false)
        , [isSavingRemarkGroup, setIsSavingRemarkGroup] = useState(false)
        , [remarkGroupData, setRemarkGroupData] = useState(null)
        , [isHorizontal, setIsHorizontal] = useState(false)
        , [isMultiple, setIsMultiple] = useState(false)
        , [remarkGroupDesc, setRemarkGroupDesc] = useState({
            value: '',
            isError: false,
            errorType: '',
        })

    useEffect(() => {
        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_TOOLS_USER_HASRIGHT,
            token: token,
            params: {
                checksuper: true,
                empid: loginfo.id,
                moduleid: 308236
            }
        }).then(res => {
            if(res.status === 200) {
                const data = res.data.data;
                if(data.canl && data.cana && data.canu && data.canx && data.cand && data.cans && data.res) {
                    setIsSuperUser(true);
                }
            } else {
                setIsSuperUser(false);
            }
        })
    }, [])

    useEffect(() => {
        if(remarkGroupDesc.value.length > 0 && remarkGroupDesc.value.length < 2) {
            setRemarkGroupDesc({
                ...remarkGroupDesc,
                value: remarkGroupDesc.value,
                isError: true,
                errorType: 'lengthError'
            })
        } else {
            setRemarkGroupDesc({
                ...remarkGroupDesc,
                value: remarkGroupDesc.value,
                isError: false,
                errorType: ''
            })
        }

        if(remarkGroupDesc.value.length > 0){
            const timer = setTimeout(() => {
                List({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.REMARKGR,
                    token,
                    params: {
                        query: `code::${remarkGroupDesc.value?.toUpperCase()}`,
                        hotelrefno: hotelRefNo || GENERAL_SETTINGS.HOTELREFNO
                    }
                }).then(res => {
                    if(res.status === 200) {
                        if(res.data.count > 0) {
                            setRemarkGroupDesc({
                                ...remarkGroupDesc,
                                value: remarkGroupDesc.value,
                                isError: true,
                                errorType: 'invalidCode'
                            })
                        }
                    }
                })
            }, 700)
            return () =>  clearTimeout(timer)
        }

    },[remarkGroupDesc.value])

    useEffect(() => {
        let active = true
        if (active) {
            if (isLoading) {
                return undefined
            }
            if (clientBase) {
                getRemarkGroup(active)
            } else {
                setIsInitialized(true)
            }
        }

        return () => {
            active = false
        }
    }, [])

    const getRemarkGroup = async (active = false) => {
        setIsLoading(true);
        await getClientRem()
        return ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.REMARKGR,
            token: token,
            params: {
                query: 'isactive:true',
                chkselfish: false,
                allhotels: true
            }
        }).then((r) => {
            if (active) {
                if (r.status === 200) {
                    setRemarkGroups(r.data.data)
                    setOrestState(['remarkGroups'], r.data.data)
                    setIsInitialized(true)
                    setIsLoading(false)
                } else {
                    const retErr = isErrorMsg(r)
                    showError(retErr.errorMsg)
                    setIsInitialized(true)
                    setIsLoading(false)
                }
            }
        })

    }

    const getClientRem = async () => {
       return  ViewList({
           apiUrl: GENERAL_SETTINGS.OREST_URL,
           endpoint: OREST_ENDPOINT.CLIENTREM,
           token,
           params: {
               query: `masterid:${clientBase.mid}`,
               chkselfish: false,
               allhotels: true,
               limit: 100
           }
       }).then(res => {
           if(res.status === 200) {
               setOrestState(['selectedRemarkList'], res.data.data)
               return true
           } else {
               const retErr = isErrorMsg(res)
               enqueueSnackbar(t(retErr.errorMsg), {variant: 'error'})
               return false
           }
       })
    }


    function handleButtonEdit() {
        setIsDisabled(!isDisabled)
    }

    const handlePatchRemarkNote = async () => {
        return Patch({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.CLIENT,
            gid: clientBase.gid,
            token: token,
            params: {
                hotelrefno: clientBase.hotelrefno || hotelRefNo || GENERAL_SETTINGS.HOTELREFNO
            },
            data: {
                remarknote: remarkNote
            }
        }).then( async res => {
            if(res.status === 200) {
                setOrestState(['client'], res.data.data);
                return {success: true, errorText: false}
            } else {
                const retErr = isErrorMsg(res)
                return {success: false, errorText: retErr.errorMsg}
            }
        })
    }

    const handleRemarkGroupDef = () => {
        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.REMARKGR + SLASH + OREST_ENDPOINT.DEF,
            token,
            params: {
                hotelrefno: hotelRefNo || GENERAL_SETTINGS.HOTELREFNO
            }
        }).then(res => {
            if(res.status === 200) {
                setRemarkGroupData(res?.data?.data)
            } else {
                const error = isErrorMsg(res)
                enqueueSnackbar(t(error.errorMsg), {variant: 'error'})
            }
        })
    }

    const handleAddRemarkGroup = () => {
        setIsSavingRemarkGroup(true);
        const data = remarkGroupData;
        data.code = remarkGroupDesc.value?.length > 50 ? remarkGroupDesc.value?.toUpperCase().substring(0, 50) : remarkGroupDesc.value?.toUpperCase();
        data.description = remarkGroupDesc.value;
        data.multiselect = isMultiple;
        data.ishoriz = isHorizontal;
        Insert({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.REMARKGR,
            token,
            params: {
                hotelrefno: hotelRefNo || GENERAL_SETTINGS.HOTELREFNO
            },
            data: data
        }).then(res => {
            setIsSavingRemarkGroup(false);
            if(res.status === 200){
                enqueueSnackbar(t('str_processCompletedSuccessfully'), {variant: 'success'})
                setOpenAddRemarkGroupDialog(false);
                setIsInitialized(false)
                getRemarkGroup(true);
                handleReset()
            } else {
                const error = isErrorMsg(res)
                enqueueSnackbar(t(error.errorMsg), {variant: 'error'})
            }
        })
    }

    const handleInsert = async (list) => {
       return  UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.CLIENTREM + SLASH + OREST_ENDPOINT.LIST + SLASH + OREST_ENDPOINT.INS,
            method: REQUEST_METHOD_CONST.POST,
            token,
            params: {
                hotelrefno: clientBase?.hotelrefno
            },
            data: list
        }).then( async (res) => {
            if (res.status === 200) {
                if(res.data.data) {
                    return {success: true, errorText: false}
                } else {
                    const retErr = isErrorMsg(res)
                    return {success: false, errorText: retErr.errorMsg}
                }
            }
        })
    }

    const handlePatchClientRem = async (list) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.CLIENTREM + SLASH + OREST_ENDPOINT.LIST + SLASH + OREST_ENDPOINT.PATCH,
            method: REQUEST_METHOD_CONST.PATCH,
            token,
            params: {
                hotelrefno: clientBase?.hotelrefno
            },
            data: list
        }).then( async (res) => {
            if (res.status === 200) {
                if(res.data.data) {
                    return {success: true, errorText: false}
                } else {
                    const retErr = isErrorMsg(res)
                    return {success: false, errorText: retErr.errorMsg}
                }
            }
        }).catch(e => {
            console.log(e)
        })
    }

    const handleDelete = async (delList) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.CLIENTREM + SLASH + OREST_ENDPOINT.LIST + SLASH + OREST_ENDPOINT.DEL,
            method: REQUEST_METHOD_CONST.DELETE,
            token,
            params: {
                hotelrefno: clientBase?.hotelrefno
            },
            data: delList
        }).then(async (r1) => {
            if (r1.status === 200) {
                if(r1.data.success) {
                    const checkboxGroup = state.profile.checkboxGroupAll;
                    const checkboxGroupBase = state.profile.checkboxGroupAllBase;
                    const radioGroupAllGid = state?.profile?.radioGroupAllGid;
                    const radioGroupAllGidBase = state?.profile?.radioGroupAllGidBase;
                    Object.keys(checkboxGroup).map((item) => {
                        if(checkboxGroup[item].canBeDelete && !checkboxGroup[item].canBeInsert) {
                            delete checkboxGroup[item]
                            delete checkboxGroupBase[item]
                        }
                    })
                    Object.keys(radioGroupAllGid).map((item) => {
                        if(radioGroupAllGid[item].canBeDelete && radioGroupAllGid[item].canBeInsert === 'delete') {
                            delete radioGroupAllGid[item]
                            delete radioGroupAllGidBase[item]
                        }
                    })
                    setToState('guest', ['profile', 'checkboxGroupAllBase'], checkboxGroupBase)
                    setToState('guest', ['profile', 'checkboxGroupAll'], checkboxGroup)
                    return {success: true, errorText: false}
                } else {
                    const retErr = isErrorMsg(r1)
                    return {success: false, errorText: retErr.errorMsg}
                }
            }
        })
    }


    const handleSave = async () => {
        let insList = [];
        let delList = [];
        let infoList = [];
        let patchList = [];
        setIsSaving(true);

        //radioGroup
        Object.keys(radioGroupAllGid).map((item, i) => {
            if(radioGroupAllGid[item].canBeInsert && radioGroupAllGid[item].canBeDelete || radioGroupAllGid[item].canBeDelete && radioGroupAllGid[item].canBeInsert === 'delete') {
                delList.push({
                    gid: radioGroupAllGid[item].canBeDelete
                })
            }
            if(radioGroupAllGid[item].canBeInsert && radioGroupAllGid[item].canBeInsert !== 'delete' ) {
                const remarkInfo = {
                    remarkgr: t(radioGroupAllGid[item].info.remarkgr, false, GENERAL_SETTINGS.hotelLocalLangGCode),
                    remark:  t(radioGroupAllGid[item].info.remark, false, GENERAL_SETTINGS.hotelLocalLangGCode),
                    add: true
                }
                infoList.push(remarkInfo)
                const insertData = {
                    masterid: clientBase?.mid,
                    remarkid: radioGroupAllGid[item].canBeInsert,
                    hotelrefno: clientBase?.hotelrefno
                }
                if(radioGroupAllGid[item]?.note && radioGroupAllGid[item]?.hasNote) {
                    insertData.note = radioGroupAllGid[item].note
                }
                insList.push(insertData)
            }
            if(!radioGroupAllGid[item].canBeInsert && radioGroupAllGid[item].canBeDelete) {
                if(radioGroupAllGid[item].isUpdateNote) {
                    patchList.push({
                        gid: radioGroupAllGid[item].canBeDelete,
                        note: radioGroupAllGid[item].note
                    })
                }
            }
        })

        //checkbox Group
        Object.keys(checkboxGroupAll).map((item,i) => {
            if(!checkboxGroupAll[item].canBeInsert && checkboxGroupAll[item].canBeDelete) {
                const remarkInfo = {
                    remarkgr: t(checkboxGroupAll[item].info.remarkgr, false, GENERAL_SETTINGS.hotelLocalLangGCode),
                    remark: t(checkboxGroupAll[item].info.remark, false, GENERAL_SETTINGS.hotelLocalLangGCode),
                    add: false
                }
                infoList.push(remarkInfo)
                delList.push({
                    gid: checkboxGroupAll[item].canBeDelete
                })
            } else if(checkboxGroupAll[item].canBeInsert && !checkboxGroupAll[item].canBeDelete) {
                const remarkInfo = {
                    remarkgr: t(checkboxGroupAll[item].info.remarkgr, false, GENERAL_SETTINGS.hotelLocalLangGCode),
                    remark: t(checkboxGroupAll[item].info.remark, false, GENERAL_SETTINGS.hotelLocalLangGCode),
                    add: true
                }
                infoList.push(remarkInfo)
                const insertData = {
                    masterid: clientBase?.mid,
                    remarkid: checkboxGroupAll[item].canBeInsert,
                    hotelrefno: clientBase?.hotelrefno
                }
                if(checkboxGroupAll[item].note) {
                    insertData.note = checkboxGroupAll[item].note
                }
                insList.push(insertData)
            } else {
                if(checkboxGroupAll[item].isUpdateNote) {
                    const patchData = {
                        gid: checkboxGroupAll[item]?.canBeDelete,
                        note: checkboxGroupAll[item]?.note
                    }
                    patchList = [...patchList, patchData]
                }
            }
        })

        const insListGroup = jsonGroupBy(infoList, 'remarkgr')
        const notifyValues = {
            roomno: reservBase?.roomno || "",
            clientname: transliteration(clientBase?.clientname) || "",
            changes: JSON.stringify({
                changeItems: insListGroup
            })
        }

        const apiResponse = {
            deleteRem: {success: true, errorText: false},
            patchRem: {success: true, errorText: false},
            insertRem: {success: true, errorText: false},
            patchRemNote: {success: true, errorText: false}
        }

        if(delList.length > 0) apiResponse.deleteRem = await handleDelete(delList)
        if(patchList.length > 0) apiResponse.patchRem = await handlePatchClientRem(patchList)
        if(insList.length > 0) apiResponse.insertRem = await handleInsert(insList)
        if(clientBase?.remarknote !== remarkNote) apiResponse.patchRemNote = await handlePatchRemarkNote()
        await getClientRem()
        setIsSaving(false)

        if(apiResponse.deleteRem.success && apiResponse.patchRem.success && apiResponse.insertRem.success && apiResponse.patchRemNote.success) {
            enqueueSnackbar(t('str_processCompletedSuccessfully'), {variant: 'success'})
        } else {
            enqueueSnackbar(
                apiResponse.deleteRem.errorText ||
                apiResponse.patchRem.errorText ||
                apiResponse.insertRem.errorText ||
                apiResponse.patchRemNote.errorText,
                {variant: 'error'}
            )
        }

        if(delList.length > 0 || insList.length > 0){
            sendGuestChangeNotifyMail('clientrem','upd', clientBase.id, clientBase.gid, reservBase.gid, reservBase.reservno, notifyValues, reservBase?.hotelrefno || GENERAL_SETTINGS.HOTELREFNO)
        }
     }

    const handleCloseAddRemarkDialog = () => {
        if(remarkGroupDesc.value !== '' || isMultiple || isHorizontal) {
            setOpenTrackedDialog(true);
        } else {
            setOpenAddRemarkGroupDialog(false);
            handleReset();
        }

    }

    const handleOpenToolTip = () => {
        if(remarkGroupDesc.value.length <= 0 || remarkGroupDesc.isError) {
            setOpenToolTip(true)
        }

    }

    const handleCloseToolTip = () => {
        setOpenToolTip(false);
    }

    const handleReset = () => {
        setRemarkGroupDesc({
            value: '',
            isError: false,
            errorType: ''
        })
        setIsHorizontal(false);
        setIsMultiple(false);

    }

    return (
        <React.Fragment>
            <TabHeader title={t('str_preferences')}>
                <Grid item>
                    {
                        isClient ? (
                            <Tooltip title={t('str_edit')} interactive className={classes.tooltip}>
                                <Button onClick={handleButtonEdit}>
                                    <EditIcon className={classes.editIcon} />
                                </Button>
                            </Tooltip>
                        ) : null
                    }
                    {
                        !isClient ? (
                            <Button
                                startIcon={<AddIcon />}
                                variant={'contained'}
                                color="primary"
                                onClick={() => {
                                    handleRemarkGroupDef()
                                    setOpenAddRemarkGroupDialog(true)
                                }}
                            >
                                {t('str_newGroup')}
                            </Button>
                        ) : null
                    }
                </Grid>
            </TabHeader>
            <div style={{paddingTop: '12px'}}/>
            <Grid container justify={'center'} spacing={3}>
                {clientBase ? (
                    isInitialized ? (
                        remarkGroups && remarkGroups.length > 0 ? (
                            remarkGroups.map((remarkGroup, index) => {
                                return (
                                    <RemarkGroup
                                        key={index}
                                        remarkGroup={remarkGroup}
                                        index={index}
                                        isDisabled={isDisabled}
                                        isSuperUser={isSuperUser}
                                    />
                                )
                            })
                        ) : (
                            <Grid item xs={12} className={classesTabPanel.gridItem}>
                                <Typography component="h3" className={classesTabPanel.nothingToShow}>
                                    {t('str_noPreferencesToShow')}
                                </Typography>
                            </Grid>
                        )
                    ) : (
                        <Grid item xs={12} className={classesTabPanel.gridItem}>
                            <LoadingSpinner />
                        </Grid>
                    )
                ) : (
                    <Typography component="h3" style={{ marginTop: 15, textAlign: 'center' }}>
                        {t('You are not a client.')}
                    </Typography>
                )}
                {
                    !isClient ? (
                        <Grid item xs={12} className={classesTabPanel.gridItem}>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Typography style={{fontSize: "22px"}}>
                                        {t("str_clientRemarks")}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        value={remarkNote ? remarkNote : ""}
                                        disabled={isDisabled}
                                        multiline
                                        fullWidth
                                        rows={4}
                                        rowsMax={4}
                                        variant={"outlined"}
                                        onChange={(e) => setRemarkNote(e.target.value)}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    ) : null
                }
                <Grid item xs={12} style={{textAlign: 'right'}}>
                    {
                        clientBase?.remarknote === remarkNote && JSON.stringify(state.profile.checkboxGroupAllBase) === JSON.stringify(state.profile.checkboxGroupAll) && JSON.stringify(state.profile.radioGroupAllGid) === JSON.stringify(state.profile.radioGroupAllGidBase) ?  (
                            <CustomToolTip
                                title={
                                    <div>
                                        <Typography style={{fontWeight: '600', fontSize: 'inherit'}}>
                                            {t('str_noChangesYet')}
                                        </Typography>
                                    </div>
                                }
                            >
                                  <span>
                                       <Button
                                           disabled
                                           size={'large'}
                                           color={'primary'}
                                           variant={'contained'}
                                       >
                                           {t('str_saveChanges')}
                                       </Button>
                                  </span>
                            </CustomToolTip>
                        ) : (
                            <Button
                                disabled={isSaving || isDisabled || clientBase?.remarknote === remarkNote && JSON.stringify(state.profile.checkboxGroupAllBase) === JSON.stringify(state.profile.checkboxGroupAll) && JSON.stringify(state.profile.radioGroupAllGid) === JSON.stringify(state.profile.radioGroupAllGidBase)}
                                startIcon={isSaving && <LoadingSpinner size={24}/>}
                                size={'large'}
                                color={'primary'}
                                variant={'contained'}
                                onClick={() => handleSave()}
                            >
                                {t('str_saveChanges')}
                            </Button>
                        )
                    }
                </Grid>
            </Grid>
            <Dialog
                open={openAddRemarkGroupDialog}
                maxWidth={"sm"}
                fullWidth
            >
                <div style={{padding: "24px"}}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography style={{fontSize: '24px', fontWeight: 'bold'}}>{t('str_newGroup')}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                error={remarkGroupDesc.isError}
                                id={"remark-group-desc"}
                                name={"remark-group-desc"}
                                variant={"outlined"}
                                fullWidth
                                label={t("str_description")}
                                required
                                FormHelperTextProps={{
                                    style:  {opacity: remarkGroupDesc.isError  ? '1' : '0'}
                                }}
                                helperText={remarkGroupDesc.errorType === 'lengthError' ? 'Length must be between 2 and 50' : remarkGroupDesc.errorType === 'required' ? t('str_mandatory') : remarkGroupDesc.errorType === 'invalidCode' ? t('str_thereIsAlreadyExistUniqueValue') + remarkGroupDesc.value : 'null'}
                                onChange={(e) => {
                                    setRemarkGroupDesc({
                                        ...remarkGroupDesc,
                                        value: e.target.value,
                                        isError: e.target.value === '' ? remarkGroupDesc.isError : false
                                    })
                                }}
                                onBlur={() => {
                                    setRemarkGroupDesc({
                                        ...remarkGroupDesc,
                                        value: remarkGroupDesc.value,
                                        isError: remarkGroupDesc.value === '' ? true : remarkGroupDesc.isError,
                                        errorType: remarkGroupDesc.value === '' ? 'required' : remarkGroupDesc.errorType
                                    })
                                }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControlLabel
                                checked={isMultiple}
                                onChange={(e) => setIsMultiple(e.target.checked)}
                                color={'primary'}
                                control={ <Checkbox />}
                                label={t('str_multiple')}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControlLabel
                                checked={isHorizontal}
                                onChange={(e) => setIsHorizontal(e.target.checked)}
                                color={'primary'}
                                control={ <Checkbox />}
                                label={t('str_horizontal')}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <div style={{textAlign: "right"}}>
                                <Button
                                    disabled={isSavingRemarkGroup}
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
                                                 remarkGroupDesc.value.length <= 0 || remarkGroupDesc.isError ? (
                                                    <Typography style={{fontSize: "inherit", fontWeight: "bold"}}>{t("str_invalidFields")}:</Typography>
                                                ) : null
                                            }
                                            {
                                               /* remarkGroupCode.value.length <= 0 || remarkGroupCode.isError ? (
                                                    <Typography style={{fontSize: "inherit"}}>{t("str_code")}</Typography>
                                                ) : null*/
                                            }
                                            {
                                                remarkGroupDesc.value.length <= 0 || remarkGroupDesc.isError ?  (
                                                    <Typography style={{fontSize: "inherit"}}>{t("str_description")}</Typography>
                                                ) : null
                                            }
                                        </React.Fragment>
                                    }
                                >
                                    <div style={{display: "inline"}}>
                                        <Button
                                            style={{marginLeft: '8px'}}
                                            startIcon={isSavingRemarkGroup ? <LoadingSpinner size={24}/> : <CheckIcon />}
                                            disabled={isSavingRemarkGroup || remarkGroupDesc.value.length <= 0 || remarkGroupDesc.isError}
                                            color={"primary"}
                                            variant={"contained"}
                                            onClick={() => handleAddRemarkGroup()}
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
                    setOpenAddRemarkGroupDialog(false);
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

export default connect(mapStateToProps, mapDispatchToProps)(Preferences)

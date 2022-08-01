import React, {useContext, useState, useEffect} from 'react';
import {connect, useSelector} from 'react-redux';
import { makeStyles } from '@material-ui/core/styles'
import {Typography, Grid, Card, CardContent, Avatar, Button} from '@material-ui/core'
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import useTranslation from '../../../../lib/translations/hooks/useTranslation';
import clsx from 'clsx'
import AlignToCenter from "../../../AlignToCenter";
import {DropzoneDialog} from "material-ui-dropzone";
import {Upload} from "@webcms/orest";
import WebCmsGlobal from "../../../webcms-global";
import {setToState, updateState} from "../../../../state/actions";
import {useSnackbar} from "notistack";
import {isErrorMsg} from "../../../../model/orest/constants";
import PersonalInformation from "../../../emp-portal/NewCvStepper/steps/PersonalInformation";
import LoadingSpinner from "../../../LoadingSpinner";
import PersonIcon from '@material-ui/icons/Person';




const useStyles = makeStyles(theme => ({
    subText: {
        fontSize: "14px",
        fontWeight: "600",
    },
    textColor: {
        color: theme.palette.text.main
    },
    cardContent: {
        padding: "24px 48px",
    },
    avatarStyle: {
        position: 'relative',
        width: '124px',
        height: '124px',
        maxWidth: '124px',
        [theme.breakpoints.down("md")]: {
            margin: "auto",
            width: "96px",
            height: "96px",
            maxWidth: '96px',
        },
        '&:hover $uploadViewContent': {
            opacity: '1',
            transition: 'opacity 0.2s'
        }
    },
    gridStyle: {
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
    uploadViewContent: {
        cursor: 'pointer',
        top: 0,
        position: 'absolute',
        width: "100%",
        height: "100%",
        backgroundColor: 'rgb(0,0,0,0.4)',
        borderRadius: '50%',
        opacity: '0',
        zIndex: 1,
        transition: 'opacity 0.2s',
        textAlign: 'center'
    }
}))


function ProfileInfoCard(props) {
    const classes = useStyles();

    const {isEditActive, updateState} = props

    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { t } = useTranslation()

    const { enqueueSnackbar } = useSnackbar()

    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)
    const imageUrl = useSelector((state) => state?.formReducer?.guest?.clientProfilePhoto || '');
    const token = useSelector((state) => state?.orest?.currentUser?.auth?.access_token || false)
    const empBase = useSelector((state) => state?.orest?.state?.emp || false)

    const [openUploadDialog, setOpenUploadDialog] = useState(false)
    const [openProfileEditDialog, setOpenProfileEditDialog] = useState(false)
    const [empInfo, setEmpInfo] = useState(empBase)

    useEffect(() => {
        if(empBase) {
            setEmpInfo(empBase)
        } else {
            setEmpInfo(loginfo)
        }
    }, [empBase])



    const handleUploadProfilePhoto = (file) => {
        if(token && loginfo?.mid) {
            Upload({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                token,
                params: {
                    masterid: loginfo.mid,
                    code: 'PHOTO',
                    hotelrefno: loginfo?.hotelrefno,
                },
                files: file,
            }).then((r) => {
                if (r.status === 200) {
                    let newFile = file[0]
                    let url = URL.createObjectURL(newFile)
                    updateState('guest', 'clientProfilePhoto', url)
                    setOpenUploadDialog(false)
                    enqueueSnackbar(t('str_updateIsSuccessfullyDone'), { variant: 'success' })
                } else {
                    const retErr = isErrorMsg(r)
                    setOpenUploadDialog(false)
                    enqueueSnackbar(retErr.errorMsg, { variant: 'error' })
                }
            })
        }
    }

    return(
        <React.Fragment>
            <Card>
                <CardContent className={classes.cardContent}>
                    {
                        !empInfo ? (
                            <LoadingSpinner />
                        ) : (
                            <Grid container spacing={2} alignItems={'center'} justify={'space-between'}>
                                <Grid className={classes.gridStyle} item xs={12} sm={12} md={12} lg={2}>
                                    <Avatar className={classes.avatarStyle}>
                                        {imageUrl ? <img src={imageUrl} width={'100%'}/> : <PersonIcon style={{width: '100%', height: '100%'}}/>}
                                        <div className={classes.uploadViewContent} onClick={() => setOpenUploadDialog(true)}>
                                            <AlignToCenter>
                                                <PhotoCameraIcon style={{color: '#FFF'}}/>
                                                <Typography style={{fontSize: '14px', color: '#FFF'}}>{t('str_clickToChange')}</Typography>
                                            </AlignToCenter>
                                        </div>
                                    </Avatar>
                                </Grid>
                                <Grid className={classes.gridStyle} item xs={12} sm={6} md={6} lg={2}>
                                    <Typography className={clsx(classes.subText, classes.textColor)} style={{opacity: ".7"}}>
                                        {t("str_name")}
                                    </Typography>
                                    <Typography className={classes.subText}>
                                        {empInfo?.firstname}
                                    </Typography>
                                </Grid>
                                <Grid className={classes.gridStyle} item xs={12} sm={6} md={6} lg={2}>
                                    <Typography className={clsx(classes.subText, classes.textColor)} style={{opacity: ".7"}}>
                                        {t("str_lastName")}
                                    </Typography>
                                    <Typography className={classes.subText}>
                                        {empInfo.lastname}
                                    </Typography>
                                </Grid>
                                <Grid className={classes.gridStyle} item xs={12} sm={6} md={6} lg={3}>
                                    <Typography className={clsx(classes.subText, classes.textColor)} style={{opacity: ".7"}}>
                                        {t("str_email")}
                                    </Typography>
                                    <Typography className={classes.subText}>
                                        {empInfo.email}
                                    </Typography>
                                </Grid>
                                <Grid className={classes.gridStyle} item xs={12} sm={6} md={6} lg={2}>
                                    <Typography className={clsx(classes.subText, classes.textColor)} style={{opacity: ".7"}}>
                                        {t("str_phoneNumber")}
                                    </Typography>
                                    <Typography className={classes.subText}>
                                        {empInfo?.mobiletel}
                                    </Typography>
                                </Grid>
                                <Grid className={classes.gridStyle} item xs={12} sm={12} md={12} lg={1}>
                                    {isEditActive &&
                                    <Button
                                        fullWidth
                                        className={classes.editButton}
                                        onClick={(e) => {
                                            setOpenProfileEditDialog(true)
                                            e.preventDefault()
                                        }}
                                    >
                                        {t("str_edit")}
                                    </Button>}
                                </Grid>
                            </Grid>
                        )
                    }
                </CardContent>
            </Card>
            <DropzoneDialog
                open={openUploadDialog}
                onSave={handleUploadProfilePhoto}
                acceptedFiles={[
                    'image/jpeg',
                    'image/png',
                    'image/bmp',
                ]}
                showPreviews
                filesLimit={1}
                maxFileSize={5000000}
                onClose={() => setOpenUploadDialog(false)}
                submitButtonText={t('str_save')}
                cancelButtonText={t('str_cancel')}
                dialogTitle={t('str_uploadProfilePhoto')}
            />
            {
                openProfileEditDialog && (
                    <PersonalInformation
                        open={openProfileEditDialog}
                        onClose={() => setOpenProfileEditDialog(false)}
                        empViewData={empInfo}
                    />
                )
            }
        </React.Fragment>
    );
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

export default connect(null, mapDispatchToProps)(ProfileInfoCard)
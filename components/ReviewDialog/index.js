import React, {useContext, useEffect, useState} from 'react'
import {Button, Dialog, DialogContent, Grid, TextField, Typography} from "@material-ui/core";
import Rating from "@material-ui/lab/Rating";
import CloseIcon from "@material-ui/icons/Close";
import {CustomToolTip} from "../user-portal/components/CustomToolTip/CustomToolTip";
import CheckIcon from "@material-ui/icons/Check";
import LoadingSpinner from "../LoadingSpinner";
import {makeStyles} from "@material-ui/core/styles";
import useTranslation from "../../lib/translations/hooks/useTranslation";
import TrackedChangesDialog from "../TrackedChangesDialog";
import axios from "axios";
import {isErrorMsg, OREST_ENDPOINT, REQUEST_METHOD_CONST} from "../../model/orest/constants";
import {useSnackbar} from "notistack";
import WebCmsGlobal from "../webcms-global";
import {useSelector} from "react-redux";
import {UseOrest} from "@webcms/orest";

const useStyles = makeStyles((theme) => ({
    dialogContent: {
        padding: 24
    },
    title:{
        fontSize:26,
        fontWeight:'bold',
        paddingBottom:16,
    },
}))

export default function ReviewDialog(props) {
    const classes = useStyles()

    const {open, onClose, handleAfterInsert, params, initialValue } = props

    const { t } = useTranslation()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal);
    const { enqueueSnackbar } = useSnackbar()

    const token = useSelector((state) => state?.orest?.currentUser?.auth?.access_token || false)

    const [isSaving, setIsSaving] = useState(false)
    const [reviewScore, setReviewScore] = useState(initialValue || 0)
    const [reviewComment, setReviewComment] = useState('')
    const [openTrackedDialog, setOpenTrackedDialog] = useState(false)
    const [revPortal, setRevPortal] = useState(null)
    const reviewDataBase = {
        score: 0,
        comment: ''
    }

    useEffect(() => {
        if(token && open) {
            if(!revPortal) {
                UseOrest({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: 'revportal/app',
                    token
                }).then(res => {
                    if(res.status === 200) {
                        setRevPortal(res.data.data)
                    }
                })
            }
        }

    }, [open])

    useEffect(() => {
        if(initialValue > 0) setReviewScore(initialValue)
    }, [initialValue])


    const handleAddComment = () => {
        if(params) {
            setIsSaving(true);
            Object.assign(params, {score: reviewScore}, {comment: reviewComment})
            if(revPortal) {
                Object.assign(params, {sourceid: revPortal.id})
            }
            axios({
                url: GENERAL_SETTINGS.OREST_URL + '/surevportrans/ins/review',
                method: REQUEST_METHOD_CONST.POST,
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: params
            }).then(res => {
                setIsSaving(false)
                if(res.status === 200) {
                    typeof onClose === 'function' && onClose()
                    typeof handleAfterInsert === 'function' && handleAfterInsert()
                    enqueueSnackbar(t('str_processCompletedSuccessfully'), {variant: 'success'})
                } else {
                    const retErr = isErrorMsg(res)
                    enqueueSnackbar(t(retErr.errorMsg), {variant: 'success'})
                }
            })
        }
    }

    return(
        <React.Fragment>
            <Dialog
                open={open}
                fullWidth
                maxWidth={'sm'}
            >
                <DialogContent className={classes.dialogContent}>
                    <Grid container>
                        <Grid item xs={12}>
                            <Typography className={classes.title} color={'primary'}>{t('str_addReview')}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <div style={{textAlign: 'center'}}>
                                <Rating
                                    value={reviewScore}
                                    onChange={(e,value) => setReviewScore(value)}
                                    name="review"
                                    precision={0.5}
                                    size={'large'}
                                />
                            </div>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                onChange={e => setReviewComment(e.target.value)}
                                fullWidth
                                multiline
                                rows={4}
                                rowsMax={4}
                                variant={'outlined'}
                                label={t('str_comment')}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <div style={{paddingTop: '8px', textAlign: 'right'}}>
                                <Button
                                    disabled={isSaving}
                                    color={'primary'}
                                    variant={'outlined'}
                                    startIcon={<CloseIcon />}
                                    onClick={() => {
                                        if(reviewComment !== reviewDataBase.comment || reviewScore !== reviewDataBase.score) {
                                            setOpenTrackedDialog(true);
                                        } else {
                                            typeof onClose === 'function' && onClose()
                                        }
                                    }}
                                >
                                    {t('str_cancel')}
                                </Button>
                                {
                                    reviewScore <= 0 ? (
                                        <CustomToolTip
                                            title={
                                                <div>
                                                    <Typography style={{fontWeight: '600', fontSize: 'inherit'}}>
                                                        {t('str_invalidFields')}
                                                    </Typography>
                                                    {
                                                        reviewScore <= 0 ? (
                                                            <Typography style={{fontSize: 'inherit'}}>{t('str_score')}</Typography>
                                                        ) : null
                                                    }
                                                </div>
                                            }
                                        >
                                                <span>
                                                     <Button
                                                         disabled
                                                         style={{marginLeft: '8px'}}
                                                         variant={'contained'}
                                                         color={'primary'}
                                                         startIcon={ <CheckIcon />}
                                                     >
                                                           {t('str_save')}
                                                     </Button>
                                                </span>
                                        </CustomToolTip>
                                    ) : (
                                        <Button
                                            disabled={isSaving || reviewScore <= 0}
                                            style={{marginLeft: '8px'}}
                                            variant={'contained'}
                                            color={'primary'}
                                            startIcon={isSaving ? <LoadingSpinner size={24}/> : <CheckIcon />}
                                            onClick={handleAddComment}
                                        >
                                            {t('str_save')}
                                        </Button>
                                    )
                                }

                            </div>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
            <TrackedChangesDialog
                open={openTrackedDialog}
                onPressNo={(e) => setOpenTrackedDialog(e)}
                onPressYes={(e) => {
                    setOpenTrackedDialog(e);
                    setReviewScore(0)
                    setReviewComment('')
                    typeof onClose === 'function' && onClose()
                }}
            />
        </React.Fragment>

    )
}
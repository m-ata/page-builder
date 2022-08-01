import React, {useState} from 'react';
import {
    Dialog,
    Grid,
    Typography
} from "@material-ui/core";
import RaTagSelect from "../RaTagSelect";
import useTranslation from "../../lib/translations/hooks/useTranslation";
import {InsertRaTag, PatchRaTag} from "../../model/orest/components/RaTag";
import {useSnackbar} from "notistack";
import {isErrorMsg} from "../../model/orest/constants";
import AddDialogActions from "../AddDialogActions";
import TrackedChangesDialog from "../TrackedChangesDialog";

function AddRaTagDialog(props) {
    const { open, tableName, onClose, mid, token, orestUrl, hotelRefNo, raTagLabel, onSuccess, onError } = props;

    const { t } = useTranslation();
    const { enqueueSnackbar } = useSnackbar()

    const [selectedList, setSelectedList] = useState([]);
    const [selectedListBase, setSelectedListBase] = useState([]);
    const [raTagInfo, setRaTagInfo] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    //trackedDialog
    const [openTrackedDialog, setOpenTrackedDialog] = useState(false);


    const handleSave = () => {
        setIsSaving(true)
        if(raTagInfo) {
           PatchRaTag(orestUrl, token, raTagInfo?.gid, selectedList, hotelRefNo).then(r1 => {
               setIsSaving(false);
               if(r1.status === 200) {
                   enqueueSnackbar(t('str_processCompletedSuccessfully'), {variant: 'success'});
                   onClose();
                   onSuccess();
                   handleReset();
               } else {
                   const error = isErrorMsg(r1);
                   enqueueSnackbar(t(error.errorMsg), {variant: 'error'});
                   onError();
               }
           })
        } else {
            if(selectedList.length > 0) {
                InsertRaTag(orestUrl, token, mid, selectedList, hotelRefNo).then(r1 => {
                    setIsSaving(false)
                    if(r1.status === 200) {
                        enqueueSnackbar(t('str_processCompletedSuccessfully'), {variant: 'success'});
                        onClose();
                        onSuccess();
                        handleReset();
                    } else {
                        const error = isErrorMsg(r1);
                        enqueueSnackbar(t(error.errorMsg), {variant: 'error'});
                        onError();
                    }
                })
            }
        }
    }

    const handleOnClose = () => {
        if(JSON.stringify(selectedList) !== JSON.stringify(selectedListBase)) {
            setOpenTrackedDialog(true);
        } else {
            onClose();
            handleReset();
        }
    }

    const handleReset = () => {
        setSelectedList([]);
        setSelectedListBase([]);
    }

    return(
        <React.Fragment>
            <Dialog open={open} fullWidth maxWidth={'sm'}>
                <div style={{padding: '16px'}}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography style={{fontWeight: 600, fontSize: 24}}>{raTagInfo ? t('str_editTag') : t('str_addTag')}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <RaTagSelect
                                value={selectedList}
                                onChange={(event, newValue) => {
                                    setSelectedList(newValue)
                                }}
                                onLoad={(raTagInfo, tagList) => {
                                    setSelectedList(tagList);
                                    setSelectedListBase(tagList)
                                    setRaTagInfo(raTagInfo);
                                }}
                                disabled={isSaving}
                                mid={mid}
                                tableName={tableName}
                                label={raTagLabel}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <AddDialogActions
                                align={'right'}
                                loading={isSaving}
                                disabled={isSaving}
                                disabledSave={selectedList.length <= 0}
                                showToolTip
                                toolTipTitle={
                                    <div>
                                        <Typography style={{fontWeight: '600', fontSize: 'inherit'}}>
                                            {t('str_invalidFields')}
                                        </Typography>
                                        {
                                            selectedList.length <= 0 && (
                                                <Typography style={{fontSize: 'inherit'}}>
                                                    {t('str_label')}
                                                </Typography>
                                            )
                                        }
                                    </div>
                                }
                                onCancelClick={handleOnClose}
                                onSaveClick={handleSave}
                                cancelButtonLabel={t('str_cancel')}
                                saveButtonLabel={t('str_save')}
                            />
                        </Grid>
                    </Grid>
                </div>
            </Dialog>
            <TrackedChangesDialog
                open={openTrackedDialog}
                onPressNo={(e) => {
                    setOpenTrackedDialog(e)
                }}
                onPressYes={(e) => {
                    setOpenTrackedDialog(e)
                    onClose()
                    setTimeout(() => {
                        handleReset()
                    }, 50)
                }}
            />
        </React.Fragment>
    )
}

export default AddRaTagDialog;
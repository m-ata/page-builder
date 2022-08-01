import React, {useEffect, useState} from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from "@material-ui/core/Button";
import {makeStyles} from '@material-ui/core/styles';
import {COLORS} from "../../../constants";

const useStyles = makeStyles(theme => ({
    actionButton: {
        marginLeft: theme.spacing(1),
        borderRadius: 20,
    }
}));

const Alert = (props) => {

    const { handleAlert, alertType } = props;
    const [dialogContent, setDialogContent] = useState('');
    const [openModal, setOpenModal] = useState(true);
    const cls = useStyles();

    useEffect(() => {
        if(alertType === 'section' ) {
            setDialogContent('It will delete the section you added previously. Are you sure, you want to proceed ?');
        }
        if(alertType === 'component') {
            setDialogContent('It will delete the section component you added previously. Are you sure, you want to proceed ?')
        }
    }, [alertType]);

    const handleCancel = () => {
        setOpenModal(false);
        handleAlert(false);
    }

    const handleSave = () => {
        setOpenModal(false);
        handleAlert(true);
    }

    return(
        <Dialog disableBackdropClick disableEnforceFocus open={openModal}
                onClose={handleCancel} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title" color="secondary"> Alert
                <hr/>
            </DialogTitle>
            <DialogContent>
                {dialogContent}
            </DialogContent>
            <DialogActions>
                <Button
                    className={cls.actionButton}
                    onClick={handleCancel}
                    variant="contained"
                    size="small"
                    aria-label="add"
                >
                    No
                </Button>
                <Button
                    onClick={handleSave}
                    className={cls.actionButton}
                    variant="contained"
                    size="small"
                    aria-label="add"
                    color="primary"
                    // disabled={isApply ? false : true}
                >
                    Yes
                </Button>
            </DialogActions>
        </Dialog>
    )
}
export default Alert;
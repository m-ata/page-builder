import React, {useState} from 'react';
//material imports
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import WarningIcon from '@material-ui/icons/Warning';

const AlertDialog = (props) => {

    const { handleDelete } = props;
    const [openModal, setOpenModal] = useState(true);

    const handleCancel = () => {
        setOpenModal(false);
        handleDelete(false);
    }

    const handleApply = () => {
        handleDelete(true);
        setOpenModal(false);
    }

    return(
        <Dialog disableBackdropClick disableEnforceFocus fullWidth={true} maxWidth="md" open={openModal}
                onClose={handleCancel} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title" color="secondary">
                <WarningIcon style={{color: '#ffcc00', marginTop: -8}} /> Alert
                <hr />
            </DialogTitle>
            <DialogContent style={{marginTop: -24, fontSize: 20}}>
                Do you want to delete the slider ?
                <hr />
            </DialogContent>
            <DialogActions>
                <Button
                    style={{borderRadius: 20}}
                    onClick={handleCancel}
                    variant="contained"
                    size="small"
                    aria-label="add"
                >
                    No
                </Button>
                <Button
                    onClick={handleApply}
                    style={{borderRadius: 20}}
                    variant="contained"
                    size="small"
                    aria-label="add"
                    color="primary"
                >
                    Yes
                </Button>
            </DialogActions>
        </Dialog>
    )
}
export default AlertDialog;
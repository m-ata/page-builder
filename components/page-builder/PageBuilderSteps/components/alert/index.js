import React, {useState, useEffect} from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@material-ui/core";
import WarningIcon from '@material-ui/icons/Warning';

const Index = (props) => {

    const {handleDelete, alertDialogType} = props
    const [openModal, setOpenModal] = useState(true);
    const [dialogContent, setDialogContent] = useState('');

    useEffect(() => {
        switch (alertDialogType) {
            case 'webPage':
                setDialogContent('Do you want to delete this web page ?');
                break;
            case 'website':
                setDialogContent('Do you want to delete this website ?');
                break;
            case 'email':
                setDialogContent('Do you want to delete this email ?');
                break;
            case 'section':
                setDialogContent('Do you want to delete this section ?');
                break;
            case 'header':
                setDialogContent('Do you want to delete this header ?');
                break;
            case 'footer':
                setDialogContent('Do you want to delete this footer ?');
                break;
            case 'footerOnly':
                setDialogContent('Do you want to perform this action ?');
                break;
            case 'qa':
                setDialogContent('Do you want to delete this question ?');
                break;
            case 'cat':
                setDialogContent('Do you want to delete this category ?');
                break;
            case 'footerOnly':
                setDialogContent('Do you want to perform this action ?');
                break;
            default:
                setDialogContent('');
        }
    }, [alertDialogType]);

    const handleCancel = () => {
        setOpenModal(false);
        handleDelete(alertDialogType, false);
    }

    const handleApply = () => {
        handleDelete(alertDialogType, true);
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
                {
                    dialogContent
                }
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

export {Index as AlertDialog}
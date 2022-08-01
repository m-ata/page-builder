import React from 'react'
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import LoadingSpinner from "../LoadingSpinner";
import DialogActions from "@material-ui/core/DialogActions";
import AddDialogActions from "../AddDialogActions";
import Dialog from "@material-ui/core/Dialog";
import PropTypes from "prop-types";


function DataFormDialog (props) {

    const {open, fullWidth, maxWidth, loadingDialog, title, render, onClose, loadingAction, disabledActions, disabledSave, toolTipTitle, onCancelClick, onSaveClick, actionAlign, cancelButtonLabel, saveButtonLabel, showToolTip} = props


    return(
        <Dialog
            fullWidth={fullWidth}
            maxWidth={maxWidth || 'md'}
            open={open}
            onClose={typeof onClose === 'function' ? onClose() : () => {}}
            aria-labelledby="new-dialog"
            aria-describedby="new-dialog"
        >
            <DialogTitle id="dialog-title">{title || ''}</DialogTitle>
            <DialogContent dividers>
                {loadingDialog ? <LoadingSpinner /> : render}
            </DialogContent>
            <DialogActions>
                <AddDialogActions
                    showToolTip={showToolTip}
                    align={actionAlign}
                    loading={loadingAction}
                    disabled={disabledActions}
                    disabledSave={disabledSave}
                    toolTipTitle={toolTipTitle}
                    cancelButtonLabel={cancelButtonLabel}
                    saveButtonLabel={saveButtonLabel}
                    onCancelClick={() => typeof onCancelClick === 'function' && onCancelClick()}
                    onSaveClick={() => typeof onSaveClick === 'function' && onSaveClick()}
                />
            </DialogActions>
        </Dialog>
    )
}

export default DataFormDialog;

DataFormDialog.propTypes = {
    open: PropTypes.bool,
    title: PropTypes.string,
    render: PropTypes.any,
    onClose: PropTypes.func,
    actionAlign: PropTypes.string,
    loadingDialog: PropTypes.bool,
    loadingAction: PropTypes.bool,
    disabledActions: PropTypes.bool,
    disabledSave: PropTypes.bool,
    showToolTip: PropTypes.bool,
    toolTipTitle: PropTypes.any,
    cancelButtonLabel: PropTypes.string,
    saveButtonLabel: PropTypes.string,
    onCancelClick: PropTypes.func,
    onSaveClick: PropTypes.func,
    fullWidth: PropTypes.bool,
    maxWidth: PropTypes.string
}
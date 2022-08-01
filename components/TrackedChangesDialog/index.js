import React from "react";
import {
    Button,
    Dialog,
    Grid,
    Typography,
} from '@material-ui/core'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import useTranslation from "../../lib/translations/hooks/useTranslation";
import PropTypes from 'prop-types'
import * as global from "../../@webcms-globals";

import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'

function TrackedChangesDialog(props) {

    const { open, onPressNo, labelNo, onPressYes, labelYes, dialogTitle, dialogDesc, isContainedNo, disabled } = props;
    const { t } = useTranslation();

    const handlePressNo = () => {
        onPressNo(global.base.isFalse)
    }

    const handlePressYes = () => {
        onPressYes(global.base.isFalse)
    }

    return(
        <Dialog
            open={open}
            maxWidth="xs"
            fullWidth
            disableEnforceFocus
            disableBackdropClick
            disableEscapeKeyDown
        >
            <DialogContent style={{padding: '16px'}}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography style={{fontSize: '18px', fontWeight: 'bold'}}>{dialogTitle || t('str_trackedChangesTitle')}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                        <HelpOutlineIcon color="primary" style={{width: '3em', height: '3em'}}/>
                    </Grid>
                    <Grid item xs={9}>
                        <Grid container alignItems="center" spacing={4}>
                            <Grid item xs={12}>
                                <Typography>{dialogDesc || t('str_trackedChangesContent')}</Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                <DialogActions style={{marginTop: '24px'}}>
                    <Button
                        disabled={disabled}
                        variant={'contained'}
                        color='primary'
                        style={{marginRight: '8px'}}
                        onClick={handlePressYes}
                    >
                        {labelYes || t('str_yes')}
                    </Button>
                    <Button
                        disabled={disabled}
                        variant={isContainedNo ? 'contained' : 'text'}
                        color='primary'
                        onClick={handlePressNo}
                    >
                        {labelNo || t('str_no')}
                    </Button>
                </DialogActions>
            </DialogContent>
        </Dialog>
    );
}

export default TrackedChangesDialog;


TrackedChangesDialog.defaultProps = {
    open: false,
    isContainedNo: true
}


TrackedChangesDialog.propTypes = {
    open: PropTypes.bool,
    onPressNo: PropTypes.func,
    onPressYes: PropTypes.func,
    dialogTitle: PropTypes.string,
    dialogDesc: PropTypes.any,
    isContainedNo: PropTypes.bool

}
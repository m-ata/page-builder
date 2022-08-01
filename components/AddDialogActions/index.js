import React from 'react';
import {
    Button
} from "@material-ui/core";
import CheckIcon from "@material-ui/icons/Check";
import CloseIcon from "@material-ui/icons/Close";
import LoadingSpinner from "../LoadingSpinner";
import useTranslation from "../../lib/translations/hooks/useTranslation";
import {CustomToolTip} from "../user-portal/components/CustomToolTip/CustomToolTip";
import PropTypes from "prop-types";


function AddDialogActions(props) {
    const { cancelButtonLabel, saveButtonLabel, onCancelClick, onSaveClick, loading, align, disabled, disabledSave, showToolTip, toolTipTitle} = props;
    const { t } = useTranslation();

    const handleOnCancelClick = () => {
        typeof onCancelClick === 'function' && onCancelClick()
    }

    const handleOnSaveClick = () => {
        typeof onSaveClick === 'function' && onSaveClick()
    }

    return(
        <div style={{textAlign: align}}>
            <Button
                disabled={disabled}
                startIcon={<CloseIcon />}
                color={'primary'}
                variant={'outlined'}
                onClick={handleOnCancelClick}
            >
                {cancelButtonLabel || t('str_cancel')}
            </Button>
            {
                showToolTip && disabledSave && !loading ? (
                    <CustomToolTip title={toolTipTitle}>
                        <span>
                            <Button
                                disabled
                                style={{marginLeft: '8px'}}
                                startIcon={<CheckIcon />}
                                color={'primary'}
                                variant={'contained'}
                            >
                                {saveButtonLabel || t('str_save')}
                            </Button>
                        </span>
                    </CustomToolTip>
                ) : (
                    <Button
                        disabled={disabled || disabledSave}
                        style={{marginLeft: '8px'}}
                        startIcon={loading ? <LoadingSpinner size={20}/> : <CheckIcon />}
                        color={'primary'}
                        variant={'contained'}
                        onClick={handleOnSaveClick}
                    >
                        {saveButtonLabel || t('str_save')}
                    </Button>
                )
            }

        </div>
    )
}

export default AddDialogActions;

AddDialogActions.defaultProps = {
    align: 'right',
    loading: false,
    disabledSave: false,
    showToolTip: true,
    toolTipTitle: 'cant save'
}

AddDialogActions.propTypes = {
    align: PropTypes.string,
    loading: PropTypes.bool,
    disabledSave: PropTypes.bool,
    showToolTip: PropTypes.bool,
    toolTipTitle: PropTypes.any,
    cancelButtonLabel: PropTypes.string,
    saveButtonLabel: PropTypes.string,
    onCancelClick: PropTypes.func,
    onSaveClick: PropTypes.func

}
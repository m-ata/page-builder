import React from 'react'
import { connect,  } from 'react-redux'
import { setToState, updateState } from 'state/actions'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import useTranslation from 'lib/translations/hooks/useTranslation'
import FaqCommon from "./FaqCommon";


const DialogFaq = (props) => {
    const { open, onClose, state, setToState } = props
    const { t } = useTranslation()

    return (
        <Dialog open={open} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">{t('str_faqLong')}</DialogTitle>
            <DialogContent dividers>
               <FaqCommon />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose()} color="primary">
                    {t('str_close')}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(DialogFaq)

import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from '@material-ui/core'
import SignatureCanvas from 'react-signature-canvas'
import useTranslation from 'lib/translations/hooks/useTranslation'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'

const SignaturePad = (props) => {

    const { t } = useTranslation()
    const {onSave } = props
    const [open, setOpen] = useState(false)
    const [trimmedDataURL, setTrimmedDataURL] = useState(null)
    const [sigPad, setSigPad] = useState({})

    useEffect(() => {
        if(typeof onSave === "function"){
            onSave(trimmedDataURL);
        }
    }, [trimmedDataURL])

    const handleClear = () => {
        sigPad.clear()
    }

    const handleSave = () => {
        setTrimmedDataURL(sigPad.getTrimmedCanvas().toDataURL('image/png'))
        handleClose()
    }

    const handleClickOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    return (
        <React.Fragment>
            <div style={{ margin: 7, textAlign: 'center' }}>
                <Button startIcon={<EditIcon />} variant="outlined" color="primary" onClick={handleClickOpen}>
                    {t('str_sign')}
                </Button>
                <Dialog open={open} onClose={()=>handleClose()} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">{t('str_sign')}</DialogTitle>
                    <DialogContent>
                        <div>
                            <div>
                                <SignatureCanvas ref={(ref) => setSigPad(ref)} penColor='black' canvasProps={{width: 500, height: 200, style: {border: '1px dashed #2196F3'}, className: 'sigCanvas'}}  />
                            </div>
                            <div>
                                <Button variant="contained" startIcon={<DeleteIcon />} color="primary" disableElevation onClick={() => handleClear()}>
                                    {t('str_clear')}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={()=>handleClose()} color="primary">
                            {t('str_close')}
                        </Button>
                        <Button onClick={()=> handleSave()} color="primary">
                            {t('str_save')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </React.Fragment>
    )
}

SignaturePad.propTypes = {
    onSave: PropTypes.func,
}

export default SignaturePad

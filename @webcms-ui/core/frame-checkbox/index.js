import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
    FormControl,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip,
    Button,
} from '@material-ui/core'
import LoadingSpinner from 'components/LoadingSpinner'
import useTranslation from 'lib/translations/hooks/useTranslation'

const FrameCheckbox = (props) => {
    const { t } = useTranslation()
    let {
        disabled,
        required,
        isError,
        isCheck,
        value,
        ifamePageUrl,
        title,
        linkText,
        linkTextADesc,
        acceptButtonText,
        cancelButtonText,
        fontSize,
        variant,
        checkboxColor,
        linkColor
    } = props

    const [isIframeLoaded, setIsIframeLoaded] = useState(false)
    const [openModal, setOpenModal] = useState(false)
    const [isAccept, setIsAccept] = useState(value)

    const handleIframeOnLoad = () => {
        setIsIframeLoaded(true)
    }

    const handleOpenModal = () => {
        setOpenModal(true)
    }

    const handleCloseModal = () => {
        setOpenModal(false)
    }

    const handleCheckBox = (value, newValue) => {
        if (typeof newValue !== 'undefined') {
            setIsAccept(newValue)
        }
    }

    useEffect(() => {
        if (typeof isCheck === 'function' && typeof isAccept !== 'undefined') {
            isCheck(isAccept)
        }
    }, [isAccept])

    useEffect(() => {
        setIsAccept(value)
    }, [value])

    return (
        <React.Fragment>
            <FormControl required={required} error={isError} component="fieldset">
                <FormGroup row>
                    <FormControlLabel
                        disabled={disabled}
                        control={
                            <Checkbox
                                color={"primary"}
                                checked={isAccept}
                                onClick={() => handleCheckBox(isAccept, isAccept ? false : true)}
                            />
                        }
                        label={
                            <Typography variant={variant} style={{ fontSize: fontSize }}>
                                {t(linkText, {
                                    link: (
                                        <a
                                            onClick={() => handleOpenModal()}
                                            style={{
                                                textDecoration: 'underline',
                                                fontWeight: 'bold',
                                                color: linkColor ? linkColor : '#198C9B',
                                            }}
                                        >
                                            {' '}
                                            {t(linkTextADesc)}
                                        </a>
                                    ),
                                })}
                                {required && (<div style={{color:'red', display: 'inline-block'}}>*</div>)}
                            </Typography>
                        }
                    />
                </FormGroup>
            </FormControl>
            <Dialog
                open={openModal}
                onClose={()=> handleCloseModal()}
                scroll={'paper'}
                fullWidth
                maxWidth={'md'}
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
            >
                <DialogTitle id="scroll-dialog-title">{title ? t(title).toUpperCase() : ''}</DialogTitle>
                <DialogContent dividers={true}>
                    {!isIframeLoaded && <LoadingSpinner />}
                    <iframe
                        src={ifamePageUrl}
                        onLoad={()=> handleIframeOnLoad()}
                        style={{ width: '100%', height: '100%', margin: 0, border: 0, minHeight: '50vh' }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        color="primary"
                        onClick={() => {
                            handleCheckBox(isAccept, false)
                            handleCloseModal()
                            setIsIframeLoaded(false)
                        }}
                    >
                        {t(cancelButtonText)}
                    </Button>
                    <Button
                        variant={'contained'}
                        color="primary"
                        disabled={!isIframeLoaded}
                        onClick={() => {
                            handleCheckBox(isAccept, true)
                            handleCloseModal()
                            setIsIframeLoaded(false)
                        }}
                    >
                        {t(acceptButtonText)}
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    )
}

FrameCheckbox.defaultProps = {
    required: false,
    isError: false,
    value: false,
    ifamePageUrl: '',
    title: '',
    linkText: '',
    linkTextIn: '',
    acceptButtonText: 'str_iAccept',
    cancelButtonText: 'str_close',
    disabled: false,
    fontSize: '1rem',
    variant: 'subtitle2'
}

FrameCheckbox.propTypes = {
    required: PropTypes.bool,
    isError: PropTypes.bool,
    value: PropTypes.bool,
    isCheck: PropTypes.func,
    ifamePageUrl: PropTypes.string,
    title: PropTypes.string,
    linkText: PropTypes.string,
    linkTextADesc: PropTypes.string,
    acceptButtonText: PropTypes.string,
    cancelButtonText: PropTypes.string,
    disabled: PropTypes.bool,
    fontSize: PropTypes.string,
    variant: PropTypes.string,
}

export default FrameCheckbox

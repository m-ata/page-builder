import React, { useState, useContext } from 'react'
import { UseOrest } from '@webcms/orest'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogTitle from '@material-ui/core/DialogTitle'
import useTranslation from 'lib/translations/hooks/useTranslation'
import WebCmsGlobal from 'components/webcms-global'
import Grid from '@material-ui/core/Grid'
import useNotifications from 'model/notification/useNotifications'
import IconButton from '@material-ui/core/IconButton'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import InputAdornment from '@material-ui/core/InputAdornment'
import FormControl from '@material-ui/core/FormControl'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import Container from '@material-ui/core/Container'
import LockIcon from '@material-ui/icons/Lock'
import { Typography } from '@material-ui/core'
import { useSnackbar } from 'notistack'

const ChangePassword = (props) => {
    //props
    const {
        textClassName,
        textFieldClassName,
        dialogButtonClassName,
        disabled,
        align,
        buttonVisible,
        dialogOpen,
        onClose
    } = props

    const { enqueueSnackbar } = useSnackbar()

    //context
    const { t } = useTranslation()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    //redux
    const token = useSelector((state) => state?.orest?.currentUser?.auth?.access_token || false)
    const clientBase = useSelector((state) => state?.orest?.state?.client || false)
    const loginfo = useSelector((state) => state?.orest?.currentUser?.loginfo || false)
    const isClient = loginfo.roletype === '6500310'

    //state
    const [open, setOpen] = useState(false)

    const handleClickOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)

        if(typeof onClose === "function"){
            onClose(false)
        }

        setValues({ password: '' }, { passwordrepeat: '' })
    }

    const [values, setValues] = useState({
        password: '',
        showPassword: false,
        passwordrepeat: '',
        showPasswordRepeat: false,
    })

    const handleChange = (prop) => (event) => {
        setValues({ ...values, [prop]: event.target.value })
    }

    const handleClickShowPassword = (name) => {
        setValues({ ...values, [name]: !values[name] })
    }

    const handleMouseDownPassword = (event) => {
        event.preventDefault()
    }

    const handleSave = () => {
        if (!values.password && !values.passwordrepeat) {
            enqueueSnackbar(t('str_pleaseCheckMandatoryFields'), { variant: 'warning' })
        } else if (values.password !== values.passwordrepeat) {
            enqueueSnackbar(t('str_wrongMatchPassword'), { variant: 'error' })
        } else {
            UseOrest({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: 'tools/user/password',
                method: 'put',
                token: token,
                params: {
                    email: isClient ? clientBase?.email : loginfo?.email,
                    pass: values.password,
                    sendmsg: false,
                },
            }).then((response) => {
                if (response.status === 200) {
                    enqueueSnackbar(t('str_yourRequestHasBeenSaved'), { variant: 'success' })
                    handleClose()
                } else {
                    enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'error' })
                    handleClose()
                }
            })
        }
    }

    return (
        <React.Fragment>
            {buttonVisible ?
                <div style={{ padding: 7, textAlign: align ? align : 'center' }}>
                    <Button className={dialogButtonClassName || null} color={'primary'} startIcon={<LockIcon />} variant='outlined' onClick={handleClickOpen} disabled={disabled}>
                        {t('str_changePassword')}
                    </Button>
                </div> : null}
            <Dialog open={dialogOpen || open} onClose={handleClose} maxWidth={'xs'} aria-labelledby='form-dialog-title'>
                <DialogTitle id='form-dialog-title'>{t('str_changePassword')}</DialogTitle>
                <Container maxWidth='xs' style={{ paddingBottom: '16px' }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography className={textClassName || null}>{`${t('str_newPassword')}*`}</Typography>
                            <FormControl className={textFieldClassName || null} variant='outlined' fullWidth={true} required>
                                <OutlinedInput
                                    id='outlined-adornment-password'
                                    type={values.showPassword ? 'text' : 'password'}
                                    value={values.password}
                                    onChange={handleChange('password')}
                                    endAdornment={
                                        <InputAdornment position='end'>
                                            <IconButton
                                                aria-label='toggle password visibility'
                                                onClick={() => handleClickShowPassword('showPassword')}
                                                onMouseDown={e => handleMouseDownPassword(e)}
                                                edge='end'
                                            >
                                                {
                                                    values.showPassword ?
                                                        <Visibility color={'primary'}/>
                                                        :
                                                        <VisibilityOff />
                                                }
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography className={textClassName || null}>{`${t('str_newPassword')}(${t('str_repeat')})*`}</Typography>
                            <FormControl className={textFieldClassName || null} variant='outlined' fullWidth={true} required>
                                <OutlinedInput
                                    id='outlined-adornment-password'
                                    type={values.showPasswordRepeat ? 'text' : 'password'}
                                    value={values.passwordrepeat}
                                    onChange={handleChange('passwordrepeat')}
                                    endAdornment={
                                        <InputAdornment position='end'>
                                            <IconButton
                                                aria-label='toggle password visibility'
                                                onClick={() => handleClickShowPassword('showPasswordRepeat')}
                                                onMouseDown={e => handleMouseDownPassword(e)}
                                                edge='end'
                                            >
                                                {
                                                    values.showPasswordRepeat ?
                                                        <Visibility color={'primary'}/>
                                                        :
                                                        <VisibilityOff />
                                                }
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <DialogActions style={{ padding: '0' }}>
                                <Button color={'primary'} variant={'outlined'} onClick={handleClose}>
                                    {t('str_close')}
                                </Button>
                                <Button
                                    disabled={values.password?.length <= 0 || values.passwordrepeat?.length <= 0}
                                    variant={'contained'}
                                    color={'primary'}
                                    onClick={handleSave}
                                >
                                    {t('str_save')}
                                </Button>
                            </DialogActions>
                        </Grid>
                    </Grid>
                </Container>
            </Dialog>
        </React.Fragment>
    )
}

ChangePassword.defaultProps = {
    dialogButtonClassName: null,
    textClassName: null,
    textFieldClassName: null,
    closeButtonClassName: null,
    saveButtonClassName: null,
    visibilityIconColor: '',
    buttonVisible: true,
    dialogOpen: false
}

ChangePassword.propTypes = {
    dialogButtonClassName: PropTypes.string,
    textClassName: PropTypes.string,
    textFieldClassName: PropTypes.string,
    closeButtonClassName: PropTypes.string,
    saveButtonClassName: PropTypes.string,
    visibilityIconColor: PropTypes.string,
    buttonVisible: PropTypes.bool,
    dialogOpen: PropTypes.bool
}

export default ChangePassword

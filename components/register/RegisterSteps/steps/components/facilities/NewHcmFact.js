import React, { useContext, useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useRouter } from 'next/router'
import { pushToState, setToState, updateState } from 'state/actions'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import AddIcon from '@material-ui/icons/AddCircle'
import useNotifications from 'model/notification/useNotifications'
import Grid from '@material-ui/core/Grid'
import { isErrorMsg, OREST_ENDPOINT } from 'model/orest/constants'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import { Insert, ViewList } from '@webcms/orest'
import WebCmsGlobal from 'components/webcms-global'
import useTranslation from '../../../../../../lib/translations/hooks/useTranslation'

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        height: '100%',
        maxHeight: '365px',
    },
    formControl: {
        minWidth: '100%',
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
    extendedIcon: {
        marginRight: theme.spacing(1),
    },
}))

const NewHcmFact = (props) => {
    const { t } = useTranslation()
    const cls = useStyles()
    const { setToState, state, groupIndex, categoryID } = props
    const { showSuccess, showError } = useNotifications()
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const [factName, setFactName] = useState('')
    const [sectionID, setSectionID] = useState(0)
    const [open, setOpen] = useState(false)
    const [isAdding, setIsAdding] = useState(false)
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    useEffect(() => {
        if (!state.hcmFactSec.length > 0) {
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMSEC,
                token: token,
                params: {
                    query: 'isfact:true',
                    allhotels: true,
                },
            }).then((r) => {
                if (r.status === 200) {
                    setToState('registerStepper', ['hcmFactSec'], r.data.data)
                }
            })
        }
    }, [])

    const handleClickOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const handleFactName = (event) => {
        setFactName(event.target.value)
    }

    const handleSecID = (event) => {
        setSectionID(event.target.value)
    }

    const handleSave = () => {
        setIsAdding(true)
        Insert({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.HCMFACT,
            token: token,
            data: {
                code: factName,
                description: factName,
                catid: categoryID,
                secid: sectionID,
                isactive: true,
                hotelrefno: Number(companyId),
            },
        }).then((r1) => {
            if (r1.status === 200) {
                ViewList({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.HCMFACT,
                    token: token,
                    params: {
                        query: `catid::${categoryID}`,
                        allhotels: true,
                    },
                }).then((r2) => {
                    if (r2.status === 200) {
                        setToState(
                            'registerStepper',
                            ['hcmFacilities', String(groupIndex), 'hcmFactCategoryItems'],
                            r2.data.data
                        )
                    }
                })
                handleClose()
                setSectionID(0)
                setFactName('')
                showSuccess('New item added!')
                setIsAdding(false)
            } else {
                setIsAdding(false)
                const retErr = isErrorMsg(r1)
                showError(retErr.errorMsg)
            }
        })
    }

    return (
        <React.Fragment>
            <Tooltip style={{ verticalAlign: 'super', marginRight: 4 }} title="New Hcm Item">
                <span>
                    <IconButton size={'small'} onClick={handleClickOpen}>
                        <AddIcon fontSize={'default'} />
                    </IconButton>
                </span>
            </Tooltip>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">{t('str_addNewFact')}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={1} style={{ width: 380 }}>
                        <Grid item xs={12}>
                            <FormControl margin="dense" className={cls.formControl}>
                                <InputLabel id="hcmFactSection-label">{t('str_section')}</InputLabel>
                                <Select
                                    labelId="hcmFactSection-label"
                                    id="hcmFactSection-select"
                                    onChange={handleSecID}
                                    value={sectionID}
                                >
                                    <MenuItem value={0}>Choose a section</MenuItem>
                                    {state.hcmFactSec &&
                                        state.hcmFactSec.map((hcmFactSecItem, ind) => {
                                            return (
                                                <MenuItem key={hcmFactSecItem.id} value={hcmFactSecItem.id}>
                                                    {hcmFactSecItem.description}
                                                </MenuItem>
                                            )
                                        })}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                margin="dense"
                                name="name"
                                label="Fact Name"
                                type="text"
                                fullWidth
                                value={factName}
                                onChange={handleFactName}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        {t('str_cancel')}
                    </Button>
                    <Button onClick={handleSave} disabled={isAdding} color="primary">
                        {t('str_save')}
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.registerStepper,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    pushToState: (stateType, stateName, value) => dispatch(pushToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(NewHcmFact)

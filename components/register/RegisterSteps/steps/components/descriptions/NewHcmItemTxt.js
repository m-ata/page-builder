import React, { useContext, useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useRouter } from 'next/router'
import { pushToState, setToState, updateState } from 'state/actions'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import useNotifications from '../../../../../../model/notification/useNotifications'
import Grid from '@material-ui/core/Grid'
import { isErrorMsg, OREST_ENDPOINT } from '../../../../../../model/orest/constants'
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

const NewHcmItemTxt = (props) => {
    const { t } = useTranslation()
    const cls = useStyles()
    const { setToState, pushToState, state, hcmItemID, useCallBack, open, onClose } = props
    const { showSuccess, showError } = useNotifications()
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const [categoryID, setCategoryID] = useState(0)
    const [languageID, setLanguageID] = useState(0)
    const [isAdding, setIsAdding] = useState(false)
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const TXTYPE = '0000205'

    useEffect(() => {
        if (!state.hcmCategory.length > 0) {
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMCAT,
                token: token,
                params: {
                    query: 'istxt:true',
                    allhotels: true,
                },
            })
                .then((r) => {
                    if (r.status === 200) {
                        setToState('registerStepper', ['hcmCategory'], r.data.data)
                    }
                })
                .then(() => {
                    if (!state.languages.length > 0) {
                        ViewList({
                            apiUrl: GENERAL_SETTINGS.OREST_URL,
                            endpoint: OREST_ENDPOINT.RALANG,
                            token: token,
                            params: {
                                sort: 'id',
                            },
                        }).then((r) => {
                            if (r.status === 200) {
                                setToState('registerStepper', ['languages'], r.data.data)
                            }
                        })
                    }
                })
        }
    }, [])

    const handleCategorySelect = (event) => {
        setCategoryID(event.target.value)
    }

    const handleLanguageSelect = (event) => {
        setLanguageID(event.target.value)
    }

    const handleSave = () => {
        setIsAdding(true)
        Insert({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.HCMITEMTXT,
            token: token,
            data: {
                itemid: hcmItemID,
                catid: categoryID,
                langid: languageID,
                txttype: Number(TXTYPE),
                hotelrefno: Number(companyId),
            },
        }).then((hcmItemTxtResponse) => {
            if (hcmItemTxtResponse.status === 200) {
                useCallBack()
                setIsAdding(false)
                onClose(false)
                setCategoryID(0)
                setLanguageID(0)
                showSuccess('Category added successfully')
            }
        })
    }

    return (
        <React.Fragment>
            <Dialog open={open} onClose={()=> onClose(false)} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Add New Category</DialogTitle>
                <DialogContent>
                    <Grid container spacing={1} style={{ width: 380 }}>
                        <Grid item xs={12}>
                            <FormControl className={cls.formControl}>
                                <InputLabel id="hcmCategory-label">Category</InputLabel>
                                <Select
                                    labelId="hcmCategory-label"
                                    id="hcmCategory-select"
                                    onChange={handleCategorySelect}
                                    value={categoryID}
                                >
                                    <MenuItem value={0}>Choose a category</MenuItem>
                                    {state.hcmCategory &&
                                        state.hcmCategory.map((hcmCategoryItem, ind) => {
                                            return (
                                                <MenuItem key={hcmCategoryItem.id} value={hcmCategoryItem.id}>
                                                    {hcmCategoryItem.description}
                                                </MenuItem>
                                            )
                                        })}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl className={cls.formControl}>
                                <InputLabel id="languages-label">Language</InputLabel>
                                <Select
                                    labelId="languages-label"
                                    id="languages"
                                    onChange={handleLanguageSelect}
                                    value={languageID}
                                >
                                    <MenuItem value={0}>Choose a language</MenuItem>
                                    {state.languages &&
                                        state.languages.map((languageItem, ind) => {
                                            return (
                                                <MenuItem key={languageItem.id} value={languageItem.id}>
                                                    {languageItem.longdesc}
                                                </MenuItem>
                                            )
                                        })}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={()=> onClose(false)} color="primary">
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

export default connect(mapStateToProps, mapDispatchToProps)(NewHcmItemTxt)

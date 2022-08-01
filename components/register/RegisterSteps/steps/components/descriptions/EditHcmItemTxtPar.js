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
import { isErrorMsg, OREST_ENDPOINT } from 'model/orest/constants'
import { UseOrest, Patch, ViewList } from '@webcms/orest'
import WebCmsGlobal from 'components/webcms-global'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import Grid from '@material-ui/core/Grid'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { useSnackbar } from 'notistack'
import dynamic from 'next/dynamic'

const FroalaEditor = dynamic(
    async () => {
        const values = await Promise.all([
            import('react-froala-wysiwyg'),
            import('froala-editor/js/plugins.pkgd.min'),
            import('froala-editor/js/froala_editor.min'),
            import('froala-editor/js/froala_editor.pkgd.min'),
        ])
        return values[0]
    },
    {
        loading: () => <p>LOADING!!!</p>,
        ssr: false,
    }
)

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        height: '100%',
        maxHeight: '365px',
    },
    dialogForm: {
        maxWidth: 365,
    },
    formControl: {
        width: '100%',
    },
    extendedIcon: {
        marginRight: theme.spacing(1),
    },
}))

const NewHcmItemTxtPar = (props) => {
    const { t } = useTranslation()
    const cls = useStyles()
    const { setToState, state, groupIndex, itemIndex, onClose, open } = props
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const [sectionID, setSectionID] = useState(state.hcmItemTxt[groupIndex].hcmItemTxtPar[itemIndex].secid)
    const [title, setTitle] = useState(state.hcmItemTxt[groupIndex].hcmItemTxtPar[itemIndex].title)
    const [description, setDescription] = useState(state.hcmItemTxt[groupIndex].hcmItemTxtPar[itemIndex].itemtext)
    const [maxChar, setMaxChar] = useState(0)
    const [minChar, setMinChar] = useState(0)
    const [descLength, setDescLength] = useState(0)
    const [isAdding, setIsAdding] = useState(false)
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { enqueueSnackbar } = useSnackbar()

    const config = {
        placeholderText: 'Edit Your Content Here!',
        charCounterCount: true,
        key: 'YNB3fJ3B7A7C6D6E3A-9UJHAEFZMUJOYGYQEa1c1ZJg1RAeF5C4C3D3E2C2C6D6D4B3==',
        heightMin: 250,
        pluginsEnabled: [
            'align',
            'charCounter',
            'codeBeautifier',
            'codeView',
            'colors',
            'draggable',
            'embedly',
            'emoticons',
            'entities',
            'file',
            'fontFamily',
            'fontSize',
            'fullscreen',
            'image',
            'imageManager',
            'inlineStyle',
            'lineBreaker',
            'link',
            'lists',
            'paragraphFormat',
            'paragraphStyle',
            'quickInsert',
            'quote',
            'save',
            'table',
            'url',
            'video',
            'wordPaste',
        ],
        toolbarButtons: {
            moreText: {
                buttons: [
                    'bold',
                    'italic',
                    'fontFamily',
                    'underline',
                    'strikeThrough',
                    'subscript',
                    'superscript',
                    'fontSize',
                    'textColor',
                    'backgroundColor',
                    'inlineClass',
                    'inlineStyle',
                    'clearFormatting',
                ],
                align: 'left',
            },

            moreParagraph: {
                buttons: [
                    'alignLeft',
                    'alignCenter',
                    'formatOLSimple',
                    'alignRight',
                    'alignJustify',
                    'formatOL',
                    'formatUL',
                    'paragraphFormat',
                    'paragraphStyle',
                    'lineHeight',
                    'outdent',
                    'indent',
                    'quote',
                ],
                align: 'left',
                buttonsVisible: 1,
            },

            moreRich: {
                buttons: [
                    'insertLink',
                    'insertImage',
                    'insertVideo',
                    'insertTable',
                    'emoticons',
                    'fontAwesome',
                    'specialCharacters',
                    'embedly',
                    'insertFile',
                    'insertHR',
                ],
                align: 'left',
                buttonsVisible: 1,
            },

            moreMisc: {
                buttons: ['undo', 'redo', 'fullscreen', 'print', 'getPDF', 'spellChecker', 'selectAll', 'html', 'help'],
                align: 'right',
                buttonsVisible: 1,
            },
        },
    }

    useEffect(() => {
        if (!state.hcmTxtSec.length > 0) {
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMTXTSEC,
                token: token,
                params: {
                    short: 'id',
                    hotelrefno: Number(companyId),
                },
            }).then((r) => {
                if (r.status === 200) {
                    setToState('registerStepper', ['hcmTxtSec'], r.data.data)
                }
            })
        }
    }, [])

    const handleSave = () => {
        if (sectionID === 0) {
            enqueueSnackbar('Please select a section!' , { variant: 'warning' })
        } else if (title === '') {
            enqueueSnackbar('Title field cannot be empty!' , { variant: 'warning' })
        } else if (description === '') {
            enqueueSnackbar('Description field cannot be empty!' , { variant: 'warning' })
        } else if (minChar !== 0 && descLength < minChar) {
            enqueueSnackbar('Please complete the minimum character for explanation!' , { variant: 'warning' })
        } else if (maxChar !== 0 && descLength > maxChar) {
            enqueueSnackbar('Please do not exceed the maximum character limit!' , { variant: 'warning' })
        } else {
            setIsAdding(true)
            Patch({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMTXTPAR,
                token: token,
                gid: state.hcmItemTxt[groupIndex].hcmItemTxtPar[itemIndex].gid,
                data: {
                    secid: sectionID,
                    title: title,
                    itemtext: description,
                    hotelrefno: Number(companyId),
                },
            }).then((hcmItemTxtParPatchResonpse) => {
                if (hcmItemTxtParPatchResonpse.status === 200) {
                    UseOrest({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: 'hcmitemtxtpar/view/getbyid',
                        token,
                        params: {
                            key: hcmItemTxtParPatchResonpse.data.data.id,
                            chkselfish: false,
                        },
                    }).then((hcmItemTxtParResonpse) => {
                        if (hcmItemTxtParResonpse.status === 200) {
                            setToState('registerStepper', ['hcmItemTxt', String(groupIndex), 'hcmItemTxtPar', String(itemIndex), 'catid'], hcmItemTxtParResonpse.data.data.catid)
                            setToState('registerStepper', ['hcmItemTxt', String(groupIndex), 'hcmItemTxtPar', String(itemIndex), 'secid'], hcmItemTxtParResonpse.data.data.secid)
                            setToState('registerStepper', ['hcmItemTxt', String(groupIndex), 'hcmItemTxtPar', String(itemIndex), 'langid'], hcmItemTxtParResonpse.data.data.langid)
                            setToState('registerStepper', ['hcmItemTxt', String(groupIndex), 'hcmItemTxtPar', String(itemIndex), 'catcode'], hcmItemTxtParResonpse.data.data.catcode)
                            setToState('registerStepper', ['hcmItemTxt', String(groupIndex), 'hcmItemTxtPar', String(itemIndex), 'catdesc'], hcmItemTxtParResonpse.data.data.catdesc)
                            setToState('registerStepper', ['hcmItemTxt', String(groupIndex), 'hcmItemTxtPar', String(itemIndex), 'seccode'], hcmItemTxtParResonpse.data.data.seccode)
                            setToState('registerStepper', ['hcmItemTxt', String(groupIndex), 'hcmItemTxtPar', String(itemIndex), 'secdesc'], hcmItemTxtParResonpse.data.data.secdesc)
                            setToState('registerStepper', ['hcmItemTxt', String(groupIndex), 'hcmItemTxtPar', String(itemIndex), 'langcode'], hcmItemTxtParResonpse.data.data.langcode)
                            setToState('registerStepper', ['hcmItemTxt', String(groupIndex), 'hcmItemTxtPar', String(itemIndex), 'langdesc'], hcmItemTxtParResonpse.data.data.langdesc)
                            setToState('registerStepper', ['hcmItemTxt', String(groupIndex), 'hcmItemTxtPar', String(itemIndex), 'title'], hcmItemTxtParResonpse.data.data.title)
                            setToState('registerStepper', ['hcmItemTxt', String(groupIndex), 'hcmItemTxtPar', String(itemIndex), 'itemtext'], hcmItemTxtParResonpse.data.data.itemtext)
                            onClose(false)
                            setIsAdding(false)
                            enqueueSnackbar('Text update successfully', { variant: 'success' })
                        }
                    })
                    onClose(false)
                    setIsAdding(false)
                } else {
                    setIsAdding(false)
                    const retErr = isErrorMsg(hcmItemTxtParPatchResonpse)
                    enqueueSnackbar(retErr , { variant: 'warning' })
                }
            })
        }
    }

    const setMaxMinValue = (val) =>{
        const _maxChar = state.hcmTxtSec.find((item) => item.id === val).maxchar
        const _minChar = state.hcmTxtSec.find((item) => item.id === val).minchar

        if (_maxChar !== 0) {
            setMaxChar(_maxChar === null ? 0 : _maxChar)
        } else {
            setMaxChar(0)
        }

        if (_minChar !== 0) {
            setMinChar(_minChar === null ? 0 : _minChar)
        } else {
            setMinChar(0)
        }
    }

    const handleSectionChange = (e) => {
        setSectionID(e.target.value)
        setMaxMinValue(e.target.value)
    }

    const handleTitleChange = (e) => {
        setTitle(e.target.value)
    }

    const handleDescriptionChange = (e) => {
        setDescription(e)
        setDescLength(e.replace(/<[^>]*>?/gm, '').length)
        setMaxMinValue(sectionID)
    }

    const HelperText = () => {
        if (maxChar !== 0 && minChar === 0) {
            return `Please enter a max. of ${maxChar} chars.`
        } else if (minChar !== 0 && maxChar === 0) {
            return `Please enter a min. of ${minChar} chars.`
        } else if (maxChar !== 0 && minChar !== 0) {
            return `Please enter a max. of ${maxChar} chars. and a min. of ${minChar} chars.`
        } else {
            return ''
        }
    }

    return (
        <React.Fragment>
            <Dialog open={open} onClose={()=> onClose(false)} aria-labelledby="form-dialog-title" maxWidth="md">
                <DialogTitle id="form-dialog-title">Edit Item</DialogTitle>
                <DialogContent>
                    <Grid container spacing={3} direction="row" justify="center" alignItems="center">
                        <Grid item xs={6}>
                            <FormControl margin="dense" className={cls.formControl}>
                                <InputLabel id="hcmtTxtSection-label">Section</InputLabel>
                                <Select
                                    labelId="hcmTxtSection-label"
                                    id="hcmTxtSection-select"
                                    onChange={handleSectionChange}
                                    value={sectionID}
                                >
                                    <MenuItem value={0}>Choose a section</MenuItem>
                                    {state.hcmTxtSec &&
                                    state.hcmTxtSec.map((hcmTxtSecItem, ind) => {
                                        return (
                                            <MenuItem key={hcmTxtSecItem.id} value={hcmTxtSecItem.id}>
                                                {hcmTxtSecItem.description}
                                            </MenuItem>
                                        )
                                    })}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                margin="dense"
                                name="title"
                                label="Title"
                                type="text"
                                fullWidth
                                value={title}
                                onChange={handleTitleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FroalaEditor
                                config={config}
                                model={description}
                                onModelChange={handleDescriptionChange}
                            />
                            <HelperText />
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

export default connect(mapStateToProps, mapDispatchToProps)(NewHcmItemTxtPar)

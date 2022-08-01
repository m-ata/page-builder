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
import AddIcon from '@material-ui/icons/AddCircle'
import { isErrorMsg, OREST_ENDPOINT } from '../../../../../../model/orest/constants'
import Tooltip from '@material-ui/core/Tooltip'
import useNotifications from '../../../../../../model/notification/useNotifications'
import IconButton from '@material-ui/core/IconButton'
import { Insert, ViewList } from '@webcms/orest'
import WebCmsGlobal from 'components/webcms-global'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import Grid from '@material-ui/core/Grid'
import useTranslation from '../../../../../../lib/translations/hooks/useTranslation'
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
    const { setToState, pushToState, state, groupIndex, itemID, open, onClose, useCallBack } = props
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const [sectionID, setSectionID] = useState(0)
    const [maxChar, setMaxChar] = useState(0)
    const [minChar, setMinChar] = useState(0)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [descLength, setDescLength] = useState(0)
    const [descError, setDescError] = useState(false)
    const [isAdding, setIsAdding] = useState(false)
    const { showSuccess, showError } = useNotifications()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

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
            // Key represents the more button from the toolbar.
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
            showError('Please select a section!')
        } else if (title === '') {
            showError('Title field cannot be empty!')
        } else if (description === '') {
            showError('Description field cannot be empty!')
        } else if (minChar !== 0 && descLength < minChar) {
            showError('Please complete the minimum character for explanation!')
        } else if (maxChar !== 0 && descLength > maxChar) {
            showError('Please do not exceed the maximum character limit!')
        } else {
            setIsAdding(true)
            Insert({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMTXTPAR,
                token: token,
                data: {
                    itemid: itemID,
                    secid: sectionID,
                    title: title,
                    itemtext: description,
                    hotelrefno: Number(companyId),
                },
            }).then((hcmItemTxtParResponse) => {
                if (hcmItemTxtParResponse.status === 200) {
                    onClose(false)
                    setSectionID(0)
                    setMinChar(0)
                    setMaxChar(0)
                    setTitle('')
                    setDescription('')
                    showSuccess('New item added!')
                    useCallBack()
                    setIsAdding(false)
                }
            })
        }
    }


    const handleSectionChange = (e) => {
        setSectionID(e.target.value)
        const _maxChar = state.hcmTxtSec.find((item) => item.id === e.target.value).maxchar
        const _minChar = state.hcmTxtSec.find((item) => item.id === e.target.value).minchar

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

    const handleTitleChange = (e) => {
        setTitle(e.target.value)
    }

    const handleDescriptionChange = (e) => {
        setDescription(e)
        setDescLength(e.replace(/<[^>]*>?/gm, '').length)
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
                <DialogTitle id="form-dialog-title">Add New Text</DialogTitle>
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
                                required
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
                                tag="textarea"
                                model={description}
                                config={config}
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

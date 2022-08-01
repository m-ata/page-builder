import React, {useState, memo} from 'react'
import {useSelector} from 'react-redux'
import { useRouter } from 'next/router'
import {makeStyles} from '@material-ui/core/styles'
import styles from '../../../style/SurveyOptions.style'
import Button from '@material-ui/core/Button'
import {DropzoneArea} from 'material-ui-dropzone'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import useSurveyAction from '../../../../../model/survey/useSurveyAction'
import LoginComponent from '../../../../LoginComponent/LoginComponent'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { DEFAULT_OREST_TOKEN } from 'model/orest/constants'

const useStyles = makeStyles(styles)

function HasFile(props) {
    const { t } = useTranslation()
    const {option} = props
    const router = useRouter()
    //style
    const classes = useStyles()

    //redux
    const auth = useSelector((state) => state.orest.currentUser && state.orest.currentUser.auth)
    const {setSurveyFiles} = useSurveyAction()
    const surveyIsValid = useSelector((state) => state.survey.isValid)
    const surveyTrans = useSelector((state) => state.survey.trans)
    const token = useSelector((state) => state.orest.currentUser !== null ? state.orest.currentUser.auth.access_token : DEFAULT_OREST_TOKEN)
    const reftoken = router.query.reftoken || token

    //state
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

    const onOpen = () => {
        setIsUploadDialogOpen(true)
    }

    const onClose = () => {
        setIsUploadDialogOpen(false)
    }

    const onChange = (files) => {
        setSurveyFiles(surveyTrans, option.id, files)
    }

    const onDelete = (file) => {
        //console.log(file)
    }

    return (
        <div className={classes.optionContainer}>
            <Button
                onClick={onOpen}
                variant="contained"
                fullWidth={true}
                disabled={surveyIsValid}
                className={classes.uploadFileButton}
            >
                {t('str_uploadAFile')}
            </Button>
            <Dialog open={isUploadDialogOpen} onClose={onClose} maxWidth={'sm'} fullWidth={true} keepMounted={true}>
                {(!reftoken && !auth) ? (
                    <div style={{padding: 18}}>
                        <h3
                            style={{
                                fontSize: 27,
                                fontWeight: 500,
                                color: '#2F3434',
                                textAlign: 'center',
                                margin: 6,
                            }}
                        >
                            {t('str_loginToUpload')}
                        </h3>
                        <LoginComponent locationName="survey"/>
                    </div>
                ) : (
                    <React.Fragment>
                        <DialogContent dividers={false}>
                            <DropzoneArea
                                showPreviews={false}
                                showPreviewsInDropzone={true}
                                showFileNames={true}
                                showFileNamesInPreview={true}
                                filesLimit={10}
                                showAlerts={true}
                                dropzoneText={'Drag and drop files here or click'}
                                getFileLimitExceedMessage={(filesLimit) =>
                                    `Maximum allowed number of files exceeded. Only ${filesLimit} allowed`
                                }
                                getFileAddedMessage={(fileName) => `File ${fileName} successfully added.`}
                                getFileRemovedMessage={(fileName) => `File ${fileName} removed.`}
                                //getDropRejectMessage={(rejectedFile) => `File ${rejectedFile.name} was rejected. File type not supported. File is too big. Size limit is ${rejectedFile.size}.`}
                                previewGridClasses={{
                                    image: classes.fileUploadPreviewImage,
                                }}
                                dropzoneParagraphClass={classes.fileUploadPreviewParagraph}
                                previewGridProps={{
                                    alignContent: 'center',
                                    alignItems: 'center',
                                    justify: 'center',
                                    item: {
                                        style: {padding: 12},
                                        xs: 'auto',
                                    },
                                    container: {
                                        spacing: 0,
                                        margin: 0,
                                        width: '100%',
                                        direction: 'row',
                                        justify: 'center',
                                        alignContent: 'center',
                                        alignItems: 'center',
                                        style: {paddingTop: 18},
                                    },
                                }}
                                onChange={onChange}
                                onDelete={onDelete}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={onClose} className={classes.button}>
                                {t('str_done')}
                            </Button>
                        </DialogActions>
                    </React.Fragment>
                )}
            </Dialog>
        </div>
    )
}

export default memo(HasFile)
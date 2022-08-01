import React, {forwardRef, memo} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import CloseIcon from '@material-ui/icons/Close'
import Slide from '@material-ui/core/Slide'
import SurveyTree from './index'
import useTranslation from 'lib/translations/hooks/useTranslation'

const useStyles = makeStyles((theme) => ({
    appBar: {
        position: 'relative',
    },
    title: {
        marginLeft: theme.spacing(2),
        flex: 1,
    },
}));

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function SurveyTreeDialog(props) {
    const classes = useStyles();
    const { open, onClose, data, isAlreadyLoadTree } = props
    const { t } = useTranslation()

    const handleClose = () => {
        onClose(false)
    }

    return (
        <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
            <AppBar className={classes.appBar}>
                <Toolbar>
                    <Typography variant='h6' className={classes.title}>
                        {t('str_fillSurvey')}
                    </Typography>
                    <IconButton edge='end' color='inherit' onClick={handleClose} aria-label='close'>
                        <CloseIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <DialogContent>
                <SurveyTree isWidget={true} surveygid={data.surveygid} surveyrefno={data.surveyrefno} clientid={data.clientid} isAlreadyLoadTree={isAlreadyLoadTree}/>
            </DialogContent>
        </Dialog>
    )
}

export default memo(SurveyTreeDialog)
import React, { useEffect, useState, useContext } from 'react'
import { connect } from 'react-redux'
import { setToState, updateState } from 'state/actions'
import axios from 'axios'
import Typography from '@material-ui/core/Typography'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Dialog from '@material-ui/core/Dialog'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import WebCmsGlobal from 'components/webcms-global'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import VisibilityIcon from '@material-ui/icons/Visibility'
import Tooltip from '@material-ui/core/Tooltip'
import LoadingSpinner from 'components/LoadingSpinner'
import { LocaleContext } from 'lib/translations/context/LocaleContext'

const useStyles = makeStyles((theme) => ({
    dialogTitle: {
        '& h2': {
            [theme.breakpoints.only('md')]: {
                fontSize: 15,
            },
            [theme.breakpoints.only('sm')]: {
                fontSize: 14,
            },
            [theme.breakpoints.only('xs')]: {
                fontSize: 13,
            },
        },
    },
    button: {
        textAlign: 'center',
        '& a': {
            background: '#fffbfb',
            padding: 10,
            textAlign: 'center',
            color: theme.palette.primary.main,
            border: `1px solid ${theme.palette.primary.main}`,
            fontSize: '0.875rem',
            minWidth: 64,
            boxSizing: 'border-box',
            transition: 'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
            fontWeight: 500,
            lineHeight: 1.75,
            borderRadius: 4,
            letterSpacing: '0.02857em',
            textTransform: 'uppercase'
        },
    },
    sliderImgBox: {
        width: '100%',
        height: 340,
        [theme.breakpoints.only('xs')]: {
            height: 180,
        },
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%',
    },
}))

const FileItem = (props) => {
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { t } = useTranslation()
    const { data } = props

    return (
        <Card>
            <CardActionArea onClick={()=> window.open(GENERAL_SETTINGS.STATIC_URL + data.fileurl)}>
                <CardMedia
                    component="img"
                    alt={data && data.description}
                    height="140"
                    image={data.isPreview ? GENERAL_SETTINGS.STATIC_URL + data.fileurl : '/imgs/pdf-placeholder.jpg'}
                />
                <CardContent>
                    <Tooltip title={data && data.description}>
                        <Typography gutterBottom variant="h6" component="h4" noWrap>
                            {data && data.description}
                        </Typography>
                    </Tooltip>
                </CardContent>
            </CardActionArea>
            <CardActions>
                <Button
                    onClick={()=> window.open(GENERAL_SETTINGS.STATIC_URL + data.fileurl)}
                    color="primary"
                    startIcon={<VisibilityIcon />}
                >
                    {t('str_preview')}
                </Button>
            </CardActions>
        </Card>
    );
}

const CardSliderItemInfoDialog = (props) => {
    const { state, dialogData, open, close } = props
        , { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
        , { locale } = useContext(LocaleContext)
        , { t } = useTranslation()
        , classes = useStyles()
        , [isLoading, setIsloading] = useState(false)
        , [fileList, setFileList] = useState(false)

    let clientParams = {}

    useEffect(() => {
        let active = true
        if (active && open && !fileList) {

            if (GENERAL_SETTINGS.ISCHAIN && state.changeHotelRefno !== false) {
                clientParams.ischain = true
                clientParams.chainid = state.changeHotelRefno
                clientParams.hotelrefno = GENERAL_SETTINGS.HOTELREFNO

            } else {
                clientParams.ischain = false
                clientParams.chainid = false
            }

            clientParams.langcode = locale

            setIsloading(true)
            axios({
                url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/content/file/list',
                method: 'post',
                params: Object.assign({
                    masterid: dialogData.locmid,
                }, clientParams),
            }).then((fileResponse) => {
                if (active) {
                    const fileListData = fileResponse?.data?.data
                    if (fileResponse.data.success && fileListData.length > 0) {
                        setFileList(fileListData)
                        setIsloading(false)
                    } else {
                        setFileList(null)
                        setIsloading(false)
                    }
                }
            })
        }

        return () => {
            active = false
        }
    }, [open])

    return (
        <Dialog maxWidth="md" open={open} onClose={() => close(false)}>
            <DialogTitle className={classes.dialogTitle}>{dialogData && t(dialogData.localtitle)} - {t('str_info')}</DialogTitle>
            <DialogContent dividers style={{overflow: 'overlay'}}>
                <Grid container spacing={3}>
                    {isLoading ?
                        <Grid item xs={12}>
                            <LoadingSpinner size={40} />
                        </Grid> : fileList && fileList.length > 0 ? fileList.map((item, index) => {
                        return (
                            <Grid item xs={fileList.length === 1 ? 6 : 4} key={index}>
                                <FileItem data={item}/>
                            </Grid>
                        )
                    }): t('str_noDefaultRecord')}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => close(false)} color="primary">
                    {t('str_cancel')}
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

export default connect(mapStateToProps, mapDispatchToProps)(CardSliderItemInfoDialog)

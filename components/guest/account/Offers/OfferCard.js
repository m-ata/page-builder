import React, { useContext, useState, useEffect } from 'react'
import axios from 'axios'
import styles from './style/OfferCard.style'
import LoadingSpinner from 'components/LoadingSpinner'
import {
    Grid,
    Card,
    CardContent,
    CardActionArea,
    CardActions,
    Button,
    Typography,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Box
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import WebCmsGlobal from 'components/webcms-global'
import stylesTabPanel from '../style/TabPanel.style'
import CardImage from '@webcms-ui/core/card-image'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { getHyperlinkParser, stdTimeFormat } from 'model/orest/constants'
import { useSelector } from 'react-redux'
import LoginDialog from '../../../LoginComponent/LoginDialog'
import { useSnackbar } from 'notistack'
import Link from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Slider from 'react-slick'
const useStyles = makeStyles(styles)
const useStylesTabPanel = makeStyles(stylesTabPanel)

const getDescription = (str, useLength = 100, useShort = 100) => {
    if (str && str.length >= useLength) {
        return str.substring(0, useShort) + ' ...'
    }
    return str
}

const useModalStyles = makeStyles((theme) => ({
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
    deleteIcon: {
        cursor: 'unset'
    }
}))

function OfferModal({ open, handleCloseDialog, dialogData }) {
    const { GENERAL_SETTINGS, locale } = useContext(WebCmsGlobal)
    const [isOpenLoginDialog, setIsOpenLoginDialog] = useState(false)
    const { t } = useTranslation()
    const {enqueueSnackbar} = useSnackbar();

    const classes = useModalStyles()

    const [itemSlideData, setItemSlideData] = useState(false)
    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)

    let clientParams = {
        hotelrefno:  loginfo && loginfo.hotelrefno || GENERAL_SETTINGS.HOTELREFNO
    }

    useEffect(() => {
        let active = true
        if (active && open && dialogData?.sliderid) {
            axios({
                url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/content/slider',
                method: 'post',
                params:  Object.assign({
                    sliderid: dialogData.sliderid
                }, clientParams),
            }).then((sliderResponse) => {
                if (active) {
                    const sliderData = sliderResponse.data
                    if (sliderData.success && sliderData.data.length > 0) {
                        setItemSlideData(sliderData.data)
                    } else {
                        setItemSlideData(null)
                    }
                }
            })
        }

        return () => {
            active = false
        }
    }, [open])

    const settings = {
        dots: true,
        infinite: true,
        lazyLoad: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        swipeToSlide: true,
        touchMove: true,
    }

    const [mouseX, setMouseX] = useState(null)
    const [mouseY, setMouseY] = useState(null)
    const [openContextMenu, setOpenContextMenu] = useState(false)
    const [contextData, setContextData] = useState(null)

    const handleRightClick = (e, item) => {
        setMouseX(e.clientX - 2)
        setMouseY(e.clientY - 4)
        setOpenContextMenu(true)
        setContextData(item)
        e.preventDefault()
    }

    const onHandleCopyText = () => {
        navigator.clipboard.writeText(contextData).then(() => {
            enqueueSnackbar(t("str_copiedToClipboard").replace('%s', `"${contextData.substring(0, 50) + '...'}"`), { variant: 'success', autoHideDuration: 2000 })
        })
        setOpenContextMenu(false)
        setContextData(null)
    }

    const renderButton = (cta) => {
        if (cta) {
            const link = getHyperlinkParser(cta)

            if (link === false) {
                return
            }

            let href = link.href
                , text = link?.text?.replace(/ /g, '') || ''
                , host = window.location.host
                , isExternalLink = false

            if (href.includes('http') && !href.includes(host)) {
                isExternalLink = true
            }

            if (!isExternalLink) {
                return (
                    <Link id='slick-button' variant='outlined' color='primary' href={href}>
                        {t(text)}
                    </Link>
                )
            }

            return (
                <Link id='slick-button' variant='outlined' color='primary' target='_blank' href={href}>
                    {t(text)}
                </Link>
            )
        }
    }

    return (
        <React.Fragment>
            <LoginDialog open={isOpenLoginDialog} onClose={(status) => setIsOpenLoginDialog(status)} locationName='guest' isLoginWrapper disableRegister/>
            <Dialog maxWidth="sm" open={open} onClose={() => handleCloseDialog()}>
                <DialogTitle className={classes.dialogTitle}>{dialogData && t(dialogData?.localtitle?.renderText() || "")}</DialogTitle>
                <DialogContent dividers style={{overflow: 'overlay', padding: '16px 40px'}}>
                    {dialogData === false ? (
                        <Box p={3}>
                            <LoadingSpinner size={40} />
                        </Box>
                    ) : dialogData === null ? (
                        <Box p={3}>
                            <Typography variant="h6" align="center" gutterBottom>
                                {t('str_noDefaultRecord')}
                            </Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={1}>
                            <Grid item xs={12}>
                                <Slider {...settings}>
                                    {itemSlideData && itemSlideData.map((item, i) => {
                                        return (
                                            <Box key={i} p={1}>
                                                <div className={classes.sliderImgBox} style={{ backgroundImage: `url(${GENERAL_SETTINGS.STATIC_URL + item.fileurl})` }} />
                                            </Box>
                                        )
                                    })}
                                </Slider>
                                <br />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography onContextMenu={(e)=> handleRightClick(e, t(dialogData?.localdesc?.renderText()))} variant="body2" align="justify" style={{whiteSpace: 'pre-line'}} dangerouslySetInnerHTML={{ __html: t(dialogData?.localdesc?.renderText())?.replace('\n', '<br/>')}} />
                                <Menu
                                    open={openContextMenu}
                                    onClose={() => setOpenContextMenu(false)}
                                    anchorReference="anchorPosition"
                                    anchorPosition={mouseY !== null && mouseX !== null ? { top: mouseY, left: mouseX } : undefined}
                                >
                                    <MenuItem onClick={()=> onHandleCopyText()}>{t("str_copy")}</MenuItem>
                                </Menu>
                            </Grid>
                            {dialogData && dialogData.cta ? (
                                <Grid item xs={12}>
                                    <br/>
                                      {renderButton(dialogData.cta)}
                                    <br/>
                                </Grid>
                            ): null}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleCloseDialog()} color="primary">
                        {t('str_close')}
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    )
}

export default function OfferCard(props) {
    const { offer } = props
        , { t } = useTranslation()
        , classes = useStyles()
        , classesTabPanel = useStylesTabPanel()
        , { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
        , [openDialog, setOpenDialog] = useState(false)
        , [isOpenLoginDialog, setIsOpenLoginDialog] = useState(false)

    if (!offer) {
        return <LoadingSpinner />
    }

    let cta = false
    if (offer.cta) {
        let link = getHyperlinkParser(offer.cta)
        if (link) {
            cta = {}
            cta.href = link.href
            cta.text = link.text
        }
    }

    const handleOnClick = (cta) => {
        return cta.href.includes(window.location.host) ? window.location.href = cta.href : window.open(cta.href)
    }

    return (
        <Grid item xs={12} sm={6} md={4} className={classesTabPanel.gridItem}>
            <LoginDialog open={isOpenLoginDialog} onClose={(status) => setIsOpenLoginDialog(status)} locationName='guest' isLoginWrapper disableRegister/>
            <Card className={classes.root}>
                <CardActionArea onClick={() => setOpenDialog(true)}>
                    <CardImage
                        className={classes.offerImage}
                        src={offer.url !== null ? GENERAL_SETTINGS.STATIC_URL + offer.url : null}
                        alt={t(offer?.localdesc?.renderText() || "")}
                    />
                    {(offer.saleprice && offer.pricecurr) ? (
                        <span className={classes.priceBox}>
                            <Typography className={classes.price}>
                                {offer.saleprice} {offer.pricecurr} <small>/{t(offer.qty)}</small>
                            </Typography>
                        </span>
                    ): null}
                    <CardContent>
                        {(offer.localtitle || offer.title) && (
                            <Typography gutterBottom variant='h5' component='h2' align='center' className={classes.nameText}>
                                {t(offer?.localtitle.renderText() || offer?.title.renderText())}
                            </Typography>
                        )}
                        {(offer.localdesc || offer.description) && (
                            <Typography variant='body2' color='textSecondary' component='p' align='justify' className={classes.descText}>
                                {getDescription(t(offer?.localdesc.renderText() || offer?.description.renderText()))}
                            </Typography>
                        )}
                    </CardContent>
                </CardActionArea>
                <CardActions>
                    {(cta && cta.text && cta.href) ? (
                        <Button classes={{ root: classes.ctaButton }} variant='outlined' color='primary' fullWidth onClick={() => handleOnClick(cta)}>
                            {t(cta.text.renderText())}
                        </Button>
                    ): null}
                </CardActions>
            </Card>
            <OfferModal open={openDialog} handleCloseDialog={() => setOpenDialog(false)} dialogData={offer}/>
        </Grid>
    )
}

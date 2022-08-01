import React, { useContext, useEffect, useState } from 'react'
import Slider from 'react-slick'
import { makeStyles } from '@material-ui/core/styles'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import Link from '@material-ui/core/Button'
import CarouselItem from './carousel-item'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { getHyperlinkParser } from 'model/orest/constants'
import WebCmsGlobal from 'components/webcms-global'
import { useSelector } from 'react-redux'
import { useSnackbar } from 'notistack'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'

const useStyles = makeStyles((theme) => ({
    root: {
        position: 'relative',
        maxWidth: '100%',
        height: 0,
        margin: 10,
        paddingTop: '56.25%'
    },
    media: {
        height: 0,
        paddingTop: '56.25%', // 16:9
    }
}))

export default function Carousel(props) {
    const isLogin = useSelector((state) => state.orest.currentUser && state.orest.currentUser.auth) ? true : false
    const classes = useStyles()
    const [slider, setSlider] = useState({ nav1: null, nav2: null })
    const [loadPiority, setLoadPiority] = useState(0)
    const { enqueueSnackbar } = useSnackbar()
    const [mouseX, setMouseX] = useState(null)
    const [mouseY, setMouseY] = useState(null)
    const [openContextMenu, setOpenContextMenu] = useState(false)
    const [contextData, setContextData] = useState(null)
    let { slideData, slider1, slider2 } = props
    const { t } = useTranslation()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    useEffect(() => {
        setSlider({ ...slider, nav1: slider1, nav2: slider2 })
    }, [])

    const imageSetting = {
        centerMode: true,
        slidesToShow: 1,
        arrows: true,
        dots: true,
        accessibility: true,
        focusOnSelect: true,
        afterChange: current => setLoadPiority(current),
    }

    const descSetting = {
        centerMode: false,
        slidesToShow: 1,
        arrows: false,
        dots: false,
        focusOnSelect: true
    }

    const renderButton = (cta) => {
        if (cta) {
            let link = getHyperlinkParser(cta)
            if(link === false){
                return
            }

            let href = link.href
            let text = link?.text?.replace(/ /g,'') || ''
            let host = window.location.host

            let isExternalLink = false
            if(href.includes('http') && !href.includes(host)){
                isExternalLink = true
            }

            if(!isExternalLink){

                if((!isLogin) && href.includes('profile') || href.includes('history')){
                    let destinationLink = encodeURIComponent(link.href)
                    href = '/guest/login?refurl='+destinationLink
                }

                return (
                    <Link id="slick-button"  variant="outlined" color="primary" href={href}>
                        {t(text?.removeHtmlTag())}
                    </Link>
                )
            }

            return (
                <Link id="slick-button"  variant="outlined" color="primary" target="_blank" href={href}>
                    {t(text?.removeHtmlTag())}
                </Link>
            )
        } else {
            return
        }
    }

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

    return (
        <React.Fragment>
            <Box style={{ marginBottom: 50 }}>
                <Slider asNavFor={slider.nav2} ref={(slider) => (slider1 = slider)} {...imageSetting}>
                    {slideData.map((item, i) => {
                        return (
                            <CarouselItem
                                key={i + '-homeCarousel'}
                                rootCls={classes.root}
                                mediaCls={classes.media}
                                img={GENERAL_SETTINGS.STATIC_URL + item.url}
                                title={item.title}
                                score={3}
                                loadPriority={loadPiority === i ? "true" : "false"}
                            />
                        )
                    })}
                </Slider>
            </Box>
            <Slider asNavFor={slider.nav1} ref={(slider) => (slider2 = slider)} {...descSetting}>
                {slideData.map((item, key) => {
                    return (
                        <div key={key}>
                            <Typography variant="h6" align="center" gutterBottom onContextMenu={(e)=> handleRightClick(e, t(item?.localtitle?.removeHtmlTag()))}>
                                {t(item?.localtitle?.removeHtmlTag())}
                            </Typography>
                            <Typography variant="body1" align="center" gutterBottom onContextMenu={(e)=> handleRightClick(e, t(item?.localdesc?.removeHtmlTag()))}>
                                {t(item?.localdesc?.removeHtmlTag())}
                            </Typography>
                            <Typography variant="body1" align="center" gutterBottom>
                                {item.cta && renderButton(item.cta)}
                            </Typography>
                        </div>
                    )
                })}
            </Slider>
            <Menu
                open={openContextMenu}
                onClose={() => setOpenContextMenu(false)}
                anchorReference="anchorPosition"
                anchorPosition={mouseY !== null && mouseX !== null ? { top: mouseY, left: mouseX } : undefined}
            >
                <MenuItem onClick={()=> onHandleCopyText()}>{t("str_copy")}</MenuItem>
            </Menu>
        </React.Fragment>
    )
}

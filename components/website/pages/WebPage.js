import React, { useEffect, useState, useContext, memo } from 'react'
import WebsiteSlider from './WebsiteSlider'
import WebsiteImage from './WebsiteImage'
import WebsiteParagraph from './WebsiteParagraph'
import WidgetBooking from '../../ibe/widget/booking'
import Grid from '@material-ui/core/Grid'
import Container from '@material-ui/core/Container'
import WebsiteContactForm from './WebsiteContactForm'
import WrappedMap from '../../page-builder/PageBuilderSteps/components/page/sections/map/Map'
import WebCmsGlobal from 'components/webcms-global'
import { useSelector, connect } from 'react-redux'
import { useRouter } from 'next/router'
import WebsiteSliderGallery from './WebsiteSliderGallery'
import WebsiteCardSlider from './WebsiteCardSlider'
import { updateState } from '../../../state/actions'
import { NextSeo } from 'next-seo'
import Video from '../../page-builder/PageBuilderSteps/components/page/sections/video/Video'

const WebsitePage = (props) => {
    const { updateState } = props
        , [backgroundImage, setBackgroundImage] = useState('')
        , [mobileView, setMobileView] = useState(false)
        , { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
        , website = useSelector((state) => state?.formReducer?.website)
        , [webPage, setWebPage] = useState(null)
        , [otherLangPage, setOtherLangPage] = useState(null)
        , [title, setTitle] = useState('')
        , router = useRouter()
        , { code } = router.query

    useEffect(() => {
        const setResponsiveness = () => {
            return window.innerWidth <= 1024 ? setMobileView(true) : setMobileView(false)
        }
        setResponsiveness()
        window.addEventListener('resize', () => setResponsiveness())

    }, [])

    useEffect(() => {
        if (code) {
            const page = website?.defaultPages?.find((x) => x?.currentCode?.toLowerCase() === code.toLowerCase())
            if (page) {
                updateState('website', 'pageNotFound', false)
                setWebPage(page)
                website?.otherLangPages?.length > 0 &&
                    setOtherLangPage(website.otherLangPages.find((x) => x?.defaultId === page?.id))
            } else {
                let pageNotFound = false
                for (const webPage of website.defaultPages) {
                    let isBreak = false
                    if (typeof webPage.code !== 'string') {
                        for (const codeValue of webPage.code) {
                            if (codeValue.toLowerCase() === code.toLowerCase()) {
                                pageNotFound = false
                                setWebPage(webPage)
                                website?.otherLangPages?.length > 0 &&
                                    setOtherLangPage(website.otherLangPages.find((x) => x?.defaultId === page?.id))
                                isBreak = true
                                break
                            } else {
                                pageNotFound = true
                            }
                        }
                        if (isBreak) break
                    } else {
                        const page = website?.defaultPages?.find((x) => x?.code?.toLowerCase() === code.toLowerCase())
                        if (page) {
                            pageNotFound = false
                            setWebPage(page)
                            website?.otherLangPages?.length > 0 &&
                                setOtherLangPage(website.otherLangPages.find((x) => x?.defaultId === page?.id))
                        } else {
                            pageNotFound = true
                        }
                    }
                }
                updateState('website', 'pageNotFound', pageNotFound)
            }
        } else {
            website?.defaultPages?.length > 0 && setWebPage(website?.defaultPages[0])
            website?.otherLangPages?.length > 0 && setOtherLangPage(website.otherLangPages[0])
        }
    }, [website?.defaultPages, website?.otherLangPages, code, website?.selectedLangCode])

    useEffect(() => {
        if (website?.assets?.images?.background) {
            setBackgroundImage(website?.assets?.images?.background)
        }
        if (website?.assets?.meta?.title && website?.selectedHeaderLink) {
            setTitle(website.assets.meta.title + ' | ' + website?.selectedHeaderLink)
        }
        if (website?.assets?.meta?.title && !website?.selectedHeaderLink) {
            setTitle(website?.assets?.meta?.title)
        }
    }, [website?.assets, website?.selectedHeaderLink])

    const getColumnWidth = (width) => {
        return Math.floor((width / 100) * 12)
    }

    return (
        <div style={{ backgroundImage: backgroundImage ? `url(${GENERAL_SETTINGS.STATIC_URL + backgroundImage})` : '' }}>
            <NextSeo title={title} />
            {website?.selectedLangCode !== website?.defaultLangCode &&
                otherLangPage &&
                otherLangPage[website.selectedLangCode]?.items?.length > 0 &&
                // otherLangPage[website.selectedLangCode].items.length === webPage?.sections?.length &&
                otherLangPage[website.selectedLangCode].items.map((item, index) => {
                    let sectionImages = []
                    return (
                        <div
                            style={{
                                backgroundColor: Number.isInteger((index + 1) / 2)
                                    ? website?.assets?.colors?.primary?.light
                                    : '',
                            }}
                            key={index}
                        >
                            {item?.title && (
                                <Grid container spacing={1} justify={'flex-start'}>
                                    <Grid item xs={12}>
                                        <div dangerouslySetInnerHTML={{ __html: item.title }}></div>
                                    </Grid>
                                </Grid>
                            )}
                            {webPage.sections[index]?.type === 'fullcol' &&
                                webPage.sections[index]?.items[0]?.type === 'slider' && (
                                    <Grid container spacing={1} justify={'flex-start'}>
                                        <Grid
                                            style={{ minWidth: webPage.sections[index].items[0].width + '%' }}
                                            item
                                            xs={getColumnWidth(webPage.sections[index].items[0].width)}
                                        >
                                            {'slider' in item.subItems[0] && (
                                                <WebsiteSlider
                                                    type={webPage.sections[index]?.type}
                                                    sliderData={webPage.sections[index].items[0]}
                                                    otherLangSlider={item.subItems[0].slider}
                                                    selectedLang={website?.selectedLangCode}
                                                    defaultLang={website?.defaultLangCode}
                                                    sliderType={webPage.sections[index]?.items[0]?.type}
                                                />
                                            )}
                                            {'sliderImages' in item.subItems[0] && (
                                                <WebsiteSlider
                                                    type={webPage.sections[index]?.type}
                                                    sliderData={webPage.sections[index].items[0]}
                                                    otherLangSliderImages={item.subItems[0].sliderImages}
                                                    selectedLang={website?.selectedLangCode}
                                                    defaultLang={website?.defaultLangCode}
                                                    sliderType={webPage.sections[index]?.items[0]?.type}
                                                />
                                            )}
                                        </Grid>
                                    </Grid>
                                )}
                            {webPage.sections[index]?.type === 'fullcol' &&
                                webPage.sections[index]?.items[0]?.type === 'sliderOnly' && (
                                    <Grid container spacing={3} justify={'flex-start'}>
                                        <Grid
                                            style={{ minWidth: webPage.sections[index].items[0].width + '%' }}
                                            item
                                            xs={getColumnWidth(webPage.sections[index].items[0].width)}
                                        >
                                            <WebsiteSlider
                                                type={webPage.sections[index]?.type}
                                                sliderData={webPage.sections[index].items[0]}
                                                otherLangSlider={webPage.sections[index].items[0].gid}
                                                selectedLang={website?.selectedLangCode}
                                                defaultLang={website?.defaultLangCode}
                                                sliderType={webPage.sections[index]?.items[0]?.type}
                                            />
                                        </Grid>
                                    </Grid>
                                )}
                            <Container>
                                <Grid key={index} container spacing={1} justify={'flex-start'}>
                                    {item.subItems.length > 0 &&
                                        item.subItems.map((subItem, i) => {
                                            const isModal =
                                                (webPage.sections[index]?.items[0]?.type === 'image' &&
                                                    (webPage.sections[index]?.items[1]?.type === 'image' ||
                                                        webPage.sections[index]?.items[2]?.type === 'image')) ||
                                                (webPage.sections[index]?.items[1]?.type === 'image' &&
                                                    (webPage.sections[index]?.items[1]?.type === 'image' ||
                                                        webPage.sections[index]?.items[2]?.type === 'image')) ||
                                                (webPage.sections[index]?.items[2]?.type === 'image' &&
                                                    (webPage.sections[index]?.items[0]?.type === 'image' ||
                                                        webPage.sections[index]?.items[1]?.type === 'image'))
                                            if (isModal) {
                                                webPage.sections[index]?.items[i]?.type === 'image' &&
                                                    sectionImages.push(webPage.sections[index]?.items[i])
                                            }
                                            return (
                                                <Grid
                                                    style={{
                                                        minWidth: mobileView
                                                            ? '100%'
                                                            : webPage.sections[index]?.items[i]?.width + '%',
                                                    }}
                                                    item
                                                    xs={
                                                        mobileView
                                                            ? 12
                                                            : getColumnWidth(webPage.sections[index]?.items[i]?.width)
                                                    }
                                                    key={i}
                                                >
                                                    {'sliderOnly' in subItem &&
                                                        webPage.sections[index]?.type !== 'fullcol' && (
                                                            <WebsiteSlider
                                                                type={webPage.sections[index]?.type}
                                                                sliderData={webPage.sections[index].items[i]}
                                                                otherLangSlider={webPage.sections[index].items[i].gid}
                                                                selectedLang={website?.selectedLangCode}
                                                                defaultLang={website?.defaultLangCode}
                                                                sliderType={'sliderOnly'}
                                                            />
                                                        )}
                                                    {'sliderGallery' in subItem && (
                                                        <WebsiteSliderGallery
                                                            mobileView={mobileView}
                                                            sliderGallery={webPage.sections[index].items[i]}
                                                            otherLangSliderGallery={subItem?.sliderGallery}
                                                            selectedLang={website?.selectedLangCode}
                                                            defaultLang={website?.defaultLangCode}
                                                        />
                                                    )}
                                                    {'cardSlider' in subItem && (
                                                        <WebsiteCardSlider
                                                            // mobileView={mobileView}
                                                            cardSlider={webPage.sections[index].items[i]}
                                                            otherLangCardSlider={subItem?.cardSlider}
                                                            selectedLang={website?.selectedLangCode}
                                                            defaultLang={website?.defaultLangCode}
                                                        />
                                                    )}
                                                    {'image' in subItem && (
                                                        <WebsiteImage
                                                            imageData={webPage.sections[index]?.items[i]}
                                                            otherLangImage={subItem.image}
                                                            selectedLang={website?.selectedLangCode}
                                                            defaultLang={website?.defaultLangCode}
                                                            sectionType={webPage?.sections[index]?.type}
                                                            sectionImages={sectionImages}
                                                        />
                                                    )}
                                                    {'text' in subItem && (
                                                        <div
                                                            style={{
                                                                backgroundColor: webPage?.sections[index]?.items[i]
                                                                    ?.useBgColor
                                                                    ? website?.assets?.colors?.message?.main
                                                                    : 'transparent',
                                                                height: '100%',
                                                            }}
                                                        >
                                                            <WebsiteParagraph paragraph={subItem} />
                                                        </div>
                                                    )}
                                                    {'contactForm' in subItem && (
                                                        <WebsiteContactForm
                                                            formData={webPage.sections[index]?.items[i]}
                                                            otherLangFormData={subItem.contactForm.labels}
                                                            selectedLang={website?.selectedLangCode}
                                                            defaultLang={website?.defaultLangCode}
                                                        />
                                                    )}
                                                    {webPage?.sections[index]?.items[i]?.type === 'widgetbooking' && (
                                                        <WidgetBooking />
                                                    )}
                                                    {'map' in subItem && (
                                                        <WrappedMap
                                                            googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAP_API_KEY}`}
                                                            loadingElement={<div style={{ height: `100%` }} />}
                                                            containerElement={
                                                                <div style={{ height: `350px`, borderRadius: 10 }} />
                                                            }
                                                            mapElement={<div style={{ height: `100%` }} />}
                                                        />
                                                    )}
                                                </Grid>
                                            )
                                        })}
                                </Grid>
                            </Container>
                        </div>
                    )
                })}
            {website?.selectedLangCode === website?.defaultLangCode &&
                // ||
                // (otherLangPage && selectedLang && !otherLangPage[selectedLang]))
                webPage?.sections.length > 0 &&
                webPage.sections.map((page, i) => {
                    let sectionImages = []
                    return (
                        <div
                            key={i}
                            style={{
                                backgroundColor: Number.isInteger((i + 1) / 2)
                                    ? website?.assets?.colors?.primary?.light
                                    : '',
                            }}
                        >
                            {page?.title && (
                                <Grid container spacing={1} justify={'flex-start'}>
                                    <Grid item xs={12}>
                                        <div dangerouslySetInnerHTML={{ __html: page.title }}></div>
                                    </Grid>
                                </Grid>
                            )}

                            {page.type === 'fullcol' &&
                                (page.items[0].type === 'slider' || page.items[0].type === 'sliderOnly') && (
                                    <Grid container spacing={0} justify={'flex-start'}>
                                        <Grid
                                            style={{ minWidth: page.items[0].width + '%' }}
                                            item
                                            xs={getColumnWidth(page.items[0].width)}
                                        >
                                            <WebsiteSlider
                                                type={page?.type}
                                                sliderData={page.items[0]}
                                                sliderType={page.items[0].type}
                                            />
                                        </Grid>
                                    </Grid>
                                )}
                            {page.type === 'fullcol' && page.items[0].type === 'video' && (
                                <Video videoComponent={page.items[0]} />
                            )}
                            <Container>
                                <Grid container spacing={3} justify={'flex-start'}>
                                    {page.items.map((item, index) => {
                                        const isModal =
                                            (page.items[0]?.type === 'image' &&
                                                (page.items[1]?.type === 'image' || page.items[2]?.type === 'image')) ||
                                            (page.items[1]?.type === 'image' &&
                                                (page.items[0]?.type === 'image' || page.items[2]?.type === 'image')) ||
                                            (page.items[2]?.type === 'image' &&
                                                (page.items[0]?.type === 'image' || page.items[1]?.type === 'image'))
                                        if (isModal) {
                                            item.type === 'image' && sectionImages.push(item)
                                        }
                                        return (
                                            <Grid
                                                style={{ minWidth: mobileView ? '100%' : item.width + '%' }}
                                                item
                                                xs={mobileView ? 12 : getColumnWidth(item.width)}
                                                key={index}
                                            >
                                                {item?.type === 'video' && page.type !== 'fullcol' && <Video videoComponent={item} />}
                                                {item.type === 'sliderOnly' && page.type !== 'fullcol' && (
                                                    <WebsiteSlider
                                                        type={page?.type}
                                                        sliderData={item}
                                                        sliderType={item.type}
                                                    />
                                                )}
                                                {item.type === 'slider-gallery' && (
                                                    <WebsiteSliderGallery
                                                        mobileView={mobileView}
                                                        sliderGallery={item}
                                                    />
                                                )}
                                                {item.type === 'card-slider' && <WebsiteCardSlider cardSlider={item} />}
                                                {item.type === 'image' && (
                                                    <WebsiteImage
                                                        mobileView={mobileView}
                                                        sectionImages={sectionImages}
                                                        sectionType={page?.type}
                                                        itemID={item?.id}
                                                        imageData={item}
                                                    />
                                                )}
                                                {item.type === 'paragraph' && (
                                                    <div
                                                        style={{
                                                            backgroundColor: item?.useBgColor
                                                                ? website?.assets?.colors?.message?.main
                                                                : 'transparent',
                                                            height: '100%',
                                                        }}
                                                    >
                                                        <WebsiteParagraph
                                                            paragraph={item}
                                                            font={website?.assets?.font}
                                                        />
                                                    </div>
                                                )}
                                                {item.type === 'widgetbooking' && <WidgetBooking />}
                                                {item.type === 'contactForm' && <WebsiteContactForm formData={item} />}
                                                {item.type === 'map' && (
                                                    <WrappedMap
                                                        googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAP_API_KEY}`}
                                                        loadingElement={<div style={{ height: `100%` }} />}
                                                        containerElement={
                                                            <div style={{ height: `350px`, borderRadius: 10 }} />
                                                        }
                                                        mapElement={<div style={{ height: `100%` }} />}
                                                    />
                                                )}
                                            </Grid>
                                        )
                                    })}
                                </Grid>
                            </Container>
                        </div>
                    )
                })}
        </div>
    )
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

const memorizedWebsitePage = memo(WebsitePage)

export default connect(null, mapDispatchToProps)(memorizedWebsitePage)

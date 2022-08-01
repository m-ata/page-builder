//react imports
import React from 'react'
//redux imports
import { connect } from 'react-redux'
//material imports
import { Container, Typography, Grid } from '@material-ui/core'
//custom imports
import Slider from '../../components/page/sections/slider/Slider'
import Image from '../../components/page/sections/image/Image'
import Paragraph from '../../components/page/sections/paragraph/Paragraph'
import WidgetBooking from 'components/ibe/widget/booking'
import ContactForm from '../../components/page/sections/contact-form/ContactForm'
import WrappedMap from '../../components/page/sections/map/Map'
import SliderOnlyPreview from '../../components/page/sections/slider-only/Slider'
import SliderGallery from '../../components/page/sections/slider-gallery/SliderGallery'
import CardSlider from '../../components/page/sections/card-type-slider/CardSlider'
import Video from '../../components/page/sections/video/Video'

const Preview = (props) => {
    const { state } = props

    const getColumnWidth = (width) => {
        return Math.floor((width / 100) * 12)
    }

    return (
        <Container>
            {state.langCode !== state.defaultLang &&
                state.langsFile[state.langCode] &&
                state.langsFile[state.langCode].items.length > 0 &&
                state.langsFile[state.langCode].items.map((item, index) => {
                    let sectionImages = []
                    return (
                        <Typography key={index} component={'div'}>
                            {item?.title && (
                                <Grid container spacing={1} justify={'flex-start'}>
                                    <Grid item xs={12}>
                                        <div dangerouslySetInnerHTML={{ __html: item.title }}></div>
                                    </Grid>
                                </Grid>
                            )}
                            <Grid container spacing={1} justify={'flex-start'}>
                                {item.subItems.length > 0 &&
                                    item.subItems.map((subItem, i) => {
                                        const isModal =
                                            (state.page.sections[index].items[0]?.type === 'image' &&
                                                (state.page.sections[index].items[1]?.type === 'image' ||
                                                    state.page.sections[index].items[2]?.type === 'image')) ||
                                            (state.page.sections[index].items[1]?.type === 'image' &&
                                                (state.page.sections[index].items[0]?.type === 'image' ||
                                                    state.page.sections[index].items[2]?.type === 'image')) ||
                                            (state.page.sections[index].items[2]?.type === 'image' &&
                                                (state.page.sections[index].items[0]?.type === 'image' ||
                                                    state.page.sections[index].items[1]?.type === 'image'))
                                        if (isModal) {
                                            state.page.sections[index].items[i].type === 'image' &&
                                                sectionImages.push(state.page.sections[index].items[i])
                                        }
                                        return (
                                            <Grid
                                                key={i}
                                                item
                                                xs={getColumnWidth(state?.page?.sections[index]?.items[i]?.width)}
                                                style={{
                                                    minWidth: state?.page?.sections[index]?.items[i]?.width + '%',
                                                }}
                                            >
                                                {'image' in subItem && (
                                                    <Image
                                                        imageComponent={state.page.sections[index].items[i]}
                                                        otherLangsImage={subItem.image}
                                                        sectionType={state?.page?.sections[index]?.type}
                                                        sectionImages={sectionImages}
                                                    />
                                                )}
                                                {'text' in subItem && (
                                                    <div
                                                        style={{
                                                            backgroundColor: state?.page?.sections[index]?.items[i]
                                                                ?.useBgColor
                                                                ? state?.assets?.colors?.message?.main
                                                                : 'white',
                                                            height: '100%',
                                                        }}
                                                    >
                                                        <Paragraph paragraph={subItem.text} />
                                                    </div>
                                                )}
                                                {'sliderGallery' in subItem && (
                                                    <SliderGallery
                                                        sliderGallery={state.page.sections[index].items[i]}
                                                        otherLangSliderGallery={subItem.sliderGallery}
                                                    />
                                                )}
                                                {'cardSlider' in subItem && (
                                                    <CardSlider
                                                        cardSlider={state.page.sections[index].items[i]}
                                                        otherLangCardSlider={subItem.cardSlider}
                                                    />
                                                )}
                                                {'slider' in subItem && (
                                                    <Slider
                                                        sliderComponent={state.page.sections[index].items[i]}
                                                        slider={subItem.slider}
                                                    />
                                                )}
                                                {'sliderImages' in subItem && (
                                                    <Slider
                                                        sliderComponent={state.page.sections[index].items[i]}
                                                        otherLangSliderImages={subItem.sliderImages}
                                                    />
                                                )}
                                                {'sliderOnly' in subItem && (
                                                    <SliderOnlyPreview
                                                        masterid={state.page.sections[index].items[i].masterid}
                                                    />
                                                )}
                                                {('booking' in subItem || subItem?.service === 'hcmwidgetbooking') && <WidgetBooking />}
                                                {'contactForm' in subItem && (
                                                    <div
                                                        style={{
                                                            backgroundColor: state?.page?.sections[index]?.items[i]
                                                                ?.useBgColor
                                                                ? state?.assets?.colors?.message?.main
                                                                : 'white',
                                                            height: '100%',
                                                        }}
                                                    >
                                                        <ContactForm
                                                            formData={state.page.sections[index].items[i]}
                                                            otherLangFormData={subItem.contactForm.labels}
                                                        />
                                                    </div>
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
                        </Typography>
                    )
                })}
            {state.langCode === state.defaultLang &&
                state.page.sections.length > 0 &&
                state.page.sections.map((section, i) => {
                    let sectionImages = []
                    return (
                        <Typography component={'div'} key={i}>
                            {section?.title && (
                                <Grid container spacing={1} justify={'flex-start'}>
                                    <Grid item xs={12}>
                                        <div dangerouslySetInnerHTML={{ __html: section.title }}></div>
                                    </Grid>
                                </Grid>
                            )}
                            <Grid container spacing={1} justify={'flex-start'}>
                                {section.items.map((component, index) => {
                                    const isModal =
                                        (section.items[0]?.type === 'image' &&
                                            (section.items[1]?.type === 'image' ||
                                                section.items[2]?.type === 'image')) ||
                                        (section.items[1]?.type === 'image' &&
                                            (section.items[0]?.type === 'image' ||
                                                section.items[2]?.type === 'image')) ||
                                        (section.items[2]?.type === 'image' &&
                                            (section.items[0]?.type === 'image' || section.items[1]?.type === 'image'))
                                    if (isModal) {
                                        component.type === 'image' && sectionImages.push(component)
                                    }
                                    return (
                                        <Grid
                                            style={{ minWidth: component.width + '%' }}
                                            item
                                            xs={getColumnWidth(component.width)}
                                            key={index}
                                        >
                                            {component.type === 'slider' && <Slider sliderComponent={component} />}
                                            {component?.type === 'card-slider' && <CardSlider cardSlider={component} />}
                                            {component.type === 'sliderOnly' && (
                                                <SliderOnlyPreview masterid={component.masterid} />
                                            )}
                                            {component.type === 'slider-gallery' && (
                                                <SliderGallery sliderGallery={component} />
                                            )}
                                            {component.type === 'image' && (
                                                <Image
                                                    imageComponent={component}
                                                    sectionType={section?.type}
                                                    sectionImages={sectionImages}
                                                />
                                            )}
                                            {component.type === 'paragraph' && (
                                                <div
                                                    style={{
                                                        backgroundColor: component?.useBgColor
                                                            ? state?.assets?.colors?.message?.main
                                                            : 'white',
                                                        height: '100%',
                                                    }}
                                                >
                                                    <Paragraph paragraph={component} />
                                                </div>
                                            )}
                                            {component.type === 'widgetbooking' && (
                                                <Typography component={'div'} style={{ pointerEvents: 'none' }}>
                                                    <WidgetBooking />
                                                </Typography>
                                            )}
                                            {component.type === 'contactForm' && (
                                                <div
                                                    style={{
                                                        backgroundColor: component?.useBgColor
                                                            ? state?.assets?.colors?.message?.main
                                                            : 'white',
                                                        height: '100%',
                                                    }}
                                                >
                                                    <ContactForm formData={component} />
                                                </div>
                                            )}
                                            {component.type === 'map' && (
                                                <WrappedMap
                                                    googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAP_API_KEY}`}
                                                    loadingElement={<div style={{ height: `100%` }} />}
                                                    containerElement={
                                                        <div style={{ height: `350px`, borderRadius: 10 }} />
                                                    }
                                                    mapElement={<div style={{ height: `100%` }} />}
                                                />
                                            )}
                                            {component?.type === 'video' && <Video videoComponent={component} />}
                                        </Grid>
                                    )
                                })}
                            </Grid>
                        </Typography>
                    )
                })}
        </Container>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.pageBuilder,
    }
}

export default connect(mapStateToProps)(Preview)

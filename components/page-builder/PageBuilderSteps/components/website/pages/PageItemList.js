import React, {useEffect, useState} from 'react';
import Slider from "./../../page/sections/slider/Slider";
import Image from "./../../page/sections/image/Image";
import Paragraph from "./../../page/sections/paragraph/Paragraph";
import WidgetBooking from "../../../../../ibe/widget/booking";
import { connect } from 'react-redux';
import ContactForm from "../../page/sections/contact-form/ContactForm";
import WrappedMap from "../../page/sections/map/Map";
import SliderOnlyPreview from "../../page/sections/slider-only/Slider";
import {Typography, Grid} from "@material-ui/core";
import SliderGallery from "../../page/sections/slider-gallery/SliderGallery";
import CardSlider from "../../page/sections/card-type-slider/CardSlider";

const PageItemList = (props) => {

    const { pageData, state, otherLangsPage, handleSelectedLink } = props
    const [isExist, setIsExist] = useState(false);
    useEffect(() => {
        if (otherLangsPage && Object.keys(otherLangsPage).length > 0) {
            const keys = Object.keys(otherLangsPage);
            for (let i = 0; i < keys.length; i++) {
                if (keys[i] === state.langCode) {
                    setIsExist(true);
                    break
                } else {
                    setIsExist(false);
                }
            }
        }
    }, [otherLangsPage, state.langCode]);

    const getColumnWidth = (width) => {
        return Math.floor((width/100) * 12);
    }

    return (
        <div style={{pointerEvents: state.pageStep !== 2 ? 'none' : '', minHeight: 800}}>
            {
                state.langCode !== state.defaultLang &&
                otherLangsPage &&
                otherLangsPage[state.langCode] &&
                otherLangsPage[state.langCode].items.length > 0 &&
                otherLangsPage[state.langCode].items.length === pageData.sections.length &&
                otherLangsPage[state.langCode].items.map((item, index) => {
                    return(
                        <Typography component={'div'} key={index}>
                            {
                                item?.title &&
                                <Grid container spacing={1} justify={'flex-start'}>
                                    <Grid item xs={12}>
                                        <div dangerouslySetInnerHTML={{__html: item.title}}></div>
                                    </Grid>
                                </Grid>
                            }
                            <Grid container spacing={1} justify={'flex-start'}>
                                {
                                    item.subItems.length > 0 && item.subItems.map((subItem, i) => {
                                        return (
                                            <Grid
                                                key={i}
                                                item
                                                xs={getColumnWidth(pageData?.sections[index]?.items[i]?.width)}
                                                style={{minWidth: pageData?.sections[index]?.items[i]?.width + '%'}}
                                            >
                                                {
                                                    ('image' in subItem) &&
                                                    <Image
                                                        imageComponent={pageData?.sections[index]?.items[i]}
                                                        otherLangsImage={subItem?.image}
                                                        sectionType={pageData?.sections[index]?.type}
                                                    />
                                                }
                                                {
                                                    ('text' in subItem) &&
                                                    <div style={{
                                                        backgroundColor: pageData?.sections[index]?.items[i]?.useBgColor ? state?.assets?.colors?.message?.main : 'white',
                                                        height: '100%'
                                                    }}>
                                                        <Paragraph
                                                            paragraph={subItem.text}
                                                        />
                                                    </div>
                                                }
                                                {
                                                    ('slider' in subItem) &&
                                                    <Slider
                                                        sliderComponent={pageData?.sections[index]?.items[i]}
                                                        slider={subItem?.slider}
                                                    />
                                                }
                                                {
                                                    ('sliderImages' in subItem) &&
                                                    <Slider
                                                        sliderComponent={pageData?.sections[index]?.items[i]}
                                                        otherLangSliderImages={subItem?.sliderImages}
                                                    />
                                                }
                                                {
                                                    ('sliderGallery' in subItem) &&
                                                    <SliderGallery
                                                        sliderGallery={pageData?.sections[index].items[i]}
                                                        otherLangSliderGallery={subItem?.sliderGallery}
                                                    />
                                                }
                                                {
                                                    ('sliderOnly' in subItem) &&
                                                    <SliderOnlyPreview masterid={pageData?.sections[index]?.items[i]?.masterid} />
                                                }
                                                {
                                                    ('booking' in subItem) &&
                                                    <WidgetBooking/>
                                                }
                                                {
                                                    ('contactForm' in subItem) &&
                                                    <ContactForm formData={pageData?.sections[index]?.items[i]}
                                                                 otherLangFormData={subItem?.contactForm?.labels}
                                                    />
                                                }
                                                {
                                                    ('map' in subItem) &&
                                                    <WrappedMap
                                                        googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAP_API_KEY}`}
                                                        loadingElement={<div style={{ height: `100%` }} />}
                                                        containerElement={<div style={{ height: `350px`, borderRadius: 10 }} />}
                                                        mapElement={<div style={{ height: `100%` }} />}
                                                    />
                                                }
                                            </Grid>
                                        )
                                    })
                                }
                            </Grid>
                        </Typography>
                    )
                })
            }
            {
                (state.langCode === state.defaultLang || !isExist) &&
                pageData.sections.length > 0 && pageData.sections.map((section, i) => {
                    return (
                        <Typography component={'div'} key={i}>
                            {
                                section?.title &&
                                <Grid container spacing={1} justify={'flex-start'}>
                                    <Grid item xs={12}>
                                        <div dangerouslySetInnerHTML={{__html: section.title}}></div>
                                    </Grid>
                                </Grid>
                            }
                            <Grid container spacing={1} justify={'flex-start'}>
                                {
                                    section.items.map((component, index) => {
                                        return (<Grid style={{minWidth: component.width + '%'}} item
                                                      xs={getColumnWidth(component.width)}
                                                      key={index}>
                                            {
                                                component.type === 'slider' &&
                                                <Slider sliderComponent={component}/>
                                            }
                                            {
                                                component?.type === 'card-slider' &&
                                                <CardSlider cardSlider={component} handleSelectedLink={handleSelectedLink} />
                                            }
                                            {
                                                component.type === 'sliderOnly' &&
                                                <SliderOnlyPreview masterid={component.masterid}/>
                                            }
                                            {
                                                component?.type === 'slider-gallery' &&
                                                <SliderGallery sliderGallery={component}/>
                                            }
                                            {
                                                component.type === 'image' &&
                                                <Image imageComponent={component} sectionType={section?.type}/>
                                            }
                                            {
                                                component.type === 'paragraph' &&
                                                <div style={{
                                                    backgroundColor: component?.useBgColor ? state?.assets?.colors?.message?.main : 'white',
                                                    height: '100%'
                                                }}>
                                                    <Paragraph paragraph={component}/>
                                                </div>
                                            }
                                            {
                                                component.type === 'widgetbooking' &&
                                                <WidgetBooking/>
                                            }
                                            {
                                                component.type === 'contactForm' &&
                                                <ContactForm formData={component}/>
                                            }
                                            {
                                                component.type === 'map' &&
                                                <WrappedMap
                                                    googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAP_API_KEY}`}
                                                    loadingElement={<div style={{height: `100%`}}/>}
                                                    containerElement={<div
                                                        style={{height: `350px`, borderRadius: 10}}/>}
                                                    mapElement={<div style={{height: `100%`}}/>}
                                                />
                                            }
                                        </Grid>)
                                    })
                                }
                            </Grid>
                        </Typography>
                    )
                })
            }
        </div>
    )

}

const mapStateToProps = state => {
    return {
        state: state.formReducer.pageBuilder
    }
};

export default connect(
    mapStateToProps,
)(PageItemList);
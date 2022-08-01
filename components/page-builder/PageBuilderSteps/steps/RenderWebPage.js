import React from 'react'
import Slider from '../components/page/sections/slider/Slider'
import SliderOnlyPreview from '../components/page/sections/slider-only/Slider'
import SliderGallery from '../components/page/sections/slider-gallery/SliderGallery'
import Image from '../components/page/sections/image/Image'
import Paragraph from '../components/page/sections/paragraph/Paragraph'
import WidgetBooking from '../../../ibe/widget/booking'
import ContactForm from '../components/page/sections/contact-form/ContactForm'
import WrappedMap from '../components/page/sections/map/Map'
import CardSlider from "../components/page/sections/card-type-slider/CardSlider"
import { Typography, Grid } from '@material-ui/core'

const getColumnWidth = (width) => {
    return Math.floor((width/100) * 12);
}

export default function RenderWebPage(props) {
    const { sections } = props

    return (
        <React.Fragment>
            {sections.map((section, i) => {
                return (
                    <Typography key={i} component={'div'}>
                        {
                            section?.title &&
                            <Grid container spacing={1} justify={'flex-start'}>
                                <Grid item xs={12}>
                                    <div dangerouslySetInnerHTML={{ __html: section.title }}/>
                                </Grid>
                            </Grid>
                        }
                        <Grid key={i} container spacing={1} justify={'flex-start'}>
                            {
                                section.items.map((component, index) => {
                                    return (<Grid style={{ minWidth: component.width + '%' }} item xs={getColumnWidth(component.width)} key={index}>
                                        {
                                            component.type === 'slider' &&
                                            <Slider sliderComponent={component} />
                                        }
                                        {
                                            component?.type === 'card-slider' && <CardSlider cardSlider={component} />
                                        }
                                        {
                                            component.type === 'sliderOnly' &&
                                            <SliderOnlyPreview masterid={component.masterid} />
                                        }
                                        {
                                            component?.type === 'slider-gallery' &&
                                            <SliderGallery sliderGallery={component} />
                                        }
                                        {
                                            component.type === 'image' &&
                                            <Image imageComponent={component} sectionType={section?.type} />
                                        }
                                        {
                                            component.type === 'paragraph' &&
                                            <Paragraph paragraph={component} />
                                        }
                                        {
                                            component.type === 'widgetbooking' &&
                                            <WidgetBooking />
                                        }
                                        {
                                            component.type === 'contactForm' &&
                                            <ContactForm formData={component} />
                                        }
                                        {
                                            component.type === 'map' &&
                                            <WrappedMap
                                                googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAP_API_KEY}`}
                                                loadingElement={<div style={{ height: `100%` }} />}
                                                containerElement={<div
                                                style={{ height: `350px`, borderRadius: 10 }} />}
                                                mapElement={<div style={{ height: `100%` }} />}
                                            />
                                        }
                                    </Grid>)
                                })
                            }
                        </Grid>
                    </Typography>
                )
            })}
        </React.Fragment>
    )
}
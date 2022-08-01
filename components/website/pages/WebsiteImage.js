import React, { memo, useContext, useEffect, useState } from 'react'
import WebCmsGlobal from 'components/webcms-global'
import { makeStyles } from '@material-ui/core/styles'
import ThumbnailSliderModal from './SliderModal'
import clsx from 'clsx'

const useStyles = makeStyles(() => ({
    box: {
        position: 'relative',
        textAlign: 'center',
        color: 'white',
    },
    text: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 999,
        height: '100%',
        width: '100%',
    },
    textColor: {
        color: (props) => (props?.imageData?.textColor ? props.imageData.textColor : '#000000'),
    },
    image: {
        width: '100%',
        backgroundSize: 'cover',
        borderRadius: 10,
        minHeight: 100,
        height: (props) => {
            if (props.sectionType === 'threecol') return 200
            if (props.sectionType === 'twocol') return 300
            if (props.sectionType === 'fullcol') return 'auto'
        },
        marginBottom: 8
    },
    cursorPointer: {
        cursor: 'pointer',
    },
}))

const WebsiteImage = (props) => {
    const { imageData, otherLangImage, selectedLang, defaultLang, sectionImages, itemID } = props
        , [image, setImage] = useState('')
        , [isOpenSlider, setIsOpenSlider] = useState(false)
        , { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
        , classes = useStyles(props)
        , [sliderImages, setSliderImages] = useState(sectionImages)

    useEffect(() => {
        if (imageData && imageData.gid) {
            setImage({
                fileurl: imageData.gid.fileurl,
                title: selectedLang === defaultLang ? imageData.gid.title : otherLangImage.title,
                description: selectedLang === defaultLang ? imageData.gid.description : otherLangImage.description,
            })
        }
        handleResetSliderImages()
    }, [imageData, otherLangImage, sectionImages])

    const handleResetSliderImages = () => {
        if (sectionImages?.length) setSliderImages(sectionImages.map((s) => s.gid))
    }

    return (
        <React.Fragment>
            {image && Object.keys(image).length > 0 && (
                <div className={classes.box}>
                    <img
                        alt={'image'}
                        onClick={() => {
                            if (sliderImages?.length) {
                                let updatedSliderImages = [...sliderImages]
                                const img = sectionImages?.find((image) => image.id === itemID)
                                const index = sectionImages?.indexOf(img)
                                const tmp = updatedSliderImages[0]
                                updatedSliderImages[0] = sliderImages[index]
                                updatedSliderImages[index] = tmp
                                setSliderImages(updatedSliderImages)
                                setIsOpenSlider(true)
                            }
                        }}
                        className={clsx({
                            [classes.image]: true,
                            [classes.cursorPointer]: sliderImages?.length,
                        })}
                        src={GENERAL_SETTINGS.STATIC_URL + image.fileurl}
                    />
                    <div className={classes.text}>
                        <div className={classes.textColor} dangerouslySetInnerHTML={{ __html: image.title }}/>
                        <div className={classes.textColor} dangerouslySetInnerHTML={{ __html: image.description }} />
                    </div>
                </div>
            )}
            <ThumbnailSliderModal
                open={isOpenSlider}
                sliderTitle={image?.title || 'Image'}
                sliderDesc={image?.description}
                onClose={(e) => {
                    setIsOpenSlider(e)
                    handleResetSliderImages()
                }}
                sliderImages={sliderImages}
            />
        </React.Fragment>
    )
}

const memorizedWebsiteImage = memo(WebsiteImage)

export default memorizedWebsiteImage

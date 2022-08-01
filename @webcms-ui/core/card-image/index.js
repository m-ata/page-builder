import React from "react"
import PropTypes from 'prop-types'
import Image from 'next/image'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
    root: {
        position: 'relative',
        maxWidth: '100%',
    },
}))

export default function CardImage(props) {

    let { src, alt, layout, onClick, cursor, width, minWidth, height, loadPriority, className } = props;
    const classes = useStyles()

    let style = {}
    if(cursor !== 'unset') {
        style.cursor = cursor
    }

    if(height !== 0){
        style.height = height
    }

    if(width !== 0){
        style.width = width
    }

    if(minWidth !== 0){
        style.minWidth = minWidth
    }

    return (
        <div onClick={typeof onClick === "function" ? ()=> onClick() : null} className={className ? className + ' ' + classes.root : classes.root} style={style}>
            <Image
                src={src ? src : '/imgs/not-found.png'}
                alt={alt}
                width={500}
                height={300}
                quality={process.env.IMG_CACHE_QUALITY && Number(process.env.IMG_CACHE_QUALITY) || 60}
                piority={loadPriority}
            />
        </div>
    )
}

CardImage.defaultProps = {
    src: '',
    alt: '',
    layout: 'fill',
    cursor: 'unset',
    height: 0,
    width: 0,
    minWidth: 0,
}

CardImage.propTypes = {
    src: PropTypes.string,
    alt: PropTypes.string,
    layout: PropTypes.string,
    onClick: PropTypes.func,
    cursor: PropTypes.string,
    height: PropTypes.number,
    width: PropTypes.number,
    minWidth: PropTypes.number
}
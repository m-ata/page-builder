import React from "react"
import Image from 'next/image'

export default function CarouselItem(props) {
    const { key, rootCls, img, title, loadPriority } = props
    let imgUrl = img

    if (img.includes('null')) {
        imgUrl = '/imgs/not-found.png'
    }

    return (
        <div key={key} className={rootCls}>
            <Image
                src={imgUrl}
                alt={title}
                layout='fill'
                quality={process.env.IMG_CACHE_QUALITY && Number(process.env.IMG_CACHE_QUALITY) || 60}
                piority={loadPriority}
            />
        </div>
    )
}

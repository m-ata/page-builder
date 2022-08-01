import React, { memo, useContext } from 'react'
import ReactPlayer from 'react-player';
import WebCmsGlobal from "../../../../../../webcms-global";

const Video = (props) => {
    const { videoComponent } = props
    , { GENERAL_SETTINGS } = useContext(WebCmsGlobal);

    return <ReactPlayer style={{pointerEvents: 'none'}} playing url={GENERAL_SETTINGS.STATIC_URL + videoComponent?.url} width="100%" height="100%" controls={true} />
}

const memorizedVideo = memo(Video)

export default memorizedVideo
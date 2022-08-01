import React from 'react';
import PropTypes from 'prop-types'


export  default function YoutubeVideoViewer(props) {
    
    const { videoId, width, height } = props;
    
    
    return(
        <iframe width={width} height={height} src={`https://www.youtube.com/embed/${videoId}`} frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
    );
}

YoutubeVideoViewer.defaultProps = {
    videoId: "",
    width: 0,
    height: 0
}

YoutubeVideoViewer.propTypes = {
    src: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number
}
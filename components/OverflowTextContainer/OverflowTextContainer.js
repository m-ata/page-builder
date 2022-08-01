import { makeStyles } from '@material-ui/core';
import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import useTranslation from '../../lib/translations/hooks/useTranslation';
import PropTypes from 'prop-types';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    textContainer: props => ({
        lineHeight: `${props.lineHeight}px`,
        height: props.maxHeight,
        maxHeight: props.maxHeight,
        wordBreak: 'break-all',
        display: '-webkit-box',
        '-webkit-box-orient': 'vertical',
        '-moz-box-orient': 'vertical',
        '-ms-box-orient': 'vertical',
        'box-orient': 'vertical',
        '-webkit-line-clamp': props.lineCount,
        '-moz-line-clamp': props.lineCount,
        '-ms-line-clamp': props.lineCount,
        'line-clamp': props.lineCount,
        overflow: 'hidden'
    }),
    textContainerBlock: {
        display: 'block'
    }
}))

function OverflowTextContainer(props) {
    const { children, showButton, buttonText, buttonIcon, maxHeight, lineHeight, lineCount } = props;
    const classes = useStyles({lineCount, lineHeight, maxHeight})

    //localization
    const { t } = useTranslation()
    
    //state
    const [isExpand, setIsExpand] = useState(false)
    const [isOverflow, setIsOverflow] = useState(false)
    const containerRef = useRef(null)
   


    useEffect(() => {
        if(containerRef) {
            if (containerRef.current?.scrollHeight > containerRef.current?.offsetHeight){
                setIsOverflow(true)
            } else {
                setIsOverflow(false)
            }
        }
    }, [containerRef])

    const handleExpand = () => {
        setIsExpand(!isExpand)
    }


    return(
        <div ref={containerRef} className={classes.textContainer}>
            {children}
            {(showButton && isOverflow) && (
                <div style={{ paddingTop: '4px' }}>
                    <Button 
                        endIcon={buttonIcon || <ExpandMoreIcon />}
                        onClick={() => handleExpand()}
                    >
                        {t(buttonText)}
                    </Button>
                </div>
            )}
        </div>
    )

}

export default OverflowTextContainer;


OverflowTextContainer.defaultProps = {
    buttonText: 'str_showAll',
    lineHeight: 20,
    lineCount: 5,
    maxHeight: 100,
    showButton: false
}

OverflowTextContainer.propTypes = {
    buttonText: PropTypes.string,
    lineHeight: PropTypes.number,
    lineCount: PropTypes.number,
    maxHeight: PropTypes.number,
    showButton: PropTypes.bool,
    buttonIcon: PropTypes.any
}
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';




export default function GoUpButton(props) {
    const {top, right, bottom, left, zIndex, buttonVariant, buttonBorderRadius, buttonPadding } = props;
    const [scrollIndex, setScrollIndex] = useState(0);


    const handleGoUp = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        })
    }

    const handleGetScroll = () => {
        setScrollIndex(window.scrollY);
    }

    useEffect(() => {
        window.addEventListener("scroll", handleGetScroll);

        return () => window.removeEventListener("scroll", handleGetScroll)
    }, [])

    return(
        <div style={{position: "relative"}}>
            <div style={{position: "fixed", top: top, right: right, bottom: bottom, left: left, zIndex: zIndex, opacity: scrollIndex > 20 ? "1" : "0"}}>
                <Button
                    style={{borderRadius: buttonBorderRadius, padding: buttonPadding, minWidth: "auto"}}
                    onClick={handleGoUp}
                    color={"primary"}
                    variant={buttonVariant}
                >
                    <ArrowUpwardIcon style={{color: "#FFFF"}}/>
                </Button>
            </div>
        </div>
    )
}

GoUpButton.defaultProps = {
    top: "unset",
    right: "unset",
    bottom: "unset",
    left: "unset",
    zIndex: 1,
    buttonVariant: "contained",
    buttonBorderRadius: 4,
    buttonPadding: "6px 16px"

}

GoUpButton.propTypes = {
    top: PropTypes.any,
    right: PropTypes.any,
    bottom: PropTypes.any,
    left: PropTypes.any,
    zIndex: PropTypes.number,
    buttonVariant: PropTypes.string,
    buttonBorderRadius: PropTypes.any,
    buttonPadding: PropTypes.any
}
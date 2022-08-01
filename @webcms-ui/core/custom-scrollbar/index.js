import React, { useState, useEffect, useRef, useCallback } from "react";
import {makeStyles} from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
    scrollContainer: {
        position: "relative",
        height: "100%"
    },
    scrollBarStyle: {
        width: "100%",
        height: "7px",
        position: "absolute",
        borderRadius: "8px",
        backgroundColor: "rgba(0, 0, 0, 0.35)"
    },
    scrollDiv: {
        "&::-webkit-scrollbar": {
            width: 0,
            display: "none"
        },
        overflow: "auto",
        width: "100%",
        scrollbarWidth: "none",
        position: "relative"
    },
    scrollThump: {
        width: "8px",
        height: "7px",
        marginLeft: "1px",
        position: "absolute",
        borderRadius: "8px",
        opacity: 1,
        top: 0,
        backgroundColor: "rgba(0, 0, 0, 0.55)"
    }
}))

const SCROLL_BOX_MIN_WIDTH = 20

function CustomScrollbar(props) {
    const classes = useStyles()
    const { children } = props;
    const [scrollBoxWidth, setScrollBoxWidth] = useState(SCROLL_BOX_MIN_WIDTH);
    const [scrollBoxLeft, setScrollBoxLeft] = useState(0);
    const [lastScrollThumbPosition, setScrollThumbPosition] = useState(0);
    const [isDragging, setDragging] = useState(false);
    const [hovering, setHovering] = useState(false);
    const scrollHostRef = useRef();

    const handleMouseOver = useCallback(() => {
        !hovering && setHovering(true);
    }, [hovering]);

    const handleMouseOut = useCallback(() => {
        !!hovering && setHovering(false);
    }, [hovering]);


    const handleScroll = useCallback(() => {
        if (!scrollHostRef) {
            return;
        }
        const scrollHostElement = scrollHostRef.current;
        const { scrollLeft, scrollWidth, offsetWidth } = scrollHostElement;
        let newTop =
            (parseInt(scrollLeft, 10) / parseInt(scrollWidth, 10)) * offsetWidth;
        //console.log(newTop, scrollBoxWidth, scrollLeft, scrollWidth, offsetWidth);

        //console.log(offsetWidth - scrollBoxWidth);
        // newTop = newTop + parseInt(scrollTop, 10);
        newTop = Math.min(newTop, offsetWidth - scrollBoxWidth);
        setScrollBoxLeft(newTop);



    }, []);

    useEffect(() => {
        if(scrollHostRef) {
            const scrollHostElement = scrollHostRef.current;
            const { clientWidth, scrollWidth } = scrollHostElement;
            const scrollBoxPercentage = clientWidth / scrollWidth;
            const scrollbarWidth = Math.max(
                scrollBoxPercentage * clientWidth,
                SCROLL_BOX_MIN_WIDTH
            );
            setScrollBoxWidth(scrollbarWidth);
            scrollHostElement.addEventListener("scroll", handleScroll, true);
            return function cleanup() {
                scrollHostElement.removeEventListener("scroll", handleScroll, true);
            };
        }
    }, [scrollHostRef])

    const handleDocumentMouseUp = useCallback(
        e => {
            if (isDragging) {
                e.preventDefault();
                setDragging(false);
            }
        },
        [isDragging]
    );

    const handleDocumentMouseMove = useCallback(
        e => {
            if (isDragging) {
                e.preventDefault();
                e.stopPropagation();
                const scrollHostElement = scrollHostRef.current;
                const { scrollWidth, offsetWidth } = scrollHostElement;

                let deltaX = e.clientX - lastScrollThumbPosition;
                let percentage = deltaX * (scrollWidth / offsetWidth);

                setScrollThumbPosition(e.clientX);
                setScrollBoxLeft(
                    Math.min(
                        Math.max(0, scrollBoxLeft + deltaX),
                        offsetWidth - scrollBoxWidth
                    )
                );
                scrollHostElement.scrollLeft = Math.min(
                    scrollHostElement.scrollLeft + percentage,
                    scrollWidth - offsetWidth
                );
            }
        },
        [isDragging, lastScrollThumbPosition, scrollBoxWidth, scrollBoxLeft]
    );

    useEffect(() => {
        //this is handle the dragging on scroll-thumb
        document.addEventListener("mousemove", handleDocumentMouseMove);
        document.addEventListener("mouseup", handleDocumentMouseUp);
        document.addEventListener("mouseleave", handleDocumentMouseUp);
        return function cleanup() {
            document.removeEventListener("mousemove", handleDocumentMouseMove);
            document.removeEventListener("mouseup", handleDocumentMouseUp);
            document.removeEventListener("mouseleave", handleDocumentMouseUp);
        };
    }, [handleDocumentMouseMove, handleDocumentMouseUp]);


    const handleScrollThumbMouseDown = useCallback(e => {
        e.preventDefault();
        e.stopPropagation();
        setScrollThumbPosition(e.clientX);
        setDragging(true);
    }, []);


    return(
        <div
            className={classes.scrollContainer}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
        >
            <div
                className={classes.scrollDiv}
                ref={scrollHostRef}
            >
                {children}
            </div>
            {
                scrollHostRef?.current?.scrollWidth > scrollHostRef?.current?.offsetWidth && (
                    <div className={classes.scrollBarStyle} >
                        <div
                            className={classes.scrollThump}
                            style={{width: scrollBoxWidth, left: scrollBoxLeft}}
                            onMouseDown={handleScrollThumbMouseDown}
                        />
                    </div>
                )
            }
        </div>
    );

}

export default CustomScrollbar;
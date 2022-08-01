import React, {useRef, useState, useEffect} from 'react'
import {Card, CardContent, List, ListItem, Typography, IconButton} from "@material-ui/core";
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import moment from "moment";
import {makeStyles} from "@material-ui/core/styles";
import clsx from 'clsx'


const useStyles = makeStyles((theme) => ({
    container: {
        display: 'flex',
        alignItems: 'center'
    },
    centeredContent: {
        justifyContent: 'center',
    },
    mainRoot: {
        overflow: 'auto',
        '&::-webkit-scrollbar': {
            display: 'none'
        },
    },
    listRoot: {
        display: 'inline-flex',
    },
    cardContent: {
        padding: 10,
        minWidth: 65,
        "&:last-child": {
            padding: 10
        }
    },
    listItemRoot: {
        paddingTop: '0',
        paddingBottom: '0',
        border: `1px solid ${theme.palette.primary.main}`,
        margin: '0 4px',
        cursor: 'pointer'
    },
    active: {
        borderColor: '#FFC107'
    },
    cardText: {
        fontSize: '14px',
        textAlign: 'center'
    },
    withPaddingBottom: {
        paddingBottom: '4px'
    },
    cardTextUpperCase: {
        textTransform: 'uppercase'
    },
    leftIcon: {
        paddingRight: '16px'
    },
    rightIcon: {
        paddingLeft: '16px'
    }
}))

export default function HorizontalList(props) {
    const classes = useStyles()

    const { list, onClick, showLeftButton, showRightButton, value, fields } = props
    const [selectedItem, setSelectedItem] = useState(value)
    const [isLoadedRef, setIsLoadedRef] = useState(false)

    const mainRef = useRef()


    useEffect(() => {
        if(mainRef?.current) setIsLoadedRef(true)
    }, [mainRef])

    const handleWheel = (e) => {
        mainRef.current.scrollLeft = e.deltaY + mainRef?.current?.scrollLeft
    }

    const handleOnClick = (e) => {
        if(typeof onClick === 'function') {
            onClick(e)
            setSelectedItem(e)
        }
    }

    const handleScrollWithButton = (type) => {
        const scrollLeft = mainRef?.current?.scrollLeft
        const scrollWidth = mainRef?.current?.scrollWidth
        const offsetWidth = mainRef?.current.offsetWidth
        const maxScroll = scrollWidth - offsetWidth
        if(type === 'right') {
            if((scrollLeft + 150) >= maxScroll) {
                mainRef.current.scrollLeft = maxScroll
            } else if((scrollLeft + 150) < maxScroll) {
                mainRef.current.scrollLeft += 150
            }
        } else if(type === 'left') {
            if((scrollLeft - 150) <= 0) {
                mainRef.current.scrollLeft = 0
            } else if((scrollLeft - 150) > 0) {
                mainRef.current.scrollLeft -= 150
            }
        }
    }




    return(
        <div className={clsx(classes.container, {[classes.centeredContent]: mainRef?.current?.scrollWidth <= mainRef?.current?.offsetWidth})}>
            {
                list && list?.length > 0 && showLeftButton && mainRef?.current?.scrollWidth > mainRef?.current?.offsetWidth && (
                    <div className={classes.leftIcon}>
                        <IconButton onClick={() => handleScrollWithButton('left')}>
                            <KeyboardArrowLeftIcon />
                        </IconButton>
                    </div>
                )
            }
            <div
                ref={mainRef}
                className={classes.mainRoot}
                onWheel={(e) =>  handleWheel(e)}
            >
                <List className={classes.listRoot}>
                    {
                        list.map((item, index) => (
                            <ListItem
                                disableGutters
                                key={index}
                                className={clsx(classes.listItemRoot, {[classes.active]: selectedItem === item?.item})}
                                onClick={() => handleOnClick(item?.item)}
                                selected={selectedItem === item?.item}
                            >
                                <Card>
                                    <CardContent className={classes.cardContent}>
                                        {fields && fields.length > 0 && (
                                            fields.map((field, i) => (
                                                <Typography key={`${i}-p`} className={clsx(classes.cardText, classes.withPaddingBottom, {[classes.cardTextUpperCase]: field?.uppercase})}>
                                                    {field?.useMoment ? (
                                                        moment(item[field?.name], field?.convertFormat).format(field?.renderFormat)
                                                    ): (
                                                        item[field?.name]
                                                    )}
                                                </Typography>
                                            ))
                                        )}
                                    </CardContent>
                                </Card>
                            </ListItem>
                        ))
                    }
                </List>
            </div>
            {
                list && list?.length > 0 && showRightButton && mainRef?.current?.scrollWidth > mainRef?.current?.offsetWidth && (
                    <div className={classes.rightIcon}>
                        <IconButton onClick={() => handleScrollWithButton('right')}>
                            <KeyboardArrowRightIcon />
                        </IconButton>
                    </div>
                )
            }
        </div>

    )
}
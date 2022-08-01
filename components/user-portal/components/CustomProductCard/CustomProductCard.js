import React from 'react';
import PropTypes from "prop-types";
import {Avatar, Card, CardActions, CardContent, CardHeader, Typography, Button} from '@material-ui/core';
import useTranslation from '../../../../lib/translations/hooks/useTranslation';
import Link from 'next/link'
import {makeStyles} from '@material-ui/core/styles';



const useStyles = makeStyles(theme => ({
    root:{
        transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
            "&:hover": {
            background: '#f0f7f9',
                transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'
        },
    },
    title:{
        paddingBottom:"8px",
        fontSize: "14px",
        fontWeight: "600",
        color: '#648B92',
        textTransform: 'uppercase',
    },
    cardHeader:{
        padding: 0,
        alignItems:"start"
    },
    cardContent: {
        padding: "40px 24px 0 24px",
    },
    productTitle: {
        fontWeight: "bold",
        fontSize: '24px',
        color: '#122D31',
        lineHeight:"125%",
        letterSpacing:"-0.02em",
        [theme.breakpoints.down('md')]: {
            fontSize: '16px',
        },
    },
    avatarColor:{
        backgroundColor: 'red'
    },
    shortDesc:{
        paddingTop: "24px",
        fontSize: '16px',
        fontWeight: "500",
        color:"#30555B",
    },
    avatar:{
        width: 30,
        height: 30,
        backgroundColor: '#F8C9BE'
    },
    cardAvatar:{
        marginRight: 10
    },
    cardAction: {
        padding:"0 24px 45px 16px",
        "&.MuiCardActions-spacing > :not(:first-child)": {
            marginLeft: "auto"
        }
    },
    tryDemoButton: {
        fontSize: "21px",
        color: "#67B548",
        backgroundColor: "#ffffff00",
        boxShadow: "none",
        textTransform: "none",
        "&:hover,&:visited": {
            color: "#8CCD6F",
            backgroundColor: "#ffffff00",
            boxShadow: "none"
        },
        "&:active,&:focus": {
            color: "#448B39",
            backgroundColor: "transparent",
        }
    },
    buyNowButton: {
        minWidth: "146px",
        color: "#FFF",
        fontSize: "19px",
        backgroundColor: "#67B548",
        textTransform: "none",
        "&:hover": {
            backgroundColor: "#8CCD6F",
        },
        "&:active,&:focus": {
            backgroundColor: "#448B39",
        },
        [theme.breakpoints.down('sm')]: {
            minWidth: "auto",
        },
    },
    priceText: {
        paddingTop: "24px",
        fontSize: '29px',
        fontWeight: "bold",
        color:"#4D4F5C",
    }
}))

export default function CustomProductCard(props) {
    const classes = useStyles();
    const {className, productName, productType, productShortDesc, productIcon, productPageLink, isProdType, price, priceCurrencyCode} = props;
    const {t} = useTranslation();
    
    return (
        <Card className={classes.root}>
            <CardContent className={classes.cardContent}>
                {isProdType &&
                <Typography className={classes.title}>
                    {productType}
                </Typography>
                }
                <CardHeader
                    classes={{root: classes.cardHeader, title: classes.productTitle, avatar: classes.cardAvatar}}
                    avatar={
                        /*
                         <Avatar aria-label="recipe" className={classes.avatar} src={"/assets/img/icons/" + productIconName + ".png"}/>
                         */
                        <Avatar className={classes.avatar}>
                            {productIcon}
                        </Avatar>
                    }
                    title={
                        <span> {productName}</span>
                    }
                />
                <Typography className={classes.shortDesc}>
                    {productShortDesc}
                </Typography>
                <Typography className={classes.priceText}>
                    {`${price} ${priceCurrencyCode}` }
                </Typography>
            </CardContent>
            <CardActions className={classes.cardAction}>
                <Link href="https://hotech.systems/try-for-free" >
                    <a target={"_blank"} style={{textDecoration:"none"}}>
                        <Button className={classes.tryDemoButton}>
                            {t("str_tryDemo")}
                        </Button>
                    </a>
                </Link>
                <Link href="https://hotech.systems/try-for-free" >
                    <a target={"_blank"} style={{textDecoration:"none"}}>
                        <Button className={classes.buyNowButton}>
                            {t("str_buyNow")}
                        </Button>
                    </a>
                </Link>
            </CardActions>
        </Card>
    );
}

CustomProductCard.propTypes = {
    className: PropTypes.string,
    productName: PropTypes.string,
    productType: PropTypes.string,
    productShortDesc: PropTypes.string,
    productIconName: PropTypes.string,
    productPageLink: PropTypes.string
};
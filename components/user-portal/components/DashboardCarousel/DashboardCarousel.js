import React from 'react';
import {setToState} from '../../../../state/actions';
import { connect, useSelector } from 'react-redux';
import {makeStyles} from "@material-ui/core/styles";
import Button from '@material-ui/core/Button'
import Carousel from 'react-bootstrap/Carousel';
import PrevIcon from '@material-ui/icons/KeyboardArrowLeft';
import NextIcon from '@material-ui/icons/KeyboardArrowRight';
import useTranslation from '../../../../lib/translations/hooks/useTranslation';


const useStyles = makeStyles(theme => ({
    sliderIcon: {
        color: "#252525c7",
        fontSize: "60px"
    },
    viewButton: {
        width: "150px",
        border:"1px solid black",
        backgroundColor: "#FFF",
        textTransform: "none",
        "&:hover": {
            backgroundColor: "#FFF",
        },
        [theme.breakpoints.down('sm')]: {
            padding: "2px 0",
            marginLeft: "0",
            width: "100px",
            fontSize: "13px",
        },
        [theme.breakpoints.only('xs')]: {
            marginTop: "8px",
        },
    },
    visitButton: {
        width: "150px",
        border:"1px solid black",
        backgroundColor: "#FFF",
        textTransform: "none",
        "&:hover": {
            backgroundColor: "#FFF",
        },
        [theme.breakpoints.down('sm')]: {
            padding: "2px 0",
            width: "100px",
            fontSize: "13px"
        },
    },
    spacing64: {
        paddingTop: "64px",
        [theme.breakpoints.down('sm')]: {
            paddingTop: "0",
        },
    }
}))

const imgArray = [
    {
        imgLink: "https://cloud.hotech.systems/files/7C3F5C18-1A47-4D4A-92E2-FE024ABED03E/AGENCY/99862/Group16769_2.png",
        productLink: "mobilepms"
    },
    {
        imgLink: "https://cloud.hotech.systems/files/7C3F5C18-1A47-4D4A-92E2-FE024ABED03E/AGENCY/99862/Group16771_2.png",
        productLink: "guestapp"
    },
    {
        imgLink: "https://cloud.hotech.systems/files/7C3F5C18-1A47-4D4A-92E2-FE024ABED03E/AGENCY/99862/Group16772_2.png",
        productLink: "otello-dashboss"
    },
    
    
]


function DashboardCarousel() {
    const classes = useStyles();
    
    const { t } = useTranslation();
    
    function handleVisit() {
        const win = window.open("https://hotech.systems/products", "_blank");
        win.focus();
    }
    
    function handleView(productLink) {
        if(productLink === "mobilepms") {
            const win = window.open(`http://mobilepms.net/`, "_blank");
            win.focus();
        } else {
            const win = window.open(`https://hotech.systems/products/detail/${productLink}`, "_blank");
            win.focus();
        }
    }
    
    return(
        <React.Fragment>
            <div style={{marginLeft: "-30px"}}>
                <Carousel
                    slide={true}
                    pause={'hover'}
                    nextIcon={<NextIcon className={classes.sliderIcon} />}
                    prevIcon={<PrevIcon className={classes.sliderIcon} />}
                >
                    {
                        imgArray.map((item,i) => {
                            return(
                                <Carousel.Item key={`item-${i}`}>
                                    <div
                                        style={{
                                            width: "100%",
                                            height: '300px',
                                            backgroundImage: `url(${item.imgLink}`,
                                            backgroundSize: 'cover'
                                        }}/>
                                    <Carousel.Caption>
                                        <div>
                                            {/*<Button className={classes.visitButton} onClick={handleVisit}>{t("str_visitProducts")}</Button>*/}
                                            <Button className={classes.viewButton} onClick={() => handleView(item.productLink)}>{t("str_view")}</Button>
                                        </div>
                                    </Carousel.Caption>
                                </Carousel.Item>
                               
                            );
                        })
                    }
                </Carousel>
            </div>
            <div className={classes.spacing64}/>
        </React.Fragment>
    );
    
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.userPortal,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(DashboardCarousel)
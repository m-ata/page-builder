import React, { useEffect, useState } from 'react'
import { Container, Grid, Card, CardMedia, CardContent, Button,  Typography, CardActionArea } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import useTranslation from 'lib/translations/hooks/useTranslation'
import Info from '../../../public/Info'
import Events from '../../../public/Events'
import BackIcon from '@material-ui/icons/KeyboardBackspace'
import Surveys from '../../MyProfile/Surveys'
import MyRequest from '../../MyRequest'
import { useSelector } from 'react-redux'
import LoginDialog from '../../../../LoginComponent/LoginDialog'
import { useSnackbar } from 'notistack'

const useStyles = makeStyles((theme) => ({
    root: {
        background: '#ffffff 0% 0% no-repeat padding-box',
        boxShadow: '0px 3px 6px #122D3129',
        paddingBottom: 10,
        borderRadius: 10
    },
    nameText: {
        color: theme.palette.primary.main,
    },
    offerImage: {
        height: 240,
        borderRadius: 10
    },
    ctaButton: {
        borderWidth: 2.3,
        fontWeight: 400,
        margin: '0 auto',
        width: '95%',
        '&:hover': {
            borderWidth: 2.3,
            fontWeight: 400,
        }
    },
    descriptionText: {
        fontSize: 18,
        color: '#707070',
        textAlign: 'center',
        padding: '0 6px',
        height: 48,
        overflow: 'auto',
    },
    paper: {
        position: 'absolute',
        top: 10,
        background: '#E2F4F7 0% 0% no-repeat padding-box',
        boxShadow: '0px 3px 6px #00000029',
        borderRadius: '6px 6px 6px 0px',
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2F3434',
    },
    priceBox: {
        position: 'absolute',
        top: 0,
        background: '#ffffffc9',
        marginTop: '20%',
        padding: 7,
        paddingBottom: 5,
        paddingLeft: 10,
        borderRadius: '0px 5px 5px 0px',
        boxShadow: '3px 0 6px #17171766'
    },
    night: {
        fontSize: 14,
        color: '#2F3434',
        marginLeft: 5,
    },
    form: {
        alignItems: 'center',
    },
    submit: {
        backgroundColor: '#FFFFFF',
        border: '2px solid #198C9B',
        borderRadius: 6,
    },
    book: {
        fontSize: 16,
        color: '#198C9B',
    },
    media: {
        height: 221,
        backgroundSize: 'cover',
    },
}))

const HomeCard = (props) =>{
    const classes = useStyles()
    const { title, description, imageUrl, onClick } = props
    const { t } = useTranslation()

    return (
        <Card className={classes.root} onClick={()=> onClick()}>
            <CardActionArea>
                <CardMedia
                    className={classes.offerImage}
                    image={imageUrl}
                    alt={t(description)}
                />
                <CardContent>
                    <Typography gutterBottom variant='h5' component='h2' align='center' className={classes.nameText}>
                        {t(title)}
                     </Typography>
                    <Typography variant='body2' color='textSecondary' component='p' align='center'>
                        {t(description)}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    )
}

const Home = () => {
    const { t } = useTranslation()
    const { enqueueSnackbar } = useSnackbar()
    const [useHomePage, setHomePage] = useState(false)
    const [isOpenLoginDialog, setIsOpenLoginDialog] = useState(false)
    const isLogin = useSelector((state) => state.orest.currentUser && state.orest.currentUser.auth) ? true : false

    const homeMenuList = [
        {
            imageUrl: 'imgs/guest/kiosk/alacarte-res.png',
            title: 'str_aLaCarteReservations',
            description: '',
            onClick: ()=> {
                if(!isLogin){
                    enqueueSnackbar(t('str_youMustLoginFirst'), { variant: 'info' })
                    setIsOpenLoginDialog(true)
                }else{
                    setHomePage('ALACARTE_RES')
                }
            },
            isHide: false
        },
        {
            imageUrl: 'imgs/guest/kiosk/events-res.png',
            title: 'str_eventReservations',
            description: '',
            onClick: ()=> {
                if(!isLogin){
                    enqueueSnackbar(t('str_youMustLoginFirst'), { variant: 'info' })
                    setIsOpenLoginDialog(true)
                }else{
                    setHomePage('EVENTS_RES')
                }
            },
            isHide: true
        },
        {
            imageUrl: 'imgs/guest/kiosk/fill-survey.png',
            title: 'str_fillSurvey',
            description: '',
            onClick: () => {
                if(!isLogin){
                    enqueueSnackbar(t('str_youMustLoginFirst'), { variant: 'info' })
                    setIsOpenLoginDialog(true)
                }else{
                    setHomePage('FILL_SURVEY')
                }
            },
            isHide: false
        },
        {
            imageUrl: 'imgs/guest/kiosk/request.png',
            title: 'str_request',
            description: '',
            onClick: () => {
                if(!isLogin){
                    enqueueSnackbar(t('str_youMustLoginFirst'), { variant: 'info' })
                    setIsOpenLoginDialog(true)
                }else{
                    setHomePage('REQUEST')
                }
            },
            isHide: false
        }
    ]

    const renderMenuComponent = (menuItem) => {
        let component
        switch (menuItem) {
            case 'ALACARTE_RES':
                component = <Info onlyRes={true} />
                break
            case 'EVENTS_RES':
                component = <Events onlyRes={true} />
                break
            case 'FILL_SURVEY':
                component = <Surveys />
                break
            case 'REQUEST':
                component = <MyRequest />
                break
        }

        return component
    }

    return (
        <Container fixed maxWidth="lg">
            <LoginDialog open={isOpenLoginDialog} onClose={(status) => setIsOpenLoginDialog(status)} locationName='guest' isLoginWrapper disableRegister/>
            <Grid container spacing={3}>
                {!useHomePage ? homeMenuList.filter(hMenuItem => !hMenuItem.isHide).map((item, index)=> {
                    return (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <HomeCard
                                imageUrl={item.imageUrl}
                                title={item.title}
                                description={item.description}
                                onClick={()=> item.onClick()}
                            />
                        </Grid>
                    )
                }):
                    <React.Fragment>
                        <Button
                            style={{
                                marginBottom: 10
                            }}
                            variant="outlined"
                            color="primary"
                            size="large"
                            startIcon={<BackIcon />}
                            onClick={()=> setHomePage(false)}
                        >
                            {t('str_back')}
                        </Button>
                        {renderMenuComponent(useHomePage)}
                    </React.Fragment>
                }
            </Grid>
        </Container>
    )
}

export default Home
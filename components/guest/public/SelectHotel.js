import React, { useEffect, useContext } from 'react'
import { connect } from 'react-redux'
import { UseOrest } from '@webcms/orest'
import { setToState, updateState } from 'state/actions'
import { useSelector } from 'react-redux'
import { Container } from '@material-ui/core'
import useTranslation from 'lib/translations/hooks/useTranslation'
import WebCmsGlobal from 'components/webcms-global'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import { jsonGroupBy, LOCAL_STORAGE_OREST_TOKEN_TEXT } from 'model/orest/constants'
import Grid from '@material-ui/core/Grid'
import withWidth from '@material-ui/core/withWidth'
import { useSnackbar } from 'notistack'
import { useRouter } from 'next/router'
import IconButton from '@material-ui/core/IconButton'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflowX: 'hidden',
        backgroundColor: theme.palette.background.paper,
        minHeight: 600,
        height:'100vh',
        borderRadius: 2,
    },
    gridList: {
        width: '100%',
        marginBottom: '25px!important'
    },
    gridListTitle: {
        height: 55,
        background: '#e3eaea',
        borderBottom: '1px solid rgb(224 224 224)',
        color: '#79756d'
    },
    icon: {
        color: 'rgb(255 255 255 / 83%)',
    },
}))

const HotelCard = ({title, imgUrl, onClick}) => {
    return (
        <Card onClick={() => onClick()} variant="outlined">
            <CardActionArea>
                <CardMedia
                    component="img"
                    height="190"
                    image={imgUrl}
                    alt={title}
                />
                <CardContent style={{padding: '0 10px 0 10px'}}>
                    <Grid container direction="row" alignItems="center" justify={'space-between'}>
                        <Grid item>
                            <Typography variant="button" component="div">
                                {title}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <IconButton style={{ position: 'relative', left: 10 }} onClick={() => onClick()}>
                                <ArrowForwardIcon/>
                            </IconButton>
                        </Grid>
                    </Grid>
                </CardContent>
            </CardActionArea>
        </Card>
    )
}

const SelectHotel = (props) => {
    const { setToState, onClose } = props
    const classes = useStyles()
    const router = useRouter()

    let currentUser = useSelector((state) => state.orest.currentUser && state.orest.currentUser)
    const token = useSelector((state) => state?.orest?.currentUser?.auth?.access_token || false)
    const hotelRefNo = Number(router.query.hotelrefno)

    const { enqueueSnackbar } = useSnackbar()
    const { t } = useTranslation()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    useEffect(() => {
        let active = true

        if(active && hotelRefNo){
            const useHotelRefno = GENERAL_SETTINGS?.HOTEL_CHAIN_LIST?.find(item => item.id === hotelRefNo) || false
            if(useHotelRefno){
                handleHotelSelect(useHotelRefno.id, useHotelRefno.code)
            }
        }

        return () => {
            active = false
        }
    }, [hotelRefNo])

    const handleHotelSelect = (id, code) => {
        if (id) {
            if(currentUser){
                UseOrest({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: 'tools/changehotel',
                    method: 'PUT',
                    token,
                    params: {
                        hotelrefno: id
                    },
                }).then((respose) => {
                    if(respose.data && respose.data.data && respose.data.data.res){
                        setToState('guest', ['changeHotelRefno'], respose.data.data.res)
                        setToState('guest', ['changeHotelName'], code)
                        enqueueSnackbar(t('str_hotelChangedSuccessfully'), { variant: 'success' })
                    }else{
                        enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'warning' })
                    }

                }).catch(()=>{
                    enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'warning' })
                })
            }else {
                setToState('guest', ['changeHotelRefno'], id)
                setToState('guest', ['changeHotelName'], code)
            }

            if(typeof onClose === 'function'){
                setToState('guest', ['infoListOneGroup', 'id'], false)
                setToState('guest', ['infoListOneGroup', 'groupName'], false)
                setToState('guest', ['infoListOneGroup', 'data'], false)
                setToState('guest', ['infoListOneGroup', 'langcode'], false)
                setToState('guest', ['infoListOneGroup', 'chainid'], false)
                onClose()
            }
        }
    }

    let newHotelList = jsonGroupBy(GENERAL_SETTINGS.HOTEL_CHAIN_LIST, 'countryAndCity')

    return (
        <Container maxWidth="md">
            <div className={classes.root}>
                {newHotelList &&
                Object.keys(newHotelList).sort().reverse().map((groupName, index) => {
                    return (
                        <div className={classes.gridList} key={index}>
                            <div className={classes.gridListTitle}>
                                <Typography variant="h6" component="div" style={{padding: 10}}>
                                    {groupName}
                                </Typography>
                            </div>
                            <Grid container justify={'space-between'} alignItems={'center'} spacing={2} style={{padding: '12px 10px 10px 15px'}}>
                                {newHotelList && newHotelList[groupName].sort((a, b) => { return a.code - b.code}).map((hotel) => (
                                    <Grid item xs={12} sm={6}>
                                        <HotelCard
                                            key={hotel.code}
                                            title={hotel.code}
                                            imgUrl={hotel.thumbnail && GENERAL_SETTINGS.STATIC_URL + hotel.thumbnail}
                                            onClick={()=> handleHotelSelect(hotel.id, hotel.code)}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </div>
                    )
                })}
            </div>
        </Container>

    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(withWidth()(SelectHotel))

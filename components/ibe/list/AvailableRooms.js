import React, { useContext } from 'react'
import { connect } from 'react-redux'
import { setToState, updateState } from 'state/actions'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import CardContent from '@material-ui/core/CardContent'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import Tooltip from '@material-ui/core/Tooltip'
import PeopleIcon from '@material-ui/icons/People'
import RoomPriceWrap from 'components/ibe/RoomPriceWrap'
import AddRoom from 'components/ibe/AddRoom'
import Image from 'next/image'
import WebCmsGlobal from 'components/webcms-global'
import useTranslation from 'lib/translations/hooks/useTranslation'
import RoomAttrList from 'components/ibe/RoomAttrList'
import { withStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
    roomCardRoot: {
        boxShadow: '0 0 1px 1px #b9b9b982',
    },
    typography: {
        padding: theme.spacing(2),
    },
    rdbutton: {
        marginRight: 10,
    },
    card: {
        display: 'flex',
        marginBottom: 20,
    },
    title: {
        padding: '10px 10px 0 10px',
    },
    description: {
        padding: '0 10px 10px 10px',
    },
    ownerContainer: {
        height: 36,
        overflow: 'hidden',
        textAlign: 'left',
    },
    owner: {
        display: 'inline-block',
        backgroundColor: '#a22e97',
        height: 48,
        width: 48,
    },
    facilitiesContainer: {
        height: 36,
        overflow: 'hidden',
        textAlign: 'right',
        paddingRight: 5,
    },
    facilityItem: {
        margin: '0 3px',
        display: 'inline-block',
        backgroundColor: '#ffffff',
        border: '1px solid #eee',
        padding: 5,
        height: 35,
    },
    roomTypeInfoContainer: {
        height: 36,
        overflow: 'hidden',
        textAlign: 'left',
        paddingLeft: 5,
    },
    roomTypeInfoItem: {
        border: '1px solid #eee',
        height: 35,
        margin: '0 3px',
        float: 'left',
        display: 'inline-block',
        padding: '5px 10px 5px 10px',
        backgroundColor: '#ffffff',
    },
    roomTypeItemBadge: {
        display: 'inline-block',
        float: 'right',
        paddingLeft: 5,
    },
    date: {
        fontSize: '0.8rem',
        lineHeight: 1,
    },
    roomDefaultImg: {
        width: '100%',
        height: '100%',
    },
    addRoom: {
        minWidth: 90,
    },
    roomSelectInput: {
        padding: 6,
    },
    formControl: {
        minWidth: 100,
    },
}))

const LightTooltip = withStyles((theme) => ({
    tooltip: {
        backgroundColor: theme.palette.common.white,
        color: 'rgba(0, 0, 0, 0.87)',
        boxShadow: theme.shadows[1],
        fontSize: 11,
    },
}))(Tooltip)

const AvailableRooms = (props) => {
    const { state } = props
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { t } = useTranslation()
    const classes = useStyles()

    const StyledTableCell = withStyles((theme) => ({
        head: {
            backgroundColor: '#e8e8e8',
            color: '#2e2e2e',
            lineHeight: '0.3rem',
        },
        body: {
            fontSize: 14,
        },
    }))(TableCell)

    const StyledTableRow = withStyles((theme) => ({
        root: {
            '&:nth-of-type(odd)': {
                backgroundColor: theme.palette.background.default,
            },
        },
    }))(TableRow)

    const renderPrice = (minsngrate, mindblrate, mintrprate, minquadrate, minextrarate) => {
        if (state.adult === 1) {
            if (minsngrate > 0 && minsngrate !== null) {
                return minsngrate
            } else {
                return null
            }
        } else if (state.adult === 2) {
            if (mindblrate > 0 && mindblrate !== null) {
                return mindblrate
            } else {
                return null
            }
        } else if (state.adult === 3) {
            if (mintrprate > 0 && mintrprate !== null) {
                return mintrprate
            } else {
                return null
            }
        } else if (state.adult === 4) {
            if (minquadrate > 0 && minquadrate !== null) {
                return minquadrate
            } else {
                return null
            }
        } else if (state.adult >= 5 && minextrarate !== 0) {
            let extrapax = parseInt(state.adult - 4)
            let extrapaxprice = parseInt(Number(minquadrate) + minextrarate * extrapax)

            if (extrapaxprice > 0 && extrapaxprice !== null) {
                return extrapaxprice
            } else {
                return null
            }
        } else {
            return null
        }
    }

    return (
        <React.Fragment>
            <Grid container spacing={2}>
                {state.roomAvailabilityList &&
                    state.roomAvailabilityList
                        .sort((a, b) => b.totalroom - a.totalroom)
                        .sort((a, b) => b.minsngrate - a.minsngrate)
                        .map((room, index) => {
                            let totalroom = room.totalroom
                            let searchidSelectRoom = 0
                            if (state.listOfSelectedRooms.roomList) {
                                state.listOfSelectedRooms.roomList.map((roomListItem) => {
                                    if (
                                        roomListItem.roomsearchid === state.searchid &&
                                        roomListItem.roomtypeid === room.id
                                    ) {
                                        searchidSelectRoom++
                                    }
                                })
                            }
                            totalroom = totalroom - searchidSelectRoom
                            return (
                                <Grid key={index} item xs={12}>
                                    <Card className={classes.roomCardRoot}>
                                        <Grid container spacing={1}>
                                            <Grid container spacing={1}>
                                                <Grid item sm={12} md={3}>
                                                    <Image
                                                        src={
                                                            room.imgfileurl
                                                                ? GENERAL_SETTINGS.STATIC_URL + room.imgfileurl
                                                                : '/imgs/not-found.png'
                                                        }
                                                        layout="responsive"
                                                        width={700}
                                                        height={475}
                                                    />
                                                </Grid>
                                                <Grid item sm={12} md={9}>
                                                    <Grid item style={{ flex: 1, minWidth: 0 }}>
                                                        <Typography
                                                            className={classes.title}
                                                            variant="h6"
                                                            align="left"
                                                            noWrap
                                                            gutterBottom
                                                        >
                                                            {room.description}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item>
                                                        <Typography
                                                            className={classes.description}
                                                            variant="body2"
                                                            align="left"
                                                        >
                                                            {room.shorttext}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                            <Grid
                                                item
                                                container
                                                spacing={0}
                                                alignItems="center"
                                                style={{ backgroundColor: 'rgb(249, 249, 249)' }}
                                            >
                                                <Grid item xs={4} className={classes.roomTypeInfoContainer}>
                                                    <LightTooltip title="Max. Person to Stay">
                                                        <Box className={classes.roomTypeInfoItem}>
                                                            <PeopleIcon />{' '}
                                                            <span className={classes.roomTypeItemBadge}>
                                                                {room.totalpax + room.totalchd}
                                                            </span>
                                                        </Box>
                                                    </LightTooltip>
                                                </Grid>
                                                <Grid item xs={8} className={classes.facilitiesContainer}>
                                                    {room.roomgid && (
                                                        <RoomAttrList roomtypeid={room.id} roomgid={room.roomgid} />
                                                    )}
                                                </Grid>
                                            </Grid>
                                            <Grid item container spacing={1} style={{ padding: '5px 10px 10px 10px' }}>
                                                {totalroom > 0 &&
                                                renderPrice(
                                                    room.minsngrate,
                                                    room.mindblrate,
                                                    room.mintrprate,
                                                    room.minquadrate,
                                                    room.minextrarate
                                                ) !== null ? (
                                                    <Grid item xs={12}>
                                                        <Card className={classes.root} variant="outlined">
                                                            <CardContent>
                                                                <Grid item xs={12} sm container>
                                                                    <Grid
                                                                        item
                                                                        xs
                                                                        container
                                                                        direction="column"
                                                                        spacing={2}
                                                                    >
                                                                        <Grid item xs>
                                                                            <Typography
                                                                                gutterBottom
                                                                                align="left"
                                                                                variant="subtitle1"
                                                                            >
                                                                                {t('str_roomPrice')}
                                                                            </Typography>
                                                                            <Typography
                                                                                variant="body2"
                                                                                align="left"
                                                                                gutterBottom
                                                                            ></Typography>
                                                                        </Grid>
                                                                    </Grid>
                                                                    <Grid item>
                                                                        <Grid
                                                                            container
                                                                            spacing={0}
                                                                            style={{ textAlign: 'right' }}
                                                                            justify="flex-end"
                                                                            alignItems="flex-end"
                                                                        >
                                                                            <Grid item xs={12}>
                                                                                <RoomPriceWrap
                                                                                    price={`${renderPrice(
                                                                                        room.minsngrate,
                                                                                        room.mindblrate,
                                                                                        room.mintrprate,
                                                                                        room.minquadrate,
                                                                                        room.minextrarate
                                                                                    )}`}
                                                                                    discount={room.discrate}
                                                                                    currency={room.pricecurr}
                                                                                />
                                                                            </Grid>
                                                                            <Grid item xs={12}>
                                                                                <AddRoom
                                                                                    roomtypeid={room.id}
                                                                                    resaction={0}
                                                                                    totalroom={totalroom}
                                                                                />
                                                                            </Grid>
                                                                        </Grid>
                                                                    </Grid>
                                                                </Grid>
                                                            </CardContent>
                                                        </Card>
                                                    </Grid>
                                                ) : (
                                                    <Grid item xs={12}>
                                                        <Card className={classes.root} variant="outlined">
                                                            <CardContent>
                                                                <Typography
                                                                    variant="subtitle2"
                                                                    style={{ marginTop: 10 }}
                                                                >
                                                                    {t('str_noRoomsAvailable')}
                                                                </Typography>
                                                            </CardContent>
                                                        </Card>
                                                    </Grid>
                                                )}
                                                {/*<Grid item xs={12}>
                                <Card className={classes.root} variant="outlined">
                                    <CardContent>
                                        <Grid item xs={12} sm container>
                                            <Grid item xs container direction="column" spacing={2}>
                                                <Grid item xs>
                                                    <Typography gutterBottom align="left" variant="subtitle1">
                                                        Flexible Price
                                                    </Typography>
                                                    <Typography variant="body2" align="left" gutterBottom>
                                                        2 Single or 1 Double 1 Single
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                            <Grid item>
                                                <Grid container spacing={0} style={{textAlign: "right"}} justify="flex-end" alignItems="flex-end">
                                                    <Grid item xs={12}>
                                                        <RoomPriceWrap price="1.881" discount="714" currency="$"/>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Grid container spacing={1} justify="flex-end" alignItems="flex-end">
                                                            <Grid item xs={6}>
                                                                <Button className={classes.addRoom} size="small" variant="outlined" color="primary">
                                                                    Add Room
                                                                </Button>
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>

                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>*/}
                                            </Grid>
                                        </Grid>
                                    </Card>
                                </Grid>
                            )
                        })}
            </Grid>
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.ibe,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(AvailableRooms)

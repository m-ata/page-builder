import React, { useEffect, useState, useContext } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useSelector, connect } from 'react-redux'
import { useRouter } from 'next/router'
import { ViewList } from '@webcms/orest'
import {
    Button,
    IconButton,
    Card,
    CardContent,
    Grid,
    TextField,
    Typography,
    InputAdornment,
    Collapse,
    Divider,
    Tooltip
} from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import FilterListIcon from '@material-ui/icons/FilterList'
import ClearIcon from '@material-ui/icons/Clear'
import { useSnackbar } from 'notistack'
import WebCmsGlobal from '../../../webcms-global'
import { mobileTelNoFormat, OREST_ENDPOINT } from 'model/orest/constants'
import useTranslation from 'lib/translations/hooks/useTranslation'
import MaterialTable, { MTableHeader } from 'material-table'
import { CustomToolTip } from '../../../user-portal/components/CustomToolTip/CustomToolTip'
import MaterialTableLocalization from '../../../MaterialTableLocalization'
import LoadingSpinner from 'components/LoadingSpinner'
import { HotelBellIcon } from '../../../../assets/svg/guest/HotelBellIcon'
import { SalesTotalIcon } from '../../../../assets/svg/guest/SalesTotalIcon'
import { BookIcon } from '../../../../assets/svg/guest/BookIcon'
import { setToState } from 'state/actions'
import RequestOverviewCard from './RequestOverviewCard/RequestOverviewCard'
import MoreVertIcon from '@material-ui/icons/MoreVert'

const useStyles = makeStyles( theme => ({
    cardTitle: {
        fontSize: '18px',
        textTransform: 'uppercase',
        textAlign: 'center'
    },
    cardCountText: {
        fontSize: '35px',
        fontWeight: 'bold'
    },
    title: {
        fontSize: '28px',
        color: '#43425D',
        paddingBottom: '48px'
    },
    iconStyle: {
        color:"#FFF",
        width:"40px",
        height:"40px"
    },
    iconDiv: {
        top:"-20px",
        position:"absolute",
        width:"78px",
        height:"78px"
    },
    triangleDiv: {
        position: 'absolute',
        bottom: '-24px',
        right: '8%',
        width: 0,
        height: 0,
        borderTop: '28px solid #FFF',
        borderLeft: '14px solid transparent',
        borderRight: '14px solid transparent',

    },
    dividerStyle: {
        top: '0',
        right: '-12px',
        left: 'unset',
        [theme.breakpoints.down('sm')]: {
            display: "none",
        },
    },
    searchButton: {
        marginLeft: '8px',
        [theme.breakpoints.down('sm')]: {
            width: "100%",
            marginLeft: '0'
        },
    },
    textFieldContainer: {
        position: 'relative',
        display: 'flex',
        [theme.breakpoints.down('sm')]: {
            display: "block",
            textAlign: "center",
        },
    }

}));

function SearchGuest(props) {
    const classes = useStyles();

    const { clientParams, setToState } = props;

    const { enqueueSnackbar } = useSnackbar();
    const router = useRouter();

    //context
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal);
    const { t } = useTranslation();

    //redux
    const token = useSelector((state) => state?.orest?.currentUser?.auth.access_token || false);
    const hotelRefNo = useSelector(state => state?.hotelinfo?.currentHotelRefNo || null);

    //state
    const [openDetailSearch, setOpenDetailSearch] = useState(false);
    const [guestList, setGuestList] = useState([]);
    const [selectedGuest, setSelectedGuest] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [firstLoad, setFirstLoad] = useState(true);

    const overviewCardList = [
        {
            icon:(
                <HotelBellIcon className={classes.iconStyle}/>
            ),
            color: "#67B549",
            title: t('str_reservationCount'),
            count: 0
        },
        {
            icon:(
                <SalesTotalIcon className={classes.iconStyle}/>
            ),
            color: "#F16A4B",
            title: t('str_salesTotal'),
            count: 0
        },
        {
            icon:(
                <BookIcon className={classes.iconStyle}/>
            ),
            color: '#2697D4',
            title: t('str_bookerBonus'),
            count: 0
        },
    ]
    const queryTypes = {
        email: 'email',
        mobile: 'mobile',
        firstName: 'firstName',
        lastName: 'lastName',
        roomNo: 'roomNo',
        refCode: 'refCode'

    }
    const [filterList, setFilterList] = useState({
        email: {
            label: t('str_email'),
            value: ''
        },
        mobile: {
            label: t('str_mobile'),
            value: ''
        },
        firstName: {
            label: t('str_firstName'),
            value: ''
        },
        lastName: {
            label: t('str_lastName'),
            value: ''
        },
        roomNo: {
            label: t('str_roomNo'),
            value: ''
        },
        refCode: {
            label: t('str_refCode'),
            value: ''
        },

    })
    const columns = [
        {
            title: '',
            field: '#',
            headerStyle: {
                minWidth: '10px',
                maxWidth: '10px'
            },
            cellStyle: {
                padding: 0,
                minWidth: '10px',
                maxWidth: '10px',
                textAlign: 'center'
            },
            render: props => (
                <Tooltip title={t('str_select')} aria-label="select">
                    <Button
                        disableElevation
                        color='primary'
                        onClick={() => {
                            setSelectedGuest(props);
                            const routerQuery = router.query;
                            const obj = Object(clientParams)
                            let param = '';
                            for (const k in routerQuery) {
                                if (obj.hasOwnProperty(k)) {
                                    param = k
                                } else {
                                    if(k === 'telno') {
                                        param = 'telno'
                                    }
                                }
                            }

                            if(param === '' || param === 'telno') {
                                if(param === 'telno') {
                                    if(props?.mobiletel || props?.tel) {
                                        param = 'telno'
                                    } else {
                                        delete routerQuery[param]
                                        if(props?.email) {
                                            param = 'email'
                                        } else if(props?.mobiletel || props?.tel) {
                                            param = 'mobile'
                                        } else {
                                            param = 'code'
                                        }
                                    }
                                } else {
                                    if(props?.email) {
                                        param = 'email'
                                    } else if(props?.mobiletel || props?.tel) {
                                        param = 'mobile'
                                    } else {
                                        param = 'code'
                                    }
                                }
                            } else {
                                if(props && !props[param]) {
                                    delete routerQuery[param]
                                    if(props?.email) {
                                        param = 'email'
                                    } else if(props?.mobiletel || props?.tel) {
                                        param = 'mobile'
                                    } else {
                                        param = 'code'
                                    }
                                }
                            }

                            routerQuery[param] = props && param === 'telno' || param === 'mobile' ? mobileTelNoFormat(props['mobiletel'] ? props['mobiletel'] : props['tel'] ? props['tel'] : props['tel2'])?.replace('+', '') : props[param];
                            router.push({
                                pathname: router.pathname,
                                query: routerQuery
                            })
                            setTimeout(() => {
                                const routerQuery = router.query;
                                routerQuery.tab = 'details'
                                router.push({
                                    pathname: router.pathname,
                                    query: routerQuery
                                })
                            }, 1000)
                            setToState('guest', ['profile', 'loadGuest'], true);
                        }}
                    >
                       <MoreVertIcon />
                    </Button>
                </Tooltip>

            )
        },
        {
            title: t('str_firstName'),
            field: 'firstname',
        },
        {
            title: t('str_lastName'),
            field: 'lastname',
        },
        {
            title: t('str_birthDate'),
            field: 'birthdate',
        },
        {
            title: t('str_email'),
            field: 'email',
        },
        {
            title: t('str_mobile'),
            field: 'mobiletel',
        },
        {
            title: t('str_cardNo'),
            field: 'cardno',
            headerStyle: {
                textAlign: 'right'
            },
            render: (props) => (
                <Typography style={{fontSize: 'inherit', textAlign: 'right'}}>{props.cardno}</Typography>
            ),
        },
        {
            title: t('str_id'),
            field: 'id',
            headerStyle: {
                textAlign: 'right'
            },
            render: (props) => (
                <Typography style={{fontSize: 'inherit', textAlign: 'right'}}>{props.id}</Typography>
            ),
        }
    ]

    const tableLocalization = MaterialTableLocalization();

    useEffect(() => {
        if(searchText.length > 0 && !openDetailSearch) {
            const timer = setTimeout(() => {
                setLoading(true);
                ViewList({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.CLIENT,
                    token,
                    params: {
                        query: `isactive:true`,
                        field: 'firstname,code,fullname',
                        text: `*${searchText}`,
                        allhotels: true
                    }
                }).then(res => {
                    if(firstLoad) {
                        setFirstLoad(false);
                    }
                    if(res.status === 200) {
                        setGuestList(res.data.data)
                        setLoading(false);
                    } else {
                        setLoading(false);
                    }
                })
            }, 1200)
            return () => clearTimeout(timer);
        }
    }, [searchText])

    const handleOnChange = (e) => {
        const value = e.target.value;
        const key = e.target.name;

        setFilterList({
            ...filterList,
            [key]: {
                ...filterList[key],
                label: filterList[key].label,
                value: value
            }
        })
    }

    const handleFindGuest = () => {
        let query = '';
        Object.keys(filterList).map((item, i) => {
            if(filterList[item].value.length > 0) {
                if(item === queryTypes.email) {
                    query = query + `email:*${filterList[item].value},`
                } else if(item === queryTypes.mobile) {
                    query = query + `mobiletel:*${mobileTelNoFormat(filterList[item].value)},`
                } else if(item === queryTypes.firstName) {
                    query = query + `firstname:*${filterList[item].value},`
                } else if(item === queryTypes.lastName) {
                    query = query + `lastname:*${filterList[item].value},`
                } else if(item === queryTypes.roomNo) {
                    query = query + `resroomno:${filterList[item].value},`
                } else if(item === queryTypes.refCode) {
                    query = query + `refcode:*${filterList[item].value},`
                }
            }
        })
        query = query + 'isactive:true'
        setLoading(true);
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.CLIENT,
            token,
            params: {
                query: query,
                allhotels: true
            }
        }).then(res => {
            if(firstLoad) {
                setFirstLoad(false);
            }
            if(res.status === 200) {
                setGuestList(res.data.data);
                setLoading(false);
            } else {
                setLoading(false);
            }
        })
    }

    return(
        <div style={{paddingTop: '24px'}}>
            <Grid container spacing={3}>
                {
                    //TODO will be applied when booker loyalty is active
                    /*
                       <Grid item xs={12}>
                    <Typography className={classes.title}>{t('str_overview')}</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        {
                            overviewCardList.map((item, i) => (
                                <Grid key={i} item xs={12} sm={4}>
                                    <div style={{position: 'relative'}}>
                                        <Card>
                                            <CardContent style={{paddingBottom: '0'}}>
                                                <Grid container>
                                                    <Grid item xs={5}>
                                                        <div className={classes.iconDiv} style={{backgroundColor:item.color}}>
                                                            <AlignToCenter>
                                                                {item.icon}
                                                            </AlignToCenter>
                                                        </div>
                                                    </Grid>
                                                    <Grid item xs={7}>
                                                        <Typography className={classes.cardTitle}>{item.title}</Typography>
                                                    </Grid>
                                                    <Grid item xs={5}>
                                                    </Grid>
                                                    <Grid item xs={7} style={{textAlign: 'center'}}>
                                                        <Typography className={classes.cardCountText} style={{color: item.color}}>
                                                            {item.count}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </Grid>
                            ))
                        }
                    </Grid>
                </Grid>
                     */
                }
                <Grid item xs={6} style={{margin: 'auto'}}>
                    <RequestOverviewCard />
                </Grid>
                <Grid item xs={12}>
                    <div style={{position: 'relative'}}>
                        <Card>
                            <CardContent>
                                <Grid container spacing={2} alignItems={'center'}>
                                    <Grid item xs={7} sm={10}>
                                        <TextField
                                            variant={'outlined'}
                                            disabled={openDetailSearch || loading}
                                            fullWidth
                                            label={'Search Guest...'}
                                            onChange={(e) => setSearchText(e.target.value)}
                                            InputProps={{
                                                endAdornment: (
                                                    <React.Fragment>
                                                        {!openDetailSearch && loading && <LoadingSpinner size={18}/>}
                                                    </React.Fragment>
                                                ),
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={4} sm={2}>
                                        <Button
                                            startIcon={<FilterListIcon/>}
                                            onClick={() => {
                                                setOpenDetailSearch(!openDetailSearch)
                                            }}
                                        >
                                            {t('str_detailSearch')}
                                        </Button>
                                        {
                                            openDetailSearch && (
                                                <div className={classes.triangleDiv}/>
                                            )
                                        }
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </div>
                </Grid>
                <Grid item xs={12}>
                    <Collapse in={openDetailSearch}>
                        <Card>
                            <CardContent>
                                <Grid container spacing={5} alignItems={'center'}>
                                    {
                                        Object.keys(filterList).map((item, i) => (
                                            <Grid key={i} item xs={12} sm={6} md>
                                                <div className={classes.textFieldContainer}>
                                                    <TextField
                                                        disabled={loading}
                                                        value={filterList[item].value}
                                                        id={item}
                                                        name={item}
                                                        onChange={(e) => handleOnChange(e)}
                                                        color={'primary'}
                                                        label={filterList[item].label}
                                                    />
                                                    <Divider className={classes.dividerStyle} absolute orientation={'vertical'} flexItem variant={'fullWidth'}/>
                                                </div>
                                            </Grid>
                                        ))
                                    }
                                    <Grid item xs={12} sm={12} md>
                                        <div style={{display:'flex'}}>
                                            <CustomToolTip title={t('str_clearFilterValues')}>
                                                <IconButton
                                                    style={{padding: '4px'}}
                                                    onClick={() => {
                                                        setFilterList({
                                                            email: {
                                                                label: t('str_email'),
                                                                value: ''
                                                            },
                                                            mobile: {
                                                                label: t('str_mobile'),
                                                                value: ''
                                                            },
                                                            firstName: {
                                                                label: t('str_firstName'),
                                                                value: ''
                                                            },
                                                            lastName: {
                                                                label: t('str_lastName'),
                                                                value: ''
                                                            },
                                                            roomNo: {
                                                                label: t('str_roomNo'),
                                                                value: ''
                                                            },
                                                            refCode: {
                                                                label: t('str_refCode'),
                                                                value: ''
                                                            },
                                                        })
                                                    }}
                                                >
                                                    <ClearIcon style={{color: 'red'}}/>
                                                </IconButton>
                                            </CustomToolTip>
                                            <CustomToolTip title={t('str_search')}>
                                                <Button
                                                    className={classes.searchButton}
                                                    disabled={loading}
                                                    color={'primary'}
                                                    variant={'contained'}
                                                    onClick={handleFindGuest}
                                                    fullWidth
                                                >
                                                    {
                                                        loading ? (
                                                            <LoadingSpinner size={24}/>
                                                        ) : (
                                                            <SearchIcon/>
                                                        )
                                                    }
                                                </Button>
                                            </CustomToolTip>
                                        </div>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                    </Collapse>
                </Grid>
                {
                    !firstLoad && (
                        <Grid item xs={12}>
                            <MaterialTable
                                columns={columns}
                                data={guestList}
                                isLoading={loading}
                                options={{
                                    headerStyle:{
                                        width: 'auto',
                                        cursor: 'default',
                                        fontWeight:"bold",
                                        fontSize:"12px",
                                        color:"#A3A6B4",
                                        textTransform:"uppercase",
                                        backgroundColor:"#F5F6FA",
                                        whiteSpace: 'nowrap',
                                        borderLeft: '1px solid #FFF',
                                    },
                                    cellStyle: {
                                        whiteSpace: 'nowrap',
                                        borderLeft: '1px solid rgba(224, 224, 224, 1)',
                                        //minWidth: '100px'
                                    },
                                    rowStyle: rowData => ({
                                        backgroundColor: (selectedGuest?.tableData.id === rowData.tableData.id) ? '#FEF3E2' : '#FFF'
                                    }),
                                    toolbar: false,
                                    selection: false,
                                    sorting: false,
                                }}
                                localization={tableLocalization}
                                components={{
                                    Header: (props) => {
                                        const overrideProps = {...props}
                                        overrideProps.draggable = false
                                        overrideProps.columns[0].tableData.initialWidth = 'calc(100px)'
                                        overrideProps.columns[0].tableData.width = 'calc(100px)'
                                        return(
                                            <MTableHeader  {...overrideProps}/>
                                        )
                                    },
                                }}
                            />
                        </Grid>
                    )
                }
            </Grid>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(SearchGuest)

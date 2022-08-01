import React, {useContext, useEffect, useState} from 'react'
import UserPortalWrapper from '../../components/user-portal/UserPortalWrapper'
import useTranslation from '../../lib/translations/hooks/useTranslation'
import WebCmsGlobal from '../../components/webcms-global'
import {useSnackbar} from 'notistack'
import {connect, useSelector} from 'react-redux'
import {setToState, updateState} from '../../state/actions'
import {useOrestAction} from "../../model/orest";
import {
    Button,
    Dialog,
    Grid,
    InputAdornment,
    MuiThemeProvider, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow,
    TextField,
    Typography
} from "@material-ui/core";
import CachedIcon from "@material-ui/icons/Cached";
import CheckIcon from "@material-ui/icons/Check";
import SearchIcon from "@material-ui/icons/Search";
import MaterialTable from "material-table";
import {makeStyles} from "@material-ui/core/styles";
import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import {ViewList} from "@webcms/orest";
import {formatMoney, OREST_ENDPOINT} from "../../model/orest/constants";
import TableColumnText from "../../components/TableColumnText";
import {decimalColorToHexCode} from "../../@webcms-globals/helpers";
import moment from "moment";
import LoadingSpinner from "../../components/LoadingSpinner";
import CloseIcon from "@material-ui/icons/Close";

const useStyles = makeStyles(theme => ({
    mainTitle: {
        paddingBottom: "20px",
        fontSize: "48px",
        fontWeight: "600"
    },
    subTextRefresh: {
        fontSize: "16px",
        fontWeight: "500",
        color: "#F16A4B",
        textTransform: "capitalize",
        [theme.breakpoints.down("md")]: {
            paddingLeft: "0"
        },

    },
    subTextAdd: {
        fontSize: "16px",
        fontWeight: "500",
        color: "#3C3B54",
        textTransform: "capitalize",
        "& .MuiButton-endIcon": {
            marginLeft: "0"
        }
    },
    iconSpan: {
        paddingRight: "8px",
    },
    actionDiv: {
        paddingBottom: "20px",
        display: "flex",
        [theme.breakpoints.down("sm")]: {
            display: "grid",
        },
    },
    buttonDiv: {
        paddingRight: "16px",
        [theme.breakpoints.down('sm')]: {
            paddingBottom: "8px"
        },
    },
    customCheckBox: {
        textAlign: "center",
        margin: "8px 0",
        display: "flex",
        [theme.breakpoints.down("sm")]: {
            margin: "0",
        },
    },
    checkBoxDiv: {
        width: "24px",
        height: "24px",
        border: "2px solid #4666B0",
        borderRadius: "6px",
        backgroundColor: "#FFF",
        cursor: "pointer",
    },
    checkBoxText: {
        marginLeft: "4px",
        paddingLeft: "8px",
        fontSize: "15px"
    },
    checkIcon: {
        fontSize: "18px",
        verticalAlign: "middle",
        color: "#4666B0",
    },
    textFieldStyle: {
        width: "308px",
        backgroundColor: "#FFF",
        "& .MuiOutlinedInput-root": {
            "& fieldset": {
                border: "none",
            },
            "&:hover fieldset": {
                border: "1px solid #4666B0",
            },
            "&.Mui-focused fieldset": {
                border: "1px solid #4666B0",
            },
        },
        [theme.breakpoints.only("xs")]: {
            width: "100%"
        },
    },
    tableHeaderText: {
        fontWeight: "bold",
        fontSize: "12px",
        color: "#A3A6B4",
        textTransform: "uppercase",
        backgroundColor: "#F5F6FA",
    },
    tableText: {
        fontSize: "13px",
        fontWeight: "500",
    },
    tableTextDate: {
        fontSize: "13px",
        fontWeight: "600",
    },
    tableTextBalance: {
        fontSize: "13px",
        fontWeight: "bold",
        textAlign: "right"
    },
    overFlowDescriptionText: {
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        maxWidth: "280px",
        fontSize: "13px",
        color: "#4D4F5C"
    },
    overFlowDocNoText: {
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        maxWidth: "140px",
        fontSize: "13px",
    },
    iconStyle: {
        width: "1.5em",
        height: "1.5em"
    },
    secondActionDiv: {
        paddingRight: "16px",
        [theme.breakpoints.down('sm')]: {
            paddingBottom: "14px"
        },
    }


}));

const theme = createMuiTheme({
    overrides: {
        MuiTableCell: {
            root: {
                padding: "16px"
            }
        },
        MuiTableRow: {
            root: {
                "&:hover": {
                    backgroundColor: "rgb(163, 166, 180,0.1)"
                }
            }
        },
        MuiCheckbox: {
            root: {
                color: "rgb(70, 102, 176,0.5)",
            },
            colorSecondary: {
                "&.Mui-checked": {
                    color: "#4666B0",
                },
            }
        },
    },

});

function RequestsPage(props) {

    const classes = useStyles();

    const {t} = useTranslation()
    const {GENERAL_SETTINGS} = useContext(WebCmsGlobal);

    const {state, setToState} = props;

    const {enqueueSnackbar} = useSnackbar();

    //redux
    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo);
    const token = useSelector((state) => state?.orest?.currentUser?.auth.access_token || false);
    const hotelRefNo = useSelector(state => state?.hotelinfo?.currentHotelRefNo || GENERAL_SETTINGS.HOTELREFNO || null);

    //orest state
    const {setOrestState} = useOrestAction()
    const [openChecked, setOpenChecked] = useState(true);
    const [allComp, setAllComp] = useState(false);
    const [invoiceList, setInvoiceList] = useState([]);
    const [filteredInvoiceList, setFilteredInvoiceList] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [firstLoad, setFirstLoad] = useState(true);
    const [selectedDataList, setSelectedDataList] = useState([]);
    const [sthlplineList, setSthlplineList] = useState([]);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [isDef, setIsDef] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [sthelperTransno, setSthelperTransno] = useState([]);

    const columns = [
        {
            title: t('str_status'),
            field: 'reqstatuslocal',
            minWidth: 100,
            maxWidth: 100,
            render: state => StatusDot(state)
        },
        {
            title: t("str_supplier"),
            field: 'supplier',
            render: state => <TableColumnText>{state?.supplier}</TableColumnText>,
        },
        {
            title: t("str_total"),
            field: 'nettotal',
            render: state => <TableColumnText>{state?.nettotal}</TableColumnText>,
        },
        {
            title: t('currencycode'),
            field: 'currencycode',
            render: state => <TableColumnText>{state?.currencycode}</TableColumnText>,

        },
        {
            title: t('str_payDate'),
            field: 'paydate',
            render: state => transDateCalculator(state.paydate),
        },
        {
            title: t("str_accname"),
            field: 'accname',
            render: state => <TableColumnText>{state?.accname}</TableColumnText>,
        },
        {
            title: t("str_companyName"),
            field: "hotelname",
            render: props => <TableColumnText minWidth={200} maxWidth={200}
                                              showToolTip>{props?.hotelname}</TableColumnText>
        },
        {
            title: t("str_note"),
            field: 'note',
            render: state => <TableColumnText>{state?.note}</TableColumnText>,
        },
        {
            title: t('str_transNo'),
            field: 'transno',
            align: 'right',
            render: props => <TableColumnText textAlign={'right'}>{props?.transno}</TableColumnText>
        },
    ]

    const sthlplines = [
        {
            title: t("str_packdesc"),
            field: 'packdesc',
            render: state => <TableColumnText>{state?.packdesc}</TableColumnText>,
        },
        {
            title: t("str_description"),
            field: 'description',
            render: state => <TableColumnText>{state?.description}</TableColumnText>,
        },
        {
            title: t("str_price"),
            field: 'price',
            render: state => <TableColumnText>{state?.price}</TableColumnText>,
        },
        {
            title: t('pricecurrcode'),
            field: 'pricecurrcode',
            render: state => <TableColumnText>{state?.pricecurrcode}</TableColumnText>,

        },
        {
            title: t("str_amount"),
            field: 'amount',
            render: state => <TableColumnText>{state?.amount}</TableColumnText>,
        },
        {
            title: t('str_payDate'),
            field: 'paydate',
            render: state => transDateCalculator(state.paydate),
        },
    ]

    function handleOpenCheckBoxClick() {
        setOpenChecked(!openChecked);
    }

    function getInvoiceList() {
        setIsInitialized(true);
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.STHELPER,
            token,
            params: {
                hotelrefno: hotelRefNo
            }
        }).then(res => {
            if (res.status === 200) {
                setInvoiceList(res.data.data);
                setFilteredInvoiceList(res.data.data)
                setIsInitialized(false);
            } else {
                setIsInitialized(false);
            }
        }).catch(error => {
            setIsInitialized(false);
        })
    }

    function handleRefresh() {
        getInvoiceList()
        setSelectedDataList([]);
    }

    function handleRowClick(event, rowData) {
        setOpenAddDialog(true)
        setIsDef(false)
        setSthelperTransno(rowData)
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.STHLPLINE,
            token,
            params: {
                query: 'transno:' + rowData.transno,
                hotelrefno: hotelRefNo
            }
        }).then(res => {
            if (res.status === 200) {
                setSthlplineList(res.data.data);
                setFilteredInvoiceList(res.data.data);
                setIsInitialized(false);
            } else {
                setIsInitialized(false);
            }
        }).catch(error => {
            setIsInitialized(false);
        })
    }

    function handleSelectChange(event, rowData) {
        const gidArray = [...selectedDataList];
        if (rowData === undefined) {
            if (searchText.length === 0) {
                if (selectedDataList.length === invoiceList.length) {
                    setSelectedDataList([]);
                } else {
                    setSelectedDataList(invoiceList)
                }
            } else {
                if (selectedDataList.length === filteredInvoiceList.length) {
                    setSelectedDataList([])
                } else {
                    setSelectedDataList(filteredInvoiceList)
                }
            }
        } else {
            if (rowData.tableData.checked) {
                gidArray.push(rowData);
                setSelectedDataList(gidArray);
            } else {
                gidArray.map((item, i) => {
                    if (!item.tableData.checked) {
                        gidArray.splice(i, 1);
                    }
                })
                setSelectedDataList(gidArray);
            }
        }

    }


    useEffect(() => {
        setIsInitialized(true);
        getInvoiceList();
        setSearchText("");
        setSelectedDataList([]);
    }, [openChecked, allComp])

    useEffect(() => {
        if (!firstLoad) {
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.STHELPER,
                token,
                //params
            }).then(res => {
                if (res.status === 200) {
                    setFilteredInvoiceList(res.data.data)
                }
            }).catch(error => {
                setIsInitialized(false);
            })
        }
        setFirstLoad(false);
    }, [searchText])

    const StatusDot = (state) => {
        const backgroundColor = decimalColorToHexCode(state?.reqstatuslocal)
        const textColor = decimalColorToHexCode(state?.reqstatuslocal)

        return (
            <div className={classes.status}>
                <div className={classes.reqstatuslocal} style={{backgroundColor: backgroundColor}}/>
                <Typography className={classes.reqstatuslocal} style={{color: textColor || 'inherit'}}>
                    {state.reqstatuslocal}
                </Typography>
            </div>
        );
    }

    const transDateCalculator = (stringTransDate) => {
        const newDate = moment().format(OREST_ENDPOINT.DATEFORMAT);
        let color;
        const today = Date.parse(newDate.toString())
        let transDate = Date.parse(stringTransDate);
        if (today < transDate) {
            color = "#4666B0";
        } else if (today === transDate) {
            color = "#FCB655";
        } else {
            color = "#F16A4B";
        }

        return (
            <div style={{minWidth: "100px"}}>
                <Typography className={classes.dataDateText} style={{color: color}}>
                    {moment(stringTransDate).format('L')}
                </Typography>
            </div>

        );
    }


    return (
        <UserPortalWrapper isSupplierPortal>
            <div>
                <Typography className={classes.mainTitle}>{t("str_requests")}</Typography>
                <div className={classes.actionDiv}>
                    <div className={classes.buttonDiv}>
                        <Button
                            className={classes.subTextRefresh}
                            startIcon={<CachedIcon className={classes.iconStyle}/>}
                            onClick={handleRefresh}
                        >
                            {t("str_refresh")}
                        </Button>
                    </div>
                    <div className={classes.secondActionDiv}>
                        <div className={classes.customCheckBox}>
                            <div className={classes.checkBoxDiv} onClick={handleOpenCheckBoxClick}>
                                {
                                    openChecked ?
                                        <CheckIcon className={classes.checkIcon}/>
                                        :
                                        null
                                }
                            </div>
                            <Typography className={classes.checkBoxText}>{t('str_open')}</Typography>
                        </div>
                    </div>
                </div>
                <TextField
                    onChange={(e) => setSearchText(e.target.value)}
                    className={classes.textFieldStyle}
                    variant="outlined"
                    placeholder={t("str_searchTransactionsInvoicesOrHelp")}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"> <SearchIcon style={{color: "#4666B0"}}/>
                        </InputAdornment>,
                    }}
                    value={searchText}
                />
                <div style={{paddingBottom: "30px"}}/>
                <MuiThemeProvider theme={theme}>
                    <MaterialTable
                        columns={columns}
                        data={searchText.length === 0 ? invoiceList : filteredInvoiceList}
                        isLoading={isInitialized}
                        localization={{
                            pagination: {
                                firstTooltip: t("str_firstPage"),
                                firstAriaLabel: t("str_firstPage"),
                                previousAriaLabel: t("str_previousPage"),
                                previousTooltip: t("str_previousPage"),
                                nextAriaLabel: t("str_nextPage"),
                                nextTooltip: t("str_nextPage"),
                                lastAriaLabel: t("str_lastPage"),
                                lastTooltip: t("str_lastPage")
                            },
                            body: {
                                emptyDataSourceMessage: t("str_noRecordsToDisplay"),
                            },
                        }}
                        onSelectionChange={handleSelectChange}
                        onRowClick={handleRowClick}
                        options={{
                            headerStyle: {
                                fontWeight: "bold",
                                fontSize: "12px",
                                color: "#A3A6B4",
                                textTransform: "uppercase",
                                backgroundColor: "#F5F6FA",
                            },
                            toolbar: false,
                            selection: false,
                            sorting: false,
                            grouping: false,
                            pageSizeOptions: [5, 10, 15, 20],
                            actionsColumnIndex: 1,
                            selectionColumnIndex: 1
                        }}
                    />
                </MuiThemeProvider>
                <Dialog open={openAddDialog} maxWidth={'md'} fullWidth>
                    <div style={{padding: 24}}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography
                                    style={{fontSize: 20}}>{t('str_request')} : {sthelperTransno.reqstatus}</Typography>
                            </Grid>
                            <Grid container style={{textAlign: "center", padding: 14}}>
                                <Grid item xs={3}>
                                    <Typography>{t('str_reqDate')} : {sthelperTransno.transdate}</Typography>
                                </Grid>
                                <Grid item xs={3}>
                                    <Typography>{t('str_transNo')} : {sthelperTransno.transno}</Typography>
                                </Grid>
                                <Grid item xs={3}>
                                    <Typography>{t('str_requestedBy')} : {sthelperTransno.username}</Typography>
                                </Grid>
                                <Grid item xs={3}>
                                    <Typography>{t('str_hotel')} : {sthelperTransno.hotelname}</Typography>
                                </Grid>
                            </Grid>
                            {
                                isDef ? (
                                    <Grid item xs={12}>
                                        <LoadingSpinner/>
                                    </Grid>
                                ) : (
                                    <React.Fragment>
                                        <MuiThemeProvider theme={theme}>
                                            <MaterialTable
                                                columns={sthlplines}
                                                data={searchText.length === 0 ? sthlplineList : filteredInvoiceList}
                                                isLoading={isInitialized}
                                                localization={{
                                                    pagination: {
                                                        firstTooltip: t("str_firstPage"),
                                                        firstAriaLabel: t("str_firstPage"),
                                                        previousAriaLabel: t("str_previousPage"),
                                                        previousTooltip: t("str_previousPage"),
                                                        nextAriaLabel: t("str_nextPage"),
                                                        nextTooltip: t("str_nextPage"),
                                                        lastAriaLabel: t("str_lastPage"),
                                                        lastTooltip: t("str_lastPage")
                                                    },
                                                    body: {
                                                        emptyDataSourceMessage: t("str_noRecordsToDisplay"),
                                                    },
                                                }}
                                                onSelectionChange={handleSelectChange}
                                                onRowClick={handleRowClick}
                                                options={{
                                                    headerStyle: {
                                                        fontWeight: "bold",
                                                        fontSize: "12px",
                                                        color: "#A3A6B4",
                                                        textTransform: "uppercase",
                                                        backgroundColor: "#F5F6FA",
                                                    },
                                                    toolbar: false,
                                                    selection: false,
                                                    sorting: false,
                                                    grouping: false,
                                                    pageSizeOptions: [5, 10, 15, 20],
                                                    actionsColumnIndex: 1,
                                                    selectionColumnIndex: 1
                                                }}
                                            />
                                        </MuiThemeProvider>
                                    </React.Fragment>
                                )
                            }
                        </Grid>
                    </div>
                    <div style={{padding: 24}}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography
                                    style={{fontSize: 20}}>{t('str_payment')}</Typography>
                            </Grid>
                            {
                                isDef ? (
                                    <Grid item xs={12}>
                                        <LoadingSpinner/>
                                    </Grid>
                                ) : (
                                    <React.Fragment>
                                        <TableContainer>
                                            <Table sx={{minWidth: 650}} aria-label="simple table">
                                                <TableHead style={{backgroundColor: "#F5F6FA"}}>
                                                    <TableRow>
                                                        <TableCell align="left">{t('str_description')}</TableCell>
                                                        <TableCell align="left">{t('str_paymentDate')}</TableCell>
                                                        <TableCell align="left">{t('str_code')}</TableCell>
                                                        <TableCell align="left">{t('str_paymentType')}</TableCell>
                                                        <TableCell align="left">{t('str_numberOfPayment')}</TableCell>
                                                        <TableCell align="left">{t('str_total')}</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell align="left">{sthelperTransno.description}</TableCell>
                                                        <TableCell align="left">{sthelperTransno.paydate}</TableCell>
                                                        <TableCell align="left">{sthelperTransno.refcode}</TableCell>
                                                        <TableCell align="left">{sthelperTransno.paynote}</TableCell>
                                                        <TableCell align="left">{sthelperTransno.paynote}</TableCell>
                                                        <TableCell align="left">{sthelperTransno.nettotal}</TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                        <Grid item xs={10}/>
                                        <Grid item xs={2}>
                                            <Button
                                                startIcon={<CloseIcon/>}
                                                color={'primary'}
                                                variant={'outlined'}
                                                onClick={() => setOpenAddDialog(false)}
                                            >
                                                {t('str_cancel')}
                                            </Button>
                                        </Grid>
                                    </React.Fragment>
                                )
                            }
                        </Grid>
                    </div>

                </Dialog>
            </div>
        </UserPortalWrapper>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.supplierPortal,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(RequestsPage)
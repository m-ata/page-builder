import React, {useState, useEffect, useContext} from 'react';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import {setToState} from '../../../../state/actions';
import { ViewList } from '@webcms/orest'
import { makeStyles } from '@material-ui/core/styles'
import {connect, useSelector} from 'react-redux';
import {Typography, Button, TextField, InputAdornment, MuiThemeProvider} from '@material-ui/core';
import useTranslation from '../../../../lib/translations/hooks/useTranslation';
import CachedIcon from '@material-ui/icons/Cached';
import CheckIcon from '@material-ui/icons/Check';
import SearchIcon from '@material-ui/icons/Search';
import MaterialTable from 'material-table';
import { DEFAULT_OREST_TOKEN, formatMoney, OREST_ENDPOINT } from '../../../../model/orest/constants';
import WebCmsGlobal from '../../../webcms-global';
import {CustomToolTip} from '../CustomToolTip/CustomToolTip';

const useStyles = makeStyles( theme => ({
    mainTitle: {
        paddingBottom:"20px",
        fontSize:"48px",
        fontWeight:"600"
    },
    subTextRefresh: {
        fontSize:"16px",
        fontWeight:"500",
        color:"#F16A4B",
        textTransform:"capitalize",
        [theme.breakpoints.down("md")]: {
            paddingLeft:"0"
        },
        
    },
    subTextAdd: {
        fontSize:"16px",
        fontWeight:"500",
        color:"#3C3B54",
        textTransform:"capitalize",
        "& .MuiButton-endIcon": {
            marginLeft:"0"
        }
    },
    iconSpan: {
        paddingRight:"8px",
    },
    actionDiv: {
        paddingBottom: "20px",
        display:"flex",
        [theme.breakpoints.down("sm")]: {
            display:"grid",
        },
    },
    buttonDiv: {
        paddingRight:"16px",
        [theme.breakpoints.down('sm')]: {
            paddingBottom:"8px"
        },
    },
    customCheckBox: {
        textAlign:"center",
        margin:"8px 0",
        display:"flex",
        [theme.breakpoints.down("sm")]: {
            margin:"0",
        },
    },
    checkBoxDiv: {
        width:"24px",
        height:"24px",
        border:"2px solid #4666B0",
        borderRadius:"6px",
        backgroundColor:"#FFF",
        cursor:"pointer",
    },
    checkBoxText:{
        marginLeft: "4px",
        paddingLeft:"8px",
        fontSize:"15px"
    },
    checkIcon:{
        fontSize:"18px",
        verticalAlign:"middle",
        color:"#4666B0",
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
        fontWeight:"bold",
        fontSize:"12px",
        color:"#A3A6B4",
        textTransform:"uppercase",
        backgroundColor:"#F5F6FA",
    },
    tableText: {
        fontSize:"13px",
        fontWeight:"500",
    },
    tableTextDate: {
        fontSize:"13px",
        fontWeight:"600",
    },
    tableTextBalance: {
        fontSize:"13px",
        fontWeight:"bold",
        textAlign: "right"
    },
    overFlowDescriptionText: {
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        maxWidth:"280px",
        fontSize:"13px",
        color:"#4D4F5C"
    },
    overFlowDocNoText: {
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        maxWidth:"140px",
        fontSize:"13px",
    },
    iconStyle: {
        width:"1.5em",
        height:"1.5em"
    },
    secondActionDiv: {
        paddingRight: "16px",
        [theme.breakpoints.down('sm')]: {
            paddingBottom:"14px"
        },
    }
    
    
}));

const theme = createMuiTheme({
    overrides:{
        MuiTableCell: {
            root:{
                padding:"16px"
            }
        },
        MuiTableRow: {
            root:{
                "&:hover": {
                    backgroundColor:"rgb(163, 166, 180,0.1)"
                }
            }
        },
        MuiCheckbox: {
            root: {
                color:"rgb(70, 102, 176,0.5)",
            },
            colorSecondary: {
                "&.Mui-checked": {
                    color:"#4666B0",
                },
            }
        },
    },
    
});

function BillingList(){
    const classes = useStyles();
    
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { t } = useTranslation()
    const token = useSelector((state) =>
        state.orest.currentUser !== null ? state.orest.currentUser.auth.access_token : DEFAULT_OREST_TOKEN
    )
    const hotelRefNo = useSelector(state =>
        state.hotelinfo.currentHotelRefNo !== null ? state.hotelinfo.currentHotelRefNo : null);
    
    const [openChecked,setOpenChecked] = useState(true);
    const [allComp,setAllComp] = useState(false);
    const [invoiceList, setInvoiceList] = useState([]);
    const [filteredInvoiceList, setFilteredInvoiceList] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [firstLoad, setFirstLoad] = useState(true);
    const [rows, setRows] = useState([]);
    const [selectedDataList, setSelectedDataList] = useState([]);
    
    const transTypes = {
        cancelInvoice: "6030180",
        openInvoice: "6030100"
    }
    
    function findBilling(filterText) {
        setSearchText(filterText);
        setFilteredInvoiceList(invoiceList.filter((item) => {
            return item.title.toLowerCase()
                      .indexOf(filterText.toLowerCase()) !== -1;
        }));
    }
    
    function handleOpenCheckBoxClick(){
        setOpenChecked(!openChecked);
    }
    
    function handleAllCompCheckBoxClick(){
        setAllComp(!allComp);
    }
    
    function getInvoiceList(){
        setIsInitialized(true);
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.INVOICE,
            token,
            params: openChecked ? (
                allComp ? {
                    allhotels: true,
                    query: `transtype:${transTypes.openInvoice},balance>0`,
                    limit: 100,
                    start: 0
                } : {
                    hotelrefno: hotelRefNo,
                    query: `transtype:${transTypes.openInvoice},balance>0`,
                    limit: 100,
                    start: 0
                }
            ) : (
                allComp ? {
                    allhotels: true,
                    limit: 100,
                    start: 0
                } : {
                    hotelrefno: hotelRefNo,
                    limit: 100,
                    start: 0
                }
            )
        }).then(res => {
            if(res.status === 200) {
                setInvoiceList(res.data.data);
                setFilteredInvoiceList(res.data.data)
                setIsInitialized(false);
            } else {
                setIsInitialized(false);
            }
        }).catch(error => {
            console.log(error);
            setIsInitialized(false);
        })
    }
    
    function handleRefresh() {
        getInvoiceList()
        setSelectedDataList([]);
    }
    
    function handleRowClick(event, rowData){
        const gidArray = [...selectedDataList];
        let rslts = searchText.length === 0 ? invoiceList : filteredInvoiceList;
        const index = rslts.indexOf(rowData);
        rslts[index].tableData.checked = !rslts[index].tableData.checked;
        setRows( rslts => () => handleSelectChange(event, rowData));
        if(rslts[index].tableData.checked) {
            gidArray.push(rowData);
            setSelectedDataList(gidArray);
        } else {
            gidArray.map((item, i) => {
                if(!item.tableData.checked) {
                    gidArray.splice(i, 1);
                }
            })
            setSelectedDataList(gidArray);
        }
    }
    
    function handleSelectChange(event, rowData){
        const gidArray = [...selectedDataList];
        if(rowData === undefined) {
            if(searchText.length === 0) {
                if(selectedDataList.length === invoiceList.length) {
                    setSelectedDataList([]);
                } else {
                    setSelectedDataList(invoiceList)
                }
            } else {
                if(selectedDataList.length === filteredInvoiceList.length) {
                    setSelectedDataList([])
                } else {
                    setSelectedDataList(filteredInvoiceList)
                }
            }
        } else {
            if(rowData.tableData.checked) {
                gidArray.push(rowData);
                setSelectedDataList(gidArray);
            } else {
                gidArray.map((item, i) => {
                    if(!item.tableData.checked) {
                        gidArray.splice(i, 1);
                    }
                })
                setSelectedDataList(gidArray);
            }
        }
        
    }
    function colorChanger(transType, balance) {
        if(transType === transTypes.cancelInvoice || balance === 0) {
            return  "#BCBCCB";
        } else {
            return  "#4D4F5C"
        }
    }
    
    useEffect(() => {
        setIsInitialized(true);
        getInvoiceList();
        setSearchText("");
        setSelectedDataList([]);
    },[openChecked, allComp])
    
    useEffect(() => {
        if(!firstLoad) {
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.INVOICE,
                token,
                params: openChecked ? (
                    allComp ? {
                        allhotels: true,
                        query: `transtype:${transTypes.openInvoice},balance>0,title:${searchText.toUpperCase()}`,
                        limit: 100,
                        start: 0
                    } : {
                        hotelrefno: hotelRefNo,
                        query: `transtype:${transTypes.openInvoice},balance>0,title:${searchText.toUpperCase()}`,
                        limit: 100,
                        start: 0
                    }
                ) : (
                    allComp ? {
                        allhotels: true,
                        query: `title:${searchText.toUpperCase()}`,
                        limit: 25,
                        start: 0
                    } : {
                        query: `title:${searchText.toUpperCase()}`,
                        hotelrefno: hotelRefNo,
                        limit: 25,
                        start: 0
                    }
                )
            }).then(res => {
                if(res.status === 200) {
                    setFilteredInvoiceList(res.data.data)
                }
            }).catch(error => {
                console.log(error);
                setIsInitialized(false);
            })
        }
        setFirstLoad(false);
    },[searchText])
    
    
    const docNoHeader = () => {
        return(
            <CustomToolTip title={t("str_docNoDesc")} placement={"top"} arrow>
                <Typography className={classes.tableHeaderText}>{t("str_docNo")}</Typography>
            </CustomToolTip>
        );
    }
    
    const currentAmountHeader = () => {
        return(
            <CustomToolTip title={t("str_currentAmount")} placement={"top"} arrow>
                <Typography className={classes.tableHeaderText}>{t("str_cAmount")}</Typography>
            </CustomToolTip>
        );
    }
    
    const currentBalanceHeader = () => {
        return(
            <CustomToolTip title={t("str_currentBalance")} placement={"top"} arrow>
                <Typography className={classes.tableHeaderText}>{t("str_cBalance")}</Typography>
            </CustomToolTip>
        );
    }
    
    const excRateHeader = () => {
        return(
            <CustomToolTip title={t("str_exchangeRate")} placement={"top-end"} arrow>
                <Typography className={classes.tableHeaderText}>{t("str_excRate")}</Typography>
            </CustomToolTip>
        );
    }
    
    const dateColumn = (state) => {
        return(
            <Typography
                className={classes.tableTextDate}
                style={{color: colorChanger(state.transtype, state.balance)}}
            >
                {state.transdate}
            </Typography>
        );
    }
    
    const transTypeColumn = (state) => {
        return(
            <Typography
                className={classes.tableText}
                style={{color: colorChanger(state.transtype, state.balance)}}
            >
                {state.invoicetypedesc}
            </Typography>
        );
    }
    
    const docNoColumn = (state) => {
        if(state.invoiceno.length > 16) {
            return(
                <CustomToolTip title={state.invoiceno} placement={"top"} arrow>
                    <Typography
                        className={classes.overFlowDocNoText}
                        style={{fontWeight:"bold", color: colorChanger(state.transtype, state.balance)}}
                    >
                        {state.invoiceno}
                    </Typography>
                </CustomToolTip>
            );
        } else {
            return(
                <Typography
                    className={classes.tableText}
                    style={{fontWeight:"bold", color: colorChanger(state.transtype, state.balance)}}
                >
                    {state.invoiceno}
                </Typography>
            );
        }
    }
    
    const descColumn = (state) => {
        if(state.title.length > 34) {
            return(
                <CustomToolTip title={state.title} placement={"top"} arrow>
                    <Typography
                        className={classes.overFlowDescriptionText}
                        style={{color: colorChanger(state.transtype, state.balance)}}
                    >
                        {state.title}
                    </Typography>
                </CustomToolTip>
            );
        } else {
            return(
                <Typography
                    className={classes.tableText}
                    style={{color: colorChanger(state.transtype, state.balance)}}
                >
                    {state.title}
                </Typography>
            );
        }
    }
    
    const noteColumn = (state) => {
        if(state.note && state.note !== "") {
            if(state.note.length > 20) {
                return(
                    <CustomToolTip title={state.note} placement={"top"} arrow>
                        <Typography
                            className={classes.overFlowDocNoText}
                            style={{color: colorChanger(state.transtype, state.balance)}}
                        >
                            {state.note}
                        </Typography>
                    </CustomToolTip>
                );
            } else {
                return(
                    <Typography
                        className={classes.tableText}
                        style={{color: colorChanger(state.transtype, state.balance)}}
                    >
                        {state.note}
                    </Typography>
                );
            }
        } else {
            return null
        }
        
    }
    
    const amountColumn = (state) => {
        return(
            <Typography
                className={classes.tableText}
                style={{textAlign:"right", color: colorChanger(state.transtype, state.balance)}}
            >
                {formatMoney(state.currtotal,2,",", ".")}
            </Typography>
        );
    }
    
    const balanceColumn = (state) => {
        return(
            <Typography
                className={classes.tableTextBalance}
                style={{color: colorChanger(state.transtype, state.balance)}}
            >
                {formatMoney(state.balance,2,",", ".")}
            </Typography>
        );
    }
    
    const excRateColumn = (state) => {
        return(
            <Typography
                className={classes.tableText}
                style={{textAlign:"right",color: colorChanger(state.transtype, state.balance)}}
            >
                {state.excrate}
            </Typography>
        );
    }
    
    const currencyColumn = (state) => {
        return(
            <Typography
                className={classes.tableText}
                style={{color: colorChanger(state.transtype, state.balance)}}
            >
                {state.currencycode}
            </Typography>
        );
    }
    
    const currentAmount = (state) => {
        return(
            <Typography
                className={classes.tableText}
                style={{color: colorChanger(state.transtype, state.balance)}}
            >
                {formatMoney(state.currtotal,2,",", ".")}
            </Typography>
        );
    }
    
    const currentBalance = (state) => {
        return(
            <Typography
                className={classes.tableText}
                style={{color: colorChanger(state.transtype, state.balance)}}
            >
                {formatMoney(state.currbalance,2,",", ".")}
            </Typography>
        );
    }
    
    const columns = [
        {
            title: t('str_date'),
            field: 'transdate',
            render: state => dateColumn(state),
            cellStyle: {
                minWidth:"150px"
            }
        },
        {
            title: t('str_transType'),
            field: 'invoicetypedesc',
            render: state => transTypeColumn(state),
            cellStyle: {
                minWidth: "150px"
            }
        },
        {
            title: docNoHeader(),
            field: 'invoiceno',
            render: state => docNoColumn(state),
            cellStyle: {
                minWidth:"150px"
            }
        },
        {
            title: t('str_description'),
            field: 'title',
            render: state => descColumn(state),
            cellStyle: {
                minWidth:"290px"
            }
        },
        {
            title: t('str_note'),
            field: 'note',
            render: state => noteColumn(state),
            cellStyle: {
                minWidth:"170px"
            }
        },
        {
            title: t('str_amount'),
            field: 'currtotal',
            render: state => amountColumn(state),
            cellStyle: {
                minWidth: "150px"
            },
            headerStyle: {
                textAlign:"right"
            }
        },
        {
            title: t('str_balance'),
            field: 'balance',
            render: state => balanceColumn(state),
            cellStyle: {
                minWidth: "150px"
            },
            headerStyle: {
                textAlign:"right"
            }
        },
        {
            title: excRateHeader(),
            field: 'excrate',
            render: state => excRateColumn(state),
            cellStyle: {
                minWidth: "150px"
            },
            headerStyle: {
                textAlign:"right"
            }
        },
        {
            title: t('str_currency'),
            field: 'currencycode',
            render: state => currencyColumn(state),
            cellStyle: {
                minWidth: "150px",
                textAlign:"center"
            },
            headerStyle: {
                textAlign:"center"
            }
        },
        {
            title: currentAmountHeader(),
            field: 'currtotal',
            render: state => currentAmount(state),
            cellStyle: {
                minWidth: "150px",
                textAlign: "right"
            },
            headerStyle: {
                textAlign:"right"
            }
        },
        {
            title: currentBalanceHeader(),
            field: 'currbalance',
            render: state => currentBalance(state),
            cellStyle: {
                minWidth: "150px",
                textAlign: "right"
            },
            headerStyle: {
                textAlign:"right"
            }
           
        },
    ]
    
    return(
        <div>
            <Typography className={classes.mainTitle}>{t("str_billing")}</Typography>
            <div className={classes.actionDiv}>
                <div className={classes.buttonDiv}>
                    <Button
                        className={classes.subTextRefresh}
                        startIcon={<CachedIcon className={classes.iconStyle} />}
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
                                    <CheckIcon className={classes.checkIcon} />
                                    :
                                    null
                            }
                        </div>
                        <Typography className={classes.checkBoxText}>{t('str_open')}</Typography>
                    </div>
                </div>
                <div>
                    <CustomToolTip title={t("str_allCompanies")} placement={"top"}>
                        <div className={classes.customCheckBox}>
                            <div className={classes.checkBoxDiv} onClick={handleAllCompCheckBoxClick}>
                                {
                                    allComp ?
                                        <CheckIcon className={classes.checkIcon} />
                                        :
                                        null
                                }
                            </div>
                            <Typography className={classes.checkBoxText}>{t('str_allComp')}</Typography>
                        </div>
                    </CustomToolTip>
                </div>
            </div>
            <TextField
                onChange={(e) => setSearchText(e.target.value)}
                className={classes.textFieldStyle}
                variant="outlined"
                placeholder={t("str_searchBilling")}
                InputProps={{
                    startAdornment: <InputAdornment position="start"> <SearchIcon style={{color:"#4666B0"}} /> </InputAdornment>,
                }}
                value={searchText}
            />
            <div style={{paddingBottom:"30px"}}/>
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
                        headerStyle:{
                            fontWeight:"bold",
                            fontSize:"12px",
                            color:"#A3A6B4",
                            textTransform:"uppercase",
                            backgroundColor:"#F5F6FA",
                        },
                        toolbar:false,
                        selection:true,
                        sorting:false,
                        grouping:false,
                        pageSize: window.innerWidth === 1920  ? 10 : 5,
                        pageSizeOptions: [5, 10, 15, 20],
                        actionsColumnIndex: 1,
                        selectionColumnIndex: 1
                    }}
                />
            </MuiThemeProvider>
        </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(BillingList)
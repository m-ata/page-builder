import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import EditIcon from '@material-ui/icons/Edit';
import MenuHover from 'material-ui-popup-state/HoverMenu'
import { bindHover } from 'material-ui-popup-state/hooks'
import PopupState, {bindMenu, bindTrigger, bindPopover} from "material-ui-popup-state";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import {Box, Button, Divider, Grid, Menu, MenuItem, Popover} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import {CustomToolTip} from "../user-portal/components/CustomToolTip/CustomToolTip";
import CachedIcon from "@material-ui/icons/Cached";
import AddIcon from "@material-ui/icons/Add";
import AlignToCenter from "../AlignToCenter";
import LoadingSpinner from "../LoadingSpinner";
import useTranslation from "../../lib/translations/hooks/useTranslation";
import TableColumnText from "../TableColumnText";
import {FALSE} from "../../model/globals";





function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

const tableHeaderClasses = makeStyles((theme) => ({
    tableHeaderCell: {
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        backgroundColor: '#F5F6FA',
        color: '#A3A6B4',
        borderLeft: '1px solid #FFF',
    },
    actionButton: {
        minWidth: 'unset',
        maxWidth: '25px'
    }
}))



function EnhancedTableHead(props) {
    const classes = tableHeaderClasses()
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, headCells, selection, isActionFirstColumn } = props;
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow>
                <TableCell className={classes.tableHeaderCell} style={{padding: '12px', textAlign: 'center'}}>#</TableCell>
                {!isActionFirstColumn && selection && (
                    <TableCell className={classes.tableHeaderCell} padding="checkbox">
                        <Checkbox
                            color={'primary'}
                            indeterminate={numSelected > 0 && numSelected < rowCount}
                            checked={rowCount > 0 && numSelected === rowCount}
                            onChange={onSelectAllClick}
                            inputProps={{ 'aria-label': 'select all desserts' }}
                        />
                    </TableCell>
                )}
                {isActionFirstColumn && (
                    <TableCell className={classes.tableHeaderCell} align={'center'} padding="checkbox">
                        <Button
                            className={classes.actionButton}
                            disabled
                        >
                            <MoreVertIcon />
                        </Button>
                    </TableCell>
                )}
                {headCells && headCells?.length > 0 && headCells.map((headCell) => (
                    !headCell?.hidden ? (
                        <TableCell
                            className={classes.tableHeaderCell}
                            style={{padding: '12px'}}
                            key={headCell.title}
                            align={headCell.align ? headCell.align : 'left'}
                            padding={'default'}
                        >
                            {headCell?.title}
                        </TableCell>
                    ) : null
                ))}
            </TableRow>
        </TableHead>
    );
}

EnhancedTableHead.propTypes = {
    classes: PropTypes.object.isRequired,
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
};

const useToolbarStyles = makeStyles((theme) => ({
    root: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(1),
    },
    highlight:
        theme.palette.type === 'light'
            ? {
                color: theme.palette.secondary.main,
                backgroundColor: lighten(theme.palette.secondary.light, 0.85),
            }
            : {
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.secondary.dark,
            },
    title: {
        flex: '1 1 100%',
    },
}));

const EnhancedTableToolbar = (props) => {
    const classes = useToolbarStyles();
    const { numSelected, onRefresh, onAdd, refreshText, addText, showFilterDivider, filterComponent, filterComponentAlign, isDisabledAdd, isDisabledRefresh, disabledRefreshInfoText, disabledAddInfoText, t} = props;

    return (
        <Toolbar>
          <Grid container>
              <Grid item xs={12}>
                  <Grid container spacing={3}>
                      <Grid item>
                          <Grid container spacing={2}>
                              <Grid item>
                                  {typeof onRefresh === 'function' && (
                                      <CustomToolTip title={isDisabledRefresh && disabledRefreshInfoText ? disabledRefreshInfoText : (refreshText || t('str_refresh'))}>
                                          <span>
                                              <IconButton
                                                  disabled={isDisabledRefresh}
                                                  onClick={() => !isDisabledRefresh && onRefresh()}
                                                  style={!isDisabledRefresh ? {color:"#F16A4B"} : {}}
                                              >
                                                  <CachedIcon />
                                          </IconButton>
                                          </span>
                                      </CustomToolTip>
                                  )}
                              </Grid>
                              <Grid item>
                                  {typeof onAdd === 'function' && (
                                      <CustomToolTip title={isDisabledAdd && disabledAddInfoText ? disabledAddInfoText : (addText || t('str_add'))}>
                                          <span>
                                               <IconButton
                                                   disabled={isDisabledAdd}
                                                   onClick={() => !isDisabledAdd && onAdd()}
                                               >
                                                   <AddIcon/>
                                          </IconButton>
                                          </span>
                                      </CustomToolTip>
                                  )}
                              </Grid>
                          </Grid>
                      </Grid>
                      {filterComponent && (
                          <Box
                              component={Grid}
                              item
                              display={{xs: 'none', sm: 'block' }}
                              style={ {visibility: showFilterDivider ? 'visible' : 'hidden', marginLeft: filterComponentAlign === 'right' ? 'auto' : 'unset'}}
                          >
                              <Divider orientation={'vertical'}/>
                          </Box>
                      )}
                      <Grid item>
                          {filterComponent}
                      </Grid>
                  </Grid>
              </Grid>
          </Grid>
        </Toolbar>
    );
};

EnhancedTableToolbar.propTypes = {
    numSelected: PropTypes.number.isRequired,
};

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    paper: {
        width: '100%',
        marginBottom: theme.spacing(2),
    },
    tableContainer: {
        '&::-webkit-scrollbar': {
            width: '0.12em',
            height: 4,
            background: '#0000000a',
        },
        '&::-webkit-scrollbar-track': {
            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
            webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
            backgroundColor: '#DDD'
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(12, 12, 12, 0.17)',
            outline: '1px solid #29609747',
        },
    },
    table: {
        minWidth: 750,
        "& tbody>.MuiTableRow-root:hover $hoverMenu": {
            visibility: 'visible'
        },
        "& tbody>.MuiTableRow-root:hover $dataContainer": {
            visibility: 'hidden'
        },
        '& tbody>.MuiTableRow-root.Mui-selected': {
            backgroundColor: '#FEF3E2'
        },
        '& .MuiTableCell-paddingNone': {
            padding: '12px'
        },
        '& .MuiTableCell-body': {
            whiteSpace: 'nowrap',
            borderLeft: '1px solid rgba(224, 224, 224, 1)'
        },

    },
    container: {
        position: 'relative'
    },
    hoverMenu: {
        visibility: 'hidden',
        display: 'flex'
    },
    dataContainer: {
        position: 'absolute',
        visibility: 'visible'
    },
    iconButtonStyle: {
        padding: '0'
    },
    popoverStyle: {
        width: '140px'
    },
    actionButton: {
        minWidth: 'unset',
        maxWidth: '25px'
    }
}));

export default function CustomTable(props) {
    const classes = useStyles();

    const { t } = useTranslation()

    //props
    const {getRows, getColumns, onDoubleClickRow, onRowSelect, isHoverFirstColumn, showMoreActionButton, moreActionList, onClickMoreIcon, options, onRefresh, showFilterDivider, filterComponent, filterComponentAlign, onAdd, loading, onClickDetailIcon, isDisabledAdd, isDisabledRefresh, addText, refreshText, disabledAddInfoText, disabledRefreshInfoText, isActionFirstColumn, firstColumnActions, showEditIcon, onClickEditIcon, editIconText } = props

    //state
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('');
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [data, setData] = useState([])
    const [columns, setColumns] = useState(getColumns)
    const [hoverIndex, setHoverIndex] = useState(-9999)
    let timer;


    useEffect(() => {
        if(getRows) {
            setData(getRows)
            setSelected([])
        }
    }, [getRows])

    useEffect(() => {
        if(getColumns) {
            setColumns(getColumns)
            if (getColumns[0]?.hidden) {
                const index = getColumns.findIndex((e => e?.hidden === FALSE))
                setHoverIndex(index)
            } else {
                setHoverIndex(0)
            }
        }
    }, [getColumns])


    const renderColumns = (item, rowData, index) => {
        if(hoverIndex === index) {
            if(isHoverFirstColumn) {
                return(
                    <div className={classes.container} style={{minWidth: item?.minWidth || '100px', maxWidth: item?.maxWidth || 'unset' }}>
                        <div className={classes.dataContainer}>
                            {item?.render ? item.render(rowData) : rowData[item?.field]}
                        </div>
                        <div className={classes.hoverMenu}>
                            {
                                showMoreActionButton && (
                                    <React.Fragment>
                                        {showEditIcon && (
                                            <div style={{paddingRight: '8px'}}>
                                                <IconButton
                                                    className={classes.iconButtonStyle}
                                                    onClick={() => typeof onClickEditIcon === 'function' && onClickEditIcon(rowData)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </div>
                                        )}
                                        <div style={{paddingRight: '8px'}}>
                                            <IconButton
                                                className={classes.iconButtonStyle}
                                                onClick={() => typeof onClickDetailIcon === 'function' && onClickDetailIcon(rowData)}
                                            >
                                                <MenuIcon />
                                            </IconButton>
                                        </div>
                                        <PopupState variant="popover" popupId="material-table-generic">
                                            {(popupState) => (
                                                <React.Fragment>
                                                    <IconButton
                                                        className={classes.iconButtonStyle}
                                                        onClick={(e) => handleClickMoreButton(e, popupState, rowData)}
                                                    >
                                                        <MoreVertIcon />
                                                    </IconButton>
                                                    <Popover
                                                        classes={{
                                                            paper: classes.popoverStyle,
                                                        }}
                                                        anchorOrigin={{
                                                            vertical: "bottom",
                                                            horizontal: "left"
                                                        }}
                                                        transformOrigin={{
                                                            vertical: "top",
                                                            horizontal: "left"
                                                        }}
                                                        getContentAnchorEl={null}
                                                        {...bindPopover(popupState)}
                                                    >
                                                        {
                                                            moreActionList && moreActionList.map((item, i) => (
                                                                item?.hoverMenuList && item?.hoverMenuList.length > 0 ? item.hoverMenuList.map((hoverItem, hoverItemIndex) => (
                                                                    <PopupState variant="popover" popupId={`popover-${hoverItemIndex}`} key={hoverItemIndex}>
                                                                        {(popupStateHover) => (
                                                                            <React.Fragment>
                                                                                <MenuItem
                                                                                    {...bindHover(popupStateHover)}
                                                                                    key={`menu-item-${i}`}
                                                                                >
                                                                                    {item.icon}
                                                                                    <Typography style={{paddingLeft: '8px'}}>{item.title}</Typography>
                                                                                    {item?.hoverMenuList && <ChevronRightIcon style={{marginLeft: 'auto'}}/>}
                                                                                </MenuItem>
                                                                                <MenuHover
                                                                                    anchorOrigin={{
                                                                                        vertical: "top",
                                                                                        horizontal: "right"
                                                                                    }}
                                                                                    transformOrigin={{
                                                                                        vertical: "top",
                                                                                        horizontal: "left"
                                                                                    }}
                                                                                    getContentAnchorEl={null}
                                                                                    {...bindMenu(popupStateHover)}
                                                                                >
                                                                                    {
                                                                                        hoverItem?.disabled ? (
                                                                                            <CustomToolTip title={hoverItem?.disabledInfo || ''} placement={"top"}>
                                                                                                <div>
                                                                                                    <MenuItem disabled>
                                                                                                        {hoverItem?.icon}
                                                                                                        <Typography>{hoverItem?.title}</Typography>
                                                                                                    </MenuItem>
                                                                                                </div>
                                                                                            </CustomToolTip>
                                                                                        ) : (
                                                                                            <MenuItem onClick={() => typeof hoverItem?.onClick === 'function' && hoverItem.onClick(popupState, rowData)}>
                                                                                                {hoverItem?.icon}
                                                                                                <Typography>{hoverItem?.title}</Typography>
                                                                                            </MenuItem>
                                                                                        )
                                                                                    }
                                                                                </MenuHover>
                                                                            </React.Fragment>
                                                                        )}
                                                                    </PopupState>
                                                                )): (
                                                                    <React.Fragment key={`fragment-${i}`}>
                                                                        {
                                                                            item?.disabled ? (
                                                                                <CustomToolTip title={item?.disabledInfo}>
                                                                                   <span>
                                                                                        <MenuItem
                                                                                            disabled
                                                                                            key={`menu-item-${i}`}
                                                                                        >
                                                                                        {item.icon}
                                                                                            <Typography style={{paddingLeft: '8px'}}>{item.title}</Typography>
                                                                                    </MenuItem>
                                                                                   </span>
                                                                                </CustomToolTip>
                                                                            ) : (
                                                                                <MenuItem
                                                                                    onClick={() => typeof item?.onClick === 'function' && item.onClick(popupState, rowData)}
                                                                                    key={`menu-item-${i}`}
                                                                                >
                                                                                    {item.icon}
                                                                                    <Typography style={{paddingLeft: '8px'}}>{item.title}</Typography>
                                                                                </MenuItem>
                                                                            )
                                                                        }
                                                                    </React.Fragment>

                                                                )
                                                            ))
                                                        }
                                                    </Popover>
                                                </React.Fragment>
                                            )}
                                        </PopupState>
                                    </React.Fragment>
                                )
                            }
                        </div>
                    </div>
                )
            } else {
                return item?.render ? item?.render(rowData) : rowData[item?.field]
            }
        } else {
            return item?.render ? item?.render(rowData) : rowData[item?.field]
        }
    }

    const handleClickMoreButton = (event, popupState, rowData) => {
        event.preventDefault()
        event.stopPropagation()
        event.nativeEvent.stopImmediatePropagation()
        bindTrigger(popupState).onClick(event)
        if(typeof onClickMoreIcon === 'function') onClickMoreIcon(rowData)
        setSelected([rowData])
    }


    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelecteds = data.map((n) => n);
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, rowData) => {
        event.preventDefault()
        event.stopPropagation()
        event.nativeEvent.stopImmediatePropagation()
        const targetLink = event.target.closest('tr')
        const role = targetLink?.getAttribute('role') || null
        clearTimeout(timer);
        if (event.detail === 1) {
            timer = setTimeout(() => {
                if(role) {
                    const selectedIndex = selected.indexOf(rowData);
                    let newSelected = [...selected];

                    if (selectedIndex === -1) {
                        newSelected = [rowData];
                    } else {
                        newSelected.splice(selectedIndex, 1);
                    }
                    setSelected(newSelected);
                    if(typeof onRowSelect === 'function') onRowSelect(newSelected)
                }
            }, 200)
        } else if (event.detail === 2) {
            if(typeof onDoubleClickRow === 'function') onDoubleClickRow(rowData)
        }
    }

    const handleClickCheckBox = (event, rowData) => {
        const selectedIndex = selected.indexOf(rowData);
        const newSelected = [];
        if(event.target.checked) {
            newSelected.push(...selected, rowData);
        } else {
            newSelected.push(...selected)
            newSelected.splice(selectedIndex, 1)
        }

        setSelected(newSelected);
        if(typeof onRowSelect === 'function') onRowSelect(newSelected)
    }


    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    //TODO to be done later
   /* const handleRightClick = (event, rowData) => {
        if(moreActionList && moreActionList?.length > 0) {
            event.preventDefault()
            event.stopPropagation()
            event.nativeEvent.stopImmediatePropagation()
            setAnchorEl(event.target)
            typeof onClickMoreIcon === 'function' && onClickMoreIcon(rowData)
        }
    }*/


    const isSelected = (name) => selected.indexOf(name) !== -1;


    const emptyRows = rowsPerPage - Math.min(rowsPerPage, data?.length - page * rowsPerPage);

    return (
        <div className={classes.root}>
            <Paper className={classes.paper}>
                <EnhancedTableToolbar
                    filterComponent={filterComponent}
                    filterComponentAlign={filterComponentAlign}
                    showFilterDivider={showFilterDivider}
                    onRefresh={onRefresh}
                    onAdd={onAdd}
                    addText={addText}
                    refreshText={refreshText}
                    isDisabledAdd={isDisabledAdd}
                    isDisabledRefresh={isDisabledRefresh}
                    disabledAddInfoText={disabledAddInfoText}
                    disabledRefreshInfoText={disabledRefreshInfoText}
                    numSelected={selected.length}
                    selection={options?.selection}
                    t={t}
                />
                <div style={{position: 'relative'}}>
                    {
                        loading && (
                            <AlignToCenter backgroundColor={'rgba(255, 255, 255, 0.7)'} ><LoadingSpinner size={24}/></AlignToCenter>
                        )
                    }
                    <TableContainer className={classes.tableContainer}>
                        <Table
                            className={classes.table}
                            aria-labelledby="tableTitle"
                            aria-label="enhanced table"
                        >
                            <EnhancedTableHead
                                classes={classes}
                                numSelected={selected.length}
                                order={order}
                                orderBy={orderBy}
                                onSelectAllClick={handleSelectAllClick}
                                onRequestSort={handleRequestSort}
                                rowCount={data?.length}
                                headCells={columns}
                                selection={options?.selection}
                                isActionFirstColumn={isActionFirstColumn}
                            />
                            <TableBody>
                                {data && data.length > 0 ? stableSort(data, getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                                    const originalIndex = data.findIndex(e => e === row)
                                    const rowData = Object.assign(row, {tableData: {id: originalIndex}})
                                    const isItemSelected = isSelected(rowData);
                                    const labelId = `enhanced-table-checkbox-${index}`;

                                    return (
                                        <TableRow
                                            hover
                                            onClick={(event) => handleClick(event, rowData)}
                                            role="checkbox"
                                            aria-checked={isItemSelected}
                                            tabIndex={-1}
                                            key={index}
                                            selected={isItemSelected}
                                        >
                                            <TableCell align={'center'} padding={'none'} style={{minWidth: '2%', maxWidth: '2%', width: '2%'}}>
                                                {originalIndex + 1}
                                            </TableCell>
                                            {!isActionFirstColumn && options?.selection && (
                                                <TableCell padding="checkbox" style={{minWidth: '3%', maxWidth: '3%', width: '3%'}}>
                                                    <Checkbox
                                                        color={'primary'}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            e.nativeEvent.stopImmediatePropagation()
                                                        }}
                                                        onChange={(e) => handleClickCheckBox(e, rowData)}
                                                        checked={isItemSelected}
                                                        inputProps={{ 'aria-labelledby': labelId }}
                                                    />
                                                </TableCell>
                                            )}
                                            {isActionFirstColumn && (
                                                <TableCell padding="checkbox" align={'center'}>
                                                    <PopupState variant={'popover'} popupId={`actionColumn-${index}`}>
                                                        {(popupState) => (
                                                            <React.Fragment>
                                                                <Button
                                                                    className={classes.actionButton}
                                                                    variant={'contained'}
                                                                    color={'primary'}
                                                                    aria-labelledby={labelId}
                                                                    {...bindTrigger(popupState)}
                                                                >
                                                                    <MoreVertIcon />
                                                                </Button>
                                                                <Menu
                                                                    anchorOrigin={{
                                                                        vertical: "top",
                                                                        horizontal: "right"
                                                                    }}
                                                                    transformOrigin={{
                                                                        vertical: "top",
                                                                        horizontal: "left"
                                                                    }}
                                                                    {...bindMenu(popupState)}
                                                                >
                                                                    {
                                                                        firstColumnActions && firstColumnActions.length > 0 && firstColumnActions.filter(item => !item.hidden).map((item, index) => (
                                                                            typeof item?.disabled === 'function' && item?.disabled(rowData) || typeof item?.disabled === 'boolean' && item?.disabled ? (
                                                                                <CustomToolTip key={index} title={typeof item?.disabledInfo === 'function' ? item?.disabledInfo(rowData) : item?.disabledInfo}>
                                                                                   <span>
                                                                                        <MenuItem
                                                                                            disabled
                                                                                            key={`menu-item-${index}`}
                                                                                        >
                                                                                        {item.icon}
                                                                                            <Typography style={{paddingLeft: '8px'}}>{item.title}</Typography>
                                                                                    </MenuItem>
                                                                                   </span>
                                                                                </CustomToolTip>
                                                                            ) : (
                                                                                <MenuItem key={`menu-item-${index}`} onClick={() => typeof item?.onClick === 'function' && item?.onClick(popupState, rowData)}>
                                                                                    {item?.icon}
                                                                                    <Typography style={{paddingLeft: '4px'}}>{item?.title}</Typography>
                                                                                </MenuItem>
                                                                            )
                                                                             /*(typeof item?.disabled === 'function' && item?.disabled(rowData)) || item?.disabled ? (
                                                                                <CustomToolTip title={item?.disabledInfo}>
                                                                                   <span>
                                                                                        <MenuItem
                                                                                            disabled
                                                                                            key={`menu-item-${index}`}
                                                                                        >
                                                                                        {item.icon}
                                                                                            <Typography style={{paddingLeft: '8px'}}>{item.title}</Typography>
                                                                                    </MenuItem>
                                                                                   </span>
                                                                                </CustomToolTip>
                                                                            ) : (
                                                                                <MenuItem key={`menu-item-${index}`} onClick={() => typeof item?.onClick === 'function' && item?.onClick(popupState, rowData)}>
                                                                                    {item?.icon}
                                                                                    <Typography style={{paddingLeft: '4px'}}>{item?.title}</Typography>
                                                                                </MenuItem>
                                                                            )*/
                                                                        ))
                                                                    }
                                                                </Menu>
                                                            </React.Fragment>
                                                        )}
                                                    </PopupState>
                                                </TableCell>
                                            )}
                                            {
                                                columns && columns.length > 0 && columns.map((item, index) => {
                                                    return(
                                                        !item?.hidden ? (
                                                            <TableCell key={index} padding={'none'}>
                                                                {renderColumns(item, rowData, index)}
                                                            </TableCell>
                                                        ) : null
                                                    )
                                                })
                                            }
                                        </TableRow>
                                    );
                                    }) : (
                                    <TableRow style={{ height: 53 * emptyRows }}>
                                        <TableCell align={'center'} colSpan={options?.selection || isActionFirstColumn ? (columns?.length + 2 ) : (columns?.length + 1) || 1} >
                                            {t('str_noRecordsToDisplay')}
                                        </TableCell>
                                    </TableRow>
                                )}
                                {data && data.length > 0 && emptyRows > 0 && (
                                    <TableRow style={{ height: 53 * emptyRows }}>
                                        <TableCell colSpan={options?.selection || isActionFirstColumn ? (columns?.length + 2 ) : (columns?.length + 1 || 1)}/>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        //labelDisplayedRows={({ from, to, count }) => (t('str_displayingPageCountMsg').replace('{0}', from.toString()).replace('{1}', to.toString()).replace('{2}', count.toString()))}
                        labelRowsPerPage={t('str_rowsPerPage')}
                        backIconButtonText={t('str_previousPage')}
                        nextIconButtonText={t('str_nextPage')}
                        count={data?.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onChangeRowsPerPage={handleChangeRowsPerPage}
                        onChangePage={handleChangePage}
                    />
                </div>
            </Paper>
        </div>
    );
}

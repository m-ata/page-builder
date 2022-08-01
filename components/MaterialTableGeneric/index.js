import React, {useEffect, useState} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import MaterialTable, {MTableHeader} from "material-table";
import MaterialTableLocalization from "../MaterialTableLocalization";
import {IconButton, Menu, MenuItem, Typography, Button, Grid} from "@material-ui/core";
import MoreVertIcon from '@material-ui/icons/MoreVert';
import TableColumnText from "../TableColumnText";
import PopupState, {bindMenu, bindTrigger} from "material-ui-popup-state";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import {CustomToolTip} from "../user-portal/components/CustomToolTip/CustomToolTip";
import CachedIcon from "@material-ui/icons/Cached";
import AddIcon from "@material-ui/icons/Add";
import useTranslation from "../../lib/translations/hooks/useTranslation";
import PropTypes from "prop-types";
import CustomAutoComplete from "../CustomAutoComplete/CustomAutoComplete";


const useStyles = makeStyles((theme) => ({
    table: {
        '& .MuiTableCell-root': {
            padding: '10px'
        },
        "& tbody>.MuiTableRow-root:hover": {
            backgroundColor: "rgb(163, 166, 180,0.1)",
        },
        "& tbody>.MuiTableRow-root:hover $hoverMenu": {
            visibility: 'visible'
        },
        "& tbody>.MuiTableRow-root:hover $dataContainer": {
            visibility: 'hidden'
        },
    },
    container: {
        position: 'relative'
    },
    hoverMenu: {
        visibility: 'hidden'
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
    actionColumnButton: {
        minWidth: '10px',
        padding: '6px'
    }

}))



function MaterialTableGeneric(props) {

    const classes = useStyles();
    const { t } = useTranslation();

    const {columns, data, isLoading, actionFirstColumn, hoverFirstColumn, showMoreActionButton, moreActionList, onRefresh, refreshText, onAdd, addText} = props

    const tableLocalization = MaterialTableLocalization();


    useEffect(() => {
        if(actionFirstColumn) {
            const actionColumn =  {
                id: 'actionColumn',
                title: (
                    <Button
                        style={{padding: 0, maxWidth: 25, minWidth: 25}}
                        disabled
                        color={'primary'}
                        variant={'text'}
                        className={classes.actionColumnButton}
                    >
                        <MoreVertIcon/>
                    </Button>
                ),
                headerStyle: {
                    textAlign: 'center',
                    maxWidth: '30px'
                },
                cellStyle: {
                    textAlign: 'center',
                },
                render: props => (
                    <TableColumnText minWidth={30}>
                        <PopupState variant="popover" popupId="material-table-action-column">
                            {(popupState) => (
                                <React.Fragment>
                                    <Button
                                        style={{padding: 0, maxWidth: 25, minWidth: 25}}
                                        color={'primary'}
                                        variant={'contained'}
                                        {...bindTrigger(popupState)}
                                    >
                                        <MoreVertIcon size={'small'} />
                                    </Button>
                                    <Menu
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
                                        {...bindMenu(popupState)}
                                    >
                                        {
                                            moreActionList && moreActionList.map((item, i) => (
                                                <MenuItem
                                                    key={`menu-item-${i}`}
                                                    onClick={() => {
                                                        item.onClick(props)
                                                        popupState.close();
                                                    }}
                                                >
                                                    {item.icon}
                                                    <Typography style={{paddingLeft: '8px'}}>{item.title}</Typography>
                                                </MenuItem>
                                            ))
                                        }
                                    </Menu>
                                </React.Fragment>
                            )}
                        </PopupState>
                    </TableColumnText>)
            }

            if(columns[0]?.id !== 'actionColumn') {
                columns.splice(0, 0, actionColumn)
            } else {
                columns.splice(0, 1, actionColumn)
            }

        } else {
            if(hoverFirstColumn) {
                columns[0].render = rowData => handleRenderFirstColumn(rowData)
            }

        }
    }, [])


    /** for hover use standardRender instead of render when defining columns. Write the space to be rendered as child **/
    const handleRenderFirstColumn = (rowData) => {
        const firstColumnProps = columns[0]?.standardRender?.props
        const firstColumnField = columns[0].field

        if(hoverFirstColumn) {
            return(
                <div className={classes.container}>
                    <div className={classes.dataContainer}>
                        <TableColumnText
                            maxWidth={firstColumnProps?.maxWidth}
                            textAlign={firstColumnProps?.textAlign}
                            minWidth={firstColumnProps?.minWidth}
                            showToolTip={firstColumnProps?.showToolTip}
                        >
                            {rowData[firstColumnField]}
                        </TableColumnText>
                    </div>
                    <div className={classes.hoverMenu}>
                        {
                            showMoreActionButton && (
                                <PopupState variant="popover" popupId="material-table-generic">
                                    {(popupState) => (
                                        <React.Fragment>
                                            <IconButton className={classes.iconButtonStyle} {...bindTrigger(popupState)}>
                                                <MoreVertIcon />
                                            </IconButton>
                                            <Menu
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
                                                {...bindMenu(popupState)}
                                            >
                                                {
                                                    moreActionList && moreActionList.map((item, i) => (
                                                        <MenuItem
                                                            key={`menu-item-${i}`}
                                                            onClick={() => {
                                                                item.onClick(rowData)
                                                                popupState.close();
                                                            }}
                                                        >
                                                            {item.icon}
                                                            <Typography style={{paddingLeft: '8px'}}>{item.title}</Typography>
                                                        </MenuItem>
                                                    ))
                                                }
                                            </Menu>
                                        </React.Fragment>
                                    )}
                                </PopupState>
                            )

                        }
                    </div>
                </div>
            )
        } else {
            return(
                <TableColumnText
                    maxWidth={firstColumnProps?.maxWidth}
                    textAlign={firstColumnProps?.textAlign}
                    minWidth={firstColumnProps?.minWidth}
                    showToolTip={firstColumnProps?.showToolTip}
                >
                    {rowData[firstColumnField]}
                </TableColumnText>

            )
        }

    }







    return(
        <Grid container>
            <Grid item xs={12}>
                <Grid container spacing={3}>
                    <Grid item xs={4} sm={3}>
                        <Grid container>
                            {typeof onRefresh === 'function' && (
                                <Grid item xs={6} sm={3}>
                                    <CustomToolTip title={refreshText || t('str_refresh')}>
                                        <IconButton
                                            onClick={onRefresh}
                                        >
                                            <CachedIcon style={{color:"#F16A4B"}}/>
                                        </IconButton>
                                    </CustomToolTip>
                                </Grid>
                            )}
                            {typeof onAdd === 'function' && (
                                <Grid item xs={6} sm={3}>
                                    <CustomToolTip title={addText || t('str_add')}>
                                        <IconButton
                                            onClick={onAdd}
                                        >
                                            <AddIcon/>
                                        </IconButton>
                                    </CustomToolTip>
                                </Grid>
                            )}
                        </Grid>
                    </Grid>
                    <Grid item xs={8}>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <div className={classes.table}>
                    <MaterialTable
                        isLoading={isLoading}
                        columns={columns}
                        data={data}
                        localization={tableLocalization}
                        options={{
                            headerStyle:{
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
                                fontSize: '13px',
                            },
                            toolbar: false,
                            selection: false,
                            sorting: false,
                            search: false,
                            actionsColumnIndex: 1,
                            selectionColumnIndex: 1
                        }}
                        components={{
                            Header: (props) => {
                                const overrideProps = {...props}
                                overrideProps.draggable = false
                                if(actionFirstColumn) {
                                    overrideProps.columns[0].tableData.initialWidth = 'calc(30px)'
                                    overrideProps.columns[0].tableData.width = 'calc(30px)'
                                }
                                return(
                                    <MTableHeader  {...overrideProps}/>
                                )
                            },
                        }}
                    />
                </div>
            </Grid>
        </Grid>

    );
}

export default MaterialTableGeneric;

MaterialTableGeneric.propTypes = {
    columns: PropTypes.object,
    data: PropTypes.object,
    isLoading: PropTypes.bool,
    actionFirstColumn: PropTypes.bool,
    hoverFirstColumn: PropTypes.bool,
    showMoreActionButton: PropTypes.bool,
    moreActionList: PropTypes.array,
    onRefresh: PropTypes.func,
    refreshText: PropTypes.string,
    onAdd: PropTypes.func,
    addText: PropTypes.string

}
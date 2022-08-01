import React, {useContext, useEffect, useState} from 'react';
//material imports
import Paper from "@material-ui/core/Paper";
import { makeStyles } from '@material-ui/core/styles'
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
//redux imports
import { connect } from 'react-redux';
import {setToState, updateState} from "../../../../../../state/actions";
//server related imports
import { ViewList} from "@webcms/orest";
import {OREST_ENDPOINT} from "../../../../../../model/orest/constants";
import WebCmsGlobal from "../../../../../webcms-global";
import {useRouter} from "next/router";
//custom imports
import {COLORS} from "../../../constants";
import PageItemList from "./PageItemList";

const useStyles = makeStyles(theme => ({

    pageBlock: {
        border: `2px solid ${COLORS?.secondary}`,
        height: 200,
        width: 200,
        overflow: 'auto',
        marginLeft: theme.spacing(1),
        marginTop: theme.spacing(2),
        cursor: "pointer",
    },
    pageContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        height: 500,
        overflow: 'auto',
    },
    codeText: {
        marginTop: theme.spacing(1),
        marginLeft: theme.spacing(2),
    }

}));

const AddPage = (props) => {

    const {
        onAddPage,
    } = props;

    const classes = useStyles();

    const [pages, setPages] = useState([]);
    const [selectedIndexes, setSelectedIndexes] = useState([]);
    const [selectedPages, setSelectedPages] = useState([]);

    const {GENERAL_SETTINGS, token} = useContext(WebCmsGlobal);
    const router = useRouter();
    const companyId = router.query.companyID;
    const authToken = token || router.query.authToken;

    useEffect(() => {
        //getting web page from rafile
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RAFILE,
            token: authToken,
            params: {
                hotelrefno: Number(companyId),
                query: `filetype:WEBPAGE`,
            }
        }).then(res => {
            if (res.status === 200 && res.data && res.data.data) {
                setPages(res.data.data);
            }
        })
    }, []);

    useEffect(() => {
        onAddPage(selectedPages);
    }, [selectedPages]);

    const handleSelectedPage = (index, page) => {
        const updatedIndexes = [...selectedIndexes];
        const updatedPages = [...selectedPages];
        const indexExist = selectedIndexes.find(x => x=== index);
        if (!indexExist && indexExist !==0) {
            updatedIndexes.push(index);
            updatedPages.push({
                gid: page?.gid,
                code: [page?.code]
            });
        } else {
            const i = selectedIndexes.indexOf(indexExist);
            updatedIndexes.splice(i, 1);
            updatedPages.splice(i, 1);
        }
        setSelectedIndexes(updatedIndexes);
        setSelectedPages(updatedPages);
    }

    return (
        <React.Fragment>
            <Grid container={true} className={classes.pageContainer}>
                {
                    pages.length > 0 && pages.map((page, index) => {
                        return (
                            <Grid item key={index}>
                                <Paper
                                    className={classes.pageBlock}
                                    onClick={() => handleSelectedPage(index, page)}
                                    style={{
                                        border: index === selectedIndexes.find(x => x=== index) ? `2px solid red` :
                                            `2px solid ${COLORS?.secondary}`
                                    }}
                                    key={`page-${index}`}
                                >
                                    <PageItemList
                                        pageData={JSON.parse(Buffer.from(page.filedata, 'base64').toString('utf-8'))}
                                    />
                                </Paper>
                                <Typography
                                    component={'div'}
                                    className={classes.codeText}
                                    style={{
                                        color: index === selectedIndexes.find(x => x=== index) ? `red` :
                                            `${COLORS?.secondary}`
                                    }}
                                > {page.code} </Typography>
                            </Grid>
                        )
                    })
                }
            </Grid>
        </React.Fragment>
    )
}

const mapStateToProps = state => {
    return {
        state: state.formReducer.pageBuilder
    }
};

const mapDispatchToProps = dispatch => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddPage)

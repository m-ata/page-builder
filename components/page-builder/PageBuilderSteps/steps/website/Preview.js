//react imports
import React, {useState} from 'react';
//redux imports
import { connect } from 'react-redux';
//material imports
import {Container} from "@material-ui/core";
//custom imports
import Header from "../../components/website/header/Header";
import Footer from "../../components/website/footer/Footer";
import Page from "../../components/website/pages/Page";


const WebsitePreview = (props) => {

    const { state } = props;

    const [selectedGID, setSelectedGID] = useState(state.website.pages.length > 0 ? state.website.pages[0].gid : '');

    const handleSelectedLink = (gid) => {
        if (gid) {
            setSelectedGID(gid);
        } else {
            state.website.pages && state.website.pages.length > 0 &&
            state.website.pages[0] && state.website.pages[0].gid &&
            setSelectedGID(state.website.pages[0].gid);
        }
    }

    return (
            <React.Fragment>
                {
                    Object.keys(state.website.header).length > 0 ? <>
                        {
                            state.langCode === state.defaultLang &&
                            <Header
                                headerItems={state.website.header.items}
                                handleSelectedLink={handleSelectedLink}
                            />
                        }
                        {
                            state.langCode !== state.defaultLang &&
                            <Header
                                handleSelectedLink={handleSelectedLink}
                                headerItems={state.langsFile.header[state.langCode].items}
                            />
                        }
                        </>: null
                }
                {
                    state.website.pages.length > 0 &&
                    <Container>
                        <Page gid={selectedGID} handleSelectedLink={handleSelectedLink}/>
                    </Container>
                }
                {
                    Object.keys(state.website.footer).length > 0 ? <>
                        {
                            state.langCode === state.defaultLang &&
                            <Footer
                                footerItems={state.website.footer.items}
                                handleSelectedLink={handleSelectedLink}
                            />
                        }
                        {
                            state.langCode !== state.defaultLang &&
                            <Footer
                                footerItems={state.langsFile.footer[state.langCode].items}
                                handleSelectedLink={handleSelectedLink}
                            />
                        }
                        </>: null
                }
            </React.Fragment>
    )
}
const mapStateToProps = state => {
    return {
        state: state.formReducer.pageBuilder
    }
};

export default connect(
    mapStateToProps
)(WebsitePreview)
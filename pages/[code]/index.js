import React, {useEffect} from 'react';
import {toast} from "react-toastify";
import {useSelector, connect} from "react-redux";
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ScrollToTop from "react-scroll-to-top";
//custom imports
import WebSiteHeader from "../../components/website/header/WebsiteHeader";
import WebsiteFooter from "../../components/website/footer/WebsiteFooter";
import WebsitePage from "../../components/website/pages/WebPage";
import {updateState} from "../../state/actions";
import PageNotFound from "../../components/website/pages/PageNotFound";
import NextNProgress from "nextjs-progressbar";

const WebPage = (props) => {

    const { websiteData, updateState } = props;
    const website = useSelector(state => state?.formReducer?.website);

    useEffect(() => {
        if (websiteData?.defaultLanguage) {
            updateState('website', 'defaultLangCode', websiteData?.defaultLanguage?.code?.toLowerCase());
            !website?.selectedLangCode && updateState('website', 'selectedLangCode', websiteData?.defaultLanguage?.code?.toLowerCase());
        } else {
            toast.error('Default language not set yet', { position: toast.POSITION.TOP_RIGHT })
        }
        Object.keys(website?.defaultHeader)?.length === 0 && updateState('website', 'defaultHeader', websiteData?.default?.header);
        Object.keys(website?.defaultFooter)?.length === 0 && updateState('website', 'defaultFooter', websiteData?.default?.footer);
        website?.languages?.length === 0 && updateState('website', 'languages', websiteData?.languages);
        website?.defaultPages?.length === 0 && updateState('website', 'defaultPages', websiteData?.default?.pages);
        website?.otherLangPages?.length === 0 && updateState('website', 'otherLangPages', websiteData?.langsFile?.pages);
        Object.keys(website?.otherLangHeader)?.length === 0 && updateState('website', 'otherLangHeader', websiteData?.langsFile?.header);
        Object.keys(website?.otherLangFooter)?.length === 0 && updateState('website', 'otherLangFooter', websiteData?.langsFile?.footer);
        Object.keys(website?.assets)?.length === 0 && updateState('website', 'assets', websiteData?.assets);
        updateState('website', 'ccTel', websiteData?.ccTel);
    }, [websiteData]);

    return (
        <React.Fragment>
            <NextNProgress
                height={4}
                color={websiteData?.assets?.colors?.primary?.light ? websiteData.assets?.colors.primary.light : '#FFFFFF'}
            />
            {
                website?.pageNotFound ? <PageNotFound/> :
                    <div style={{overflowX: 'hidden', overflowY: 'auto'}}>
                        {website?.defaultHeader ? <WebSiteHeader assets={websiteData?.assets}/> : null}
                        <div style={{minHeight: 800}}><WebsitePage/></div>
                        {<WebsiteFooter assets={websiteData?.assets}/>}
                    </div>
            }
            <ScrollToTop smooth component={<ArrowUpwardIcon style={{fontSize: 30}} />} />
        </React.Fragment>
    )
}

export const getServerSideProps = async (ctx) => {

    const { res } = ctx
    const websiteData = res.REDIS_WEBCMS_DATA

    if (websiteData?.default?.pages?.length > 0) {
        return {
            props: {
                websiteData: websiteData,
            },
        }
    } else {
        res.setHeader('location', '/guest')
        res.statusCode = 302
        res.end()
        return { props: {} }
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

export default connect(null, mapDispatchToProps)(WebPage);

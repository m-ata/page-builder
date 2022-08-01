import React, { useEffect } from 'react'
import WebSiteHeader from 'components/website/header/WebsiteHeader'
import WebsiteFooter from 'components/website/footer/WebsiteFooter'
import WebsitePage from 'components/website/pages/WebPage'
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward'
import ScrollToTop from 'react-scroll-to-top'
import { connect, useSelector } from 'react-redux'
import { updateState } from 'state/actions'
import { toast } from 'react-toastify'
import NextNProgress from 'nextjs-progressbar'
import { useRouter } from 'next/router'

const Index = (props) => {
    const { websiteData, updateState } = props
    const website = useSelector(state => state?.formReducer?.website);
    const router = useRouter()

    useEffect(() => {
        if (websiteData?.defaultLanguage) {
            let defaultLangCode = websiteData?.defaultLanguage?.code?.toLowerCase(),
                selectedLangCode = false,
                queryLangCode = router.query.lang

            if (websiteData?.languages && websiteData?.languages.length > 0 && queryLangCode) {
                selectedLangCode = websiteData?.languages.find(langItem => langItem.shortcode === router.query.lang)?.code.toLowerCase() || false
            }

            if (!selectedLangCode) {
                selectedLangCode = defaultLangCode
            }

            updateState('website', 'defaultLangCode', defaultLangCode)
            updateState('website', 'selectedLangCode', selectedLangCode)
        } else {
            toast.error('Default language not set yet', { position: toast.POSITION.TOP_RIGHT })
        }
        updateState('website', 'defaultHeader', websiteData?.default?.header)
        updateState('website', 'defaultFooter', websiteData?.default?.footer)
        updateState('website', 'languages', websiteData?.languages)
        updateState('website', 'defaultPages', websiteData?.default?.pages)
        updateState('website', 'otherLangHeader', websiteData?.langsFile?.header)
        updateState('website', 'otherLangPages', websiteData?.langsFile?.pages)
        updateState('website', 'otherLangFooter', websiteData?.langsFile?.footer)
        updateState('website', 'assets', websiteData?.assets)
        updateState('website', 'ccTel', websiteData?.ccTel)
    }, [websiteData])

    return (
        <React.Fragment>
            <NextNProgress
                height={4}
                color={websiteData?.assets?.colors?.primary?.light ? websiteData.assets?.colors.primary.light : '#FFFFFF'}
            />
            <div style={{overflowX: 'hidden', overflowY: 'auto'}}>
                {website?.defaultHeader ? <WebSiteHeader assets={websiteData?.assets} />: null}
                <div style={{minHeight: 800}}>
                    <WebsitePage/>
                </div>
                {<WebsiteFooter assets={websiteData?.assets} />}
            </div>
            <ScrollToTop smooth component={<ArrowUpwardIcon style={{fontSize: 30}} />} />
        </React.Fragment>
    )
}

export const getServerSideProps = async (ctx) => {
    const { req, res } = ctx
    const websiteData = await res.REDIS_WEBCMS_DATA

    if (websiteData?.default?.pages && Object.keys(websiteData.default.pages).length) {
        return {
            props: {
                websiteData: JSON.parse(JSON.stringify(websiteData)),
            },
        }
    } else if (req.headers.host === 'docs.hotech.systems') {
        res.setHeader('location', '/userdoc')
        res.statusCode = 302
        res.end()
        return { props: {} }
    } else if (req.headers.host === 'portal.hotech.systems') {
        res.setHeader('location', '/hup')
        res.statusCode = 302
        res.end()
        return { props: {} }
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

export default connect(null, mapDispatchToProps)(Index)

import React, { useContext, useEffect, useState } from 'react';
import WebSiteHeader from './header/WebsiteHeader';
import WebsiteFooter from './footer/WebsiteFooter';
import WebsitePage from './pages/WebPage';
import axios from 'axios';
import WebCmsGlobal from '../webcms-global';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ScrollToTop from "react-scroll-to-top";

const WebsiteViewer = (props) => {

    const {
        WEBSITE_STDJSON,
    } = props

    const [header, setHeader] = useState(null)
    const [otherLangHeader, setOtherLangHeader] = useState(null)
    const [otherLangFooter, setOtherLangFooter] = useState(null)
    const [footer, setFooter] = useState(null)
    const [selectedPage, setSelectedPage] = useState(null)
    const [languages, setLanguages] = useState([])
    const [selectedLangCode, setSelectedLangCode] = useState('')
    const [defaultLang, setDefaultLang] = useState('')
    const [selectedLangFilePage, setSelectedLangFilePage] = useState()

    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    useEffect(() => {
        if (WEBSITE_STDJSON) {
            if (WEBSITE_STDJSON.default) {
                WEBSITE_STDJSON.default.header && setHeader(WEBSITE_STDJSON.default.header);
                WEBSITE_STDJSON.default.pages && WEBSITE_STDJSON.default.pages.length > 0 && setSelectedPage(WEBSITE_STDJSON.default.pages[0]);
                WEBSITE_STDJSON.default.footer && setFooter(WEBSITE_STDJSON.default.footer);
            }
            if (WEBSITE_STDJSON.langsFile) {
                WEBSITE_STDJSON.langsFile.header && setOtherLangHeader(WEBSITE_STDJSON.langsFile.header)
                WEBSITE_STDJSON.langsFile.footer && setOtherLangFooter(WEBSITE_STDJSON.langsFile.footer)
                WEBSITE_STDJSON.langsFile.pages && WEBSITE_STDJSON.langsFile.pages.length > 0 &&
                setSelectedLangFilePage(WEBSITE_STDJSON.langsFile.pages.find(x => x.defaultId === WEBSITE_STDJSON.default.pages[0].id))

            }
            if (WEBSITE_STDJSON?.languages?.length > 0) {
                setLanguages(WEBSITE_STDJSON.languages);
            }
        }

        axios({
            url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/content/lang/def',
            method: 'post',
        }).then(res => {
            if (res.status === 200 && res.data && res.data.success && res.data.data && res.data.data.code) {
                setDefaultLang(res.data.data.code.toLowerCase())
                setSelectedLangCode(res.data.data.code.toLowerCase())
            } else {
                setDefaultLang('en')
                setSelectedLangCode('en')
            }
        })
    }, [WEBSITE_STDJSON])

    const handleSelectedLink = (gid) => {
        const page = WEBSITE_STDJSON.default.pages.find(x => x.id === gid)
        if (page) {
            setSelectedPage(page);
            WEBSITE_STDJSON.langsFile && WEBSITE_STDJSON.langsFile.pages && WEBSITE_STDJSON.langsFile.pages.length > 0 &&
            setSelectedLangFilePage(WEBSITE_STDJSON.langsFile.pages.find(x => x.defaultId === page.id))
        } else {
            setSelectedPage(WEBSITE_STDJSON.default.pages[0]);
            WEBSITE_STDJSON.langsFile && WEBSITE_STDJSON.langsFile.pages && WEBSITE_STDJSON.langsFile.pages.length > 0 &&
            setSelectedLangFilePage(WEBSITE_STDJSON.langsFile.pages.find(x => x.defaultId === WEBSITE_STDJSON.default.pages[0].id))
        }
    }

    const handleSelectLanguage = (value) => {
        setSelectedLangCode(value);
    }

    return (
        <React.Fragment>
            {
                header && <WebSiteHeader
                    websiteHeader={header}
                    assets={WEBSITE_STDJSON.assets}
                    handleSelectedLink={handleSelectedLink}
                    defaultLang={defaultLang}
                    selectedLang={selectedLangCode}
                    otherLangHeader={otherLangHeader}
                    languages={languages}
                    handleSelectLanguage={handleSelectLanguage}
                />
            }
            <div style={{ minHeight: 800 }}>
                <WebsitePage
                    page={selectedPage}
                    otherLangPage={selectedLangFilePage}
                    selectedLang={selectedLangCode}
                    defaultLang={defaultLang}
                    assets={WEBSITE_STDJSON.assets}
                />
            </div>
            {
                footer && <WebsiteFooter
                    websiteFooter={footer}
                    assets={WEBSITE_STDJSON.assets}
                    defaultLang={defaultLang}
                    selectedLang={selectedLangCode}
                    otherLangFooter={otherLangFooter}
                />
            }
            <ScrollToTop smooth component={<ArrowUpwardIcon style={{fontSize: 30}} />} />
        </React.Fragment>
    )
}

export default WebsiteViewer

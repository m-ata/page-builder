import React from 'react'
import { UseOrest } from '@webcms/orest'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import { Container, Paper } from '@material-ui/core'
import { useRouter } from 'next/router'
import InfoLayout from 'components/layout/containers/InfoLayout'
import * as global from '@webcms-globals'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { Alert, AlertTitle } from '@material-ui/lab'

const useStyles = makeStyles(() => ({
    '@global': {
        body: {
            backgroundColor: '#fff',
        },
    },
    container: {
        padding: 12,
    },
    iframe: {
        padding: 12,
        overflow: 'auto',
    },
}))

const InfoPage = (props) => {
    const classes = useStyles()
    const { fileData } = props
    const router = useRouter()
    const iframe = router.query.iframe === 'true'
    const { t } = useTranslation()

    const handleAnchorClick = (e) => {
        const targetLink = e.target.closest('a')
        if (targetLink && targetLink.href) {
            const url = targetLink.href
            window.location.hash = url.substring(url.indexOf('#') + 1)
        } else {
            return
        }

        if (!targetLink) return
        e.preventDefault()
    }

    if (!fileData) {
        return (
            <Alert severity="warning" variant="outlined">
                {t('str_fileDoesntExist')}
            </Alert>
        )
    }

    if (iframe) {
        return (
            <React.Fragment>
                <div
                    className={classes.iframe}
                    onClick={handleAnchorClick}
                    onKeyPress={handleAnchorClick}
                    dangerouslySetInnerHTML={{__html: fileData && Buffer.from(fileData, 'base64').toString('utf-8')}}
                />
            </React.Fragment>
        )
    }

    return (
        <InfoLayout>
            <Container maxWidth={'lg'} className={classes.container}>
                <Paper>
                    <div
                        className={classes.iframe}
                        onClick={handleAnchorClick}
                        onKeyPress={handleAnchorClick}
                        dangerouslySetInnerHTML={{
                            __html: fileData && Buffer.from(fileData,'base64').toString('utf-8'),
                        }}
                    />
                </Paper>
            </Container>
        </InfoLayout>
    )
}

export const getServerSideProps = async (ctx) => {
    const { res, query } = ctx
    let newQuery = new URLSearchParams()
        , strShortLangCode = query.page[0] || global.base.isFalse
        , strRafileCode = query.page[1] || global.base.isFalse
        , strRafileMasterId = query.page[2] || global.base.isFalse
        , strHotelrefno = query.page[3] || res.GENERAL_SETTINGS.HOTELREFNO

    if (!global.helper.isFalse(strRafileCode)) {
        newQuery.append('code', strRafileCode.toUpperCase())
    }

    if (!global.helper.isFalse(strShortLangCode)) {
        newQuery.append('langcode', strShortLangCode)
    }

    if (!global.helper.isFalse(strRafileMasterId)) {
        newQuery.append('masterid', strRafileMasterId)
    }else{
        newQuery.append('masterid', res.GENERAL_SETTINGS.HOTELMID)
    }

    newQuery.append('ignlang', true)
    newQuery.append('hotelrefno', strHotelrefno)

    const getFileData = (contentype = null) => {
        delete newQuery.contentype
        newQuery.append('contentype', contentype)
        return UseOrest({
            apiUrl: res.GENERAL_SETTINGS.OREST_URL,
            endpoint: 'tools/file/find',
            headers: {
                ReqType: 'Company',
                'Content-Type': 'application/json',
            },
            token: res.OREST_CACHE_TOKEN,
            params: newQuery,
        }).then((rafileResponse) => {
            if (rafileResponse?.data?.data?.filedata) {
                const data = rafileResponse.data.data
                return {
                    props: { fileData: data && data.filedata || null, title: data && data.caption || null }
                }
            } else {
                delete newQuery.hotelrefno
                return UseOrest({
                    apiUrl: res.GENERAL_SETTINGS.OREST_URL,
                    endpoint: 'tools/file/find',
                    headers: {
                        ReqType: 'Company',
                        'Content-Type': 'application/json',
                    },
                    token: res.OREST_CACHE_TOKEN,
                    params: newQuery,
                }).then((rafileResponse) => {
                    if (rafileResponse?.data?.data?.filedata) {
                        const data = rafileResponse.data.data
                        return {
                            props: { fileData: data && data.filedata || null, title: data && data.caption || null }
                        }
                    } else {
                        return {
                            props: { fileData: null }
                        }
                    }
                })
            }
        })
    }

    let getFileDataForContentType = await getFileData('0000505') // TEXT
    if(getFileDataForContentType?.props?.fileData === null){
        getFileDataForContentType = await getFileData('0000530') // HTML
    }

    return getFileDataForContentType
}

InfoPage.propTypes = {
    fileData: PropTypes.string.isRequired,
    title: PropTypes.string,
}

export default InfoPage

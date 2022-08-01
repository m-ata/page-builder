import React from 'react'
import Header from 'components/o-livechat/client/layout/components/Header'
import Stem from 'components/o-livechat/client/layout/components/Stem'
import Footer from 'components/o-livechat/client/layout/components/Footer'
import * as constraints from 'components/o-livechat/constants'
import {makeStyles} from '@material-ui/core/styles'
import { Box, Typography } from '@material-ui/core'
import LoadingSpinner from 'components/LoadingSpinner'
import useTranslation from 'lib/translations/hooks/useTranslation'

const useStyles = makeStyles(() => ({
    root: {
        position: 'fixed',
        bottom: 0,
        right: 0,
        margin: 24,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        boxSizing: 'border-box',
        textRendering: 'optimizeLegibility',
        fontKerning: 'auto',
        '-webkit-font-smoothing': 'antialiased',
        '-moz-osx-font-smoothing': 'grayscale',
        '-webkit-text-size-adjust': '100%',
        zIndex: 9,
    }, layout: {
        background: constraints.COLORS['whiteColor'],
        width: constraints.WIDGET_WIDTH,
        '-webkit-border-radius': 5,
        '-moz-border-radius': 5,
        borderRadius: 5,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.07),0 2px 4px rgba(0, 0, 0, 0.07), 0 4px 8px rgba(0, 0, 0, 0.07), 0 8px 16px rgba(0, 0, 0, 0.07), 0 16px 32px rgba(0, 0, 0, 0.07), 0 32px 64px rgba(0, 0, 0, 0.07)',
    },
}))

const Layout = ({ profile, stemContent, footerContent, isLoading }) => {
    const classes = useStyles()
    const { t } = useTranslation()

    return (
        <section className={classes.root}>
            <div className={classes.layout}>
                <Header>
                    {profile}
                </Header>
                {(!isLoading) ?
                    (
                        <React.Fragment>
                            <Box p={6}>
                                <LoadingSpinner size={30} style={{ height: '100%', color: '#6d6d6d' }}/>
                                <Typography variant="overline" display="block" color="textSecondary" align="center" gutterBottom>
                                    {t('str_pleaseWait')}
                                </Typography>
                            </Box>
                        </React.Fragment>
                    ) :
                    (
                        <React.Fragment>
                            <Stem>
                                {stemContent}
                            </Stem>
                            <Footer>
                                {footerContent}
                            </Footer>
                        </React.Fragment>
                    )}
            </div>
        </section>
    )
}

export default Layout
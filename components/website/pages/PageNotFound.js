import React from "react"
import useTranslation from "lib/translations/hooks/useTranslation"

const PageNotFound = () => {
    const { t } = useTranslation()

    return (
        <section style={{height: '50vh', padding: '90px 0', background: '#fff', fontFamily: 'serif'}}>
            <div>
                <div>
                    <div>
                        <div style={{textAlign: 'center'}}>
                            <div>
                                <h1 style={{fontSize: '80px'}}>404</h1>
                            </div>
                            <div style={{marginTop: '-10px'}}>
                                <h3 className="h2">
                                    {t('str_pageNotFound')}
                                </h3>
                                <p>{t('str_thisPageDoesNotExistYouCanReturnToTheHomePage')}</p>
                                <a href="/" style={{padding: '10px 20px', background: '#39ac31', margin: '20px 0', display: 'inline-block', color: '#ffffff', cursor: 'pointer'}}>{t('str_goToHome')}</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default PageNotFound;
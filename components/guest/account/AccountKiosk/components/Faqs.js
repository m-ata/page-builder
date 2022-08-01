import React from 'react'
import Container from '@material-ui/core/Container'
import Faq from 'components/guest/public/components/faq'
import FaqCommon from "components/guest/public/components/FaqCommon"

const Faqs = () => {
    return (
        <Container fixed>
            <Faq>
                <FaqCommon />
            </Faq>
        </Container>
    )
}

export default Faqs
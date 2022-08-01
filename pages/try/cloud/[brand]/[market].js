import React from 'react'
import { useRouter } from 'next/router'
import TryForFree from 'components/try-for-free'
import { getBrand } from 'components/try-for-free/style/theme'

const TryForFreePage = () => {
    const router = useRouter()
    const brand = router.query.brand
    const market = router.query.market
    return <TryForFree brand={getBrand(brand)} market={market}/>
}

export default TryForFreePage
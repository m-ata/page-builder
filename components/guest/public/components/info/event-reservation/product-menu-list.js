import React, {useContext, useState, useRef, useEffect} from 'react'
import { connect } from 'react-redux'
import { setToState, updateState } from 'state/actions'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import MenuProductCard from './menu-product-card'
import MenuCard from './menu-card'
import BackIcon from '@material-ui/icons/KeyboardBackspace';
import Divider from '@material-ui/core/Divider'
import useTranslation from 'lib/translations/hooks/useTranslation'
import WebCmsGlobal from 'components/webcms-global'

const ProductMenuList = (props) => {
    const { menuGroupAndProductList, isAddActive, isOnlyProduct, getSelectedGroupOrItem, isSpaRes, sPGroupName, setSPGroupName, resEventDef } = props
    const [selectedProduct, setSelectedProduct] = useState(null)
    const { t } = useTranslation()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const isPortal = GENERAL_SETTINGS.ISPORTAL;

    return (
        <React.Fragment>
            {
                isPortal ? (
                    <div>
                        <Grid container spacing={2}>
                            <Box
                                component={Grid}
                                xs={12}
                                sm={12}
                                md={sPGroupName ? 5 : 12}
                                display={{xs: (sPGroupName ? 'none' : 'block'), sm: 'block' }}
                            >
                                <Grid container spacing={2}>
                                    {
                                        isOnlyProduct ? (
                                            menuGroupAndProductList.map((item, index) => {
                                                return (
                                                    <MenuCard
                                                        key={index}
                                                        selectGroupName={item?.title}
                                                        description={item?.title}
                                                        onClick={(e) => {
                                                            setSPGroupName(e)
                                                            setSelectedProduct(item)}
                                                        }
                                                        imageUrl={item.imageurl}
                                                    />
                                                )
                                            })
                                        ) : (
                                            Object.keys(menuGroupAndProductList).map((groupName, index) => {
                                                return <MenuCard key={index} selectGroupName={sPGroupName} description={groupName} onClick={(e) => setSPGroupName(e)} imageUrl={GENERAL_SETTINGS.STATIC_URL + menuGroupAndProductList[groupName][0].spgroupimageurl} />
                                            })
                                        )
                                    }
                                </Grid>
                            </Box>
                           <Grid item xs={12} sm={12} md={sPGroupName ? 7 : false}>
                               {sPGroupName && menuGroupAndProductList[sPGroupName].length > 0 && (
                                   <Grid container>
                                       <Box
                                           item
                                           xs={1}
                                           style={{width: "0", maxWidth: "0", paddingRight: "16px"}}
                                           display={{xs: 'none', sm: 'block'}}
                                       >
                                           <Divider orientation={"vertical"}/>
                                       </Box>
                                       <Grid item xs={12} sm={11}>
                                           <div style={{ display: sPGroupName ? 'block' : 'none' }}>
                                               <div style={{textAlign: "right"}}>
                                                   <IconButton onClick={()=> setSPGroupName(null)}>
                                                       <BackIcon />
                                                   </IconButton>
                                               </div>
                                               <Grid container style={{maxHeight:"50vh", overflowY: "auto"}}>
                                                   {menuGroupAndProductList[sPGroupName].map((pList, pIndex) => (
                                                       <Grid item xs={12}  key={pIndex}>
                                                           <MenuProductCard isAddActive={isAddActive} productItem={pList} resEventDef={resEventDef} />
                                                       </Grid>
                                                   ))}
                                               </Grid>
                                           </div>
                                       </Grid>
                                   </Grid>
                                  )
                               }
                           </Grid>
                        </Grid>
                    </div>
                ) : (
                    <React.Fragment>
                        <div
                            style={{ display: sPGroupName === null ? 'block' : 'none'}}
                        >
                            <Grid container>
                                <Grid item xs={12}>
                                    <Grid container spacing={2}>
                                        {
                                            isOnlyProduct ? (
                                                menuGroupAndProductList && menuGroupAndProductList.map((item, index) => {
                                                    return (
                                                        <MenuCard
                                                            key={index}
                                                            selectGroupName={item?.title}
                                                            description={item?.description}
                                                            onClick={(e) => {
                                                                setSPGroupName(e)
                                                                setSelectedProduct(item)
                                                               if(typeof getSelectedGroupOrItem === 'function') getSelectedGroupOrItem(e)
                                                            }}
                                                            imageUrl={item.imageurl}
                                                            isOnlyProduct={isOnlyProduct}
                                                        />
                                                    )
                                                })
                                            ) : (
                                                Object.keys(menuGroupAndProductList).map((groupName, index) => {
                                                    return <MenuCard key={index} selectGroupName={sPGroupName} description={groupName} onClick={(e) => setSPGroupName(e)} imageUrl={GENERAL_SETTINGS.STATIC_URL + menuGroupAndProductList[groupName][0].spgroupimageurl} />
                                                })
                                            )
                                        }
                                    </Grid>
                                </Grid>
                            </Grid>
                        </div>
                        {(isOnlyProduct || (sPGroupName && menuGroupAndProductList[sPGroupName].length > 0)) && (
                            <div style={{ display: sPGroupName ? 'block' : 'none'}}>
                                <Grid container spacing={2}>
                                    {
                                        isOnlyProduct ? (
                                            <Grid item xs={12} key={sPGroupName}>
                                                {sPGroupName && selectedProduct && <MenuProductCard isAddActive={isAddActive} productItem={selectedProduct} isOnlyProduct={isOnlyProduct} resEventDef={resEventDef}/>}
                                            </Grid>
                                        ) : (
                                            menuGroupAndProductList[sPGroupName].map((pList, pIndex) => (
                                                <Grid item xs={12} key={pIndex}>
                                                    <MenuProductCard isAddActive={isAddActive} productItem={pList} isOnlyProduct={isSpaRes} resEventDef={resEventDef}/>
                                                </Grid>
                                            ))
                                        )
                                    }
                                </Grid>
                            </div>)
                        }
                    </React.Fragment>
                )
            }
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ProductMenuList)

import * as global from '@webcms-globals'
import Snippets from './Snippets'
import { useTotalPrice, getCurrencyCodeToIso, getLowPrices, isAnyRoomAvailability } from 'lib/helpers/useFunction'

const TagManager = {
    dataScript: function (dataLayer) {
        const script = document.createElement('script')
        script.innerHTML = dataLayer
        return script
    },
    gtm: function (args) {
        const snippets = Snippets.tags(args)
        const noScript = () => {
            const noscript = document.createElement('noscript')
            noscript.innerHTML = snippets.iframe
            return noscript
        }
        const script = () => {
            const script = document.createElement('script')
            script.innerHTML = snippets.script
            return script
        }
        const dataScript = this.dataScript(snippets.dataLayerVar)
        return {
            noScript,
            script,
            dataScript
        }
    },
    initialize: function ({ gtmId, events = {}, dataLayer, dataLayerName = 'dataLayer', auth = '', preview = '' }) {
        const gtm = this.gtm({
            id: gtmId,
            events: events,
            dataLayer: dataLayer || undefined,
            dataLayerName: dataLayerName,
            auth,
            preview
        })
        if (dataLayer) document.head.appendChild(gtm.dataScript)
        document.head.insertBefore(gtm.script(), document.head.childNodes[0])
        document.body.insertBefore(gtm.noScript(), document.body.childNodes[0])
    },
    dataLayer: function ({dataLayer, dataLayerName = 'dataLayer'}) {
        if (window[dataLayerName]) return window[dataLayerName].push(dataLayer)
        const snippets = Snippets.dataLayer(dataLayer, dataLayerName)
            , dataScript = this.dataScript(snippets)
        document.head.insertBefore(dataScript, document.head.childNodes[0])
    },
    getActionFieldForPageView: function(pageStep) {
        switch (pageStep) {
            case 'Preview':
                return {
                    'eventCategory': 'Enhanced Ecommerce',
                    'ecommerce': {
                        'actionField': { 'step': 3, 'option': 'Preview' },
                    }
                }
            default:
                return {}
        }
    },
    resetPrevious: function(){
        TagManager.dataLayer({
            dataLayer: {
                'eventCategory': null,
                'ecommerce': null,
            },
        })
    },
    page: {
        setChange: function({ hotelName, hotelId, pageTitle = '', pagePath = '', pageStep = '', isGuest = false}) {
            TagManager.resetPrevious()
            TagManager.dataLayer({
                dataLayer: Object.assign({
                    'eventLabel': 'Page View',
                    'event': 'Pageview',
                    'eventAction': 'Page View',
                    'hotelName': hotelName,
                    'hotelId': hotelId,
                    'pagePath': pagePath,
                    'pageTitle': pageTitle,
                    'pageStep': pageStep,
                    'visitorType': isGuest ? 'guest' : 'visitor',
                }, TagManager.getActionFieldForPageView(pageStep)),
            })
        },
    },
    setThnAnalyticQueryAndResult: (hotelId, hotelName, ciDate, coDate, adult, child, childAges, currencyCode, langCode, promoCode, isLogin, impressionsData) => {
        const hotelInfo = {
            'hotelId': hotelId,
            'hotelName': hotelName,
            'languageCode': langCode,
            'currencyCode': getCurrencyCodeToIso(currencyCode),
            'user': {
                'loggedIn': isLogin,
            },
        }
            , searchInfo = {
            'checkIn': ciDate,
            'checkOut': coDate,
            'promoCode': '',
            'rooms': [
                {
                    'adults': adult,
                    'children': child || 0,
                    'childrenAges': child > 0 && childAges && childAges.map(childAge => Number(childAge.age)) || '',
                },
            ],
        }
        , lowPrices = getLowPrices(impressionsData, adult)

        TagManager.dataLayer({
            dataLayer: {
                'event': 'thnSearchQuery',
                'thn': {
                    ...hotelInfo,
                    'search': searchInfo,
                    'results': null
                }
            }
        })

        const isRoomAvailability = lowPrices > 0 && isAnyRoomAvailability(impressionsData);
        TagManager.dataLayer({
            dataLayer: {
                'event': 'thnSearchResults',
                'thn': {
                    ...hotelInfo,
                    'search': searchInfo,
                    'results': {
                        'availability': isRoomAvailability,
                        'lowestPriceWithoutTaxes': lowPrices,
                        'lowestPriceWithTaxes': getLowPrices(impressionsData, adult),
                        'rooms': isRoomAvailability ? impressionsData.map((impression) => {
                            return {
                                'id': impression.id,
                                'name': impression.shorttext,
                                'people': impression.totalpax + impression.totalchd,
                                'rates': impression.priceList.map((priceListItem) => {
                                    const getTotalPrice = useTotalPrice(priceListItem.prices, adult)
                                        , totalPrice = getTotalPrice.discTotalPrice || getTotalPrice.totalPrice || 0
                                    return {
                                        name: priceListItem.description,
                                        priceWithoutTaxes: totalPrice,
                                        priceWithTaxes: totalPrice,
                                    }
                                })
                            }
                        }): null,
                    }
                }
            }
        })
    },
    setThnAnalyticConfirm: (hotelId, hotelName, masterReservNo, revenue, coupon, isLogin, langCode, currencyCode, purchaseData) => {
        const hotelInfo = {
            'hotelId': hotelId,
            'hotelName': hotelName,
            'languageCode': langCode,
            'currencyCode': getCurrencyCodeToIso(currencyCode),
            'user': {
                'loggedIn': isLogin,
            },
        }

        TagManager.dataLayer({
            dataLayer: {
                'event': 'thnBookingConfirmation',
                'thn': {
                    ...hotelInfo,
                    'booking': {
                        'id': masterReservNo,
                        'totalCost': revenue,
                        'checkIn': purchaseData[0].checkin,
                        'checkOut': purchaseData[0].checkout,
                        'promoCode': coupon || '',
                        'promoCodeType': 'generic',
                        'rooms': purchaseData.map((purchase) => {
                            return {
                                'adults': purchase.totalpax,
                                'children': purchase.totalchd || 0,
                                'childrenAges': purchase.totalchd > 0 && purchase.childages && purchase.childages.map(childAge => Number(childAge.age)) || '',
                            }
                        })
                    },
                }
            }
        })
    },
    booking: {
        setRoomList: function({ eventLabel = '', hotelName, hotelId, ciDate, coDate, adult, child, childAges, currencyCode = '', langCode, promoCode, isLogin, impressionsData = [] }) {
            TagManager.resetPrevious()
            TagManager.setThnAnalyticQueryAndResult(hotelId, hotelName, ciDate, coDate, adult, child, childAges, currencyCode, langCode, promoCode, isLogin, impressionsData)
            TagManager.dataLayer({
                dataLayer: {
                    'eventLabel': eventLabel,
                    'eventCategory': 'Enhanced Ecommerce',
                    'eventAction': 'Product Impression',
                    'event': 'productImpression',
                    'hotelName': hotelName,
                    'hotelId': hotelId,
                    'ecommerce': {
                        'ciDate': ciDate,
                        'coDate': coDate,
                        'adult': adult,
                        'child': child,
                        'currencyCode': getCurrencyCodeToIso(currencyCode),
                        'actionField': { 'step': 1, 'option': 'Product Impression' },
                        'impressions': impressionsData.map((impression, position) => {
                            const totalPrice = useTotalPrice(impression.priceList, adult).discTotalPrice || useTotalPrice(impression.priceList, adult).totalPrice || 0
                            return {
                                'name': impression.description,
                                'id': impression.id,
                                'price': global.helper.formatPrice(totalPrice),
                                'quantity': impression.totalroom,
                                'category': 'Room',
                                'list': 'Search Results',
                                'position': impression.orderno || position
                            }
                        })
                    },
                },
            })
        },
        setAddRoom: function({ eventLabel = '', hotelName, hotelId, ciDate, coDate, adult, child, currencyCode = '', addToCartData = [] }){
            TagManager.resetPrevious()
            TagManager.dataLayer({
                dataLayer: {
                    'eventLabel': eventLabel,
                    'eventCategory': 'Enhanced Ecommerce',
                    'eventAction': 'Add to Cart',
                    'event': 'addToCart',
                    'hotelName': hotelName,
                    'hotelId': hotelId,
                    'ecommerce': {
                        'ciDate': ciDate,
                        'coDate': coDate,
                        'adult': adult,
                        'child': child,
                        'currencyCode': getCurrencyCodeToIso(currencyCode),
                        'actionField': { 'step': 2, 'option': 'Add to Cart' },
                        'add': {
                            'products': addToCartData
                        }
                    },
                },
            })
        },
        setRemoveRoom: function({ eventLabel = '', hotelName, hotelId, ciDate, coDate, adult, child, currencyCode = '', removeToCartData = [] }){
            TagManager.resetPrevious()
            TagManager.dataLayer({
                dataLayer: {
                    'eventLabel': eventLabel,
                    'eventCategory': 'Enhanced Ecommerce',
                    'eventAction': 'Remove to Cart',
                    'event': 'removeFromCart',
                    'hotelName': hotelName,
                    'hotelId': hotelId,
                    'ecommerce': {
                        'ciDate': ciDate,
                        'coDate': coDate,
                        'adult': adult,
                        'child': child,
                        'currencyCode': getCurrencyCodeToIso(currencyCode),
                        'remove': {
                            'products': removeToCartData
                        }
                    },
                },
            })
        },
        setCheckoutRoom: function({ eventLabel = '', hotelName, hotelId, payOption, checkoutData = [] }){
            TagManager.resetPrevious()
            TagManager.dataLayer({
                dataLayer: {
                    'eventLabel': eventLabel,
                    'eventCategory': 'Enhanced Ecommerce',
                    'eventAction': 'Checkout',
                    'event': 'checkout',
                    'hotelName': hotelName,
                    'hotelId': hotelId,
                    'ecommerce': {
                        'checkout': {
                            'actionField': { 'payOption': payOption || '' },
                            'products': checkoutData.map((checkout) => {
                                return {
                                    'reservNo': checkout.reservno,
                                    'id': checkout.roomtypeid,
                                    'name': checkout.roomtypename,
                                    'price': global.helper.formatPrice(checkout.totalprice),
                                    'qty': 1,
                                    'category': 'Room'
                                }
                            })
                        }
                    }
                },
            })
        },
        setPurchaseRoom: function({ eventLabel = '', hotelName = '', hotelId = '', masterReservNo = '', revenue = '', coupon = '', isLogin, langCode, currencyCode = '', purchaseData = [] }){
            TagManager.resetPrevious()
            TagManager.setThnAnalyticConfirm(hotelId, hotelName, masterReservNo, revenue, coupon, isLogin, langCode, currencyCode, purchaseData)
            TagManager.dataLayer({
                dataLayer: {
                    'eventLabel': eventLabel,
                    'eventCategory': 'Enhanced Ecommerce',
                    'eventAction': 'Purchase',
                    'event': 'purchase',
                    'hotelName': hotelName,
                    'hotelId': hotelId,
                    'ecommerce': {
                        'purchase': {
                            'actionField':  {
                                'id': masterReservNo,
                                'affiliation': 'Online Booking',
                                'revenue': revenue,
                                'coupon': coupon,
                                'step': 4,
                                'option': 'Purchase'
                            },
                            'products': purchaseData.map((purchase) => {
                                return {
                                    'reservNo': purchase.reservno,
                                    'id': purchase.roomtypeid,
                                    'name': purchase.roomtypename,
                                    'price': global.helper.formatPrice(purchase.totalprice),
                                    'qty': 1,
                                    'category': 'Room'
                                }
                            })
                        }
                    }
                },
            })
        },
    }
}

module.exports = TagManager
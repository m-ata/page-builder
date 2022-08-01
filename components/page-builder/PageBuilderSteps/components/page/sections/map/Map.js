import React, { memo, useContext, useEffect, useRef, useState } from 'react'
import WebCmsGlobal from "../../../../../../webcms-global";
import {
    GoogleMap,
    withScriptjs,
    withGoogleMap,
    Marker
} from "react-google-maps";
import InfoBox from "react-google-maps/lib/components/addons/InfoBox";

const Map = (props) => {

    const {handleCmponent, langCode, defaultCode} = props;
    const [center, setCenter] = useState({lat: 54.68916, lng: 25.2798});
    const [infoBoxOpen, setInfoBoxOpen] = useState(false)
    const refMap = useRef(null);

    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal);

    useEffect(() => {
        GENERAL_SETTINGS && GENERAL_SETTINGS.hotelLocation && setCenter(GENERAL_SETTINGS.hotelLocation)
    }, [GENERAL_SETTINGS]);

    useEffect(() => {
        if (handleCmponent && langCode && defaultCode) {
            if (langCode !== defaultCode) {
                handleCmponent({
                    map: true
                });
            }
        }
    }, []);

    return (
        <GoogleMap
            ref={refMap}
            zoom={5}
            center={center}
            options={{
                streetViewControl:false,
                gestureHandling: "greedy",
                zoomControl: false,
            }}
        >
            <Marker
                position={center}
                clickable={true}
                onClick={() => setInfoBoxOpen(!infoBoxOpen)}
            >
                {
                    infoBoxOpen && <InfoBox
                        onCloseClick={() => setInfoBoxOpen(false)}
                        options={{ closeBoxURL: ``, enableEventPropagation: true }}
                    >
                        <div style={{ backgroundColor: `silver`, opacity: 0.75, padding: `12px` }}>
                            <div style={{ fontSize: `10px`, fontColor: `#08233B` }}>
                                {`Longitude ${center.lng}, Latitude ${center.lat})`}
                            </div>
                        </div>
                    </InfoBox>
                }
            </Marker>
        </GoogleMap>
    );
}

const memorizedMap = memo(withScriptjs(withGoogleMap(Map)))

export default memorizedMap
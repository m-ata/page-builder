import React, { useState, useEffect, useContext } from 'react';
//material ui imports
import Grid from '@material-ui/core/Grid';
import FormControl from "@material-ui/core/FormControl";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
//service constants
import WebCmsGlobal from "components/webcms-global";
import { ViewList } from '@webcms/orest';
import { useRouter } from "next/router";
//custom constants
import { OREST_ENDPOINT } from "../../../../../../../model/orest/constants";
import SliderOnlyPreview from './Slider';

const EditSliderOnly = (props) => {

    const { handleComponent, sliderOnlyCmp, defaultCode, langCode } = props;
    //local states
    const [sliderLoc, setSliderLoc] = useState('');
    const [eventLocations, setEventLocations] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('');

    const router = useRouter();
    const companyId = router.query.companyID;
    const { GENERAL_SETTINGS, token } = useContext(WebCmsGlobal);
    const authToken = token || router.query.authToken;

    useEffect(() => {
        //fetch event locations
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.EVENTLOC,
            token: authToken,
            params: {
                hotelrefno: Number(companyId)
            }
        }).then(res1 => {
            if (res1.status === 200 && res1.data && res1.data.data && res1.data.data.length > 0) {
                setEventLocations(res1.data.data);
            }
        })
        //fetch room types
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.ROOMTYPE,
            token: authToken,
            params: {
                hotelrefno: Number(companyId)
            }
        }).then(res1 => {
            if (res1.status === 200 && res1.data && res1.data.data && res1.data.data.length > 0) {
                setRoomTypes(res1.data.data);
            }
        })
    }, []);

    useEffect(() => {
        if (sliderOnlyCmp) {
            setSliderLoc(sliderOnlyCmp.service);
            setSelectedLocation(sliderOnlyCmp.masterid);
        }
    }, [sliderOnlyCmp]);

    useEffect(() => {
        if (sliderOnlyCmp) {
            if (defaultCode !== langCode) {
                handleComponent({
                    sliderOnly: true
                })
            } else {
                handleComponent({
                    service: sliderLoc,
                    type: sliderOnlyCmp.type,
                    masterid: selectedLocation,
                    width: sliderOnlyCmp.width,
                    id: sliderOnlyCmp.id
                })
            }
        }
    }, [selectedLocation, sliderLoc]);

    return (
        <React.Fragment>
            <Grid container>
                <Grid item xs={6}>
                    <FormControl component="fieldset">
                        <RadioGroup
                            aria-label="component"
                            name="component"
                            row
                            value={sliderLoc}
                            onChange={(e) => {
                                setSliderLoc(e.target.value);
                                if (e.target.value === 'eventloc') {
                                    setSelectedLocation(eventLocations[0].mid);
                                } else {
                                    setSelectedLocation(roomTypes[0].mid);
                                }
                            }}
                        >
                            <FormControlLabel
                                value="eventloc"
                                control={<Radio color={'primary'} />}
                                label="Event Location"
                            />
                            <FormControlLabel
                                value="roomtype"
                                control={<Radio color={'primary'} />}
                                label="Room Types"
                            />
                        </RadioGroup>
                    </FormControl>
                </Grid>
                <Grid item xs={6}>
                    <FormControl
                        variant="outlined"
                        style={{ minWidth: 200, float: 'right' }}
                    >
                        <Select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                        >
                            {
                                sliderLoc === 'eventloc' ?
                                    eventLocations.length > 0 && eventLocations.map((eventLoc, index) => {
                                        return (
                                            <MenuItem value={eventLoc.mid} key={index}>
                                                {' '}
                                                {eventLoc.description}{' '}
                                            </MenuItem>
                                        )
                                    }) : roomTypes.length > 0 && roomTypes.map((roomType, index) => {
                                        return (
                                            <MenuItem value={roomType.mid} key={index}>
                                                {' '}
                                                {roomType.description}{' '}
                                            </MenuItem>
                                        )
                                    })
                            }
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
            <Grid container style={{padding: 16}}>
                <Grid item xs={12}>
                    <SliderOnlyPreview masterid={selectedLocation} />
                </Grid>
            </Grid>
        </React.Fragment>
    )
}

export default EditSliderOnly;
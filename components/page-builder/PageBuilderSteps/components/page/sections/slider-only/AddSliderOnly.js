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

const AddSliderOnly = (props) => {

    const { handleSectionComponent, handleNextDisable, component } = props
    //local states
    const [sliderLoc, setSliderLoc] = useState('eventloc');
    const [eventLocations, setEventLocations] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('');

    const router = useRouter();
    const companyId = router.query.companyID;
    const { GENERAL_SETTINGS, token } = useContext(WebCmsGlobal);
    const authToken = token || router.query.authToken;

    useEffect(() => {
        if (component?.service && component?.masterid) {
            setSliderLoc(component?.service);
            setSelectedLocation(component?.masterid);
        }
    }, [component]);

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
                !component?.masterid && setSelectedLocation(res1.data.data[0].mid);
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
        if (selectedLocation) {
            handleSectionComponent({
                service: sliderLoc,
                type: "sliderOnly",
                masterid: selectedLocation
            });
            handleNextDisable(false);
        } else
            handleNextDisable(true);
    }, [selectedLocation]);

    const handleDisable = (isDisable) => {
        handleNextDisable(isDisable);
    }

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
                                    eventLocations.length > 0 && setSelectedLocation(eventLocations[0].mid);
                                } else {
                                    roomTypes.length > 0 && setSelectedLocation(roomTypes[0].mid);
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
                    <SliderOnlyPreview masterid={selectedLocation} handleDisable={handleDisable} />
                </Grid>
            </Grid>
        </React.Fragment>
    )
}

export default AddSliderOnly;
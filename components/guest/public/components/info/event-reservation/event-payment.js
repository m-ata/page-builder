import React, { useState } from "react";
import { makeStyles } from '@material-ui/core/styles'
import {
    IconButton,
    Typography,
    Card,
    CardMedia,
    CardContent,
    Button,
    Grid,
    Divider
} from '@material-ui/core'
import PaymentInformation from "../../../../../booking/components/PaymentInformation";

function EventPayment(props) {

    const { showSummary, isPortal, activeTabColor, companyTitle, date, time, adult, child, isHaveProductList, selectedProductList, eventLocData } = props;

    const [creditCardInfo, setCreditCardInfo] = useState(null)

    return(
        <React.Fragment>
            <Grid container>
                <Grid item xs={12}>
                    <PaymentInformation
                        onChange={(e)=> setCreditCardInfo(e)}
                        isPortal={isPortal}
                        activeTabColor={activeTabColor}
                        showSummary={showSummary}
                        companyTitle={companyTitle}
                        date={date}
                        time={time}
                        adult={adult}
                        child={child}
                        isHaveProductList
                        selectedProductList={selectedProductList}
                        eventLocData={eventLocData}
                    />
                </Grid>
            </Grid>
        </React.Fragment>
    )
}

export default EventPayment;
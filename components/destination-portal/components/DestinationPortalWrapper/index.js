import React from 'react';
import { connect } from 'react-redux'
import { setToState } from "../../../../state/actions";
import Header from "../../../layout/Header";
import GoUpButton from "../../../../@webcms-ui/core/go-up-button";
import BaseLoader from "../../../common/base-loader";



function DestinationPortalWrapper (props) {
    const { children } = props;

    return(
        <React.Fragment>
            <BaseLoader>
                <Header langSelect={true} loginButton={true} isLoginWrapper isShowFullName/>
                <main>
                    {children}
                    <GoUpButton
                        right={8}
                        bottom={24}
                        buttonVariant={"contained"}
                        buttonPadding={"8px"}
                    />
                </main>
            </BaseLoader>
        </React.Fragment>

    );
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.destinationPortal,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(DestinationPortalWrapper)
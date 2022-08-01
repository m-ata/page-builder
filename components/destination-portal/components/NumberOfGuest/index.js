import React, { useState, useContext } from 'react';
import {connect} from 'react-redux'
import {
    Typography,
    TextField,
    Grid,
    Menu,
    List,
    MenuItem,
    ListItem,
    Divider
} from '@material-ui/core'
import PopupState, {
    bindTrigger,
    bindMenu,
} from 'material-ui-popup-state';
import SpinEdit from "../../../../@webcms-ui/core/spin-edit";
import useTranslation from "../../../../lib/translations/hooks/useTranslation";
import {deleteFromState, pushToState, setToState, updateState} from "../../../../state/actions";



function NumberOfGuest(props) {

    const { adult, setAdult, maxAdult, child, setChild, maxChild, maxChildAge, isRestaurantRes, setToState, textFieldStyle } = props
    const { t } = useTranslation();

    const handleChangeAdultCount = (value) => {
        setAdult(value);
        if(isRestaurantRes) {
            setToState('guest', ['totalPax'], value)
        }
    }

    const handleChild = (value) => {
        let array = [...child];
        if(value > array.length) {
            array.push({
                childAge: 1
            })
            setChild(array);
        } else {
            if(array.length > 0) {
                array.splice(value, 1);
                setChild(array);
            }
        }

        if(isRestaurantRes) {
            setToState('guest', ['totalChd'], array.length)
        }
    }

    const handleChildAgeSelect = (event, index) => {
        const value = [...child];
        value[index] = {
            childAge: event.target.value
        }
        setChild(value);

    }

    return(
     <React.Fragment>
         <PopupState variant="popover" popupId="guest-info">
             {(popupState) => (
                 <React.Fragment>
                     <TextField
                         className={textFieldStyle ? textFieldStyle : ""}
                         value={
                             adult > 0 && child.length > 0 ?
                                 `${adult} ${t("str_adult")}, ${child.length} ${t("str_child")}` :
                                 adult > 0 && child.length <= 0 ?
                                     `${adult} ${t("str_adult")}` :
                                     ""
                         }
                         fullWidth
                         label={t("str_guest")}
                         placeholder={"Max 6 Adults Can Be Selected"}
                         variant={"outlined"}
                         InputLabelProps={{shrink: adult > 0 || child.length > 0 || !!popupState.isOpen}}
                         {...bindTrigger(popupState)}
                     />
                     <Menu
                         {...bindMenu(popupState)}
                         getContentAnchorEl={null}
                         anchorOrigin={{
                             vertical: "bottom",
                             horizontal: "left"
                         }}
                         transformOrigin={{
                             vertical: "top",
                             horizontal: "left"
                         }}
                     >
                      <List>
                          <ListItem>
                              <SpinEdit
                                  defaultValue={adult}
                                  padding={2}
                                  max={6}
                                  min={1}
                                  size="small"
                                  label={t('str_adult')}
                                  onChange={(value) => handleChangeAdultCount(value)}
                              />
                          </ListItem>
                          <Divider variant="middle" component="li"/>
                          <ListItem alignItems="flex-start">
                              <SpinEdit
                                  max={maxChild}
                                  defaultValue={child.length}
                                  padding={2}
                                  size="small"
                                  label={t('str_child')}
                                  onChange={(value) => handleChild(value)}
                              />
                          </ListItem>
                          <ListItem style={{paddingLeft: "32px", paddingRight:"32px"}}>
                              <Grid container spacing={2}>
                                  {
                                      child.map((item, index) => {
                                          return(
                                              <Grid item xs={12} sm={12} md={12} lg={6}>
                                                  <TextField
                                                      value={child[index].childAge}
                                                      key={`age-${index}`}
                                                      id={`child-${index}`}
                                                      name={`child-${index}`}
                                                      label={`${index + 1}. ${t('str_childAge')}`}
                                                      variant={"outlined"}
                                                      size="small"
                                                      fullWidth
                                                      onChange={(e) => handleChildAgeSelect(e, index)}
                                                      select
                                                  >
                                                      {Array.from({length: maxChildAge}).map((chd, i) => {
                                                          let age = i + 1;
                                                          return(
                                                              <MenuItem key={`age-${age}`} value={age}>{age}</MenuItem>
                                                          )
                                                      })}
                                                  </TextField>
                                              </Grid>
                                          )
                                      })
                                  }
                              </Grid>
                          </ListItem>
                      </List>
                     </Menu>
                 </React.Fragment>
             )}
         </PopupState>
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
    pushToState: (stateType, stateName, value) => dispatch(pushToState(stateType, stateName, value)),
    deleteFromState: (stateType, stateName, value) => dispatch(deleteFromState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(NumberOfGuest)
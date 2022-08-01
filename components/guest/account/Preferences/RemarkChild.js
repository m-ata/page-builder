import React from "react";
import RemarkCheckbox from "./RemarkCheckbox";
import RemarkRadio from "./RemarkRadio";
import FormGroup from '@material-ui/core/FormGroup'
import RadioGroup from '@material-ui/core/RadioGroup'

function RemarkChild(props) {

    const { remarkGroup, isClient, isHorizontal, isDisabled, remarks, radioGroupValue, setRadioGroupValue } = props
    return(
        <React.Fragment>
            {
                remarkGroup.multiselect ? (
                    <FormGroup row={isClient ? isClient : !!isHorizontal} style={{ marginLeft: 16 }}>
                        {remarks.map((remark, index) => {
                            return <RemarkCheckbox key={index} remark={remark} isDisabled={isDisabled} />
                        })}
                    </FormGroup>
                ) : (
                    <RadioGroup row={isClient ? isClient : !!isHorizontal} value={radioGroupValue} style={{ marginLeft: 16 }}>
                        {remarks.map((remark, index) => {
                            return (
                                <RemarkRadio key={index} remark={remark} isDisabled={isDisabled} setRadioGroupValue={setRadioGroupValue} />
                            )
                        })}
                    </RadioGroup>
                )
            }
        </React.Fragment>
    )
}

export default RemarkChild;
import React, { useState, useEffect, useContext } from 'react'
//material imports
import {Checkbox, Container, FormControlLabel} from '@material-ui/core'
import dynamic from 'next/dynamic'
import { connect } from 'react-redux'
import {Delete, ViewList} from '@webcms/orest'
import {isErrorMsg, OREST_ENDPOINT} from '../../../../../../../model/orest/constants'
import { useRouter } from 'next/router'
import WebCmsGlobal from '../../../../../../webcms-global'
import { updateState } from '../../../../../../../state/actions'
import Typography from "@material-ui/core/Typography";
import {froalaConfig} from "../../../../constants";
import {toast} from "react-toastify";
//dynamic imports for froala editors
const FroalaEditor = dynamic(
    async () => {
        const values = await Promise.all([
            import('react-froala-wysiwyg'),
            import('froala-editor/js/plugins.pkgd.min'),
            import('froala-editor/js/froala_editor.min'),
            import('froala-editor/js/froala_editor.pkgd.min'),
        ])
        return values[0]
    },
    {
        loading: () => <p>LOADING!!!</p>,
        ssr: false,
    }
);

const AddParagraph = (props) => {

    const { component, handleSectionComponent, handleNextDisable, state, updateState } = props
    const [model, setModel] = component?.type === 'paragraph' ? useState(component?.service) : useState('');
    const [useBgColor, setUseBgColor] = useState(false);

    const router = useRouter()
    const companyId = router.query.companyID
    const { GENERAL_SETTINGS, token } = useContext(WebCmsGlobal);
    const authToken = token || router.query.authToken;

    const config = froalaConfig;

    useEffect(() => {
        if (Object.keys(state.hcmCategory).length > 0) {
            Delete({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMIMG,
                token: authToken,
                gid: state.hcmCategory.gid,
                params: {
                    hotelrefno: Number(companyId),
                },
            }).then((res) => {
                if (res.status === 200) {
                    updateState('pageBuilder', 'hcmCategory', {})
                }
            })
        }
    }, [])

    useEffect(() => {
        if (component?.gid) {
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMTXTPAR,
                token: authToken,
                params: {
                    query: `gid:${component.gid}`,
                    hotelrefno: Number(companyId)
                }
            }).then(res => {
                if (res.status === 200 && res?.data?.data?.length > 0) {
                    setModel(res.data.data[0].itemtext);
                } else {
                    const retErr = isErrorMsg(res);
                    toast.error(retErr.errorMsg, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                }
            });
        }
    }, [component]);

    useEffect(() => {
        if (model) {
            handleNextDisable(false)
        } else {
            handleNextDisable(true)
        }
        handleSectionComponent({
            service: model,
            type: 'paragraph',
            useBgColor: useBgColor
        })
    }, [model, useBgColor])

    const handleModelChange = (model) => {
        setModel(model)
    }

    return (
        <Container>
            <Typography component={'div'}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={useBgColor}
                            onChange={() => setUseBgColor(!useBgColor)}
                            name="background-color"
                            color="primary"
                            style={{float: 'right'}}
                        />
                    }
                    label="Background Color"
                />
            </Typography>
            <FroalaEditor tag="textarea" config={config} model={model} onModelChange={handleModelChange} />
        </Container>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.pageBuilder,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(AddParagraph)

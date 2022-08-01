import React, {useState, useEffect} from 'react';
import {FormControl, TextField} from "@material-ui/core";
import { connect } from 'react-redux';
const AddCategory = (props) => {

    const { state, onAddCategory } = props;
    const [catName, setCatName] = useState('');

    useEffect(() => {
        if (catName) {
            onAddCategory({
                id: `cat-${state.faq.length}`,
                type: 'category',
                text: catName,
                items: []
            })
        } else {
            onAddCategory({});
        }
    }, [catName]);

    return (
        <FormControl component={'fieldset'} style={{margin: 8}} >
            <TextField label={'Category Name'}
                       onChange={(e) => setCatName(e.target.value)}
                       value={catName}
                       variant={'outlined'}
            />
        </FormControl>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.pageBuilder,
    }
}

export default connect(mapStateToProps)(AddCategory);
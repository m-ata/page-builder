import React, {useEffect, useState} from 'react';
import {FormControl, TextField} from "@material-ui/core";

const EditCategory = (props) => {

    const { categoryValue, onEditCategory } = props;
    const [catName, setCatName] = useState('');

    useEffect(() => {
        if (categoryValue && categoryValue.text) {
            setCatName(categoryValue.text);
        }
    }, [categoryValue]);

    useEffect(() => {
        if (categoryValue && catName) {
            onEditCategory({
                id: categoryValue.id,
                type: categoryValue.type,
                text: catName,
                items: categoryValue.items
            })
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
export default EditCategory;
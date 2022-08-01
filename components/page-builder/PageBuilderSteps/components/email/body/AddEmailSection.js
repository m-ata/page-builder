import React, {useState, useEffect} from 'react';
import Section from "../../page/sections/Section";

const AddEmailSection = (props) => {

    const { onAddBody } = props
    const [section, setSection ] = useState('');
    const [sectionOrder, setSectionOrder] = useState(null);

    useEffect(() => {
        if (section) {
            onAddBody(section, sectionOrder);
        }
    }, [section]);

    const onAddSection = (section, order) => {
        setSection(section);
        setSectionOrder(order)
    }

    return (
        <React.Fragment>
            <Section onAddSection={onAddSection} />
        </React.Fragment>
    )
}
export default AddEmailSection;
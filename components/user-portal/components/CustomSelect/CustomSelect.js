import React from 'react';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import styles from "assets/jss/components/customSelectStyle";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { makeStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import { withStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(styles);
const iconStyles = {
    root: {
        marginRight:"12px",
        color:"#7DA0A6",
        right:"0"
    },
};

const icon = withStyles(iconStyles)(({className, ...rest}) => <ExpandMoreIcon {...rest} className={classNames(className, iconStyles.root)}/>)

export default function CustomSelect(props){
    const classes = useStyles();
    
    const {children, value, onChange, width} = props
    
    return(
        <FormControl variant="outlined" className={classes.formControl}>
            <Select
                className={classes.selectRoot}
                value={value}
                onChange={onChange}
                displayEmpty
                IconComponent={icon}
                inputProps={{ 'aria-label': 'Without label' }}
                MenuProps={{
                    anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "left"
                    },
                    transformOrigin: {
                        vertical: "top",
                        horizontal: "left"
                    },
                    getContentAnchorEl: null
                }}
            >
                {children}
            </Select>
        </FormControl>
    );
    
}
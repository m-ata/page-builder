import React,{useState, useEffect} from "react"
import PropTypes from 'prop-types'
import clsx from 'clsx'
import moment from 'moment'
import {makeStyles} from "@material-ui/core/styles"
import { Box } from '@material-ui/core'
import IconButton from "@material-ui/core/IconButton"
import ArrowLeft from "@material-ui/icons/KeyboardArrowLeftOutlined"
import ArrowRight from "@material-ui/icons/KeyboardArrowRightOutlined"
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import ScrollMenu from "react-horizontal-scrolling-menu"
import Typography from '@material-ui/core/Typography'
import { stdTimeFormat } from "model/orest/constants"

const menuStyle = makeStyles({
  root: {
    marginRight: 10,
    cursor: 'pointer',
    borderColor: '#a4d7ff',
    boxShadow: '0 1px 5px #4e4e4e40'
  },
  content: {
    padding: 10,
    minWidth: 65,
    "&:last-child": {
      padding: 10
    }
  },
  active:{
    border: '1px solid #FFC107'
  }
});

export default function ScrollMenuList(props) {
  const classes = menuStyle();
  const {list, type, value, onClick} = props;
  const [selected, setSelected] = useState(value);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  const Menu = (list, selected, type) => {
   return list.map(el => {
      const { item } = el;

      return (
        <Card key={item} variant="outlined" className={clsx(classes.root, {[classes.active]: String(item) === String(selected) ? true : false})} >
          <CardContent className={classes.content}>
            <Typography variant="button" display="block" align="center" gutterBottom={type === 'date' ? true : false}>
              {type === "date" ? moment(item).format('DD') : stdTimeFormat(item)}
            </Typography>
            { type === "date" &&
            <Typography variant="button" display="block" align="center">
              {moment(item).format('ddd').toLowerCase()}
            </Typography>
            }
          </CardContent>
        </Card>
      );
    });
  }

  const onSelect = key => {
    setSelected(key);
    onClick(key);
  };

  let menuItems = Menu(list, selected, type);
  const menu = menuItems;

  return (
    <React.Fragment>
      <Box p={3}>
        <ScrollMenu
          alignCenter={1}
          data={menu}
          arrowLeft={
            <IconButton>
              <ArrowLeft />
            </IconButton>
          }
          arrowRight={
            <IconButton>
              <ArrowRight />
            </IconButton>
          }
          selected={selected}
          onSelect={onSelect}
        />
      </Box>
    </React.Fragment>
  );
}

ScrollMenuList.propTypes = {
  list: PropTypes.array,
  onClick: PropTypes.func
};
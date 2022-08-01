import React from 'react';
import PropTypes from 'prop-types';

import { Grid, colors } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Badge from '@material-ui/core/Badge';
import { Typography, Avatar } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import { withStyles } from '@material-ui/core/styles';
import { COLORS } from '../../constants/index'

const StyledBadge = withStyles((theme) => ({
	badge: {
		backgroundColor: COLORS.colorSatisfied,
		color: COLORS.colorSatisfied,
		boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
		'&::after': {
			position: 'absolute',
			top: 0,
			left: 0,
			width: '100%',
			height: '100%',
			borderRadius: '50%',
			animation: '$ripple 1.2s infinite ease-in-out',
			border: '1px solid currentColor',
			content: '""',
		},
	},
	'@keyframes ripple': {
		'0%': {
			transform: 'scale(.8)',
			opacity: 1,
		},
		'100%': {
			transform: 'scale(2.4)',
			opacity: 0,
		},
	},
}))(Badge)

const useStyles = makeStyles((theme) => ({
	root: {
		borderBottom: `1px solid ${COLORS.borderColor}`
	},
	reciever: {
		width: '100%',
		maxWidth: '36ch',
		backgroundColor: theme.palette.background.paper,
		fontSize: 12
	},
	inline: {
		display: 'inline'
	},
	iconStyles: {
		textAlign: 'right',
	},
	MuiSvgIconRoot: {
		fontSize: '22px',
		boxSizing: 'content-box',
		cursor: 'pointer',
		transition: 'all 0.3s',
		'&:not(:last-child)': {
			paddingRight: '10px',
			color: COLORS.primary,
			'&:hover': {
				color: COLORS.primaryDark,
				transform: 'scale(1.3)'
			}
		},
		'&:last-child': {
			color: COLORS.secondaryDark,
			'&:hover': {
				color: COLORS.primaryDark,
				transform: 'scale(1.3)'
			}
		}
	},
	large: {
		width: theme.spacing(6),
		height: theme.spacing(6),
	},
	img: {
		objectFit: 'contain'
	}
}));

const ChatProfile = (props) => {
	const classes = useStyles();
	const { imageSrc, name, occupation } = props
	return (
		<section className={classes.root}>
			<Grid container
				direction="row"
				alignItems="center"
			>
				<Grid item md={8} lg={8} sm={8} xs={8}>
					<List className={classes.reciever} disablePadding>
						<ListItem disableGutters>
							<ListItemAvatar>
								<StyledBadge
									overlap="circle"
									anchorOrigin={{
										vertical: 'bottom',
										horizontal: 'right',
									}}
									variant="dot"
								>
									<Avatar alt={name} src={imageSrc} className={classes.large} classes={{ img: classes.img }} />
								</StyledBadge>
							</ListItemAvatar>
							<ListItemText
								primary={<React.Fragment>
									<Typography
										variant="body2"
										className={classes.inline}
										color="textPrimary"
									>
										{name}
									</Typography>
								</React.Fragment>}
								secondary={
									<React.Fragment>
										<Typography
											variant="caption"
											color="textSecondary"
											className={classes.inline}
										>
											{occupation}
										</Typography>
									</React.Fragment>
								}
							/>
						</ListItem>
					</List>
				</Grid>
				{/* <Grid item md={4} lg={4} sm={4} xs={4}
					className={classes.iconStyles}>
					<VideocamIcon className={classes.MuiSvgIconRoot} />
					<CallIcon className={classes.MuiSvgIconRoot} />
					<MoreVertIcon className={classes.MuiSvgIconRoot} />
				</Grid> */}
			</Grid>
		</section>
	)
}


ChatProfile.propTypes = {
	occupation: PropTypes.string,
	name: PropTypes.string,
	imageSrc: PropTypes.string
};

ChatProfile.defaultProps = {
	occupation: 'Account Manager',
	name: 'John Mayers',
	imageSrc: 'imgs/not-found.png',
};


export default ChatProfile;
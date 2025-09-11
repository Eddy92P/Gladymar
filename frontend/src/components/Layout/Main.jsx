import React, { useContext } from 'react';

import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';

import { options } from '../../SideBarOptions.jsx';

import AuthContext from '../../store/auth-context';

import MainContent from './MainContent';

import { Link } from 'react-router-dom';

const drawerWidth = 240;

const openedMixin = theme => ({
	width: drawerWidth,
	transition: theme.transitions.create('width', {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.enteringScreen,
	}),
	overflowX: 'hidden',
});

const closedMixin = theme => ({
	transition: theme.transitions.create('width', {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	overflowX: 'hidden',
	width: `calc(${theme.spacing(7)} + 1px)`,
	[theme.breakpoints.up('sm')]: {
		width: `calc(${theme.spacing(8)} + 1px)`,
	},
});

const DrawerHeader = styled('div')(({ theme }) => ({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'flex-end',
	padding: theme.spacing(0, 1),
	...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
	shouldForwardProp: prop => prop !== 'open',
})(({ theme }) => ({
	zIndex: theme.zIndex.drawer + 1,
	transition: theme.transitions.create(['width', 'margin'], {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	variants: [
		{
			props: ({ open }) => open,
			style: {
				marginLeft: drawerWidth,
				width: `calc(100% - ${drawerWidth}px)`,
				transition: theme.transitions.create(['width', 'margin'], {
					easing: theme.transitions.easing.sharp,
					duration: theme.transitions.duration.enteringScreen,
				}),
			},
		},
	],
}));

const Drawer = styled(MuiDrawer, {
	shouldForwardProp: prop => prop !== 'open',
})(({ theme }) => ({
	width: drawerWidth,
	flexShrink: 0,
	whiteSpace: 'nowrap',
	boxSizing: 'border-box',
	variants: [
		{
			props: ({ open }) => open,
			style: {
				...openedMixin(theme),
				'& .MuiDrawer-paper': openedMixin(theme),
			},
		},
		{
			props: ({ open }) => !open,
			style: {
				...closedMixin(theme),
				'& .MuiDrawer-paper': closedMixin(theme),
			},
		},
	],
}));

export default function Main() {
	const theme = useTheme();
	const [drawerOpen, setDrawerOpen] = React.useState(false);
	const [anchorEl, setAnchorEl] = React.useState(null);
	const authContext = useContext(AuthContext);
	const avatarName =
		authContext.name.charAt(0).toUpperCase() +
		authContext.lastName.charAt(0).toUpperCase();

	const handleMenu = event => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleDrawerOpen = () => {
		setDrawerOpen(true);
	};

	const handleDrawerClose = () => {
		setDrawerOpen(false);
	};

	const handleLogout = () => {
		authContext.logout();
	};

	return (
		<Box sx={{ display: 'flex', height: '100vh' }}>
			<CssBaseline />
			<AppBar
				position="fixed"
				open={drawerOpen}
				style={{ backgroundColor: '#74353C' }}
			>
				<Toolbar>
					<IconButton
						color="inherit"
						aria-label="open drawer"
						onClick={handleDrawerOpen}
						edge="start"
						sx={[
							{
								marginRight: 5,
							},
							drawerOpen && { display: 'none' },
						]}
					>
						<MenuIcon />
					</IconButton>
					<Box sx={{ flexGrow: 1 }} />
					<IconButton
						onClick={handleMenu}
						size="small"
						sx={{ ml: 2 }}
						aria-controls={anchorEl ? 'account-menu' : undefined}
						aria-haspopup="true"
						aria-expanded={anchorEl ? 'true' : undefined}
					>
						<Avatar sx={{ width: 40, height: 40 }}>
							{avatarName}
						</Avatar>
					</IconButton>
					<Menu
						anchorEl={anchorEl}
						id="account-menu"
						open={!!anchorEl}
						onClose={handleClose}
						onClick={handleClose}
						slotProps={{
							paper: {
								elevation: 0,
								sx: {
									overflow: 'visible',
									filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
									mt: 1.5,
									'& .MuiAvatar-root': {
										width: 32,
										height: 32,
										ml: -0.5,
										mr: 1,
									},
									'&::before': {
										content: '""',
										display: 'block',
										position: 'absolute',
										top: 0,
										right: 14,
										width: 10,
										height: 10,
										bgcolor: 'background.paper',
										transform:
											'translateY(-50%) rotate(45deg)',
										zIndex: 0,
									},
								},
							},
						}}
						transformOrigin={{
							horizontal: 'right',
							vertical: 'top',
						}}
						anchorOrigin={{
							horizontal: 'right',
							vertical: 'bottom',
						}}
					>
						<MenuItem onClick={handleClose}>
							<Avatar /> Perfil
						</MenuItem>
						<MenuItem onClick={handleLogout}>
							<ListItemIcon>
								<Logout fontSize="small" />
							</ListItemIcon>
							Cerrar Sesión
						</MenuItem>
					</Menu>
				</Toolbar>
			</AppBar>
			<Drawer variant="permanent" open={drawerOpen}>
				<DrawerHeader>
					<IconButton onClick={handleDrawerClose}>
						{theme.direction === 'rtl' ? (
							<ChevronRightIcon />
						) : (
							<ChevronLeftIcon />
						)}
					</IconButton>
				</DrawerHeader>
				<Divider />
				<List>
					{options
						.filter(option =>
							authContext.permissions.includes(option.permission)
						)
						.map(option => (
							<ListItem
								key={option.key}
								disablePadding
								sx={{ display: 'block' }}
							>
								<Link
									to={option.path}
									style={{ textDecoration: 'none' }}
								>
									<ListItemButton
										sx={[
											{
												minHeight: 48,
												px: 2.5,
											},
											drawerOpen
												? {
														justifyContent:
															'initial',
													}
												: {
														justifyContent:
															'center',
													},
										]}
									>
										<ListItemIcon
											sx={[
												{
													minWidth: 0,
													justifyContent: 'center',
												},
												drawerOpen
													? {
															mr: 3,
														}
													: {
															mr: 'auto',
														},
											]}
										>
											{typeof option.icon === 'function'
												? option.icon()
												: React.createElement(
														option.icon
													)}
										</ListItemIcon>
										<ListItemText
											secondary={option.label}
											sx={[
												drawerOpen
													? {
															opacity: 1,
														}
													: {
															opacity: 0,
														},
											]}
											slotProps={{
												primary: {
													color: 'primary',
													variant: 'h1',
												},
											}}
										/>
									</ListItemButton>
								</Link>
							</ListItem>
						))}
				</List>
				<Divider />
			</Drawer>
			<Box
				component="main"
				sx={{
					flexGrow: 1,
					p: 3,
					display: 'flex',
					flexDirection: 'column',
					height: '100vh',
				}}
			>
				<DrawerHeader />
				<Box
					sx={{
						flexGrow: 1,
						display: 'flex',
						flexDirection: 'column',
					}}
				>
					<MainContent />
				</Box>
			</Box>
		</Box>
	);
}

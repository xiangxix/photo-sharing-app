import React from 'react';
import PropTypes from 'prop-types';
import {
    withStyles,
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Link,
    Menu,
    MenuItem,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import {Link as RouterLink} from 'react-router-dom';
import NewPhoto from '../newPhoto/NewPhoto';
// import NewPhoto from '../newPhoto/NewPhoto';
import UserContext from "../../UserContext";
import './TopBar.css';
import axios from 'axios';


const styles = {
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: 16,
    },
    title: {
        flexGrow: 1,
    },
    link: {
        underline: 'none',
    },
    button: {
        outline: 'none',
    }
};

/**
 * Define TopBar, a React componment of CS142 project #5
 */
class TopBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {anchorEl:null};
        this.handleLogout = this.handleLogout.bind(this);
        this.handleMenu = this.handleMenu.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    handleLogout(setUser) {
        axios.post('/admin/logout', {}).then(res => {
            setUser({});
            console.log("logout successfully.");
        }).catch(err => {
            console.log(err);
        });
    }

    handleMenu(event) {
        this.setState({anchorEl:event.currentTarget});
    }
    handleClose() {
        this.setState({anchorEl:null});
    }


    render() {
        const {classes} = this.props;
        return (
            <UserContext.Consumer>
                {(context) => (
                    <AppBar className={classes.root} position="absolute">
                        <Toolbar>
                            <IconButton
                                edge="start"
                                className={classes.menuButton}
                                color="inherit"
                                aria-label="Open drawer"
                            >
                                <MenuIcon/>
                            </IconButton>
                            <Typography className={classes.title} variant="h5" color="inherit">
                                Photo APP
                            </Typography>
                            { context.user.login_name &&  <NewPhoto/> }
                            { !context.user.login_name &&
                                <React.Fragment>
                                    <Link component={RouterLink} to='/login' className={classes.link}>
                                        <Button variant="contained" color="primary" className={classes.button}>
                                            Sign In
                                        </Button>
                                    </Link>
                                    <Link component={RouterLink} to='/register' className={classes.link}>
                                        <Button variant="contained" color="primary" className={classes.button}>
                                            Sign Up
                                        </Button>
                                    </Link>
                                </React.Fragment>
                            }

                            {
                                context.user.login_name &&
                                <React.Fragment>
                                    <Typography variant="h5" color="inherit">
                                        Hello,{context.user.first_name}
                                    </Typography>
                                    <IconButton
                                        aria-label="account of current user"
                                        aria-controls="menu-appbar"
                                        aria-haspopup="true"
                                        onClick={this.handleMenu}
                                        color="inherit"
                                    >
                                        <AccountCircle />
                                    </IconButton>
                                    <Menu
                                        id="menu-appbar"
                                        anchorEl={this.state.anchorEl}
                                        anchorOrigin={{
                                            vertical: 'bottom',
                                            horizontal: 'center',
                                        }}
                                        keepMounted
                                        transformOrigin={{
                                            vertical: 'top',
                                            horizontal: 'center',
                                        }}
                                        open={Boolean(this.state.anchorEl)}
                                        onClose={this.handleClose}
                                    >
                                        <MenuItem onClick={this.handleClose}>Profile</MenuItem>
                                        <MenuItem onClick={this.handleClose}>My account</MenuItem>
                                        <MenuItem onClick={()=>this.handleLogout(context.setUser)}>
                                            Logout
                                        </MenuItem>
                                    </Menu>

                                </React.Fragment>
                            }
                        </Toolbar>
                    </AppBar>
                )}
            </UserContext.Consumer>
        );
    }
}

TopBar.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TopBar);

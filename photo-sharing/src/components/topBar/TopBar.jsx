import React from 'react';
import PropTypes from 'prop-types';
import {
    withStyles,
    AppBar,
    Toolbar,
    Typography,
    Button,
    ClickAwayListener,
    IconButton,
    Link,
    Popper,
    Paper,
    Grow,
    MenuList,
    MenuItem,
} from '@material-ui/core';
import {Link as RouterLink} from 'react-router-dom';
import NewPhoto from '../newPhoto/NewPhoto';
import UserContext from "../../UserContext";
import './TopBar.css';
import axios from 'axios';
import Avatar from "@material-ui/core/Avatar";


const styles = {
    root: {
        flexGrow: 1,
        backgroundColor:'white',
        justifyContent: 'center',
    },
    menuButton: {
        marginRight: 16,
    },
    title: {
        flexGrow: 1,
    },
    link: {
        textDecoration:'none',
    },
    button: {
        margin:5,
        outline: 'none',
        // fontWeight:'bold',
        fontSize:'large',
        textTransform: 'none',
        fontFamily: 'Comic Sans MS, Comic Sans, cursive',
    }
};

/**
 * Define TopBar, a React componment of CS142 project #5
 */
class TopBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {open:false};
        this.anchorRef = React.createRef();
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

    handleMenu() {
        this.setState({open:!this.state.open});
    }
    handleClose() {
        this.setState({open:false});
    }

    render() {
        const {classes} = this.props;
        return (
            <UserContext.Consumer>
                {(context) => (
                    <AppBar className={classes.root} position="fixed">
                        <Toolbar>
                            <Link component={RouterLink} to='/'>
                                <img alt="web log" src={require("../../logo.png")} height="90"></img>
                            </Link>
                            <div className={classes.title} />
                            {/*<Typography variant="h5" color="textPrimary" className={classes.title} >*/}
                            {/*    PhotoShare*/}
                            {/*</Typography>*/}
                            { context.user.login_name &&  <NewPhoto/> }
                            { !context.user.login_name &&
                                <React.Fragment>
                                    <Link component={RouterLink} to='/login' underline='none' className={classes.link}>
                                        <Button  className={classes.button}>
                                            Sign In
                                        </Button>
                                    </Link>
                                    <Link component={RouterLink} to='/register' underline='none' className={classes.link}>
                                        <Button className={classes.button}>
                                            Sign Up
                                        </Button>
                                    </Link>
                                </React.Fragment>
                            }

                            {
                                context.user.login_name &&
                                <React.Fragment>
                                    <Typography variant="h6" color="textPrimary">
                                        Hello,{context.user.first_name}
                                    </Typography>

                                    <IconButton
                                        ref={this.anchorRef}
                                        aria-controls="menu-list-grow"
                                        aria-haspopup="true"
                                        onClick={this.handleMenu}
                                    >
                                        <Avatar src={context.user.avatar_url} />
                                    </IconButton>
                                    <Popper open={this.state.open}
                                            anchorEl={this.anchorRef.current}
                                            transition
                                            disablePortal>
                                        <Paper id="menu-list-grow">
                                            <ClickAwayListener onClickAway={this.handleClose}>
                                                <MenuList>
                                                    <Link component={RouterLink} to={'/users/'+context.user._id} color='textPrimary' underline='none' className={classes.link}>
                                                        <MenuItem onClick={this.handleClose}>Profile</MenuItem>
                                                    </Link>
                                                    <MenuItem onClick={()=>this.handleLogout(context.setUser)}>
                                                        Logout
                                                    </MenuItem>
                                                </MenuList>
                                            </ClickAwayListener>
                                        </Paper>
                                    </Popper>
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

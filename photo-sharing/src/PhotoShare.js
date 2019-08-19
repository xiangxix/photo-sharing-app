import React from 'react';
import {
    BrowserRouter, Route, Switch, Redirect
} from 'react-router-dom';
import {
    Grid,
    Typography,
    Paper,
} from '@material-ui/core';
import './PhotoShare.css';
import axios from 'axios';

// import necessary components
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/UserDetail';
import UserList from './components/userList/UserList';
import UserPhotos from './components/userPhotos/UserPhotos';
import SignIn from './components/loginRegister/SignIn';
import SignUp from './components/loginRegister/SignUp';
import UserContext from "./UserContext";

class PhotoShare extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user:{},
            setUser: user=>{
                this.setState({user});
            }
        }
    }

    componentDidMount() {
        axios.get('/login-user').then(response => {
            this.setState({user: response.data});
        }).catch(err => {
            console.log(err);
        });
    }

    render() {
        return (
            <UserContext.Provider value={this.state}>
                <BrowserRouter>
                    <div>
                        <Grid container spacing={1}>
                            <Grid item xs={12}>
                                <TopBar/>
                            </Grid>
                            <div className="cs142-main-topbar-buffer"/>
                            <Grid item sm={3}>
                                <Paper className="cs142-main-grid-item">
                                    { this.state.user.login_name &&  <UserList/> }
                                </Paper>
                            </Grid>
                            <Grid item sm={9}>
                                <Paper className="cs142-main-grid-item">
                                    <Switch>
                                        <Route exact path="/"
                                               render={() =>
                                                   <Typography variant="body1">
                                                       Welcome to your photosharing app! This <a
                                                       href="https://material-ui.com/demos/paper/">Paper</a> component
                                                       displays the main content of the application. The {"sm={9}"} prop in
                                                       the <a href="https://material-ui.com/layout/grid/">Grid</a> item
                                                       component makes it responsively
                                                       display 9/12 of the window. The Switch component enables us to
                                                       conditionally render different
                                                       components to this part of the screen. You don&apos;t need to display
                                                       anything here on the homepage,
                                                       so you should delete this Route component once you get started.
                                                   </Typography>}
                                        />
                                        {
                                            this.state.user.login_name ?
                                                <Route path="/users/:userId"
                                                   render={props => <UserDetail {...props} />}
                                                />
                                            : <Redirect path="/users/:id" to="/login" />
                                        }
                                        {
                                            this.state.user.login_name ?
                                                <Route path="/photos/:userId"
                                                       render={props => <UserPhotos {...props} />}
                                                /> :
                                                <Redirect path="/users/:id" to="/login" />
                                        }
                                        <Route path="/users" component={UserList}/>
                                        <Route path="/login" component={SignIn}/>
                                        <Route path="/register" component={SignUp}/>
                                    </Switch>
                                </Paper>
                            </Grid>
                        </Grid>
                    </div>
                </BrowserRouter>
            </UserContext.Provider>
        );
    }
}
export default PhotoShare;

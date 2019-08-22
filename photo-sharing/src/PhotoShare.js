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
                                                   <img width="100%" height="100%" src="https://res.cloudinary.com/hqcelqc7l/image/upload/v1566453147/background/xoksoavbjhyjkpanhjg8.jpg" />
                                                   }
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

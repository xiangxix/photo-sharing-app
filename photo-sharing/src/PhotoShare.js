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
import PostTimeLine from "./components/userPhotos/PostTimeLine";
import LoginRegister from "./components/loginRegister/LoginRegister";

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      setUser: user => {
        this.setState({user});
      }
    }
  }

  componentDidMount() {
    axios.get('/admin/login-user').then(response => {
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
              <Grid item sm={12}>
                <TopBar/>
              </Grid>
              <div className="photo-share-topbar-buffer"/>
              <Switch>
                <Route path="/login" render={()=>
                  <Grid item sm={12}>
                  <Paper className="photo-share-main-grid-item">
                    <LoginRegister />
                  </Paper>
                  </Grid>}
                />
                <Route path="/register" render={()=>
                  <Grid item sm={12}>
                  <Paper className="photo-share-main-grid-item">
                    <LoginRegister />
                  </Paper>
                  </Grid>}
                />
                {/*<Route path="/login" component={LoginRegister} />*/}
                {/*<Route path="/register" component={LoginRegister} />*/}
                <Route>
                  <Grid item sm={3}>
                    <Paper className="photo-share-main-grid-item">
                      {this.state.user.login_name && <UserList/>}
                    </Paper>
                  </Grid>
                  <Grid item sm={9}>
                    <Paper className="photo-share-main-grid-item">
                      {
                        this.state.user.login_name ?
                          <Switch>
                            <Route exact path="/" component={PostTimeLine}/>
                            <Route path="/user/:userId"
                                   render={props => <UserDetail {...props} />}
                            />
                            <Route path="/photo/:userId"
                                   render={props => <UserPhotos {...props} />}
                            />
                            <Route path="/login" component={SignIn}/>
                            <Route path="/register" component={SignUp}/>
                          </Switch> :
                          <Redirect path="/photo/:id" to="/login"/>
                      }
                    </Paper>
                  </Grid>
                </Route>
              </Switch>
            </Grid>
          </div>
        </BrowserRouter>
      </UserContext.Provider>
    );
  }
}

export default PhotoShare;

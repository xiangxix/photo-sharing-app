import React from 'react';
import {
  BrowserRouter, Route, Switch, Redirect
} from 'react-router-dom';
import {
  Grid,
  Paper,
} from '@material-ui/core';
import UserContext from "../../UserContext";
import UserList from "../userList/UserList";
import UserDetail from "../userDetail/UserDetail";
import "./MainView.css";

class MainView extends React.Component {
  render() {
    return (
      <UserContext.Consumer>
        {
          (context) => (
            <React.Fragment>
              <Grid item sm={3}>
                <Paper className="photo-share-main-grid-item">
                  {this.state.user.login_name && <UserList/>}
                </Paper>
              </Grid>
              <Grid item sm={9}>
                <Paper className="photo-share-main-grid-item">
                  <Switch>
                    {
                      context.user.login_name ?
                        <Route path="/user/:userId"
                               render={props => <UserDetail {...props} />}
                        />
                        : <Redirect path="/user/:id" to="/login"/>
                    }
                    {
                      context.user.login_name ?
                        <Route path="/photo/:userId"
                               render={props => <UserPhotos {...props} />}
                        /> :
                        <Redirect path="/photo/:id" to="/login"/>
                    }
                  </Switch>
                </Paper>
              </Grid>
            </React.Fragment>
          )
        }
      </UserContext.Consumer>
    )
  }
}
export default MainView;
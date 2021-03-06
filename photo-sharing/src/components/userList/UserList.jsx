import React from 'react';
import PropTypes from 'prop-types';
import {
  Divider,
  List,
  Link,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  withStyles,
}
from '@material-ui/core';
// import ImageIcon from '@material-ui/icons';
import { Link as RouterLink} from 'react-router-dom';
import './UserList.css';
// let fetchModel = require('../../lib/fetchModelData.js');
// import fetchModel from '../../lib/fetchModelData.js';
import axios from 'axios';

const styles = {
  userList: {
    maxHeight: '100%',
    overflow:'auto',
  },
  link: {
    textDecoration:'none',
  },
};

/**
 * Define UserList, a React componment of CS142 project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    // this.users = window.cs142models.userListModel();
    this.state = {userList:[]};
  }

  componentDidMount() {
    axios.get('/user/list').then(response => {
      this.setState({ userList: response.data});
    }).catch(function(err) {
      console.log(err);
    });
  }

// <Link component={RouterLink}  underline='none' to={`/users/${user._id}`}>

  getUserList() {
    if (!this.state.userList) {
      return;
    }
    return (this.state.userList.map((user)=>
      <div key={user._id}>
        <Link component={RouterLink}  underline='none' to={`/user/${user._id}`}>
          <ListItem >
            <ListItemAvatar>
              <Avatar src={user.avatar_url} />
            </ListItemAvatar>
            <ListItemText primary ={user.first_name + " " + user.last_name} />
          </ListItem>
        </Link>
        <Divider />
      </div>
    ));
  }

  render() {
    const { classes } = this.props;
    return (
        <List component="nav" className={classes.userList} >
          {this.getUserList()}
        </List>
    );
  }
}

UserList.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(UserList);

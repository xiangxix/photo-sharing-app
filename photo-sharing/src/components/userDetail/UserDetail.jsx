import React from 'react';
import {Link as RouterLink} from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Grid,
  GridList,
  GridListTile,
  Button,
  Link,
  Avatar,
  Divider
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
// import AvatarEditor from 'react-avatar-editor';
import LocationCityIcon from '@material-ui/icons/LocationCity';
import WorkIcon from '@material-ui/icons/Work';
import './UserDetail.css';
import axios from 'axios';


const styles = {
  avatar: {
    margin:'auto',
    height:100,
    width:100,
  },
  link: {
    textDecoration:'none',
  },
  grid:{
    flexGrow: 1,
    margin:20,
    padding:20,
  },
  userName:{
    margin:'auto',
    fontSize:'large',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  location:{
    display: 'flex',
    justifyContent: 'center',
    alignItems:'center',
  },
  work:{
    display: 'flex',
    justifyContent: 'center',
    alignItems:'center',
  },
  gridList: {
    width: 500,
    height: 450,
    display: 'flex',
    flexWrap: 'wrap',
    overflow: 'hidden',
    justifyContent: 'space-around',
  },
  icon: {
    color: 'rgba(255, 255, 255, 0.54)',
  },
};


/**
 * Define UserDetail, a React component of CS142 project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.userId = this.props.match.params.userId;
    this.state = {user : {}, photos: []};
    // this.user = window.window.cs142models.userModel(this.userId);
  }

  componentDidMount() {
    axios.get('/user/' + this.userId).then(response=>{
      this.setState({user:response.data});
    });
    axios.get('/photosOfUser/'+this.userId).then(response => {
          console.log(response.data);
          this.setState({photos: response.data});
    });
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <Grid container className={classes.grid} >
          <Grid item xs={12}>
            <Avatar alt="user photo" src={this.state.user.avatar_url} className={classes.avatar} />
          </Grid>
          <Grid item xs={12} className={classes.userName}>
            <span>{this.state.user.first_name} {this.state.user.last_name} </span>
          </Grid>
          <Grid item xs={6} className={classes.location}>
            <LocationCityIcon />
            <span> {this.state.user.location} </span>
          </Grid>
          <Grid item xs={6} className={classes.work}>
            <WorkIcon />
            <span> {this.state.user.occupation} </span>
          </Grid>
          <Grid item xs={12}>
            <p> {this.state.user.description} </p>
          </Grid>
          <Grid item xs={12}>
            <Link component={RouterLink}  to={`/photos/${this.userId}`} className={classes.link}>
              <Button variant="contained" color="primary">
               photos
              </Button>
            </Link>
          </Grid> 
        </Grid>
      <Divider />
      <GridList className={classes.gridList} cols={3}>
        {this.state.photos.map(photo => (
          <GridListTile key={photo._id}>
            <img src={photo.url} alt={photo._id} />
          </GridListTile>
        ))}
      </GridList>
    </div>
    );
  }
}

UserDetail.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(UserDetail);

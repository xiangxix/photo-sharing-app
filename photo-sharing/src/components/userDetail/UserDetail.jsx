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
  Divider,
  Typography
} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';
// import AvatarEditor from 'react-avatar-editor';
import LocationCityIcon from '@material-ui/icons/LocationCity';
import WorkIcon from '@material-ui/icons/Work';
import './UserDetail.css';
import axios from 'axios';


const styles = {
  root: {
    maxHeight: '100%',
    // overflowX: 'hidden',
    overflowY: 'auto',
  },
  avatar: {
    margin: 'auto',
    height: 100,
    width: 100,
  },
  photoButton: {
    margin: 'auto',
    display: 'block',
    marginTop: 20,
  },
  link: {
    textTransform:'none',
    textDecoration:'none',
    '&:focus, &:hover, &:visited, &:link, &:active': {
      textDecoration: 'none',
    },
    color:'white',
  },
  description: {
    borderStyle: 'double',
    margin: 10,
  },
  grid: {
    flexGrow: 1,
    margin: 'auto',
    marginBottom: 10,
    paddingLeft: '10%',
    paddingRight: '10%',
    paddingTop: '5%',
    paddingBottom: '5%',
    backgroundSize: 'cover',
    backgroundImage: `url("https://res.cloudinary.com/hqcelqc7l/image/upload/v1566361460/background/gyj0vwtg9abypmgbvelk.jpg")`,
  },
  userName: {
    margin: 'auto',
    fontSize: 'large',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  location: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  work: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridListRoot: {
    marginTop: 10,
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
  },
  gridList: {
    width: "100%",
  },
};


/**
 * Define UserDetail, a React component of CS142 project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {user: {}, photos: []};
    // this.user = window.window.cs142models.userModel(this.userId);
  }

  componentDidMount() {
    console.log("1");
    const id = this.props.match.params.userId;
    axios.all([axios.get('/user/' + id),
      axios.get('/photosOfUser/' + id)])
      .then(axios.spread((res1, res2) => {
        this.setState({
          user: res1.data,
          photos: res2.data,
        });
      }));
  }

  componentDidUpdate = prevProps => {
    const id = this.props.match.params.userId;
    console.log(2);
    console.log(id);
    console.log(prevProps.match.params.userId);
    if (id !== prevProps.match.params.userId) {
      axios.all(
        [axios.get('/user/' + id),
          axios.get('/photosOfUser/' + id)]
      ).then(
        axios.spread((res1, res2) => {
          this.setState({
            user: res1.data,
            photos: res2.data,
          })
        })
      ).catch(err => {
        console.log(err);
      });
    }
    ;
  };

  render() {
    const {classes} = this.props;
    return (
      <div className={classes.root}>
        <Grid container className={classes.grid}>
          <Grid item xs={12}>
            <Avatar alt="user photo" src={this.state.user.avatar_url} className={classes.avatar}/>
          </Grid>
          <Grid item xs={12} className={classes.userName}>
            <span>{this.state.user.first_name} {this.state.user.last_name} </span>
          </Grid>
          <Grid item xs={6} className={classes.location}>
            <LocationCityIcon/>
            <span> {this.state.user.location} </span>
          </Grid>
          <Grid item xs={6} className={classes.work}>
            <WorkIcon/>
            <span> {this.state.user.occupation} </span>
          </Grid>
          <Grid item xs={12} className={classes.description}>
            <Typography variant="h6">About Me:</Typography>
            <Typography variant="body1">
              {this.state.user.description}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" className={classes.photoButton}>
              <Link component={RouterLink} className={classes.link} to={`/photos/${this.props.match.params.userId}`}>
                Photos
              </Link>
            </Button>
          </Grid>
        </Grid>
        <Divider/>
        <div className={classes.gridListRoot}>
          <GridList className={classes.gridList} cols={3}>
            {this.state.photos.map(photo => (
              <GridListTile key={photo._id}>
                <img width='100%' src={photo.url} alt={photo._id}/>
              </GridListTile>
            ))}
          </GridList>
        </div>
      </div>
    );
  }
}

UserDetail.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(UserDetail);

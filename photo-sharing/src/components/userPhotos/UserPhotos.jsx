import React from 'react';
import {
  List,
  withStyles,
} from '@material-ui/core';
import PropTypes from 'prop-types';
import './UserPhotos.css';
import SinglePhoto from './SinglePhoto'
import axios from 'axios';


const styles = {
  photoList: {
    maxHeight: '99%',
    overflow: 'auto',
  },
}

/**
 * Define UserPhotos, a React componment of CS142 project #5
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.userId = this.props.match.params.userId;
    this.state = {
                  photos : [], 
                  user : {} ,
                };
  }

  componentDidMount() {
    let url = "/photosOfUser/"+this.userId;
    axios.get(url).then(response => 
      this.setState({photos : response.data}));

    url = "/user/"+this.userId;
    axios.get(url).then(response => {
      this.setState({user: response.data});
    });
  }

  getPhotoList() {
    if (this.state.photos) {
      // map这里不能用{扩起来}
      return (
        this.state.photos.map( photo =>
            <div key={photo._id}>
              <SinglePhoto photo={photo} user={this.state.user} />
            </div>
      ));
    }
  }
      
  render() {
    const { classes } = this.props;
    console.log(this.state.photos);
    return (
      <List className={classes.photoList}>
        { this.getPhotoList() }   
      </List> 
    );
  }
}

UserPhotos.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(UserPhotos);

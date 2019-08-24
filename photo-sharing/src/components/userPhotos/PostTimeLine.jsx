import React, {Component} from 'react';
import axios from "axios";
import SinglePhoto from "./SinglePhoto";
import {List, withStyles} from "@material-ui/core";
import PropTypes from "prop-types";

const styles = {
  photoList: {
    maxHeight: '99%',
    overflow: 'auto',
  },
}

class PostTimeLine extends Component {
  constructor(props) {
    super(props);
    this.state = {
      photos : [],
    };
  }

  componentDidMount() {
    axios.get("/photo/timeline").then(response =>
      this.setState({photos : response.data}));
  }

  getPhotoList() {
    if (this.state.photos.length) {
      // map这里不能用{扩起来}
      console.log(this.state.user);
      return (
        this.state.photos.map( photo =>
          <div key={photo._id}>
            <SinglePhoto photo={photo} user={photo.user} />
          </div>
        ));
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <List className={classes.photoList}>
        { this.getPhotoList() }
      </List>
    );
  }
}

PostTimeLine.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PostTimeLine);
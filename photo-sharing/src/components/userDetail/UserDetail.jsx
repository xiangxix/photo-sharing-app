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
  description: {
    borderStyle:'double',
    margin:10,
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
        this.state = {user: {}, photos: []};
        // this.user = window.window.cs142models.userModel(this.userId);
    }

    componentDidMount() {
        axios.get('/user/' + this.userId).then(response => {
            this.setState({user: response.data});
        });
        axios.get('/photosOfUser/' + this.userId).then(response => {
            this.setState({photos: response.data});
        });
    }

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
                        <Typography variant="body1" >
                          {this.state.user.description}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Link component={RouterLink} to={`/photos/${this.userId}`}>
                            <Button variant="contained" color="primary" className={classes.photoButton}>
                                photos
                            </Button>
                        </Link>
                        {/*<Button variant="contained" color="primary" className={classes.photoButton}>*/}
                        {/*    photos*/}
                        {/*</Button>*/}
                    </Grid>
                </Grid>
                <Divider/>
                <div className={classes.gridListRoot}>
                    <GridList className={classes.gridList} cols={3}>
                        {this.state.photos.map(photo => (
                            <GridListTile key={photo._id}>
                                <img src={photo.url} alt={photo._id}/>
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

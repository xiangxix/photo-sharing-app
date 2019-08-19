import React from 'react';
import {
    Avatar,
    Card,
    CardHeader,
    CardMedia,
    CardContent,
    CardActions,
    Collapse,
    Link,
    ListItem,
    IconButton,
    Typography,
    TextField,
    withStyles,
} from '@material-ui/core';
import PropTypes from 'prop-types';
import SendIcon from '@material-ui/icons/Send';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import AddCommentIcon from '@material-ui/icons/AddComment';
import {Link as RouterLink} from 'react-router-dom';
import axios from 'axios';


const styles = {
    card: {
        width: '90%',
        height: '100%',
        margin: 'auto',
    },
    media: {
        height: 0,
        paddingTop: '100%',
    },
    link: {
        textDecoration:'none',
    },
    inputComment: {
        display: 'flex',

    },
    input: {
        flex: 1,
        // border:'2px solid grey',
        padding: 4,
    },
}

class SinglePhoto extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            commentInput: false,
            isLiked: this.props.photo.isLiked,
            likes: this.props.photo.likes,
            newComment: '',
            comments: this.props.photo.comments
        };
        this.photo = this.props.photo;
        this.user = this.props.user;
        this.handleCommentInput = this.handleCommentInput.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleLike = this.handleLike.bind(this);
        this.handleSubmitComment = this.handleSubmitComment.bind(this);
    }

    handleLike() {
        axios.post('/like/' + this.photo._id, {}).then(res => {
            this.setState({isLiked: res.data.isLiked, likes: res.data.likes});
        });
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }

    handleSubmitComment(id, event) {
        event.preventDefault();
        if (!this.state.newComment.length) {
            return;
        }
        const url = 'commentsOfPhoto/' + id;
        axios.post(url, {
            comment: this.state.newComment
        }).then(response => {
            console.log(response.data);
            this.setState({comments: response.data});
        }).catch(err => {
            console.log(err);
        });
    }

    handleCommentInput() {
        this.setState({commentInput: !this.state.commentInput});
    }

    getComments(comments) {
        if (!comments) {
            return;
        }
        const {classes} = this.props;
        return (comments.map((comment) =>
            <div key={comment._id}>
                <CardContent>
                    <Link component={RouterLink} className={classes.link} to={`/users/${comment.user._id}`}>
                        {comment.user.first_name + " " + comment.user.last_name}
                    </Link>
                    <span>
                        <Typography variant="p1">{":"+comment.comment}</Typography>
                    </span>
                    <Typography variant="caption">{comment.date_time}</Typography>
                </CardContent>
            </div>
        ));
    }


    render() {
        const {classes} = this.props;
        return (
            <ListItem>
                <Card className={classes.card}>
                    <CardHeader
                        avatar={
                            <Link component={RouterLink} className={classes.link} to={`/users/${this.user._id}`}>
                                <Avatar aria-label="User Avatar" src={this.user.avatar_url}/>
                            </Link>
                        }
                        action={
                            <IconButton aria-label="Settings">
                                <MoreVertIcon/>
                            </IconButton>
                        }
                        title={this.user.first_name + " " + this.user.last_name}
                        subheader={this.photo.date_time}
                    />
                    <CardMedia className={classes.media}
                               image={this.photo.url}
                    />
                    <CardActions>
                        <IconButton color="secondary" aria-label="Like" onClick={this.handleLike}>
                            {this.state.isLiked ? <FavoriteIcon/> : <FavoriteBorderIcon/>}
                            <span>{this.state.likes}</span>
                        </IconButton>
                        <IconButton
                            onClick={this.handleCommentInput}
                            aria-expanded={this.state.commentInput}
                            aria-label="Make comment"
                        >
                            <AddCommentIcon/>
                        </IconButton>
                    </CardActions>
                    <Collapse in={this.state.commentInput} timeout="auto" unmountOnExit>
                        <CardContent className={classes.inputComment}>
                            <TextField
                                label="comment"
                                name="newComment"
                                value={this.state.newComment}
                                fullWidth
                                multiline
                                rowsMax="4"
                                onChange={this.handleChange}
                                className={classes.input}
                                variant="outlined"
                            />
                            <IconButton aria-label="Send"
                                        onClick={(e) => this.handleSubmitComment(this.photo._id, e)}>
                                <SendIcon/>
                            </IconButton>
                        </CardContent>
                    </Collapse>
                    {this.getComments(this.state.comments)}
                </Card>
            </ListItem>
        );
    }
}

SinglePhoto.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SinglePhoto);

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
    Button,
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
import DeleteIcon from '@material-ui/icons/Delete';
import {Link as RouterLink} from 'react-router-dom';
import axios from 'axios';
import UserContext from '../../UserContext';


const styles = {
    card: {
        width: '90%',
        height: '100%',
        margin: 'auto',
    },
    post: {
        marginLeft:15,
        marginBottom:10,
        padding: 0,
        "&:last-child": {
            paddingBottom: 0
        }
    },
    media: {
        // height: 0,
        // paddingTop: '100%',
    },
    link: {
        textDecoration:'none',
    },
    inputComment: {
        display: 'flex',
        margin:10,
        padding: 0,
        "&:last-child": {
            paddingBottom: 0
        }
    },
    like: {
        margin:[0,'auto'],
    },
    likeNumbers:{
        margin:[0,'auto'],
    },
    commentTrigger:{
        margin:[0,'auto'],
    },
    deletePhoto:{
        margin:[0,'auto'],
        marginLeft:'78%',
    },
    reply: {
        textTransform:'none',
        marginLeft:30,
    },
    deleteComment:{
        textTransform:'none',
        marginLeft:30,
    },
    input: {
        flex: 1,
        marginRight:5,
        // border:'2px solid grey',
        // padding: 4,
    },
    commentsArea :{
        marginLeft:10,
        padding: 0,
        "&:last-child": {
            paddingBottom: 0
        }
    },
    commentListItem:{
        marginTop:10,
        marginBottom:10,
    },
}

class SinglePhoto extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            photo: this.props.photo,
            commentInput: false,
            isLiked: this.props.photo.isLiked,
            likes: this.props.photo.likes,
            newComment: '',
            comments: this.props.photo.comments
        };
        this.user = this.props.user;
        this.handleCommentInput = this.handleCommentInput.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleLike = this.handleLike.bind(this);
        this.handleSubmitComment = this.handleSubmitComment.bind(this);
        this.handleDeletePhoto = this.handleDeletePhoto.bind(this);
        this.handleDeleteComment = this.handleDeleteComment.bind(this);
        this.handleReplyComment = this.handleReplyComment.bind(this);
    }

    handleLike() {
        axios.post('/like/' + this.state.photo._id, {}).then(res => {
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
        const url = 'comment/' + id;
        axios.post(url, {
            comment: this.state.newComment
        }).then(response => {
            this.setState({comments: response.data, commentInput:false, newComment:''});
        }).catch(err => {
            console.log(err.data);
        });
    }

    handleDeleteComment(commentId) {
        axios.post('/comment/delete/'+this.state.photo._id,{
            commentId:commentId,
        }).then(response => {
            this.setState({comments:response.data});
        }).catch(err => {
            console.log(err.data);
        });
    }

    handleReplyComment(username) {
        this.setState({commentInput:true, newComment:'@'+username+' '});
    }


    handleCommentInput() {
        this.setState({commentInput: !this.state.commentInput});
    }

    handleDeletePhoto(id,public_id) {
        axios.post('/photos/delete/'+id,{
            public_id:public_id,
        }).then(response=> {
            this.setState({photo:{}});
        }).catch(err => {
            console.log(err.data);
        });
    }

    getComments(comments) {
        if (!comments) {
            return;
        }
        const {classes} = this.props;
        return (comments.map((comment) =>
            <div key={comment._id} className={classes.commentListItem}>
                <Link component={RouterLink} className={classes.link} to={`/users/${comment.user._id}`}>
                    {comment.user.first_name}
                </Link>
                <Typography display="inline">{": "+comment.comment}</Typography>
                <br />
                <Typography variant="caption" color="textSecondary">{comment.date_time}</Typography>
                <UserContext.Consumer>
                    {
                        (context) => (
                            context.user._id === comment.user._id ?
                                <Button className={classes.deleteComment}
                                        onClick={() => this.handleDeleteComment(comment._id)}>
                                    <Typography variant='caption' color='primary'>
                                        Delete
                                    </Typography>
                                </Button>
                                :
                                <Button className={classes.reply}
                                    onClick={() => this.handleReplyComment(comment.user.first_name)} >
                                    <Typography variant='caption' color='primary'>
                                        Reply
                                    </Typography>
                                </Button>
                        )
                    }
                </UserContext.Consumer>
            </div>
        ));
    }

    render() {
        const {classes} = this.props;
        return (
            <ListItem>
                {
                    Object.keys(this.state.photo).length!==0 &&
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
                            subheader={this.state.photo.date_time}
                        />
                        <CardContent className={classes.post}>
                            <Typography variant='h5' >
                                {this.state.photo.description}
                            </Typography>
                        </CardContent>
                        <CardMedia className={classes.media}
                                   component="img"
                                   alt="photo"
                                   image={this.state.photo.url}
                        />
                        <CardActions>
                            <IconButton  aria-label="Like" onClick={this.handleLike} className={classes.like}>
                                {this.state.isLiked ? <FavoriteIcon color="secondary"/> : <FavoriteBorderIcon/>}
                                <Typography className={classes.likeNumbers} variant='body1' display='inline'>
                                    {this.state.likes}
                                </Typography>
                            </IconButton>
                            <IconButton
                                className={classes.commentTrigger}
                                onClick={this.handleCommentInput}
                                aria-expanded={this.state.commentInput}
                                aria-label="Make comment"
                            >
                                <AddCommentIcon color="primary"/>
                                <Typography  variant='body1' display='inline'>
                                    {this.state.comments.length}
                                </Typography>
                            </IconButton>
                            <UserContext.Consumer>
                                {
                                    (context) => (
                                        (context.user._id === this.user._id) &&
                                        <IconButton className={classes.deletePhoto} onClick={()=>this.handleDeletePhoto(this.state.photo._id, this.state.photo.public_id)}>
                                            <DeleteIcon color="secondary" />
                                        </IconButton>
                                    )
                                }
                            </UserContext.Consumer>
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
                                <Button variant="contained" color="primary" aria-label="Send"
                                        onClick={(e) => this.handleSubmitComment(this.state.photo._id, e)}>
                                    <SendIcon/>
                                </Button>
                            </CardContent>
                        </Collapse>
                        <CardContent className={classes.commentsArea}>
                            {this.getComments(this.state.comments)}
                        </CardContent>
                    </Card>
                }
            </ListItem>
        );
    }
}

SinglePhoto.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SinglePhoto);

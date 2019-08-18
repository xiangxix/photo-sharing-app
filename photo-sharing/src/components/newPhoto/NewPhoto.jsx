import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Button,
    TextField,
    withStyles
} from '@material-ui/core';

const style = {
    input: {
        display: "none",
    },
    button: {
        outline: 'none',
    },
};


class NewPhoto extends React.Component {
    constructor(props) {
        super(props);
        this.state = {postText: '', open: false};
        this.uploadInput = React.createRef();
        this.handleUpload = this.handleUpload.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleNewPhoto = this.handleNewPhoto.bind(this);
    }

    handleChange(event) {
        this.setState({postText: event.target.value});
    }

    handleClose() {
        this.setState({open: false});
    }

    handleNewPhoto() {
        this.setState({open: true});
        // console.log(this.state.open);
    }

    // componentWillReceiveProps(nextProps) {
    //        this.setState({open: nextProps.open});
    //    }

    handleUpload(event) {
        event.preventDefault();
        if (this.uploadInput.files.length > 0) {
            const domForm = new FormData();
            domForm.append('uploadedphoto', this.uploadInput.files[0]);
            axios.post('/photos/new', domForm).then(response => {
                console.log(response.data);
            }).catch(err => {
                console.log(`POST ERR: ${err}`);
            });
        }
        this.setState({open: false});
    }

    render() {
        const {classes} = this.props;
        return (
            <div>
                <Button variant="contained" color="primary" onClick={this.handleNewPhoto} className={classes.button}>
                    New Photo
                </Button>
                <Dialog
                    open={this.state.open}
                    keepMounted
                    onClose={this.handleClose}
                    aria-labelledby="alert-dialog-slide-title"
                    aria-describedby="alert-dialog-slide-description"
                >
                    <DialogTitle id="alert-dialog-slide-title">{"Upload Photo"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-slide-description">
                            Please choose the photo you want to share and tell your friends something about it!
                        </DialogContentText>
                        <TextField
                            label="Share your feelings"
                            fullWidth
                            multiline
                            rowsMax="4"
                            onChange={this.handleChange}
                            className={classes.postContent}
                            // margin="normal"
                            variant="filled"
                        />
                        <input
                            type="file"
                            accept="image/*"
                            className={classes.input}
                            id="contained-button-file"
                            multiple
                            ref={domFileRef => {
                                this.uploadInput = domFileRef;
                            }}
                        />
                        <label htmlFor="contained-button-file">
                            <Button variant="contained" component="span" className={classes.button}>
                                Choose a Photo
                            </Button>
                        </label>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleUpload} color="primary">
                            Upload
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

NewPhoto.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(NewPhoto);
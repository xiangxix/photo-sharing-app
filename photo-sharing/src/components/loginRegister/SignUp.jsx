import React from 'react';
import {Link as RouterLink} from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import {withStyles} from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import axios from 'axios';
import UserContext from "../../UserContext";

const styles = {
    root: {
        maxHeight: '80%',
        overflow: 'auto',
        marginTop: 64,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: 8,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: 24,
    },
    submit: {
        marginTop: 24,
        marginLeft: 0,
        marginRight: 0,
        marginBottom: 16,
    },
};

class SignUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            login_name: '',
            password: '',
            first_name: '',
            last_name: '',
            location: '',
            description: '',
            occupation: '',
            user: {},
            error_message: '',
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleSubmit(setUser, event) {
        axios.post('/user', {
            login_name: this.state.login_name,
            password: this.state.password,
            first_name: this.state.first_name,
            last_name: this.state.last_name,
            location: this.state.location,
            description: this.state.description,
            occupation: this.state.occupation
        }).then(response => {
            console.log(response.data);
            setUser(response.data);
            this.setState({user: response.data});
            this.props.history.push("/users/" + this.state.user._id);
        }).catch(err => {
            // this.setState({error_message:err});
            console.log(err);
        });
        // without this url will show all the parameters
        event.preventDefault();
    }

    handleChange(event) {
        const name = event.target.name;
        const value = event.target.value;
        this.setState({[name]: value});
    }

    render() {
        let {classes} = this.props;
        return (
            <UserContext.Consumer>
                {(context) => (
                    <div className={classes.root}>
                        <Avatar className={classes.avatar}>
                            <LockOutlinedIcon/>
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Sign up
                        </Typography>
                        <form
                            className={classes.form}
                            onSubmit={(e)=>this.handleSubmit(context.setUser,e)}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    < TextField
                                        variant="outlined"
                                        required
                                        fullWidth
                                        id="login_name"
                                        label="Login Name"
                                        name="login_name"
                                        autoComplete="email"
                                        onChange={this.handleChange}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        autoComplete="fname"
                                        name="first_name"
                                        variant="outlined"
                                        required
                                        fullWidth
                                        id="firstName"
                                        label="First Name"
                                        autoFocus
                                        onChange={this.handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        variant="outlined"
                                        required
                                        fullWidth
                                        id="lastName"
                                        label="Last Name"
                                        name="last_name"
                                        autoComplete="lname"
                                        onChange={this.handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        autoComplete="location"
                                        name="location"
                                        variant="outlined"
                                        required
                                        fullWidth
                                        id="location"
                                        label="Location"
                                        autoFocus
                                        onChange={this.handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        variant="outlined"
                                        required
                                        fullWidth
                                        id="occupation"
                                        label="Occupation"
                                        name="occupation"
                                        autoComplete="occupation"
                                        onChange={this.handleChange}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        variant="outlined"
                                        required
                                        fullWidth
                                        id="description"
                                        label="Description"
                                        name="description"
                                        autoComplete="description"
                                        onChange={this.handleChange}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        variant="outlined"
                                        required
                                        fullWidth
                                        id="email"
                                        label="Email Address"
                                        name="email"
                                        autoComplete="email"
                                        onChange={this.handleChange}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        variant="outlined"
                                        required
                                        fullWidth
                                        name="password"
                                        label="Password"
                                        type="password"
                                        id="password"
                                        autoComplete="current-password"
                                        onChange={this.handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={<Checkbox value="allowExtraEmails" color="primary"/>}
                                        label="I want to receive inspiration, marketing promotions and updates via email."
                                    />
                                </Grid>
                            </Grid>
                            <Button
                                type="submit"
                                method='POST'
                                fullWidth
                                variant="contained"
                                color="primary"
                                className={classes.submit}
                            >
                                Sign Up
                            </Button>
                            <Grid container justify="flex-end">
                                <Grid item>
                                    <Link href="#" variant="body2">
                                        Already have an account? Sign in
                                    </Link>
                                </Grid>
                            </Grid>
                        </form>
                        <Typography variant="body1" color='secondary'>
                            {this.state.error_message}
                        </Typography>
                    </div>
                )}
            </UserContext.Consumer>

        );
    }
}

SignUp.propTypes = {
    classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(SignUp);
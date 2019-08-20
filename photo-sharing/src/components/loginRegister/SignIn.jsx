import React from 'react';

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
import axios from 'axios';
import PropTypes from 'prop-types';
import UserContext from "../../UserContext";

const styles = {
    root: {
        maxHeight: '99%',
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
        width: '100%',
        marginTop: 8,
    },
    submit: {
        marginTop: 24,
        marginLeft: 0,
        marginRight: 0,
        marginBottom: 16,
    },
};

class SignIn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            login_name: '',
            password: '',
            user: null,
            message: ''
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        const name = event.target.name;
        const value = event.target.value;
        //name should be enclosed by [ ] or the key will be 'name'
        this.setState({[name]: value});
    }

    handleSubmit(setUser, event) {
        axios.post('/admin/login', {
            login_name: this.state.login_name,
            password: this.state.password
        }).then(response => {
            setUser(response.data);
            this.setState({user: response.data, message: "Login successfully."});
            this.props.history.push("/users/" + this.state.user._id);
        }).catch(err => {
            console.log(err);
            if (err.response) {
                this.setState({message: err.response.data});
            }
        });
        event.preventDefault();
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
                            Sign in
                        </Typography>
                        <form method='POST' className={classes.form} onSubmit={(e) => this.handleSubmit(context.setUser,e)}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                // id="email"
                                // label="Email Address"
                                id="email"
                                label="Login Name"
                                name="login_name"
                                // autoComplete="email"
                                autoFocus
                                onChange={this.handleChange}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                onChange={this.handleChange}
                            />
                            <FormControlLabel
                                control={<Checkbox value="remember" color="primary"/>}
                                label="Remember me"
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                className={classes.submit}
                            >
                                Sign In
                            </Button>
                            <Grid container>
                                <Grid item xs>
                                    <Link href="#" variant="body2">
                                        Forgot password?
                                    </Link>
                                </Grid>
                                <Grid item>
                                    <Link href="#" variant="body2">
                                        {"Don't have an account? Sign Up"}
                                    </Link>
                                </Grid>
                            </Grid>
                        </form>
                        <Typography variant="body1" color='secondary'>
                            {this.state.message}
                        </Typography>
                    </div>
                )}
            </UserContext.Consumer>
        );
    }
}

//<Link component="RouterLink" underline='none' to="/register">

SignIn.propTypes = {
    classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(SignIn);

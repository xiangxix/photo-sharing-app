import React, {Component} from 'react';
import {
  Route, Switch, Redirect
} from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  withStyles,
} from '@material-ui/core';
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import UserContext from "../../UserContext";
import PropTypes from "prop-types";

const styles = {
  grid: {
    maxHeight:'100%',
    overflow:'auto',
    width:'100%',
    height:'100%',
    backgroundSize: 'cover',
    backgroundImage:`url("https://res.cloudinary.com/hqcelqc7l/image/upload/v1566453147/background/xoksoavbjhyjkpanhjg8.jpg")`,
  },
  welcome1: {
    marginTop:'10%',
    marginLeft:'10%',
    color:"white",
    fontFamily: 'Comic Sans MS, Comic Sans, cursive',
  },
  welcome2: {
    marginLeft:'15%',
    marginTop:'3%',
    color:"white",
    fontFamily: 'Comic Sans MS, Comic Sans, cursive',
  },
  // left: {
  //   flexGrow: 1,
  // },
  signIn:{
    // width:320,
    // height:500,
    width:'80%',
    height:'80%',
    padding:'5%',
    marginTop:'10%',
    margin:'auto',
    backgroundColor:'white',
  },
  signUp:{
    // width:320,
    // height:500,
    width:'80%',
    height:'80%',
    padding:'5%',
    marginTop:'10%',
    margin:'auto',
    backgroundColor:'white',
  },
  // signUp:{
  //   width:320,
  //   height:700,
  //   padding:'5%',
  //   marginTop:'10%',
  //   margin:'auto',
  //   backgroundColor:'white',
  // }
};

class LoginRegister extends Component {
  render() {
    let {classes} = this.props;
    return (
      <UserContext.Consumer>
        {
          (context) => (
              <Grid container spacing={1} className={classes.grid}>
                <Grid item item xs={8}>
                  <Typography variant='h1' className={classes.welcome1}>
                    Welcome To
                  </Typography>
                  <Typography variant='h1' className={classes.welcome2}>
                    Photo Share!
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  {
                    !context.user.login_name ?
                      <Switch>
                        <Route path="/login"
                               render={()=>
                                 <Paper className={classes.signIn}>
                                   <SignIn  />
                                 </Paper>
                               }
                        />
                        <Route path="/register"
                               render={()=>
                                 <Paper className={classes.signUp}>
                                  <SignUp />
                                 </Paper>
                               }
                        />
                      </Switch> :
                      <Redirect to={"/"} />
                  }
                </Grid>
              </Grid>
          )
        }
      </UserContext.Consumer>
    );
  }
}

LoginRegister.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LoginRegister);
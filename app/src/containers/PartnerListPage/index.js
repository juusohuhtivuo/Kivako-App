import React, {Component} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';

import ResponsiveDrawer from '../MenuDrawer';
import UserActionCard from '../../components/UserActionCard';

import Constants from '../../config_constants';
import {Redirect} from 'react-router-dom';

const useStyles = makeStyles(theme => 
({
  root: 
  {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  inline: 
  {
    display: 'inline',
  },
}));

class PartnerListPage extends Component 
{
  state = 
  {
    openAction: false,
    actionIndex: 0,
    partnerList: [],
    isAuthenticated: true
  }

  componentDidMount()
  {
    fetch(window.location.protocol + '//' + window.location.hostname + Constants.PORT_IN_USE + '/isAuthenticated', 
    {
      method: 'GET',
      credentials: 'include'
    })
    .then(response => response.json())
    .then(responseData => 
    {
      console.log('Is authenticated check:', responseData);

      if(responseData.isAuthenticated === true)
      {
        fetch(window.location.protocol + '//' + window.location.hostname + Constants.PORT_IN_USE + '/api/v1/usersMatch/getUserActiveMatches',
        {
          method: 'GET',
          headers: 
          {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        })
        .then(responseSecond => responseSecond.json())
        .then(jsonResponse => 
          {
            const userId = jsonResponse.userId;
            let partners = [];

            for (let i = 0; i < jsonResponse.data.length; i++)
            {
              let match = jsonResponse.data[i];
              const user = match.requesterUser._id === userId ? match.recipientUser : match.requesterUser;

              let ltt = [];
              let ltl = [];

              user.languagesToTeach.forEach(item => 
              {
                ltt.push(item.language);
              });

              user.languagesToLearn.forEach(item => 
              {
                ltl.push(item.language);
              });

              partners.push(
              {
                  name: user.firstName + ' ' + user.lastName,
                  _id: i,
                  matchId: match._id,
                  city: user.cities,
                  teachLanguages: ltt,
                  studyLanguages: ltl,
                  photo_url:"https://pickaface.net/gallery/avatar/unr_test_161024_0535_9lih90.png",
              });
            }

            this.setState({partnerList: partners});
          });
      }
      else this.setState({isAuthenticated: false});
    })
    .catch((error) => {
      console.error(error);
    });
  }

  onShowActionCard= (open, index, action) =>  
  {
    console.log(open, index, action);

    if (open === true) this.setState({actionIndex: index});
    else
    {
      let data = this.state.partnerList[index];

      if (action === "unmatch") this.onUnmatchUser(data);
    }

    this.setState({openAction: open});
  };

  getPartnerDiv(list, classes) 
  {
    if (!this.state.isAuthenticated) return <Redirect to='/'/>;
    if (this.state.partnerList.length === 0) return <div/>;
    else
    {
      return (
      <div>
      <Typography variant="h6" gutterBottom>
         Partners
      </Typography>  
      <List 
        className={classes.root}>
        {list.map(item => 
        {
          return (
            <ListItem 
              key = {item._id} 
              alignItems="flex-start"
              onClick={() => this.onShowActionCard(true, this.state.partnerList.indexOf(item), null)}>
            <ListItemAvatar>
              <Avatar src={item.photo_url} />
            </ListItemAvatar>
            <ListItemText
              primary={item.name}
              secondary={
              <React.Fragment>
                <Typography
                  component="span"
                  variant="body2"
                  className={classes.inline}
                  color="textPrimary">
                  Teach: {item.teachLanguages.join(", ")}. Learn: {item.studyLanguages.join(", ")}
                </Typography>
              {" — " + item.city.join(", ")}
            </React.Fragment>}/>
          </ListItem>);
        })}
      </List>
      <UserActionCard 
          type = "partner"
          open = {this.state.openAction} 
          data = {this.state.partnerList[this.state.actionIndex]}
          onClose = {(value) =>this.onShowActionCard(false, this.state.actionIndex, value)}/>
      </div>
      );
    }
  }

  onUnmatchUser = (data) =>
  {
    console.log(data)

    fetch(window.location.protocol + '//' + window.location.hostname + Constants.PORT_IN_USE + '/api/v1/usersMatch/removeExistingMatch', 
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({matchId: data.matchId})
    })
    .then(response => response.json())
    .then(responseJson => 
      {
        console.log(responseJson);
        window.location.reload();
      });
  }

  render()
  {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
      <ResponsiveDrawer title = "Current Partners">
       {this.getPartnerDiv(this.state.partnerList, classes)}
      </ResponsiveDrawer>
      </div>
    );
  }

}

export default withStyles(useStyles) (PartnerListPage);
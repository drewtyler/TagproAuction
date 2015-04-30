Template.links.helpers({
  notSignedIn:function() {
     return !(Meteor.user());
  },
  notSignedUp: function() {
   var response = Meteor.call("getSignedUp",Meteor.user().username);
   return (response == 0);
  },
  isCaptain:function() {
   return (TeamData.findOne({"name":Meteor.user().username, "captain" : true}))
  },
  nav:function(){
   return Session.get("pageToDisplay");
  }
});

Template.links.events({
  'click #signupforleague' : function(event) {
     Session.set("pageToDisplay","signUpPage");
  }// put in a listener for a click in each div for each button
});

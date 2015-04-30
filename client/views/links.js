Template.links.helpers({
  notSignedIn:function() {
     return !(Meteor.user());
  },
  notSignedUp: function() {
    Meteor.call("getSignedUp",Meteor.user().username, function(error, result) {Session.set("notSignedUp", result==0); });
    return Session.get("notSignedUp");
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

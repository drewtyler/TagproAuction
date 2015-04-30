Template.links.helpers({
  notSignedIn:function() {
     return !(Meteor.user());
  },
  notSignedUp: function() {
   var response = PlayerResponse.find({meteorUserId: Meteor.user().username}).count();
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

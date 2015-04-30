Template.links.helpers({
  notSignedIn:function() {
     return !(Meteor.user());
  },
  notSignedUp: function() {
   console.log("test");
   var response = PlayerResponse.find({meteorUserId: Meteor.user().username}).count();
   console.log("test2");
    console.log(response);
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

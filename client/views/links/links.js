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
  },
  isAdmin:function() {
      return Administrators.find({"username":Meteor.user().username}).count()>0
  },
  canViewDraft:function() {
    username = Meteor.user().username;
    if(Nominators.find({"name":username}).count() > 0)
        return true;
    if(Administrators.find({"username":username}).count()>0)
        return true;
    if(Meteor.user().username == "Spiller" || Meteor.user().username == "port" || Meteor.user().username == "dodsfall" || Meteor.user().username == "Nawse" || Meteor.user().username == "Xile" || Meteor.user().username == "Mikero")
        return true;
    return false;
  }
});

Template.links.events({
  'click #signupforleague' : function(event) {
     Session.set("pageToDisplay","signUpPage");
  },
  'click #viewSignups' : function(event) {
     Session.set("pageToDisplay","packetPage");
  },
  'click #editsignup' : function(event) {
     Session.set("pageToDisplay","editSignUpPage");
  },
  'click #viewDraft' : function(event) {
     Session.set("pageToDisplay","draftPage");
 },
 'click #viewTrade' : function(event) {
     Session.set("pageToDisplay","tradePage");
 }// put in a listener for a click in each div for each button
});

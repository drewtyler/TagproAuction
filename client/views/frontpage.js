Template.frontpage.helpers({
  homePage:function() {
    return (Session.get("pageToDisplay") == "homePage");
  },
  signUpPage:function() {
    return (Session.get("pageToDisplay") == "signUpPage");
  },
  editSignUpPage:function() {
    return (Session.get("pageToDisplay") == "editSignUpPage");
  },
  draftPage:function() {
    console.log("test");
    return (Session.get("pageToDisplay") == "draftPage");
  },
  packetPage:function() {
    return (Session.get("pageToDisplay") == "packetPage");
  },
  adminPage:function() {
    return (Session.get("pageToDisplay") == "adminPage");
  },
  tradePage:function() {
    return (Session.get("pageToDisplay") == "tradePage");
  },
  rosterPage:function() {
    return (Session.get("pageToDisplay") == "rosterPage");
  },
  waiversPage:function(){
    return (Session.get("pageToDisplay") == "waiversPage");
  },
  nav:function(){
   return Session.get("pageToDisplay");
  },
  warningMessage:function() {
    return (WarningMessage.find({}).count() > 0) ? WarningMessage.findOne().message : "";
  }
});

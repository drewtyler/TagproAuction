Template.popover.helpers({
  viewingPopup:function() {
    console.log(Session.get("playerToDisplay"));
    return (Session.get("playerToDisplay") != "N/A");
  },
  playerToDisplay :function(){
    return PlayerResponse.find({meteorUserId:Session.get("playerToDisplay")});
  }
});

Template.popover.events({
  'click .closePopup':function() {
     Session.set("playerToDisplay","N/A");
  }
});

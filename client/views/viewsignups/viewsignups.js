Template.viewsignups.helpers({
  allsignups:function() {
    return PlayerResponse.find({},{sort: {playername: 1}});
  },
  getPlayerPosition:function(position){
    if(position == "Primarily Offense") {
     return "O";
    }
    if(position == "Primarily Offense, but can play Defense") {
     return "O/D";
    }
    if(position == "Both Equally") {
     return "Both";
    }
    if(position == "Primarily Defense, but can play Offense") {
     return "D/O";
    }
    if(position == "Primarily Defense") {
     return "D";
    }
  }
});

Template.viewsignups.events({
  'click #home' : function(event) {
     Session.set("pageToDisplay","homePage");
  }
});

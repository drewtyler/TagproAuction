Template.viewsignups.helpers({
  allsignups:function() {
    return PlayerResponse.find({},{sort: {signupTime: 1}});
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
  },
  getColorOfPosition:function(position){
    if(position == "Primarily Offense") {
      return "blue;color:white";
    }
    if(position == "Primarily Offense, but can play Defense") {
     return "#1CA9C9";
    }
    if(position == "Both Equally") {
      return "purple;color:white";
    }
    if(position == "Primarily Defense, but can play Offense") {
     return "orange";
    }
    if(position == "Primarily Defense") {
      return "#CC3333;color:white";
    }
  },
  getHighestExperience:function(mltp, minorltp, nltpa, nltpb, eltp, usc, rltp, socl, cltp){
    if(mltp) {
     return "MLTP"
    }
    if(minorltp) {
     return "mLTP"
    }
    if(nltpa) {
     return "NLTP-A"
    }
    if(nltpb) {
     return "NLTP-B"
    }
    if(eltp) {
     return "ELTP"
    }
    if(usc) {
     return "USC"
    }
    if(rltp || socl || cltp) {
     return "Tourney League"
    }
    return "None"
  },
  getDay:function(day, avail) {
    if(avail) {
     return day;
    }
    return "-";
  },
  loadPopover:function(id){
   Session.set("playerToDisplay", this._id);
  },
  getCheck:function(checker){
    return checker ? "✓" : "X";
  }
});

Template.viewsignups.events({
  'click .more' : function() {
    Session.set("playerToDisplay", this.meteorUserId);
  },
  'click #home' : function(event) {
     Session.set("pageToDisplay","homePage");
  }

});

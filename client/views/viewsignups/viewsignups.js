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
    return "-"
  }
});

Template.viewsignups.events({
  'click #home' : function(event) {
     Session.set("pageToDisplay","homePage");
  }
});

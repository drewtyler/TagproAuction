Template.viewsignups.helpers({
  canEditBoard:function(){
    return (BoardHelpers.find({"username":Meteor.user().username}).count() > 0)
  },
  downloadAsCSV:function() {

  },
  allsignups:function() {
    return PlayerResponse.find({},{sort: {ranking: 1}});
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
      return "#DD4773";
    }
    if(position == "Primarily Offense, but can play Defense") {
      return "#ea9999";
    }
    if(position == "Both Equally") {
      return "#0041c2;color:white";
    }
    if(position == "Primarily Defense, but can play Offense") {
      return "#9fc5e8";
    }
    if(position == "Primarily Defense") {
      return "#8493ea";
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
    return checker ? "background-color:LightGreen" : "background-color:#FF6666";
  }
});

Template.viewsignups.events({
  'click .more' : function() {
    Session.set("playerToDisplay", this.meteorUserId);
  },
  'click #home' : function(event) {
    Session.set("pageToDisplay","homePage");
  },
  'click .submitPacketUpdate' : function() {
    idToFind = "#playerRanking" + this.meteorUserId;
    Meteor.call("updatePacketValue", "test", $(idToFind).val(), this.meteorUserId);
  },
  'click .downloadAsCSV':function() {
    getPlayerPosition = function(position) {
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
    var csv = "playername,oldplayername,redditname,proflink,mic,sunday,monday,tuesday,wednesday,thursday,friday,saturday,sixmajor,sevenmajor,eightmajor,ninemajor,tenmajor,elevenmajor,twelvemajor,sixminor,sevenminor,eightminor,nineminor,tenminor,elevenminor,twelveminor,arc,arcping,centra,centraping,sphere,sphereping,origin,originping,pi,piping,radius,radiusping,segment,segmentping,location,country,position,mltp,minorltp,nltpa,nltpb,eltp,usc,rltp,socl,cltp,experience,personalmessage\n";
    var valsToSpit = PlayerResponse.find({});
    var curPlayer;
    console.log("test");
    console.log(valsToSpit.count());
    valsToSpit.forEach(function(curPlayer) {
      console.log("test2");
      csv += curPlayer.playername + ",";
      csv += curPlayer.oldplayername + ",";
      csv += curPlayer.redditname + ",";
      csv += curPlayer.proflink + ",";
      csv += curPlayer.mic + ",";
      csv += curPlayer.sunday + ",";
      csv += curPlayer.monday + ",";
      csv += curPlayer.tuesday + ",";
      csv += curPlayer.wednesday + ",";
      csv += curPlayer.thursday + ",";
      csv += curPlayer.friday + ",";
      csv += curPlayer.saturday + ",";
      csv += curPlayer.sixmajor + ",";
      csv += curPlayer.sevenmajor + ",";
      csv += curPlayer.eightmajor + ",";
      csv += curPlayer.ninemajor + ",";
      csv += curPlayer.tenmajor + ",";
      csv += curPlayer.elevenmajor + ",";
      csv += curPlayer.twelvemajor + ",";
      csv += curPlayer.sixminor + ",";
      csv += curPlayer.sevenminor+ ",";
      csv += curPlayer.eightminor + ",";
      csv += curPlayer.nineminor + ",";
      csv += curPlayer.tenminor + ",";
      csv += curPlayer.elevenminor + ",";
      csv += curPlayer.twelveminor + ",";
      csv += curPlayer.arc + ",";
      csv += curPlayer.arcping + ",";
      csv += curPlayer.centra + ",";
      csv += curPlayer.centraping + ",";
      csv += curPlayer.sphere + ",";
      csv += curPlayer.sphereping + ",";
      csv += curPlayer.origin + ",";
      csv += curPlayer.originping + ",";
      csv += curPlayer.pi + ",";
      csv += curPlayer.piping + ",";
      csv += curPlayer.radius + ",";
      csv += curPlayer.radiusping + ",";
      csv += curPlayer.segment + ",";
      csv += curPlayer.segmentping + ",";
      csv += curPlayer.location + ",";
      csv += curPlayer.country + ",";
      csv += getPlayerPosition(curPlayer.position) + ",";
      csv += curPlayer.mltp + ",";
      csv += curPlayer.minorltp + ",";
      csv += curPlayer.nltpa + ",";
      csv += curPlayer.nltpb + ",";
      csv += curPlayer.eltp + ",";
      csv += curPlayer.usc + ",";
      csv += curPlayer.rltp + ",";
      csv += curPlayer.socl + ",";
      csv += curPlayer.cltp + ",";
      csv += curPlayer.experience + ",";
      csv += curPlayer.personalmessage + "\n";
    });
    console.log(csv);
    $("#csvDownload").attr("href", "data:Application/octet-stream," + encodeURIComponent(csv));
    $("#csvDownload")[0].click();
    console.log("testdone");
  }

});

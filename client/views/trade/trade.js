Template.trade.helpers({
    getPendingTrades:function() {
        return PendingTrades.find({status:"PendingCaptainApproval",proposedCaptain:Meteor.user().username});
    },
    getallPlayersInRoster:function() {
        myTeamName = TeamNames.findOne({"captain":Meteor.user().username}).teamname;
        return TeamData.find({"teamname":myTeamName}, {sort:{order:1}});
    },
    isCaptain:function(playername) {
        var playerdata = TeamData.findOne({name:playername}).order;
        return (playerdata == 1);
    },
    captainlist:function() {
        myname = Meteor.user().username;
        return TeamNames.find({"captain":{$ne:myname}});
    },
    getallPlayersInTheirRoster : function() {
        var captainToView = Session.get("tradeCaptainToView");
        if(captainToView == "Select" || captainToView == "Select Captain") {
            return false;
        }
        myTeamName = TeamNames.findOne({"captain":captainToView}).teamname;
        return TeamData.find({"teamname":myTeamName}, {sort:{order:1}});
    }
});

Template.trade.events({
    'change #proposedCaptain' : function() {
        Session.set("tradeCaptainToView", $("#proposedCaptain").val());
    }
});

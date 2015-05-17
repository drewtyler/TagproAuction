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
    },
    'submit':function(event) {
        tgt = event.tgt;
        tradeProposal = {};
        myName = Meteor.user().username;
        theirName = $("#proposedCaptain").val();

        tradeProposal.proposingCaptain = myName;
        tradeProposal.proposedCaptain = theirName;

        if(theirName == "Select" || theirName == "Select Captain") {
            // TODO: "You can't do that";
            return false;
        }
        myTeamName = TeamNames.findOne({"captain":myName}).teamname;
        theirTeamName = TeamNames.findOne({"captain":theirName}).teamname;
        myPlayerCount = TeamData.find({"teamname":myTeamName,"name":{$ne:""}}).count();
        theirPlayerCount = TeamData.find({"teamname":theirTeamName,"name":{$ne:""}}).count();

        tradeProposal.proposingPlayers = [];
        tradeProposal.proposedPlayers = [];
        for(curplayer = 2; curplayer <= myPlayerCount; curplayer++) {
            if($(tgt).find('[name=myplayer' + curplayer + ']').is(':checked')) {
                tradeProposal.proposingPlayers.push(curplayer);
            }
        }
        for(curplayer = 2; curplayer <= myPlayerCount; curplayer++) {
            if($(tgt).find('[name=theirplayer' + curplayer + ']').is(':checked')) {
                tradeProposal.proposedPlayers.push(curplayer);
            }
        }

        tradeProposal.proposingAmount = $(tgt).tagCoinsToGive.value;
        tradeProposal.proposedAmount = $(tgt).tagCoinsToReceive.value;
        tradeProposal.reasoning = $(tgt).reasoning.value;
        tradeProposal.message = $(tgt).message.value;

        console.log(tradeProposal);
        return false;
        // know opposing captain and can figure out opposing team name/my team name
        // then gotta loop through each player on each team and see if that player is selected
        // then add in messages and put it in the db
    }
});

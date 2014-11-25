AuctionData = new Mongo.Collection("auctiondata");
TeamData = new Mongo.Collection('teams');
TeamNames = new Mongo.Collection('teamnames');
Divisions = new Mongo.Collection('divisions');
DraftablePlayers = new Mongo.Collection('players');
Messages = new Mongo.Collection('messages');
BidHistory = new Mongo.Collection('bids');
CaptainData = new Mongo.Collection('captains');

if (Meteor.isClient) {
  Session.setDefault("time", 0);
  Meteor.setInterval(function() {
    Session.set('time', new Date().getTime());
  }, 100);

  Template.rosters.helpers(
    {
      divisions : function() {
        return Divisions.find({});
      },
      teams : function(division) {
        return TeamNames.find({"division" : division});
      },
      players : function(teamname) {
        return TeamData.find({"teamname" : teamname}, {sort : {order : 1}});
      }
    }
  );

  Template.admin.events({
    'click button': function () {
      Meteor.call("toggleState", "admin", 0);
    }
  });


  Template.display_time.helpers(
    {
      time : function() {
        var curtime = Session.get('time');
        var serverTime = AuctionData.findOne().nextExpiryDate;
        var secsLeft = Math.ceil((serverTime - curtime)/100)/10;
        if(secsLeft < 0)
          Meteor.call("checkForToggle");
        else
          return secsLeft;
      },
      currentNominatingPlayer : function() {
          return AuctionData.findOne().Nominator;
      },
      personBeingBidOn : function() {
          return AuctionData.findOne().currentPlayer;
      },
      bidAmount :function()
      {
          return AuctionData.findOne().currentBid;
      },
      lastBidder : function()
      {
        return AuctionData.findOne().lastBidder;
      },
      isNominationTime: function()
      {
        return AuctionData.findOne().State == "Nominating";
      },
      isTurnToNominate: function()
      {
        return true;
      }
    }
  );

  Template.display_bidding_options.helpers({
    isCaptain: function() {
      return true;
    },
    isNominationTime: function() {
      return AuctionData.findOne().State == "Nominating";
    }
  });

  Template.messages.helpers({
    messages: function() {
      return Messages.find({}, {sort: {createdAt: -1}});
    }
  });

  Template.display_bidding_options.events(
    {
      'submit .bid-on-player' : function(event)
      {
        console.log("submitted bid");
        var bid = event.target.amount.value;
        if(!bid) {
          bid = 0;
        }
        console.log("amount" + bid);
        Meteor.call("acceptBid","asdf", bid, new Date().getTime());
        return false;
      }
    }
  );
  Template.display_time.events(
    {
      'submit .nominate-player' : function(event)
      {
        var player = event.target.player.value;
        var bid = event.target.amount.value;
        if(!bid) {
          bid = 0;
        }
        Meteor.call("toggleState", player, bid);
        return false;
      }
    }
  );
  Template.messages.events(
    {
      'submit .new-post' : function(event)
      {
        var text = event.target.text.value;
        Meteor.call("insertMessage", text, new Date());
        event.target.text.value = "";
        return false;
      }
    }
  );

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

Meteor.methods({
  insertMessage:function(text, createdAt) {
    if(Meteor.isServer)
      Messages.insert({text:text,createdAt:new Date()});
  },
  toggleState: function(playerNominated, bid) {
    if(Meteor.isServer) {
      // todo: add nominator here
      if(AuctionData.findOne().State == "Nominating") {
        console.log("nominated - " + playerNominated + " - " + bid);
        AuctionData.remove({});
        return AuctionData.insert({State: "Bidding", nextExpiryDate: new Date().getTime()+30000, currentBid: bid, currentPlayer: playerNominated, lastBidder: "placeholder until loginbuttons done"});
      } else {
        console.log("end bidding");
        // todo: commit auction data here to the captains & teams data collections before toggling
        AuctionData.remove({});
        return AuctionData.insert({State: "Nominating", nextExpiryDate: new Date().getTime()+30000});
      }
    }
  },
  checkForToggle: function() {
    if(Meteor.isServer) {
      console.log("Checking for toggle from client");
      var currentState = AuctionData.findOne();
      if(currentState.State == "Bidding") {
        if(currentState.nextExpiryDate < new Date().getTime()) {
          Meteor.call('toggleState');
        }
      }
      return true;
    }
  },
  acceptBid: function(bidder, amount, clienttime) {
    if(Meteor.isServer) {
      console.log("acceptBid: Called acceptBid");
      var state = AuctionData.findOne({});
			if(state.State == "Nominating") {
        console.log("acceptBid: Can't bid right now");
				return false;
			}
      console.log("acceptBid: Got State & we're bidding");
			var bids = BidHistory.findOne({ $query: {}, $orderby: {createdAt: -1}});
      console.log("acceptBid: Got bids");
      if(!bids) {
        console.log("acceptBid: no previous bids");
				BidHistory.insert({bidder: bidder, amount: amount, player: state.currentPlayer, createdAt: clienttime});
        AuctionData.update({State: "Bidding"}, {$set: {currentBid: amount}});
				if(state.nextExpiryDate - clienttime < 10000) {
          AuctionData.update({State: "Bidding"}, {$set: {nextExpiryDate: new Date(clienttime+10000).getTime()}});
				}
        console.log("acceptBid: returning true");
        return true;
			}
      console.log("acceptBid: previous bids");
      if(parseInt(state.currentBid) < parseInt(amount)) {
        console.log("acceptBid: good amount");
        if(parseInt(state.nextExpiryDate) > parseInt(clienttime)) {
          console.log("acceptBid: nextExpiryDate good");
          BidHistory.insert({
            bidder: bidder,
            amount: amount,
            player: state.currentPlayer,
            createdAt: clienttime
          });
          AuctionData.update({State: "Bidding"}, {$set: {currentBid: amount}});
          console.log("acceptBid: inserted bid");
          if(state.nextExpiryDate - clienttime < 10000) {
            AuctionData.update({State: "Bidding"}, {$set: {nextExpiryDate: new Date(clienttime+10000).getTime()}});
          }
          console.log("acceptBid: Updated Auction status. returning True");
          return true;
        } else {
          console.log("acceptBid: too late: "+ state.nextExpiryDate + " vs " + clienttime);
          return false;
        }
      } else {
        console.log("acceptBid: bad amount: " + state.currentBid + " vs " + amount + ".");
        return false;
      }
    }
  }
});

if (Meteor.isServer) {
  Meteor.startup(function () {
    // Clear state
    AuctionData.remove({});
    TeamData.remove({});
    Divisions.remove({});
    TeamNames.remove({});

    // Load state
    AuctionData.insert({State: "Nominating", nextExpiryDate: new Date().getTime()+100000, Nominator: "asdf"});
    var initialRosterData = {};
    initialRosterData = JSON.parse(Assets.getText('teams.json'));
    for(i = 0; i < initialRosterData.length; i++) {
      var obj = initialRosterData[i];
      TeamData.insert(obj);
    }
    var divisions = {};
    divisions = JSON.parse(Assets.getText('divisions.json'));
    for(i = 0; i < divisions.length; i++) {
      var obj = divisions[i];
      Divisions.insert(obj);
    }
    var teamnames = {};
    teamnames = JSON.parse(Assets.getText('teamnames.json'));
    for(i = 0; i < teamnames.length; i++) {
      var obj = teamnames[i];
      TeamNames.insert(obj);
    }
    return true;
  });
}

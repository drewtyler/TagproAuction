AuctionData = new Mongo.Collection("auctiondata");
TeamData = new Mongo.Collection('teams');
TeamNames = new Mongo.Collection('teamnames');
Divisions = new Mongo.Collection('divisions');
DraftablePlayers = new Mongo.Collection('players');
Messages = new Mongo.Collection('messages');
BidHistory = new Mongo.Collection('bids');
Nominators = new Mongo.Collection('nominators');

Meteor.setServerTime = function() {
  Meteor.call("getServerTime", function(error, serverMS) {
    var localMS = new Date().getTime();
    var serverOffset = serverMS - localMS;
    console.log('Meteor.setServerTime()', {serverMS: serverMS, localMS:localMS, serverOffset: serverOffset});
    Session.set('serverTimeOffset', serverOffset);
  });
};
if (Meteor.isClient) {
  Meteor.startup(function() {
    Session.setDefault("serverTimeOffset", 0);
    Session.setDefault("time", new Date().getTime());
    Meteor.setServerTime();
    Meteor.clearInterval(Meteor.intervalUpdateTimeDisplayed);
    Meteor.intervalUpdateTimeDisplayed = Meteor.setInterval(function() { Session.set('time', new Date().getTime()); }, 50);
    Meteor.clearInterval(Meteor.intervalUpdateServerTime);
    Meteor.intervalUpdateServerTime = Meteor.setInterval(function() { Meteor.setServerTime(); }, 300000);
  });

  // Need usernames
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

  // Rosters
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

  // display_time (aka bid status)
  Template.display_time.events(
    {
    }
  );
  Template.display_time.helpers(
    {
      time : function() {
        var curtime = Session.get('time') + Session.get('serverTimeOffset');
        var remainingTime = AuctionData.findOne().nextExpiryDate;
        var secsLeft = Math.ceil((remainingTime - curtime)/100)/10;
        if(secsLeft < 0)
          Meteor.call("checkForToggle");
        else {
          formattedSeconds = String(secsLeft)
          if(parseInt(secsLeft) == secsLeft) {
            formattedSeconds += ".0";
          }
          if(secsLeft < 10) {
            formattedSeconds = "0"+formattedSeconds;
          }
          return formattedSeconds;
        }
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
        if(!Meteor.userId())
          return false;
        return (AuctionData.findOne().Nominator == Meteor.user().username);
      }
    }
  );

  // Bidding options
  Template.display_bidding_options.helpers({
    isCaptain: function() {
      if(!Meteor.userId())
        return false;
      return (TeamData.findOne({"name" : Meteor.user().username, "captain" : true}))
    },
    isNominationTime: function() {
      return AuctionData.findOne().State == "Nominating";
    },
    isTurnToNominate: function()
      {
        if(!Meteor.userId())
          return false;
        return (AuctionData.findOne().Nominator == Meteor.user().username);
      }
  });

  Template.display_bidding_options.events(
    {
      'submit .bid-on-player' : function(event)
      {
        var bid = event.target.amount.value;
        if(!bid) {
          bid = parseInt(AuctionData.findOne().currentBid) + 1;
        }
        Meteor.call("acceptBid", Meteor.user().username, bid, new Date().getTime());
        return false;
      },
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

  // Messages
  Template.messages.helpers({
    messages: function() {
      return Messages.find({}, {sort: {createdAt: -1}});
    },
    canSendMessage: function() {
      if(!Meteor.userId())
        return false;
      return true;
    }
  });
  Template.messages.events(
    {
      'submit' : function(event)
      {
        console.log("Got a new message from ", Meteor.user().username);
        console.log("Message text:", event.target.text.value);
        if(!Meteor.userId()) {
         return false;
        }
        var text = Meteor.user().username + ": " + event.target.text.value;
        Meteor.call("insertMessage", text, new Date(), 0, 1);
        event.target.text.value = "";
        return false;
      }
    }
  );
}

Meteor.methods({
  getAuctionStatus:function() {
    return AuctionData.findOne();
  },
  insertMessage:function(text, createdAt, winningBid, isTextMessage) {
    if(Meteor.isServer)
      var texttowrite = "[" + createdAt.toLocaleTimeString() + "] " + text;
      Messages.insert({text:texttowrite,createdAt:new Date(),winningBid:winningBid,isTextMessage:isTextMessage});
  },
  toggleState: function(playerNominated, bid) {
    if(Meteor.isServer) {
      // Get current state
      var state = AuctionData.findOne();

      if(state.State == "Nominating") {
        if(TeamNames.findOne({captain:state.Nominator}).money < bid) {
         return false;
        }
        // Log message
        Meteor.call("insertMessage", state.Nominator + " nominates " + playerNominated + " with an initial bid of " + bid, new Date(), 0, 0);

        // Start bidding baby
        AuctionData.remove({});
        return AuctionData.insert({State: "Bidding", nextExpiryDate: new Date().getTime()+30000, currentBid: bid, currentPlayer: playerNominated, lastBidder: state.Nominator});
      }
      else
      {
        var team = TeamNames.findOne({"captain" : state.lastBidder});
        var playerWon = state.currentPlayer;

        // ALL CAPS-specific thing here
        if(state.lastBidder == "YOSSARIAN") {
          playerWon = playerWon.toUpperCase();
        }
        var playerOrder = parseInt(team.count) + 1;

        // Put him in the roster
        TeamData.update({"teamname": team.teamname, "order" : playerOrder}, {$set: {"name": playerWon, "cost": state.currentBid}});
        TeamNames.update({"teamname": team.teamname}, {$set: {"count":playerOrder, "money":(team.money-state.currentBid)}});
        // Log message
        var text = state.lastBidder + " wins " + playerWon + " for " + state.currentBid + "!";
        Meteor.call("insertMessage", text, new Date(), 1, 0);

        // Reset state
        var captains = Nominators.find({nominated:false}).fetch();
        var randskip = Math.floor(Math.random() * captains.length);
        var nominator = captains[randskip];
        Nominators.update({name:nominator.name}, {$set:{nominated:true}});

        AuctionData.remove({});
        return AuctionData.insert({State: "Nominating", nextExpiryDate: new Date().getTime()+10000, Nominator: nominator.name});
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
      // Gotta be logged in. Just precautionary.
      if(!Meteor.userId()) {
        console.log("acceptBid: no user");
        return false;
      }
      else
      {
        console.log("acceptBid: bid from " + Meteor.user().username);
      }

      // Check state of auction
      var state = AuctionData.findOne({});
      if(state.State == "Nominating") {
        console.log("acceptBid: Can't bid right now");
				return false;
			}

      // Alright let's check this thang out.
      console.log("acceptBid: Got State & we're bidding");
      // First, is the bid enough?
      if(parseInt(state.currentBid) < parseInt(amount)) {
        // K cool, does the player have this much money?
        var bidamt = TeamNames.findOne({captain:bidder}).money;
        if(amount < bidamt) {
          // Cool, he does. Is it in time?
          console.log("acceptBid: good amount");
          if(parseInt(state.nextExpiryDate) > parseInt(clienttime)) {
            // Sweet it was. Let's mark it down!
            console.log("acceptBid: nextExpiryDate good");
            if(!(state.lastBidder == bidder)) {
              BidHistory.insert({
                bidder: bidder,
                amount: amount,
                player: state.currentPlayer,
                createdAt: clienttime
              });
              AuctionData.update(
                {State: "Bidding"},
                {$set: {currentBid: amount, lastBidder: bidder}}
              );
              Meteor.call("insertMessage",
                          bidder + " bids " + amount + " on " + AuctionData.findOne({}).currentPlayer,
                          new Date(), 0, 0);
              console.log("acceptBid: inserted bid");

              // Do we need to give some time back?
              if(state.nextExpiryDate - new Date().getTime() < 10000) {
                AuctionData.update({State: "Bidding"}, {$set: {nextExpiryDate: new Date().getTime()+10000}});
              }
              return true;
            } else {
               console.log("why would you bid 2x in a row?")
               return false;
            }
          } else {
            console.log("acceptBid: too late: "+ state.nextExpiryDate + " vs " + clienttime);
          }
        }
        else {
          console.log("acceptBid: you outta money homie.");
        }
      } else {
        console.log("acceptBid: bad amount: " + state.currentBid + " vs " + amount + ".");
      }
    }
    return false;
  }
});

if (Meteor.isServer) {
  Meteor.startup(function () {
    // Clear state
    AuctionData.remove({});
    TeamData.remove({});
    Divisions.remove({});
    TeamNames.remove({});
    Messages.remove({});
    Nominators.remove({});

    // Load state
    var initialRosterData = {};
    initialRosterData = JSON.parse(Assets.getText('nominations.json'));
    for(i = 0; i < initialRosterData.length; i++) {
      var obj = initialRosterData[i];
      Nominators.insert(obj);
    }

    var captains = Nominators.find({nominated:false}).fetch();
    var randskip = Math.floor(Math.random() * captains.length);
    var nominator = captains[randskip];
    Nominators.update({name:nominator.name}, {$set:{nominated:true}});

    AuctionData.insert({State: "Nominating", nextExpiryDate: new Date().getTime()+100000, Nominator: nominator.name});

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
  Meteor.methods({
     getServerTime: function () {
        var _time = (new Date).getTime();
        return _time;
     }
  });
}

AuctionData = new Mongo.Collection("auctiondata");
PausedAuction = new Mongo.Collection("pauseddata");
TeamData = new Mongo.Collection('teams');
TeamNames = new Mongo.Collection('teamnames');
Divisions = new Mongo.Collection('divisions');
DraftablePlayers = new Mongo.Collection('players');
Messages = new Mongo.Collection('messages');
BidHistory = new Mongo.Collection('bids');
Nominators = new Mongo.Collection('nominators');
Keepers = new Mongo.Collection('keepers');
NextNominator = new Mongo.Collection('nextnominator');
CurrentPick = new Mongo.Collection('currentpick');
Admins = new Mongo.Collection("admin");
AuctionStatus = new Mongo.Collection("auctionstatus");
AuctionLock = new Mongo.Collection("auctionlock");
PreviousAuctionData = new Mongo.Collection("previousauctiondata")

var bidTime = 30000;
var additionTime = 10000;
var lock = 0;

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
    Session.setDefault("auctionStatus", "Waiting to start");
    Session.setDefault("nominationTime", false);
    Session.setDefault("bidAccepted", false);
    Session.setDefault("myTurnToNominate", false);
    Meteor.setServerTime();
    Meteor.clearInterval(Meteor.intervalUpdateTimeDisplayed);
    Meteor.intervalUpdateTimeDisplayed = Meteor.setInterval(function() { Session.set('time', new Date().getTime()); }, 50);
    Meteor.clearInterval(Meteor.intervalUpdateServerTime);
    Meteor.intervalUpdateServerTime = Meteor.setInterval(function() { Meteor.setServerTime(); }, 300000);

    Meteor.subscribe("divisions");
    Meteor.subscribe("teamnames");
    Meteor.subscribe("teams");

    Meteor.subscribe("auctiondata");
    Meteor.subscribe("auctionstatus");
    Meteor.subscribe("nominators");
    Meteor.subscribe("currentpick");

    Meteor.subscribe("messages");
    Meteor.subscribe("bids");
    Meteor.subscribe("previousauctiondata");
    Meteor.subscribe("keepers");

    //console.log(Messages.find({}).fetch());

  });

  // Need usernames
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
  // Rosters

  Template.renderteam.helpers({
    teams : function(division) {
      return TeamNames.find({"division" : division}, {fields:{teamname:1, keepermoney:1, money:1, division:1}, sort:{order:1}});
    },
    teamID: function(teamname) {
      return teamname.split(" ").join("_");
    },
    players : function(teamname) {
      return TeamData.find({"teamname" : teamname}, {sort : {order : 1}, fields:{captain:1, cocaptain:1, mltp:1, name:1, cost:1}});
    },
    inRedDivision : function(division) {
      if(division == "Central" || division == "Pacific") {
        return "rgb(235, 126, 126)";
      }
      else {
        return "rgb(134, 198, 230)";
      }
    }

  })

  Template.renderplayers.helpers({
      players : function(teamname) {
        return TeamData.find({"teamname" : teamname}, {sort : {order : 1}});
      }
  })

  Template.rosters.helpers(
    {
      divisions : function() {
        return Divisions.find({},{sort:{order:1}});
      },
      teams : function(division) {
        return TeamNames.find({"division" : division}, {sort:{order:1}});
      },
      teamID: function(teamname) {
        return teamname.split(" ").join("_");
      },
      players : function(teamname) {
        return TeamData.find({"teamname" : teamname}, {sort : {order : 1}});
      },
      inRedDivision : function(division) {
        if(division == "Central" || division == "Pacific") {
          return "rgb(235, 126, 126)";
        }
        else {
          return "rgb(134, 198, 230)";
        }
      },
  });

  Template.get_funds.helpers(
  {
    getBalance: function () {
      if( Meteor.user() !== undefined && Meteor.userId()) {
        return TeamNames.findOne({"captain":Meteor.user().username}).money;
      }
      return false;
    },
    getKeepermoney: function () {
      if( Meteor.user() !== undefined && Meteor.userId()) {
        return TeamNames.findOne({"captain":Meteor.user().username}).keepermoney;
      }
      return false;
    },
    isCaptain: function() {
      if(Meteor.user() !== undefined && Meteor.userId())
        return (TeamData.findOne({"name":Meteor.user().username, "captain" : true}))
      return false;
    },
  });

  // display_time (aka bid status)
  Template.display_time.helpers(
    {
      time : function() {
        if(AuctionData.findOne({}) !== undefined) {
        var curtime = Session.get('time') + Session.get('serverTimeOffset');
        var remainingTime = AuctionData.findOne({}).nextExpiryDate;
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
      }
      },
      currentNominatingPlayer : function() {
        if(AuctionData.findOne({}) !== undefined)
          return AuctionData.findOne({}).Nominator;
      },
      personBeingBidOn : function() {
        if(AuctionData.findOne({}) !== undefined)
          return AuctionData.findOne({}).currentPlayer;
      },
      bidAmount :function()
      {
        if(AuctionData.findOne({}) !== undefined)
          return AuctionData.findOne({}).currentBid;
      },
      lastBidder : function()
      {
        if(AuctionData.findOne({}) !== undefined)
          return AuctionData.findOne({}).lastBidder;
      },
      isNominationTime: function()
      {
        if(AuctionData.findOne({}) !== undefined) {
          auction_state = AuctionData.findOne({}).State;
          Session.set("nominationTime",  auction_state == "Nominating");
          return auction_state == "Nominating";
        }
      },
      isTurnToNominate: function()
      {
        if(!Meteor.userId())
          return false;
        if(AuctionData.findOne({}) !== undefined) {
          nominator = AuctionData.findOne({}).Nominator;
          Session.set("myTurnToNominate", Meteor.user().username == nominator);
          return (nominator == Meteor.user().username);
        }
      },
      auctionPaused : function() {
        status = AuctionStatus.findOne({}).status;
        return (status == "Paused" || status == "Not Started");
    },
      auctionMessage: function() {
        status = AuctionStatus.findOne({}).status;
        if(status == "Paused")
          return "Auction is paused"
        else
          return "Auction has not started"
      }
  });

  Template.display_bidding_options.rendered = function() {
    if(Session.get("myTurnToNominate"))
      document.getElementById('my-nomination').play();
    else if(Session.get("nominationTime"))
      document.getElementById('nomination').play();
    else if(Session.set("canBid"))
      document.getElementById('nomination').play();
  }


  // Bidding options
  Template.display_bidding_options.helpers({
    isCaptain: function() {
      if(!Meteor.userId())
        return false;
      //console.log(Meteor.user(), Meteor.user().username);
      return (TeamData.findOne({"name" : Meteor.user().username, "captain" : true}))
    },
    isNominationTime: function() {
      if(AuctionData.findOne({}) !== undefined)
        return AuctionData.findOne({}).State == "Nominating";
    },
    isTurnToNominate: function()
      {
        if(!Meteor.userId())
          return false;
        return (AuctionData.findOne({}).Nominator == Meteor.user().username);
      },
      canBid: function() {
        if(Meteor.userId() == undefined) {
          return false;
        }
        else if(AuctionData.findOne({}).lastBidder == Meteor.user().username) {
          return false;
        }
        return true;
      },
      sufficientFunds: function()
      {
        if(Meteor.userId() !== undefined && Meteor.user() !== undefined && AuctionData.findOne({}) !== undefined) {
          var team = TeamNames.findOne({"captain":Meteor.user().username});
          var balance = parseInt(team.money);
          //console.log(team, keepers, balance);
          if(Meteor.call("isKeeper", team.captain, AuctionData.findOne({}).currentPlayer)) {
              balance += parseInt(team.keepermoney);
          }
          var minBid = parseInt(AuctionData.findOne({}).currentBid)+1;

          if(balance < minBid) {
            return false;
          }
          else {
            return true;
          }
        }
        return false;
      },
      bids: function()
      {
        var bids = [];
        var currentBid = parseInt(AuctionData.findOne({}).currentBid);
        bids.push({'bid':currentBid+1});
        bids.push({'bid':currentBid+2});
        bids.push({'bid':currentBid+5});
        bids.push({'bid':currentBid+10});
        return bids;
      },




  });

  Template.admin.events({
    'click .undo-bid' : function(event) {
      console.log("Removing last bid")
      Meteor.call("removeLastBid", Meteor.user().username);
    },
    'click .pause-auction' : function(event) {
      console.log("Pausing auction")
      Meteor.call("pauseAuction", Meteor.user().username);
    },
    'click .resume-auction' : function(event) {
      console.log("Resuming auction")
      Meteor.call("resumeAuction", Meteor.user().username);
    },
    'click .start-auction' : function(event) {
      console.log("Start auction")
      Meteor.call("startAuction", Meteor.user().username);
    },
    'click .undo-nomination' : function(event) {
      Meteor.call("undoNomination", Meteor.user().username);
    },
    'submit .add-nomination' : function(event) {
      var name = event.target.player.value;
      Meteor.call("toggleState", name, 0);
      return false;
    }    
  })

  Template.admin.helpers({
    admin : function() {
      if(Meteor.user() !== undefined) {
        admins = ["Dino", "Spiller", "eagles.", "Troball", "Bull"];
        if(admins.indexOf(Meteor.user().username) >= 0) {
          return true;
        }
      }
      return false;
    },
  });

  Template.display_bidding_options.events(
    {
      'submit .bid-on-player' : function(event)
      {
        var bid = parseInt(event.target.amount.value);
        Meteor.call("acceptBid", Meteor.user().username, bid, new Date().getTime());
        new Audio('sound/bid.mp3').play();
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
      },
      'click .bid-button' : function(event) {
        var bid = parseInt(event.currentTarget.getAttribute('amount'));
        Meteor.call("acceptBid", Meteor.user().username, bid, new Date().getTime());
        new Audio('sound/bid.mp3').play();
        return false;
      }
    }
  );


  Template.newmessage.helpers({
    newMessage: function(limit) {
      return Messages.find({}, {sort: {createdAt: -1}, limit:1});
    }
  });

  Template.getmessages.helpers({
    lastXmessages: function(limit) {
      return Messages.find({}, {sort: {createdAt: -1}, limit:parseInt(limit)});
    },
    admin : function() {
      if(Meteor.user() !== undefined) {
        admins = ["Dino", "Spiller", "eagles.", "Troball", "Bull"];
        if(admins.indexOf(Meteor.user().username) >= 0) {
          return true;
        }
      }
      return false;
    },
    messageColor: function(messageType) {
      // Class to add to the message (for coloring or sending information to the client)
      if(messageType == "winningBid") {
        return "winningbid";
      }
      else if(messageType == "bid") {
        return "list-group-item-warning";
      }
      else if(messageType == "nomination") {
        return "list-group-item-info";
      }
      else if(messageType == "animate") {
        return "hidden winningTeam";
      }
      else if(messageType == "started") {
        return "list-group-item-info";
      }
      else if(messageType == "paused") {
        return "list-group-item-danger";
      }
      else {
        return "";
      }
    }
  });
  // Messages
  Template.messages.helpers({
    messages: function() {
      return Messages.find({}, {sort: {createdAt: -1}, limit:25});
    },
    getMessageText: function() {
      return Messages.findOne({}, {sort: {createdAt: -1}}).text;
    },
    canSendMessage: function() {
      if(!Meteor.userId())
        return false;
      return true;
    },
    admin : function() {
      if(Meteor.user() !== undefined) {
        admins = ["Dino", "Spiller", "eagles.", "Troball", "Bull"];
        if(admins.indexOf(Meteor.user().username) >= 0) {
          return true;
        }
      }
      return false;
    },
    messageColor: function(messageType) {
      // Class to add to the message (for coloring or sending information to the client)
      if(messageType == "winningBid") {
        return "list-group-item-success";
      }
      else if(messageType == "bid") {
        return "list-group-item-warning";
      }
      else if(messageType == "nomination") {
        return "list-group-item-info"
      }
      else if(messageType == "animate") {
        return "hidden winningTeam"
      }
      else {
        return "";
      }
    }
  });
  Template.messages.events(
    {
      'submit' : function(event)
      {
        //console.log("Got a new message from ", Meteor.user().username);
        //console.log("Message text:", event.target.text.value);
        if(!Meteor.userId()) {
         return false;
        }
        var text = Meteor.user().username + ": " + event.target.text.value;
        Meteor.call("insertMessage", text, new Date(), "textMessage");
        event.target.text.value = "";
        return false;
      },
    'click .delete' : function() {
      Meteor.call("removeMessage", this._id);
    },
  });
}

Meteor.methods({
  removeMessage : function(messageid) {
    Messages.remove(messageid);
  },
  isAdmin: function(player) {
    admins = ["Dino", "Spiller", "eagles.", "Troball", "Bull"];
    if(admins.indexOf(player) >= 0)
      return true;
    return false;
    },
  undoNomination : function(person) {
    ad = AuctionData.findOne({});
    if(ad.Nominator !== undefined) {
      nominator = ad.Nominator;
      AuctionData.remove({});
      AuctionData.insert({State: "Nominating", nextExpiryDate: new Date().getTime()+bidTime, Nominator: nominator});
      var text = "Last nomination removed by " + person;
      Meteor.call("insertMessage", text, new Date());
    }
  },
  removeLastBid : function(person) {
    if(Meteor.isServer) {
      auctionState = AuctionStatus.find({}).state;
      if(auctionState !== "Paused") {
        var currentState = AuctionData.findOne();
        var lastbid = BidHistory.findOne({"player": currentState.currentPlayer},{sort:{"createdAt":-1}});
        BidHistory.remove({"_id" : lastbid._id});
        var lastbid2 = BidHistory.findOne({"player":currentState.currentPlayer},{sort:{"createdAt":-1}});
        AuctionData.update(
        {State: "Bidding"},
        {$set: {currentBid: lastbid2.amount, lastBidder: lastbid2.bidder, nextExpiryDate: new Date().getTime()+bidTime}}
        );
        var text = "Last bid removed by " + person;
        Meteor.call("insertMessage", text, new Date());
      }
    }
  },
  resumeAuction : function (person) {
      pa = PausedAuction.findOne();
      pa.nextExpiryDate = new Date().getTime() + 20000;
      delete pa._id;
      AuctionStatus.update({}, {"status":"Live"});
      AuctionData.remove({});
      AuctionData.insert(pa);
      Meteor.call("insertMessage", "Auction resumed by "+person, new Date(), "started");
  },
  pauseAuction : function(person) {
      ad = AuctionData.findOne();
      secondsLeft = ad.nextExpiryDate - new Date().getTime();
      delete ad._id;
      PausedAuction.insert(ad);
      PausedAuction.update({}, {$set: {"secondsLeft": secondsLeft}});
      Meteor.call("insertMessage", "Auction paused by "+person, new Date(), "paused");
      AuctionStatus.update({}, {"status":"Paused"});
      AuctionData.remove({})
  },
  pickNominator : function() {
      var captains = Nominators.find({nominated:false}).fetch();
      var randskip = Math.floor(Math.random() * captains.length);
      var nominator = captains[randskip];
      nominator = {"name":"eagles."};
      var text = "Waiting for "+nominator.name +" to nominate pick "+CurrentPick.findOne({}).pick+" of the draft.";
      Meteor.call("insertMessage", text, new Date());
      return nominator;
  },
  startAuction: function(person) {
    console.log("Starting auction");
    nominator = Meteor.call('pickNominator');
    Nominators.update({name:nominator.name}, {$set:{nominated:true}});
    AuctionData.remove({});
    AuctionData.insert({State: "Nominating", nextExpiryDate: new Date().getTime()+bidTime, Nominator: nominator.name});
    AuctionStatus.update({}, {"status":"Live"});
    Meteor.call("insertMessage", "Auction started by "+person, new Date(), "started");
  },
  getAuctionStatus:function() {
    return AuctionData.findOne();
  },
  insertMessage:function(text, createdAt, messageType) {
    if(Meteor.isServer)
      var texttowrite = "[" + createdAt.toLocaleTimeString() + "] " + text;
      Messages.insert({text:texttowrite,createdAt:new Date(),messageType:messageType});
  },
  toggleState: function(playerNominated, bid) {
      console.log("Checking toggle state");

      if(Meteor.isServer) {
        // Get current state
        // Meteor doesn't implement collection.findAndModify, which would likely be better to use.
        if(!lock) {
          lock = 1;
        }
        console.log("Lock: ", lock);

        if(lock == 1) {
          console.log("Auction locked");
          var state = AuctionData.findOne();

          if(state !== undefined && state.State == "Nominating") {
            console.log("State is nominating");
            var team = TeamNames.findOne({captain:state.Nominator});

            var money = team.money;
            if(Meteor.call("isKeeper", state.Nominator, playerNominated)) {
              money = team.money + team.keepermoney;
            }
            if(money < parseInt(bid)) {
             return false;
            }

            // Log message
            Meteor.call("insertMessage", state.Nominator + " nominates " + playerNominated + " with an initial bid of " + bid, new Date(), "nomination");

            BidHistory.insert({bidder: state.Nominator, amount: bid, player: playerNominated, createdAt: new Date().getTime(), secondsLeft:bidTime});
            // Start bidding baby
            //PreviousAuctionData.remove({});
            //PreviousAuctionData.insert(AuctionData.find({}));
            AuctionData.remove({});
            return AuctionData.insert({State: "Bidding", nextExpiryDate: new Date().getTime()+bidTime, currentBid: bid, currentPlayer: playerNominated, lastBidder: state.Nominator, Nominator:state.Nominator});
          }
          else if (state !== undefined)
          {
            AuctionData.remove({});
            console.log("Not nominating... someone won!");
            var team = TeamNames.findOne({"captain" : state.lastBidder});
            var playerWon = state.currentPlayer;

            // ALL CAPS-specific thing here
            if(state.lastBidder == "YOSSARIAN") {
              playerWon = playerWon.toUpperCase();
            }
            var playerOrder = parseInt(team.count) + 1;

            // handle keepers
            keepers = Keepers.findOne({"captain":state.lastBidder}).keepers;
            var keepermoney = team.keepermoney;
            var money = team.money;
            if(keepers.indexOf(playerWon) >= 0) {
              console.log(playerWon, " is a keeper!");
              keepermoney = keepermoney - state.currentBid;

              if(keepermoney < 0) {
                money = money - Math.abs(keepermoney);
                keepermoney = 0;
              }
            }
            else {
              money = money - state.currentBid;
            }

            // Put him in the roster
            TeamData.update({"teamname": team.teamname, "order" : playerOrder}, {$set: {"name": playerWon, "cost": state.currentBid}});
            TeamNames.update({"teamname": team.teamname}, {$set: {"count":playerOrder, "money":money, "keepermoney":keepermoney}});
            // Log message
            var text = state.lastBidder + " wins " + playerWon + " for " + state.currentBid + "!";
            Meteor.call("insertMessage", text, new Date(), "winningBid");
            Meteor.call("insertMessage", team.teamname, new Date(), "animate");
            
            // Reset state
            nominator = Meteor.call("pickNominator");
            CurrentPick.update({}, {$inc:{'pick':1}});
            var text = "Waiting for "+nominator +" to nominate the "+CurrentPick.findOne({}).pick+" pick of the draft.";
            Nominators.update({name:nominator.name}, {$set:{nominated:true}});
            return AuctionData.insert({State: "Nominating", nextExpiryDate: new Date().getTime()+10000, Nominator: nominator.name});
          }
          lock = 0;
          console.log("Auction unlocked");
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
  isKeeper: function(bidder, player) {
    keepers = Keepers.findOne({"captain":bidder}).keepers;
    if(keepers.indexOf(player) >= 0) {
      return true;
    }
    return false;
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
        //console.log("acceptBid: Can't bid right now");
				return false;
			}

      // Alright let's check this thang out.
      console.log("acceptBid: Got State & we're bidding");

      // First, is the bid enough?
      if(parseInt(state.currentBid) < parseInt(amount)) {

        // K cool, does the player have this much money?
        team = TeamNames.findOne({captain:bidder});
        var availablebidamt = parseInt(team.money);
        if(Meteor.call("isKeeper", bidder, state.currentPlayer)) {
          availablebidamt += parseInt(team.keepermoney);
        }

        if(parseInt(amount) <= parseInt(availablebidamt)) {
          // Cool, he does. Is it in time?
          console.log("acceptBid: good amount");
          // I can't bid when the time is still valid, this fixes it
          //if(parseInt(state.nextExpiryDate) > parseInt(clienttime)) {
          if(true) {  // Sweet it was. Let's mark it down!
            console.log("acceptBid: nextExpiryDate good");

            console.log("acceptBid: Times: "+ state.nextExpiryDate + " vs " + clienttime);

            secondsLeft = state.nextExpiryDate - new Date().getTime();

            if(!(state.lastBidder == bidder)) {
              BidHistory.insert({
                bidder: bidder,
                amount: amount,
                player: state.currentPlayer,
                createdAt: new Date().getTime(),
                secondsLeft: secondsLeft
              });
              AuctionData.update(
                {State: "Bidding"},
                {$set: {currentBid: amount, lastBidder: bidder}}
              );

              Meteor.call("insertMessage",
                          bidder + " bids " + amount + " on " + AuctionData.findOne({}).currentPlayer,
                          new Date(), "bid");
              console.log("acceptBid: inserted bid");
              // Do we need to give some time back?
              if(parseInt(secondsLeft) < 15000) {
                AuctionData.update({State: "Bidding"}, {$set: {nextExpiryDate: new Date().getTime()+20000}});
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
    console.log("Loading it up");
    // Clear state

    var renewData = false;

    AuctionData.remove({});
    AuctionStatus.remove({})
    AuctionStatus.insert({"status":"Not Started"});
    AuctionLock.remove({});
    AuctionLock.insert({"locked":0}); 

    if(renewData) { 

      TeamNames.remove({});
      var teamnames = {};
      teamnames = JSON.parse(Assets.getText('teamnames.json'));
      for(i = 0; i < teamnames.length; i++) {
        var obj = teamnames[i];
        TeamNames.insert(obj);
      }

      Divisions.remove({});
      var divisions = {};
      divisions = JSON.parse(Assets.getText('divisions.json'));
      for(i = 0; i < divisions.length; i++) {
        var obj = divisions[i];
        Divisions.insert(obj);
      }

      TeamData.remove({});
      //Messages.remove({});
      Nominators.remove({});
      Keepers.remove({});
      CurrentPick.remove({});
      PausedAuction.remove({});
      CurrentPick.insert({"pick":1});
      BidHistory.remove({});

      // Load state
      var initialRosterData = {};
      initialRosterData = JSON.parse(Assets.getText('nominations.json'));
      for(i = 0; i < initialRosterData.length; i++) {
        var obj = initialRosterData[i];
        Nominators.insert(obj);
      }

      var admins = {};
      admins = JSON.parse(Assets.getText('admins.json'));
      for(i = 0; i < admins.length; i++) {
        var obj = admins[i];
        Admins.insert(obj);
      }

      keepers = JSON.parse(Assets.getText('keepers.json'));
      for(i = 0; i < keepers.length; i++) {
        var obj = keepers[i];
        Keepers.insert(obj);
      }

      initialRosterData = JSON.parse(Assets.getText('teams.json'));
      for(i = 0; i < initialRosterData.length; i++) {
        var obj = initialRosterData[i];
        TeamData.insert(obj);
      }
    }

    Meteor.publish("divisions", function() {return Divisions.find();});
    Meteor.publish("teams", function() {return TeamData.find();});
    Meteor.publish("teamnames", function() {return TeamNames.find()});
    Meteor.publish("messages", function() {return Messages.find({}, {sort: {createdAt: -1}, limit:25});});
    Meteor.publish("auctiondata", function() {return AuctionData.find()});
    Meteor.publish("auctionstatus", function() {return AuctionStatus.find()});
    Meteor.publish("nominators", function() {return Nominators.find()});
    Meteor.publish("currentpick", function() {return CurrentPick.find()});
    Meteor.publish("bids", function() { return BidHistory.find()});
    Meteor.publish("previousauctiondata", function() {return PreviousAuctionData.find()});
    Meteor.publish("keepers", function() {return Keepers.find()});
    //Keepers = new Mongo.Collection('keepers');





    return true;
  } );
  Meteor.methods({
     getServerTime: function () {
        var _time = (new Date).getTime();
        return _time;
     }
  });
}

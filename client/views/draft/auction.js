var bidTime = 25000;
var additionTime = 15000;
var lock = 0;
var bidTimeout = 0;

Meteor.setServerTime = function() {
  Meteor.call("getServerTime", function(error, serverMS) {
    var localMS = new Date().getTime();
    var serverOffset = serverMS - localMS;
    console.log('Meteor.setServerTime()', {serverMS: serverMS, localMS:localMS, serverOffset: serverOffset});
    Session.set('serverTimeOffset', serverOffset);
  });
};

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
});

Template.renderplayers.helpers({
  players : function(teamname) {
    return TeamData.find({"teamname" : teamname}, {sort : {order : 1}});
  }
});

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

Template.viewsignups.events(
  {
    'click .deleteSignup': function(event){
      idToSend = event.target.id;
      Meteor.call("deleteSignupFromSignups", idToSend);
    }
  });
// display_time (aka bid status)
Template.display_time.helpers(
  {
    time : function() {
      if(AuctionData.findOne({}) !== undefined) {
        var curtime = Session.get('time') + Session.get('serverTimeOffset');
        var remainingTime = AuctionData.findOne({}).nextExpiryDate;
        var secsLeft = Math.ceil((remainingTime - curtime)/100)/10;
        if(secsLeft < 0) {
          //Meteor.call("checkForToggle");
        }
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
      if(AuctionData.findOne({}) !== undefined) {
        name = AuctionData.findOne({}).currentPlayer;
        currentPlayerInfo = PlayerResponse.findOne({"tagpro":name});
        return name;
      }
    },
    currentPlayerInfo: function() {
      if(AuctionData.findOne({}) !== undefined) {
        return PlayerResponse.findOne({"tagpro":AuctionData.findOne({}).currentPlayer});
      }
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
        myNomination = Meteor.user().username == nominator;
        if(myNomination) {
          Session.set("playSound", "myNomination");
        }

        return myNomination;
      }
    },
    auctionPaused : function() {
      if(AuctionStatus.fineOne({}) !== undefined) {
        status = AuctionStatus.findOne({}).status;
        return (status == "Paused" || status == "Not Started");
      }
    },
    auctionMessage: function()
    {
      if(AuctionStatus.findOne({}) !== undefined) {
        status = AuctionStatus.findOne({}).status;
        if(status == "Paused")
          return "Auction is paused"
          else
            return "Auction has not started"
            }
    },
    getsnarkymessage: function()
    {
      options = ["Hurry it up ", "We don't have all day, ", "Waiting on you ", "Getting old here, ", "Take your time ", "No rush ", "C'mon ", "Need some help "]
      idx = Math.floor(Math.random() * options.length)
      return options[idx];
    },
    nextNominator: function()
    {
      nextorder = Nominators.findOne({"name":"nextInOrder"}).nextorder;
      var nextNominator = Nominators.findOne({"order":nextorder}).name;
      //console.log
      return nextNominator;
    }
  });

Template.playSound.helpers({
  shouldIPlaySound: function() {
    if(Session.get("playSound") != "" && Session.get("playSound") !== undefined) {
      console.log("Playing sound: ", Session.get("sound"));
      return true;
    }
    return false;
  },
  soundToPlay: function() {
    sound = Session.get("playSound")
    Session.set("playSound", "")
    return sound;
  }
});

// Bidding options
Template.display_bidding_options.helpers({
  getPlayers : function() {
    console.log(PlayerResponse.find({}, {fields:{tagpro:1}}));
    return PlayerResponse.find({}, {fields:{tagpro:1}});
  },
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
    players = PlayerResponse.find({}, {fields:{tagpro:1}});
    Session.set("players", players);
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
    if(Meteor.user() !== undefined) {
      var team = TeamNames.findOne({"captain":Meteor.user().username});
      var balance = parseInt(team.money);
      //console.log(team, keepers, balance);
      //console.log(Meteor.user().username);
      //console.log("Current balance w/o keeper: ", balance);
      //console.log(AuctionData.findOne({}), AuctionData.findOne({}).currentPlayer);
      keepers = Keepers.findOne({'captain':Meteor.user().username}).keepers;
      if(keepers.indexOf(AuctionData.findOne({}).currentPlayer) >= 0 || Meteor.call("isKeeper", team.captain, AuctionData.findOne({}).currentPlayer)) {
        balance += parseInt(team.keepermoney);
      }
      console.log("Current balance w/ keeper: ", balance);
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
    if(AuctionData.findOne({}) !== undefined) {
      var bids = [];
      var currentBid = parseInt(AuctionData.findOne({}).currentBid);
      var team = TeamNames.findOne({"captain":Meteor.user().username});
      money = parseInt(team.money) + parseInt(team.keepermoney);
      console.log(Meteor.user().username, " has ", money);
      if(currentBid+1 <= money) {
        bids.push({'bid':currentBid+1});
      }
      if(currentBid+2 <= money) {
        bids.push({'bid':currentBid+2});
      }
      if(currentBid+3 <= money) {
        bids.push({'bid':currentBid+3});
      }
      if(currentBid+5 <= money) {
        bids.push({'bid':currentBid+5});
      }
      if(currentBid+10 <= money) {
        bids.push({'bid':currentBid+10});
      }
      return bids;
    }
  }
});

Template.display_bidding_options.events(
  {
    'submit .bid-on-player' : function(event)
    {
      var bid = parseInt(event.target.amount.value);
      if(bid >= 0) {
        Meteor.call("acceptBid", Meteor.user().username, bid, new Date().getTime());
      }
      Session.set("playSound", "bid")
      return false;
    },
    'submit .nominate-player' : function(event)
    {
      var player = event.target.player.value;
      var bid = parseInt(event.target.amount.value);
      if(!bid || bid < 0) {
        bid = 0;
      }
      Meteor.call("toggleState", player, bid);
      return false;
    },
    'click .bid-button' : function(event) {
      var bid = parseInt(event.currentTarget.getAttribute('amount'));
      if(bid >= 0) {
        Meteor.call("acceptBid", Meteor.user().username, bid, new Date().getTime());
      }
      Session.set("playSound", "bid")
      return false;
    }
  }
);

Meteor.methods({
  hasSignedUp : function(name) {
    return PlayerResponse.find({"meteorUserId":name});
  },
  setBidTime: function(bidtime) {
    bidTime = bidtime;
  },
  removeMessage : function(messageid) {
    Messages.remove(messageid);
  },
  isAdmin: function(player) {
    if(admins.indexOf(player) >= 0)
      return true;
    return false;
  },
  undoNomination : function(person) {
    ad = AuctionData.findOne({});
    if(ad.Nominator !== undefined) {
      nominator = ad.Nominator;
      AuctionData.remove({});
      AuctionData.insert({State: "Nominating", nextExpiryDate: new Date().getTime()+bidTime, Nominator: nominator, startTime:new Date().getTime()});
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
    // Make it so you can't resume from nominating state
    if(AuctionData.findOne({State:"Nominating"}) !== undefined) {
      return false;
    }
    pa = PausedAuction.findOne();
    pa.nextExpiryDate = new Date().getTime() + additionTime;
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
  startAuction: function(person) {
    console.log("Starting auction");
    Meteor.call("insertMessage", "Auction started by "+person, new Date(), "started");
    nominator = Meteor.call('pickNominator');
    console.log("nominator is: " + nominator.name);
    AuctionData.remove({});
    AuctionData.insert({State: "Nominating", nextExpiryDate: new Date().getTime()+bidTime, Nominator: nominator.name,  startTime:new Date().getTime()});
    AuctionStatus.update({}, {"status":"Live"});
  },
  getAuctionStatus:function() {
    return AuctionData.findOne();
  },

  checkForToggle: function() {
    console.log("checking for toggle");
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

});

if (Meteor.isServer) {

}

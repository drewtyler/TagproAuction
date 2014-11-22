AuctionData = new Mongo.Collection("auctiondata");
CaptainData = new Mongo.Collection("captaindata");
TeamData = new Mongo.Collection("teamdata");

if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault("time", 0);

  Meteor.setInterval(function() {
    Session.set('time', new Date().getTime());
  }, 100);

  Template.display_time.events({
    'submit .nominate-player': function(event) {
      var player = event.target.player.value;
      var bid = event.target.amount.value;
      if(!bid) {
        bid = 0;
      }
      Meteor.call("toggleState", player, bid);
      return false;
      //TODO: figure out why this is busted.
    }
  });
  Template.admin.events({
    'click button': function () {
      Meteor.call("toggleState", "admin", "toggle");
    }
  });
  Template.display_time.time = function() {
    if(AuctionData.findOne().State == "Bidding") {
      var curtime = Session.get('time');
      var serverTime = AuctionData.findOne().nextExpiryDate;
      var secsLeft = Math.floor((serverTime - curtime)/1000);
      if(secsLeft < 0)
        Meteor.call("checkForToggle");
      else
        return secsLeft;
    }
  };
  Template.display_time.currentNominatingPlayer = function() {
    if(AuctionData.findOne().State == "Bidding") {
      return AuctionData.findOne().Nominator;
    }
  };
  Template.display_time.personBeingBidOn = function() {
    if(AuctionData.findOne().State == "Bidding") {
      return AuctionData.findOne().currentPlayer;
    }
  };
  Template.display_time.bidAmount = function() {
    if(AuctionData.findOne().State == "Bidding") {
      return AuctionData.findOne().currentBid;
    }
  };
  Template.display_time.lastBidder = function() {
    if(AuctionData.findOne().State == "Bidding") {
      return AuctionData.findOne().lastBidder;
    }
  };
  Template.display_time.helpers({
    isNominationTime: function() {
       return AuctionData.findOne().State == "Nominating";
    },
    isTurnToNominate: function() {
       return true;
    }
  });
}

Meteor.methods({
  toggleState: function(playerNominated, bid) {
    console.log("test - " + playerNominated + " - " + bid);
    // todo: add nominator here
    if(AuctionData.findOne().State == "Nominating") {
      AuctionData.remove({});
      return AuctionData.insert({State: "Bidding", nextExpiryDate: new Date().getTime()+30000, currentBid: bid, currentPlayer: playerNominated, lastBidder: "placeholder until loginbuttons done"});
    } else {
      // todo: commit auction data here to the captains & teams data collections before toggling
      AuctionData.remove({});
      return AuctionData.insert({State: "Nominating", nextExpiryDate: new Date().getTime()+30000});
    }
  },
  checkForToggle: function() {
    console.log("Checking for toggle from client");
    var currentState = AuctionData.findOne();
    if(currentState.State == "Bidding") {
      if(currentState.nextExpiryDate < new Date().getTime()) {
        Meteor.call('toggleState');
      }
    }
    return true;
  },
  acceptBid: function(bidder, amount, player, clienttime) {
			if(state == "Bidding") {
				return false;
			}
			var bids = BidHistory.findOne({ $query: {}, $orderby: {datetime: -1}});
			if(!bids) {
				BidHistory.insert({bidder: this.bidder, amount: this.amount, player: this.player, datetime: this.clienttime});
				if(nextExpiryDate.getTime() - new Date().getTime() < 10000) {
					nextExpiryDate = new Date(clienttime.GetTime() + 10000);
				}
			}
			if(bids.player == this.player) {
				if(bids.amount < this.amount) {
					if(nextExpiryDate.getTime() - new Date().getTime() > 0) {
						BidHistory.insert({
							bidder: this.bidder,
							amount: this.amount,
							player: this.player,
							datetime: this.clienttime
						});
						if(nextExpiryDate.getTime() - new Date().getTime() < 10000) {
							nextExpiryDate = new Date(clienttime.GetTime() + 10000);
						}
						return true;
					} else {
						return false;
					}
				} else {
					return false;
				}
			} else {
				return false;
			}
  }
});

if (Meteor.isServer) {
  /*Meteor.setInterval(function() {
    if(AuctionData.findOne().State == "Bidding") {
      if(AuctionData.findOne().nextExpiryDate < new Date().getTime()) {
         // Bidding has ended, award the player and reset the state.
         toggleState("","");
      }
    }
  }, 100);*/
  Meteor.startup(function () {
    AuctionData.remove({});
    return AuctionData.insert({State: "Nominating", nextExpiryDate: new Date().getTime()+100000, Nominator: "asdf"});
  });
}

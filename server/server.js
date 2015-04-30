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
AuctionStatus = new Mongo.Collection("auctionstatus");
AuctionLock = new Mongo.Collection("auctionlock");
PreviousAuctionData = new Mongo.Collection("previousauctiondata");
PlayerResponse = new Mongo.Collection("playerResponse");

Meteor.methods({
  insertSignup : function(dataToSend) {
    PlayerResponse.insert(dataToSend);
    console.log("Got signup from: " + dataToSend.meteorUserId);
  },
  getSignedUp : function(playername) {
    return PlayerResponse.find({meteorUserId:playername}).count();
  }
});

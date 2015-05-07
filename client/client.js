WarningMessage = new Mongo.Collection("warningmessage");
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
BoardHelpers = new Mongo.Collection("boardhelpers");

if (Meteor.isClient) {
  Meteor.startup(function() {
    Session.setDefault("serverTimeOffset", 0);
    Session.setDefault("time", new Date().getTime());
    Session.setDefault("auctionStatus", "Waiting to start");
    Session.setDefault("nominationTime", false);
    Session.setDefault("bidAccepted", false);
    Session.setDefault("myTurnToNominate", false);
    Session.setDefault('players', []);
    Session.setDefault("playSound", "");
    Session.setDefault("teamJustBid", "");
    Session.setDefault("pageToDisplay", "homePage");
    Session.setDefault("playerToDisplay", "N/A");
    Session.setDefault("teamToDisplay", "N/A");

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
    Meteor.subscribe("playerResponse");
    Meteor.subscribe("warningMessage");
    Meteor.subscribe("boardhelpers");
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

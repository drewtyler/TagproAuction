Meteor.methods({
  getAuctionStatus:function() {
    return AuctionData.findOne();
  }
});

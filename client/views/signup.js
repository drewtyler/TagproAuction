Template.signup.helpers({
  canSignup: function() {
    if(!Meteor.userId())
      return false;
    return true;
  },
  displaySignup: function() {
    return (Session.get('pageToDisplay') == "signUpPage");
  }
});
Template.signup.events({
  'submit' : function(event) {
    $("#somethingWentWrong").empty();
    // need to create a row for the player w/ answers to their question.
    var isOK = true;
    var reasonsToFail = [];
    var dataToSend = {};
    tgt = event.target;

    //validate
    if($(tgt).find('[name=playername]').val() == '') {
      isOK = false;
      reasonsToFail.push("<li>You must put in your Tagpro name!</li>");
    }
    dataToSend.playername = tgt.playername.value;
    dataToSend.oldplayername = tgt.oldplayername.value;
    //validate
    if(tgt.redditname.value == '') {
      isOK = false;
      reasonsToFail.push("<li>You must put in your reddit username!</li>");
    }
    dataToSend.redditname = tgt.redditname.value;
    //validate
    if(tgt.proflink.value == '') {
      isOK = false;
      reasonsToFail.push("<li>You must put in your Tagpro profile link!</li>");
    }
    dataToSend.proflink = tgt.proflink.value;
    //validate
    if(!$(tgt).find('[name=mumble]').is(':checked')) {
      isOK = false;
      reasonsToFail.push("<li>You must have mumble to play competitive Tagpro!</li>");
    }
    dataToSend.mumble = $(tgt).find('[name=mumble]:checked').val();
    //validate
    if(!$(tgt).find('[name=mic]:checked').val()) {
      isOK = false;
      reasonsToFail.push("<li>Select if you can use a microphone!</li>");
    }
    dataToSend.mic = $(tgt).find('[name=mic]:checked').val();
    dataToSend.sunday = $(tgt).find('[name=sunday]').is(':checked');
    dataToSend.monday = $(tgt).find('[name=monday]').is(':checked');
    dataToSend.tuesday = $(tgt).find('[name=tuesday]').is(':checked');
    dataToSend.wednesday = $(tgt).find('[name=wednesday]').is(':checked');
    dataToSend.thursday = $(tgt).find('[name=thursday]').is(':checked');
    dataToSend.friday = $(tgt).find('[name=friday]').is(':checked');
    dataToSend.saturday = $(tgt).find('[name=saturday]').is(':checked');
    dataToSend.arc = $(tgt).find('[name=arc]').is(':checked');
    dataToSend.centra = $(tgt).find('[name=centra]').is(':checked');
    dataToSend.sphere = $(tgt).find('[name=sphere]').is(':checked');
    dataToSend.origin = $(tgt).find('[name=origin]').is(':checked');
    dataToSend.pi = $(tgt).find('[name=pi]').is(':checked');
    dataToSend.radius = $(tgt).find('[name=radius]').is(':checked');
    dataToSend.segment = $(tgt).find('[name=segment]').is(':checked');
    dataToSend.arcping = tgt.arcping.value;
    dataToSend.centraping = tgt.centraping.value;
    dataToSend.sphereping = tgt.sphereping.value;
    dataToSend.originping = tgt.originping.value;
    dataToSend.piping = tgt.piping.value;
    dataToSend.radiusping = tgt.radiusping.value;
    dataToSend.segmentping = tgt.segmentping.value;
    //validate
    if(tgt.location.value == "selectone") {
      isOK = false;
      reasonsToFail.push("<li>Select where you live!</li>");
    }
    dataToSend.location = tgt.location.value;
    //validate if location = other
    if(tgt.location.value == "other" && tgt.country.value == '') {
      isOK = false;
      reasonsToFail.push("<li>You must state which country you live in!</li>");
    }
    dataToSend.country = tgt.country.value;
    //validate
    if(tgt.position.value == "selectone") {
      isOK = false;
      reasonsToFail.push("<li>You must select a position!</li>");
    }
    dataToSend.position = tgt.position.value;
    dataToSend.mltp = $(tgt).find('[name=mltp]').is(':checked');
    dataToSend.minorltp = $(tgt).find('[name=minorltp]').is(':checked');
    dataToSend.nltpa = $(tgt).find('[name=nltpa]').is(':checked');
    dataToSend.nltpb = $(tgt).find('[name=nltpb]').is(':checked');
    dataToSend.eltp = $(tgt).find('[name=eltp]').is(':checked');
    dataToSend.usc = $(tgt).find('[name=usc]').is(':checked');
    dataToSend.rltp = $(tgt).find('[name=rltp]').is(':checked');
    dataToSend.socl = $(tgt).find('[name=socl]').is(':checked');
    dataToSend.cltp = $(tgt).find('[name=cltp]').is(':checked');
    //validate
    if(tgt.experience.value == "selectone") {
      isOK = false;
      reasonsToFail.push("<li>You must input your experience!</li>");
    }
    dataToSend.experience = tgt.experience.value;
    dataToSend.personalmessage = tgt.personalmessage.value;
    //validate
    if(!$(tgt).find('[name=agreement]').is(':checked')) {
      isOK = false;
      reasonsToFail.push("<li>You must agree to the Season 8 rules!</li>");
    }
    dataToSend.meteorUserId = Meteor.user().username;
    dataToSend.signupTime = new Date();
    if(isOK) {
      Meteor.call("insertSignup", dataToSend);
      Session.set("pageToDisplay","homePage");
    } else {
      var html = "<ul>";
      for(i = 0; i < reasonsToFail.length; i++) {
        html += reasonsToFail[i];
      }
      html += "</ul>";
      $("#somethingWentWrong").append(html);
    }
    return false;
  }
});
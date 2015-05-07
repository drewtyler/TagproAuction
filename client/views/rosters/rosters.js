Template.teamrosters.helpers({
    getRegions:function() {
        return Divisions.find({},{sort:{order:-1}});
    },
    getTeams:function(division) {
        return TeamNames.find({division:division},{sort:{order:-1}});
    },
    curTeamDisplay:function(){
        return TeamNames.find({teamname:Session.get("teamToDisplay")});
    },
    curTeamData:function(teamname) {
        return TeamData.find({teamname:teamname},{sort:{order:1}});
    }
});

Template.teamrosters.events({
    'click li':function() {
        if(this.teamname != undefined) {
         Session.set("teamToDisplay",this.teamname);
        }
    }
});

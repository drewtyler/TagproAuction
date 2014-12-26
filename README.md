TagproAuction
=============

Tagpro Auction tool for MLTP S7. Possibly usable in other situations.

To set up and run this site just git clone it, navigate to the project directory and execute:

> curl https://install.meteor.com/ | sh

> meteor

To work in other situations, modify "genner.py" to include the captains, team names, and division of each team.
After you modify it, run "python genner.py" and it will update the correct files.

You also need to alter the first line on "auction.js" to include the list of admins - people who can start/pause/undo bids on the auction. 

Run "meteor" in the project's main directory, then load up localhost:3000 to see the auction.

You can do "meteor deploy myauctionsite.meteorapp.com" to create a live site that others can access.

Captain names are case sensitive - when signing up you need to use the correct capitalization.

When we used it for the MLTP auction, we created a heroku site, and used mongolab as the database. This allows persistence and backing up, as well as on the fly modifications to the database (removing users who forgot logins, removing players that were accidentally added).

The heroku config variables used are as follows:

	=== mltp-auction Config Vars
	BUILDPACK_URL: https://github.com/AdmitHub/meteor-buildpack-horse.git
	MONGO_URL:     mongodb://<username>:<password>@<mongolabhost>.mongolab.com:<mongolab-port>/<mongolab-database>
	ROOT_URL:      http://<app-name>.herokuapp.com

To use Mongolab, you need to verify your payment information on Heroku. You just need to enter a credit card (they won't charge you).
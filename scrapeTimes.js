var page = new WebPage(),
    url = 'http://www.intrinsicsports.com.au/',
    stepIndex = 0;

/**
 * From PhantomJS documentation:
 * This callback is invoked when there is a JavaScript console. The callback may accept up to three arguments:
 * the string for the message, the line number, and the source identifier.
 */
page.onConsoleMessage = function (msg, line, source) {
    console.log('console> ' + msg);
};

/**
 * From PhantomJS documentation:
 * This callback is invoked when there is a JavaScript alert. The only argument passed to the callback is the string for the message.
 */
page.onAlert = function (msg) {
    console.log('alert> ' + msg);
};

var system = require('system');
if (system.args.length === 1) {
    console.log('Try to pass some args when invoking this script!');
} else {
    system.args.forEach(function (arg, i) {
        console.log(i + ': ' + arg);
    });
}
var competitionKey = system.args[1];
var competitions = {
    football: {sport: 'Men\'s Soccer', competition: 'Thursday Evening Men\'s Soccer St Andrews', team: 'zerglings'},
    netball: {sport: 'Netball', competition: 'Wednesday Evening Netball SCEGGS', team: 'wildcats'}
};

//************************************//
// UTILITIES
//************************************//
var Utils = Utils || {
    filePath: '/home/arthur/scraperOut/',
    loadJquery: function(){
        // Inject jQuery for scraping (you need to save jquery-1.6.1.min.js in the same folder as this file)
        // Every time a new page is loaded, this needs to load
        page.injectJs('jquery-1.10.2.min.js');
    },
    loadSport: function(sport){
        // Load JQuery
        Utils.loadJquery();

        // Save screenshot for debugging purposes
        page.render(this.filePath + 'mainMenu.png');

        page.evaluate(function findSportAndLoad(sport){
            var link = $('[title="' + sport + '"]')[0];

            if(link && link.href){
                window.location.href = link.href;
                console.log('Link found for ' + sport + ': ' + link.href);
            }
        }, sport);

    },
    loadCompetition: function(competition){
        // Load JQuery
        Utils.loadJquery();

        // Save screenshot for debugging purposes
        page.render(this.filePath + 'competitions.png');

        console.log('loadCompetition: ' + competition);

        page.evaluate(function findCompAndLoad(competition){
            var link = $('#fixTures a').filter(function findComp(){return this.innerText == competition})[0]; // Assume first match is fixtures (second match is upcoming)

            if(link && link.href){
                window.location.href = link.href;
                console.log('Link found for ' + competition + ': ' + link.href);
            }
        }, competition);
    },
    findDraw: function(team){
        // Load JQuery
        Utils.loadJquery();

        return page.evaluate(function findDraw(team){
            var upcomingFixturesDiv = $('.fxtBlock.active')[1]; // Assume second one is upcoming fixture, first one is results
            var fixtureUl = $('ul', upcomingFixturesDiv).filter(function findFixture(){return this.innerText.toLowerCase().indexOf(team) != -1})[0];

            var firstTeam = $('.fxtTL', fixtureUl)[0].innerText;
            var time = $('.fxtT', fixtureUl)[0].innerText;
            var secondTeam = $('.fxtTD', fixtureUl)[0].innerText;
            var fixtures = $('h3.active');
            var indexOfLatestFixture = fixtures.length - 1;
            var fixture = fixtures[indexOfLatestFixture].innerText;

            // TODO get whole draw instead of just next match.

            console.log('Next match: ' + fixture + ' (' + time + '): ' + firstTeam + ' vs ' + secondTeam);

            return 'Next match - ' + firstTeam + ' vs ' + secondTeam + ': ' + fixture + ' (' + time + ') ';
        }, team);
    },
    writeNextMatchToFile: function(nextMatch){
        var fs = require('fs');
        try {
            fs.write(this.filePath + 'nextMatch.txt', nextMatch, 'w');
        } catch(e) {
            console.log(e);
        }
    }
};
//************************************//
//************************************//

// Let's do stuff
page.open(url, function (status) {
    if (status === 'success') {
        Utils.loadSport(competitions[competitionKey]['sport']);

        // Step 2 - load the comp's page
        window.setTimeout(function(){
            Utils.loadCompetition(competitions[competitionKey]['competition']);

            // Step 3 - find the fixture
            window.setTimeout(function(){
                var nextMatch = Utils.findDraw(competitions[competitionKey]['team']);

                // Write next match to file
                Utils.writeNextMatchToFile(nextMatch);

                phantom.exit();
            }, 5000);

        }, 5000);
    }
});
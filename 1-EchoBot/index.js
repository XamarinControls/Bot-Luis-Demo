var builder = require('botbuilder');
var restify = require('restify');

//create our bot connector
var connector = new builder.ChatConnector();

//create our bot
var bot = new builder.UniversalBot(connector, [
    (session, args, next) => {
        session.send("You said: " + session.message.text);
    }
]);

//create an API for the bot
var server = restify.createServer();

//set the port where our bot api will run
server.listen(3978, () => {
    console.log('Bot running...');
});

//set the endpoint for our bot
server.post('api/messages', connector.listen());
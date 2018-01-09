var builder = require('botbuilder');
var restify = require('restify');

//create a bot connector

var connector = new builder.ChatConnector();

//create a bot

var bot = new builder.UniversalBot(connector, [
    (session, args, next) => {
        session.send('Hi! I\'m the help desk bot and I can report your problem');
        builder.Prompts.text(session, 'First, please give me your name.');
    },
    (session, result, next) => {
        session.dialogData.name = result.response;
        builder.Prompts.text(session, 'Alright, ' + session.dialogData.name + ' can you briefly explain the problem');
    },
     (session, result, next) => {
        session.dialogData.problem = result.response;
        builder.Prompts.text(session, 'Great! So, ' + session.dialogData.name +', your problem is: ' + session.dialogData.problem + '. Am I right?' );
    },
    (session, result, next) => {
        session.send('Alright, thank you for reporting your problem!');
   }
]
);  

//create an API for the bot
var server = restify.createServer();

//set the port where our bot api will run
server.listen(3978, () => {
    console.log('Bot running...');
});

//set the endpoint for our bot
server.post('api/messages', connector.listen());
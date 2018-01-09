var builder = require('botbuilder');
var restify = require('restify');

//create a bot connector

var connector = new builder.ChatConnector();

//create a bot

var bot = new builder.UniversalBot(connector, [
    (session, args, next) => {
        session.send('Hi! I\'m pizza bot! You can order a pizza here');
        
        var sizes = ['large', 'regular', 'small'];

        builder.Prompts.choice(session, 'What size of pizza do you want?', sizes, {listStyle: builder.ListStyle.button} );
    },
    (session, result, next) => {
        session.dialogData.size = result.response.entity;
        
        var toppings = ['pepperoni', 'all cheese', 'combo'];

        builder.Prompts.choice(session, 'What toppings do you want?', toppings, {listStyle: builder.ListStyle.button});
    },
     (session, result, next) => {
        session.dialogData.topping = result.response.entity;
        builder.Prompts.choice(session, 'Great! So you are ordering a ' + session.dialogData.size + ' ' + session.dialogData.topping + ' pizza? Am I right?' , ["yes" , "no"]);
    },
    (session, result, next) => {
        if(result.response.entity == "yes"){
        session.send('Alright, your order is now being processed! thank you!');
    }
    else{
        session.send('Okay, you can just order next time!');
    }
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
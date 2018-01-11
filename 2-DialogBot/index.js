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
        
        var toppings = ['pepperoni', 'all cheese', 'combo'];

        builder.Prompts.text(session, 'How many ' + session.dialogData.size + ' ' + session.dialogData.topping + ' do you want?');
    },
     (session, result, next) => {
        session.dialogData.quantity = result.response;
        builder.Prompts.choice(session, 'Great! So you are ordering ' + session.dialogData.quantity + ' ' + session.dialogData.size + ' ' + session.dialogData.topping + ' pizza? Am I right?' , ["yes" , "no"]);
    },
    (session, result, next) => {
        if(result.response.entity == "yes"){

            var card = new builder.ReceiptCard(session);
            card.title('FEU Pizza Co.');
            card.items([
                builder.ReceiptItem.create(session, 'PHP 300.00', session.dialogData.size + ' ' + session.dialogData.topping  + ' pizza')]);
            card.tax('Php 3.00');
            card.total('Php' + (300.00 * session.dialogData.quantity));
            
            var msg = new builder.Message(session);
            msg.attachments([card]);
            session.send(msg);
        }
    session.endDialog('Thank you!');
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
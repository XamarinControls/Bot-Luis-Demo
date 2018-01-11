var builder = require('botbuilder');
var restify = require('restify');

//create a bot connector

var connector = new builder.ChatConnector();

// Listen for messages from users

var bot = new builder.UniversalBot(connector, (session, args, next) => {
    session.send('Hello! I am pizza bot! Order a pizza now!');
});

var luisRecognizer = new builder.LuisRecognizer('URL').onEnabled(function (context, callback) {
    var enabled = context.dialogStack().length === 0;
    callback(null, enabled);
});
bot.recognizer(luisRecognizer);

bot.dialog('Help',
    (session, args, next) => {
        session.endDialog('You can order pizza through me :)')
    }
).triggerAction({
    matches: 'Help'
});

bot.dialog('BuyPizza', [
    (session, args, next) => {
        if (!session.dialogData.size) {
            var sizes = ['large', 'regular', 'small'];
            builder.Prompts.choice(session, 'What size of pizza do you want to order?', sizes, { listStyle: builder.ListStyle.button });
        } else {
            next();
        }
    },
    (session, result, next) => {
        if (!session.dialogData.size) {
            session.dialogData.size = result.response.entity;
        }

        if (!session.dialogData.topping) {
        var toppings = ['pepperoni', 'all cheese', 'combo'];
        builder.Prompts.choice(session, 'What toppings do you want?', toppings, {listStyle: builder.ListStyle.button});
        } else {
            next();
        }
    },
    (session, result, next) => {
        if (!session.dialogData.topping) {
            session.dialogData.topping = result.response.entity;
        }

        if (!session.dialogData.quantity) {
            builder.Prompts.text(session, 'How many '+ session.dialogData.size + ' ' + session.dialogData.topping + ' pizza do you want?');
            } else {
                next();
            }
        },
        (session, result, next) => {
            if (!session.dialogData.quantity) {
                session.dialogData.quantity = result.response;
            }
           
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
]).triggerAction({
    matches: /buy a pizza/i
});


//create an API for the bot
var server = restify.createServer();

//set the port where our bot api will run
server.listen(3978, () => {
    console.log('Bot running...');
});

//set the endpoint for our bot
server.post('api/messages', connector.listen());
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

var trelloKey = process.env.TRELLO_KEY;
var trelloToken = process.env.TRELLO_TOKEN;
var trelloBoardID = process.env.TRELLO_BOARD_ID;
var pagerdutyKey = process.env.PAGERDUTY_KEY;

const PagerDuty = require('@pagerduty/pdjs');

var now = new Date();

var Trello = require("trello");
var trello = new Trello(trelloKey, trelloToken);

trello.getCardsOnBoard(trelloBoardID)
  .then((rawCards) => {
    return rawCards.filter((card) => {
      return Date.parse(card.due) <= now && !card.dueComplete;
    })
  })
  .then((overdueCards) => {
    overdueCards.forEach((c) => {
      PagerDuty.event({
        data: {
          routing_key: pagerdutyKey,
          event_action: 'trigger',
          dedup_key: c.id,
          payload: {
            summary: `Trello card: [${c.name}] overdue`,
            source: 'trello-pagerduty',
            severity: 'critical',
          },
        },
      })
        .catch(console.error);
    });
  })
  .catch((err) => {
    console.log(err);
  });

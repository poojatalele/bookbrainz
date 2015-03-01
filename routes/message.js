var express = require('express');
var router = express.Router();
var request = require('superagent');
require('superagent-bluebird-promise');

router.get('/messageForm', function(req, res) {
  res.render('editor/messageForm', {session: req.session, error: req.query.error});
});

function renderMessageList(view, req, res) {
  var ws = req.app.get('webservice');
  request.get(ws + '/message/' + view)
  .set('Authorization', 'Bearer ' + req.session.oauth.access_token).promise()
  .then(function(listResponse) {
    return listResponse.body;
  })
  .then(function(list) {
    res.render('editor/messageList', {
      session: req.session,
      view: view,
      messages: list
    });
  });
}

router.get('/inbox', function(req, res) {
  renderMessageList('inbox', req, res);
});

router.get('/archive', function(req, res) {
  renderMessageList('archive', req, res);
});

router.get('/sent', function(req, res) {
  renderMessageList('sent', req, res);
});

router.get('/message/:id', function(req, res) {
  var ws = req.app.get('webservice');
  request.get(ws + '/message/' + req.params.id)
  .set('Authorization', 'Bearer ' + req.session.oauth.access_token).promise()
  .then(function(messageResponse) {
    return messageResponse.body;
  })
  .then(function(message) {
    res.render('editor/message', {
      session: req.session,
      message: message
    });
  })
});


router.post('/message/handler', function(req, res) {
  // This function should post a new message to the /message/send endpoint of the ws.
  var ws = req.app.get('webservice');

  // Parse recipient ids
  recipientIds = req.body.recipients.split(',').map(function(substr) {
    return parseInt(substr);
  });

  request.post(ws + '/message/sent')
  .set('Authorization', 'Bearer ' + req.session.oauth.access_token)
  .send({
    'recipient_ids': recipientIds,
    'subject': req.body.subject,
    'content': req.body.content,
  }).promise()
  .then(function() {
    res.redirect(303, '/');
  });
});


module.exports = router;

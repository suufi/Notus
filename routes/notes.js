const {rethinkdb, domains, dataGovKey} = require('./../config');
const r = require('rethinkdbdash')(rethinkdb);
const router = require('express').Router();
const request = require('request');

// show main page
router.get('/', loggedIn, (req, res) => {
  request('https://api.nasa.gov/planetary/apod?api_key=' + dataGovKey + '&hd=true', function (err, body) {
    if (err) throw err;
    r.table('notus_notes').getAll(req.user.id, {
      index: 'userId'
    }).then(notes => {
      res.render('pages/index', {
        page: {
          title: 'Notes',
          description: 'Notes page @ Notus',
          url: domains.base + '/notes'
        },
        potd: JSON.parse(body.body),
        user: req.user,
        notes: notes
      });
    });
  });
});

// create note
router.post('/', loggedIn, (req, res) => {
  if (req.user) {
    r.table('notus_notes').getAll(req.user.id, {index: 'userId'}).then(notes => {
      if (notes.length >= 50) { return res.send({error: true, message: 'Too many notes!', description: 'Try deleting some notes then try again.'}); }
    }).then(() => {
      r.table('notus_notes').insert({
        title: req.body.title,
        description: req.body.description,
        userId: req.user.id,
        content: ''
      }).then(res.sendStatus(200));
    });
  } else {
    res.sendStatus(405);
  }
});

// get a single note
router.get('/:note', loggedIn, (req, res) => {
  if (req.user) {
    r.table('notus_notes').get(req.params.note).then(note => {
      if (note) {
        res.json(note);
      } else {
        res.sendStatus(404);
      }
    });
  } else {
    res.sendStatus(405);
  }
});

// edit a note's content
router.put('/:note', loggedIn, (req, res) => {
  if (req.user) {
    r.table('notus_notes').get(req.body.note).update({
      content: req.body.content
    }).then(res.sendStatus(200));
  } else {
    res.sendStatus(405);
  }
});

// edit a note's title/description
router.post('/:note', loggedIn, (req, res) => {
  if (req.user) {
    r.table('notus_notes').get(req.params.note).update({
      title: req.body.title,
      description: req.body.description
    }).then(() => res.sendStatus(200));
  } else {
    res.sendStatus(405);
  }
});

// delete a single note
router.delete('/:note', loggedIn, (req, res) => {
  if (req.user) {
    r.table('notus_notes').get(req.params.note).delete().then(res.sendStatus(200));
  } else {
    res.sendStatus(405);
  }
});

function loggedIn (req, res, next) {
  if (req.user) {
    next();
  }
  res.redirect('/login');
}

module.exports = router;

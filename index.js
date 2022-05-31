const express = require('express'),
  morgan = require('morgan');
  bodyParser = require('body-parser');
  uuid = require('uuid');

const app = express();

app.use(bodyParser.json());

app.use(morgan('common'));
app.use(express.static('public'));

let movies = [
  {
    title: 'Now and Then',
    director: 'Lesli Linka Glatter'
  },
  {
    title: 'Clue',
    director: 'Jonathan Lynn'
  },
  {
    title: 'Hook',
    director: 'Steven Spielberg'
  },
  {
    title: 'The Princess Bride',
    director: 'Rob Reiner'
  },
  {
    title: 'Labyrinth',
    director: 'Jim Henson'
  },
  {
    title: 'Garden State',
    director: 'Zach Braff'
  },
  {
    title: 'A Simple Favor',
    director: 'Paul Feig'
  },
  {
    title: 'The Baby-Sitters Club',
    director: 'Melanie Mayron'
  },
  {
    title: 'Sharknado',
    director: 'Anthony C. Ferrante'
  },
  {
    title: 'The Other Guys',
    director: 'Adam McKay'
  }
];

app.get('/movies', (req, res) => {
  res.json(movies);
});

app.get('/', (req, res) => {
  res.send('Welcome to My Cinema!')
});

app.get('/movies', (req, res) => {
  res.json(movies);
});

app.get('/movies/:title', (req, res) => {
  res.json(movies);
});

app.get('/movies/genre/:name', (req, res) => {
  res.json(genre);
});

app.get('/movies/director/:name', (req, res) => {
  res.json(director);
});

app.post('/users', (req, res) => {
  res.json(users);
});

app.put('/users/:username', (req, res) => {
  res.json(users);
});

app.post('/users/:username/:title', (req, res) => {
  res.send('Movie has been added to favorites.');
});

app.delete('/users/:username/:title', (req, res) => {
  res.send('Movie has been removed from favorites.');
});

app.delete('/users/:username', (req, res) => {
  res.send('User email has been removed.');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});

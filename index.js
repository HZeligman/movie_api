const express = require('express'),
  morgan = require('morgan');

const app = express();

app.use(morgan('common'));
app.use(express.static('public'));

let topMovies = [
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
  res.json(topMovies);
});

app.get('/', (req, res) => {
  res.send('Welcome to My Cinema!')
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});

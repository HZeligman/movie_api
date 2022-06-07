const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myCinemaDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const express = require('express'),
  morgan = require('morgan');
  bodyParser = require('body-parser');
  uuid = require('uuid');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(morgan('common'));
app.use(express.static('public'));

let movies = [
  {
    title: 'Now and Then',
    director: 'Lesli Linka Glatter',
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

//All Movies
app.get('/movies', (req, res) => {
  Movies.find()
  .then((movies) => {
    res.status(201).json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

app.get('/', (req, res) => {
  res.send('Welcome to My Cinema!')
});

//Movie by title
app.get('/movies/:title', (req, res) => {
  Movies.findOne({title: req.params.title})
  .then((movie) => {
    if (movie) {
      res.status(200).json(movie);
    } else {
      res.status(400).send('Movie not found.');
    };
  });
});

//Movie by genre
app.get('/movies/genre/:name', (req, res) => {
  Movies.findOne({'genre.name': req.params.name})
  .then((genre) => {
    res.status(201).json(genre)
  });
});

//Movie by director
app.get('/directors/:name', (req, res) => {
  Movies.findOne({'director.name': req.params.name})
    .then((movie) => {
      if (movie) {
        res.status(200).json(movie.director);
      } else {
        res.status(400).send('Director not found.');
      }
    });
});

//Add a user
app.post('/users', (req, res) => {
  Users.findOne({Username: req.body.Username})
    .then ((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) => {res.status(201).json(user)})
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//Get all users
app.get('/users', (req, res) => {
  Users.find()
   .then((users) => {
     res.status(201).json(users);
   })
   .catch((err) => {
     console.error(err);
     res.status(500).send('Error: ' + err);
   });
});

//Get a user by username
app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Update a user's info, by username
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({Username: req.params.Username}, {$set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  {new: true},
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//Add a movie to a user's list of favorites
app.post('/users/:username/favorites/:MovieID', (req, res) => {
  Users.findOneAndUpdate({username: req.params.username}, {
    $push: {FavoriteMovies: req.params.MovieID}
  },
  {new: true},
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//Delete a movie to a user's list of favorites
app.delete('/users/:username/favorites/:MovieID', (req, res) => {
  Users.findOneAndUpdate({username: req.params.username}, {
    $pull: {FavoriteMovies: req.params.MovieID}
  },
  {new: true},
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//Delete a user by username
app.delete('/users/:username', (req, res) => {
  Users.findOneAndRemove({username: req.params.username})
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found.');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error ' + err);
    });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});

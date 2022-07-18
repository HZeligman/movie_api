const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

//mongoose.connect('mongodb://localhost:27017/myCinemaDB', { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connect('mongodb+srv://HZeligman:Gmrmh1990@cluster0.y23vfe4.mongodb.net/myCinemaDB?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

//mongoose.connect('process.env.CONNECTION_URI', { useNewUrlParser: true, useUnifiedTopology: true });


const express = require('express'),
  morgan = require('morgan');
  bodyParser = require('body-parser');
  uuid = require('uuid');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const cors = require('cors');
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];

app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1) {
      let message = 'The CORS policy for this application doesn''t allow access from origin.' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));

const {check, validationResult} = require('express-validator');

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

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
app.get('/movies', passport.authenticate('jwt', {session: false}), (req, res) => {
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
app.get('/movies/:Title', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({Title: req.params.Title})
  .then((movie) => {
    if (movie) {
      res.status(200).json(movie);
    } else {
      res.status(400).send('Movie not found.');
    };
  });
});

//Movie by genre
app.get('/movies/genre/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.find({'Genre.Name': req.params.Name})
  .then((genre) => {
    res.status(201).json(genre)
  });
});

//Movie by director
app.get('/directors/:name', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({'Director.Name': req.params.name})
    .then((movie) => {
      if (movie) {
        res.status(200).json(movie.Director);
      } else {
        res.status(400).send('Director not found.');
      }
    });
});

//Add a user
app.post('/users',
  [
    check('Username', 'Username is required').isLength({min:5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({errors: errors.array()});
    }
    let hashedPassword = Users.hashedPassword(req.body.Password);
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
            });
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
app.get('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
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
app.put('/users/:Username', passport.authenticate('jwt', {session: false}),
  [
    check('Username', 'Username is required').isLength({min:5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({errors: errors.array()});
    }
    let hashedPassword = Users.hashedPassword(req.body.Password);
    Users.findOneAndUpdate({Username: req.params.Username}, {$set:
      {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      },
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
app.post('/users/:Username/favorites/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate({Username: req.params.Username}, {
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
app.delete('/users/:Username/favorites/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate({Username: req.params.Username}, {
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
app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndRemove({Username: req.params.Username})
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

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});

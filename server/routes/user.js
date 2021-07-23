const express = require('express');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const router = express.Router();

// Environment vars
const JWT_AUTH_SECRET = process.env.JWT_AUTH_SECRET;
const TMDB_TOKEN = process.env.TMDB_TOKEN;

// JWT auth function
const authJWT = (token, secret) => jwt.verify(token, secret, (err, data) => err ? false : data);
// JWT auth callback
const authJWTCallback = (req, res, next) => {
  const header = req.headers.authorization;
  if (header) {
    // Pull token from header and verify it
    const token = header.split(' ')[1];
    const auth = authJWT(token, JWT_AUTH_SECRET);

    // If verified, attach token body to req
    if (auth) {
      req.data = auth;
      next();
    }
    // Token invalid, likely expired, request refresh
    else {
      res.status(403).json({ status: 0, message: 'Invalid token' });
    }
  }
  else {
    res.status(401).json({ status: 0, message: 'No authorization token supplied' });
  }
}

// Authorized callback
const authorizedCallback = (req, res, next) => {
  // Check role, continue if account is not unconfirmed
  req.data.role !== 'unconfirmed' ? next() : res.status(403).json({ status: 0, message: 'Please have an admin confirm your account' });
}


module.exports = function (database) {
  // Destructure database object
  const { requestsCollection } = database;

  // request endpoint
  // Post request URL or JSON encoded
  // title: String
  // year: String
  // type: String
  router.post('/request', authJWTCallback, authorizedCallback, (req, res) => {
    const { user } = req.data;
    const { title, type, year } = req.body;

    // Required arguments
    // Year not checked, as it is not always available
    if (title && type) {
      // If year is provided, include in search
      const searchReq = year ? req.body : { title, type };
      // Search existing requests
      requestsCollection.findOne(searchReq)
        .then(found => {
          // Request doesn't already exist
          if (!found) {
            // Submit request
            requestsCollection.insertOne({ ...req.body, user })
              .then(result => {
                res.json({ status: 1, message: 'Request submitted successfully!' });
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({ status: -1, message: 'Internal server error' });
              })
          }
          // Request already exists
          else {
            res.status(400).json({ status: 0, message: 'Title already requested' });
          }
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({ status: -1, message: 'Internal server error' });
        })
    }
    else {
      res.status(400).json({ status: 0, message: 'Not enough arguments' });
    }
  });

  // search endpoint
  // Get request
  // q: String
  router.get('/search', authJWTCallback, authorizedCallback, (req, res) => {
    const searchQuery = req.query ? req.query.q || '' : '';

    // Fetch tvdb config
    fetch('https://api.themoviedb.org/3/configuration', {
      headers: {
        'Authorization': `Bearer ${TMDB_TOKEN}`
      }
    })
      .then(res => res.json())
      .then(({ images: config }) => {
        // Search tvdb with searchQuery
        fetch(`https://api.themoviedb.org/3/search/multi?query=${searchQuery}`, {
          headers: {
            'Authorization': `Bearer ${TMDB_TOKEN}`
          }
        })
          .then(res => res.json())
          .then(data => {
            // Results found
            if (!data.errors) {
              const { total_results, results } = data;
              if (total_results !== 0) {
                // Max results 6, unless total_results is less than 6
                // Format and record required data
                const formatted = results.slice(0, total_results < 6 ? total_results : 6).map(current => {
                  return {
                    // Movie and tv types have two different title props
                    title: current.title || current.name,
                    type: current.media_type,
                    // Movie and tv types have two different date props, get the year
                    year: (current.release_date || current.first_air_date || '').split('-')[0],
                    // Full path to the title's poster using urls from tvdb config, picks 3rd smallest poster size at pos 2
                    poster: current.poster_path ? config.secure_base_url + config.poster_sizes[2] + current.poster_path : null
                  }
                });
                res.json({ status: 1, message: formatted });
              }
              else {
                res.status(404).json({ status: 0, message: 'Not found' });
              }
            }
            // Error returned from tmdb api
            // Probably missing query
            // TODO: Might handle differently later
            else {
              res.status(400).json({ status: 0, message: data.errors[0] });
            }
          })
          .catch(err => {
            console.log(err);
            res.status(500).json({ status: -1, message: 'Internal server error' });
          })
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ status: -1, message: 'Internal server error' });
      })
  });

  return router;
}
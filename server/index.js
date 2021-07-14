require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const path = require('path');
const { MongoClient } = require('mongodb');

// Environment vars and defaults
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_COLLECTIONS_USERS = process.env.DB_COLLECTIONS_USERS;
const DB_COLLECTIONS_REQS = process.env.DB_COLLECTIONS_REQS;

// Mongodb connect string
const mongodbStr = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}`;

// Setup Express
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(helmet());
// Serve static react front-end
app.use(express.static(path.join(__dirname, '../client/build')));

// JWT auth function
const authJWT = (req, res, next) => {
  const header = req.headers.authorization;
  if (header) {
    const token = header.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, data) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.data = data;
      next();
    });
  }
  else {
    res.sendStatus(401);
  }
}

// Api only accessible if MongoDB is reachable
MongoClient.connect(mongodbStr, { useUnifiedTopology: true, connectTimeoutMS: 10000 })
  .then(client => {
    console.log('DB connection successful');
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(DB_COLLECTIONS_USERS);
    const requestsCollection = db.collection(DB_COLLECTIONS_REQS);

    // token endpoint
    app.get('/api/token', (req, res) => {
      const token = jwt.sign({ 'user': 'scot' }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    });

    // auth endpoint
    app.post('/api/auth', authJWT, (req, res) => {
      res.send(req.data);
    });
  })
  .catch(err => {console.log(err); return process.exit(1)});

// Get request wildcard, redirect to root
app.get('*', (req, res) => {
  res.redirect('/');
});

// 404 all undefined endpoints and methods that aren't GET
app.all('*', (req, res) => {
  res.sendStatus(404);
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}/api`);
});
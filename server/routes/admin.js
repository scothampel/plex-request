const express = require('express');
const ObjectId = require('mongodb').ObjectId;
const router = express.Router();

// Authorized callback
const authorizedCallback = (req, res, next) => {
  // Check role, continue if account is not unconfirmed
  req.data.role === 'admin' ? next() : res.status(403).json({ status: 0, message: 'Access limited to admins' });
}

module.exports = function (database) {
  // Destructure database object
  const { usersCollection, requestsCollection, refreshCollection } = database;

  // All routes need to auth user role first
  router.use(authorizedCallback)

  // users endpoint
  // Get request
  router.get('/users', (req, res) => {
    // Find all users, project without _id or pass
    usersCollection.find({}).project({ _id: 0, pass: 0 }).toArray()
      .then(result => {
        // Not checking for length, will handle on the front-end
        res.json(result)
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ status: -1, message: 'Internal server error' });
      })
  });

  // role endpoint
  // Patch request URL or JSON encoded
  // user: String
  // role: String
  router.patch('/role', (req, res) => {
    const { user, role } = req.body;

    // Required arguments
    if (user && role) {
      // role must be 'unconfirmed' or 'user' or 'admin'
      if (role === 'unconfirmed' || role === 'user' || role === 'admin') {
        // Try to update role
        usersCollection.updateOne({ user }, { $set: { role } })
          .then(updated => {
            // Destructure result to get statuses 
            const { matchedCount, modifiedCount } = updated;

            // Check for matched user
            if (matchedCount) {
              // Check that role was updated
              if (modifiedCount) {
                res.json({ status: 1, message: 'User role updated' });
              }
              else {
                res.status(400).json({ status: 0, message: 'User is already that role' });
              }
            }
            else {
              // Could be 404, but 400 more applicable as front-end won't allow for nonexistent users
              res.status(400).json({ status: 0, message: 'User not found' });
            }
          })
          .catch(err => {
            console.error(err);
            res.status(500).json({ status: -1, message: 'Internal server error' });
          })
      }
      // Role is not a valid role
      else {
        res.status(400).json({ status: 0, message: 'Invalid role' });
      }
    }
    else {
      res.status(400).json({ status: 0, message: 'Not enough arguments' });
    }
  });

  // request endpoint
  // Delete request URL or JSON encoded
  // id: string
  router.delete('/request', (req, res) => {
    const { id } = req.body;

    if (id) {
      // Check if id is properly formatted for ObjectId
      // Verify id is a 12 byte hex value (24 chars)
      // OR
      // Verify id is a 12 byte string
      if ((parseInt(id, 16).toString(16) === id && id.length === 24) || id.length === 12) {
        requestsCollection.deleteOne({ id: ObjectId(id) })
          .then(deleted => {
            // Destructure result to get status
            const { deletedCount } = deleted;

            // Check for deleted request
            if (deletedCount) {
              res.json({ status: 1, message: 'Request deleted' });
            }
            else {
              // Could be 404, but 400 more applicable as front-end won't allow for nonexistent requests
              res.status(400).json({ status: 0, message: 'Request not found' });
            }
          })
          .catch(err => {
            console.error(err);
            res.status(500).json({ status: -1, message: 'Internal server error' });
          })
      }
      else {
        res.status(400).json({ status: 0, message: 'Invalid id' });
      }
    }
    else {
      res.status(400).json({ status: 0, message: 'Not enough arguments' });
    }

  });

  return router;
}
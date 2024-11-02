const router = require('express').Router();
const { User } = require('../models');

// Test route
router.get('/test', (req, res) => {
    res.send('Auth routes are working');
  });

// GET route for login page
router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
      res.redirect('/');
      return;
  }
  
  const redirect = req.query.redirect || '/';
  res.render('login', {
      redirect,
      pageTitle: 'Login'
  });
});

// GET route for signup page
router.get('/signup', (req, res) => {
  if (req.session.logged_in) {
    res.redirect('/');
    return;
  }
  res.render('signup');
});

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password || username.length < 2 || password.length < 6) {
      res.status(400).json({ message: 'Invalid username or password' });
      return;
    }

    const userData = await User.create({ username, password });
    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;
      res.status(200).json({ user: userData, message: 'You are now signed up and logged in!' });
    });
  } catch (err) {
    res.status(400).json({ message: 'Signup failed', error: err.message });
  }
});


// Login
router.post('/login', async (req, res) => {
  try {
      const userData = await User.findOne({ 
          where: { username: req.body.username } 
      });

      if (!userData) {
          res.status(400).json({ message: 'Incorrect username or password' });
          return;
      }

      const validPassword = await userData.checkPassword(req.body.password);

      if (!validPassword) {
          res.status(400).json({ message: 'Incorrect username or password' });
          return;
      }

      req.session.save(() => {
          req.session.user_id = userData.id;
          req.session.logged_in = true;
          req.session.isAdmin = userData.isAdmin;

          // Send single response with appropriate redirect
          res.json({ 
              user: userData, 
              message: 'You are now logged in!', 
              redirect: userData.isAdmin ? '/admin' : (req.body.redirect || '/')
          });
      });
  } catch (err) {
      console.error('Login error:', err);
      res.status(400).json({ message: 'Login failed', error: err.message });
  }
});

// Logout 
router.post('/logout', (req, res) => {
  if (req.session.logged_in) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).json({ message: 'No user to log out' });
  }
});

module.exports = router;
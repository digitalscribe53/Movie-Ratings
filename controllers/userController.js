const { User, Movie, Rating } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userController = {
  // User registration
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = await User.create({
        username,
        email,
        password: hashedPassword
      });

      res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
    } catch (error) {
      console.error('Error in user registration:', error);
      res.status(500).json({ message: 'Error in user registration' });
    }
  },

  // User login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Create and assign token
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.json({ message: 'Logged in successfully', token });
    } catch (error) {
      console.error('Error in user login:', error);
      res.status(500).json({ message: 'Error in user login' });
    }
  },

  // Get user profile
  getProfile: async (req, res) => {
    try {
      // TODO: Add authentication middleware
      // const userId = req.user.id;
      const userId = req.params.id; // Temporary, replace with line above when auth is implemented

      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: Rating,
            include: [{ model: Movie, attributes: ['id', 'title'] }]
          }
        ]
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ message: 'Error fetching user profile' });
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      // TODO: Add authentication middleware
      // const userId = req.user.id;
      const userId = req.params.id; // Temporary, replace with line above when auth is implemented

      const { username, email } = req.body;

      const [updated] = await User.update(
        { username, email },
        { where: { id: userId } }
      );

      if (updated) {
        const updatedUser = await User.findByPk(userId, {
          attributes: { exclude: ['password'] }
        });
        return res.json(updatedUser);
      }

      throw new Error('User not found');
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ message: 'Error updating user profile' });
    }
  },

  // Get user's rated movies
  getRatedMovies: async (req, res) => {
    try {
      // TODO: Add authentication middleware
      // const userId = req.user.id;
      const userId = req.params.id; // Temporary, replace with line above when auth is implemented

      const ratedMovies = await Rating.findAll({
        where: { userId },
        include: [{ model: Movie, attributes: ['id', 'title', 'imageSrc'] }]
      });

      res.json(ratedMovies);
    } catch (error) {
      console.error('Error fetching rated movies:', error);
      res.status(500).json({ message: 'Error fetching rated movies' });
    }
  },

  // Logout
  logout: (req, res) => {
    // In a token-based system, typically the client-side handles logout
    // by removing the token. Here we'll just send a success message.
    res.json({ message: 'Logged out successfully' });
  }
};

module.exports = userController;
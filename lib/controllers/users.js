const { Router } = require('express');
const UserService = require('../services/UserService');
const IS_DEPLOYED = process.env.NODE_ENV === 'production';
const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

module.exports = Router()
  .post('/', async (req, res, next) => {
    try {
      const user = await UserService.create(req.body);
      res.json(user);
    } catch (e) {
      next(e);  
    }
  })
  
  .post('/sessions', async (req, res, next) => {
    try {
      const token = await UserService.signIn(req.body);
      res.cookie(process.env.COOKIE_NAME, token, {
        httpOnly: true,
        secure: IS_DEPLOYED,
        sameSite: IS_DEPLOYED ? 'none' : 'strict',
        maxAge: ONE_DAY_IN_MS, 
      })
        .json({ message: 'Successfully signed in!' });
    } catch (e) {
      next(e);
    }
  })

  .get('/me', authenticate, (req, res) => {
    res.json(req.user);
  });
  

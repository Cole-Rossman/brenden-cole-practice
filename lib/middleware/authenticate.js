const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const cookie = req.cookies[process.env.COOKIE_NAME]; 
    // [] is a way to pull attributes out of an object, so we are dot notating into the request to get the cookie then saying we want the process.env from the cookies obj. If you set an attribute of an object to a variable, you cant access it unless you use [].
    if (!cookie) throw new Error('You must be signed in to proceed');
    
    const user = jwt.verify(cookie, process.env.JWT_SECRET);

    req.user = user;

    next();
  } catch (error) {
    error.status = 401;
    next(error);  
  }
};


// add async after module.exports = if there is a problem

const express = require("express");
const router = new express.Router();

const ExpressError = require("../expressError");
const db = require("../db")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require("../config");
const { User } = require("../models/user")
const {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser,
} = require("../middleware/auth");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async function(req, res, next) {
  try {
    const { username, password } = req.body;
    const result = await db.query(
      `SELECT password 
       FROM users
       WHERE username = $1`,
       [username]);
    let user = result.rows[0];

    if (user) {
      if (await bcrypt.compare(password,user.password) == true) {
        let token = jwt.sign({username},SECRET_KEY);
        return res.json( {token} );
      }
    }
  } catch(err) {
    return next(err);
  }
})
/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post("/register", async function(req, res, next){
  try{
    const { username, password, first_name, last_name, phone } = req.body;
    if (!username || !password) {
      throw new ExpressError("Username and password required!", 400);
    }
    debugger;
    const user = await User.register(
      username,
      password,
      first_name,
      last_name,
      phone
      );
    console.log(user);
    let token = jwt.sign(user, SECRET_KEY);
    return res.json({token});
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
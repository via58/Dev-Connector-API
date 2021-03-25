const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) {
    res.status(401).json({ msg: "Authorization denied" });
  }
  try {
    let decoded = jwt.verify(token, config.get("jwtSecret"));
    req.user = decoded.user;
    console.log(decoded);
    // console.log(req);

    next();
  } catch (err) {
    console.log(err.message);
    res.status(401).json({ msg: "token is Invalid" });
  }
};

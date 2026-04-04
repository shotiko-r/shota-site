const jwt = require("jsonwebtoken");

const SECRET = "shota-secret";

function auth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) return res.status(401).send("Unauthorized");

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).send("Invalid token");
  }
}

function role(roleName) {
  return (req, res, next) => {
    if (req.user.role !== roleName && req.user.role !== "admin") {
      return res.status(403).send("Forbidden");
    }
    next();
  };
}

module.exports = { auth, role, SECRET };
const usersRouter = require("express").Router();
const User = require("../models/user");

// GET /api/users
usersRouter.get("/", (req, res) => {
  const { language } = req.query;
  User.findMany({ filters: { language } })
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error retrieving users from database");
    });
});

// GET /api/users/:id
usersRouter.get("/:id", (req, res) => {
  User.findOne(req.params.id)
    .then((user) => {
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).send("User not found");
      }
    })
    .catch((err) => {
      res.status(500).send("Error retrieving user from database");
    });
});

//POST /api/users
usersRouter.post("/", (req, res) => {
  let validationErrors = null;

  User.findByEmail(req.body.email)
    .then((otherUserWithEmail) => {
      if (otherUserWithEmail) return Promise.reject("DUPLICATE_EMAIL");

      validationErrors = User.validate(req.body);
      if (validationErrors) return Promise.reject("INVALID_DATA");
      return User.create(req.body);
    })
    .then((createdUser) => {
      res.status(200).json(createdUser);
    })
    .catch((err) => {
      console.error(err);
      if (err === "DUPLICATE_EMAIL")
        res.status(409).json({ message: "This email is already used." });
      else if (err === "INVALID_DATA")
        res.status(422).json({ validationErrors: validationErrors.details });
      else res.status(500).send("Error creating a user.");
    });
});

// PUT /api/users/:id
usersRouter.put("/:id", (req, res) => {
  let existingUser = null;
  let validationErrors = null;

  User.findByEmailAndId(req.params.id, req.body.email)
    .then(([[[existingUser]], [[otherUserWithEmail]]]) => {
      if (!existingUser) return Promise.reject("RECORD_NOT_FOUND");
      if (otherUserWithEmail) return Promise.reject("DUPLICATE_EMAIL");

      validationErrors = User.validate(req.body, false);
      if (validationErrors) return Promise.reject("INVALID_DATA");
      return User.update(req.params.id, req.body);
    })
    .then(() => {
      res.status(200).json({ id: req.params.id, ...existingUser, ...req.body });
    })
    .catch((err) => {
      console.error(err);
      if (err === "RECORD_NOT_FOUND")
        res.status(404).send(`User with id ${req.params.id} not found.`);
      if (err === "DUPLICATE_EMAIL")
        res.status(409).json({ message: "This email is already used" });
      else if (err === "INVALID_DATA")
        res.status(422).json({ validationErrors: validationErrors.details });
      else res.status(500).send("Error updating a user.");
    });
});

// DELETE by id
usersRouter.delete("/:id", (req, res) => {
  User.destroy(req.params.id)
    .then((deleted) => {
      if (deleted) res.status(200).send("🎉 User deleted!");
      else res.status(404).send("User not found");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error deleting the user");
    });
});

module.exports = usersRouter;

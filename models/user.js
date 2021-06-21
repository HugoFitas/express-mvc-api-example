const connection = require("../db-config");
const Joi = require("joi");

const db = connection.promise();

const validate = (data, forCreation = true) => {
  const presence = forCreation ? "required" : "optional";
  return Joi.object({
    email: Joi.string().email().max(255).presence(presence),
    firstname: Joi.string().min(1).max(255).presence(presence),
    lastname: Joi.string().min(1).max(255).presence(presence),
    city: Joi.string().allow(null, "").max(255).presence(presence),
    language: Joi.string().allow(null, "").max(255).presence(presence),
  }).validate(data, { abortEarly: false }).error;
};

// GET all
const findMany = ({ filters: { language } }) => {
  let sql = "SELECT * FROM users";
  const sqlValues = [];
  if (language) {
    sql += " WHERE language = ?";
    sqlValues.push(req.query.language);
  }

  return db.query(sql, sqlValues).then(([results]) => results);
};

// GET by id
const findOne = (id) => {
  return db
    .query("SELECT * FROM users WHERE id = ?", [id])
    .then(([results]) => results[0]);
};

// POST
const create = (userData) => {
  return db.query("INSERT INTO users SET ?", [userData]).then(([result]) => {
    const id = result.insertId;
    return { id, ...userData };
  });
};

// GET by id and GET by email
const findByEmailAndId = (id, email) => {
  return Promise.all([
    db.query("SELECT * FROM users WHERE id = ?", [id]),
    db.query("SELECT * FROM users WHERE email = ? AND id <> ?", [email, id]),
  ]);
};

// PUT id
const update = (id, newAttributes) => {
  return db.query("UPDATE users SET ? WHERE id = ?", [newAttributes, id]);
};

// GET by email
const findByEmail = (email) => {
  return db
    .query("SELECT * FROM users WHERE email = ?", [email])
    .then(([results]) => results[0]);
};

// DELETE id
const destroy = (id) => {
  return db
    .query("DELETE FROM users WHERE id = ?", [id])
    .then(([result]) => result.affectedRows !== 0);
};

module.exports = {
  validate,
  findMany,
  findOne,
  create,
  findByEmailAndId,
  update,
  findByEmail,
  destroy,
};

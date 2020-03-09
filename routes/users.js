const express = require("express");
const Router = express.Router();
const UserController = require('../controllers/users')

Router.post("/new", async (req, res) => {
  try {
    res.json(await UserController.createUser(req.body))
  } catch (e) {
    res.status(500).json(e.message)
  }
})

Router.put("/edit", async (req, res) => {
  try {
    res.send(await UserController.updateUser(req.body))
  } catch (e) {
    res.status(500).json(e.message)
  }
})

Router.delete("/delete", async (req,res) => {
  try {
    res.send(await UserController.deleteUser(req.body))
  } catch (e) {
    res.status(500).json(e.message)
  }
})

module.exports = Router;

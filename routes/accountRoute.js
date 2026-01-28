//Needed resources
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")

//Route to login page
router.get("/login", utilities.handleErrors(accountController.buildLogin))

//Route to register page
router.get("/registration", utilities.handleErrors(accountController.buildRegister))
//registration post route
router.post('/registration', utilities.handleErrors(accountController.registerAccount))


module.exports = router;
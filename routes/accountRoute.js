//Needed resources
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation')

//Route to login page
router.get("/login", utilities.handleErrors(accountController.buildLogin))

//Route to register page
router.get("/registration", utilities.handleErrors(accountController.buildRegister))
//registration post route
router.post('/registration',
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount))

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkloginData,
  utilities.handleErrors(accountController.accountLogin)
)

module.exports = router;
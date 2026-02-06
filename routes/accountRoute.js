//Needed resources
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation')


//Route to login page
router.get("/login", utilities.handleErrors(accountController.buildLogin))

//Route to register page
router.get("/registration", 
  utilities.handleErrors(accountController.buildRegister))

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

// Default route for account management view
router.get("/", 
  utilities.checkLogin, 
  utilities.handleErrors(accountController.buildAccountManagement)
)

//Build account update view
router.get("/update", 
  utilities.checkLogin, 
  utilities.handleErrors(accountController.buildAccountUpdate))

//Account update Route
router.post("/update", 
  utilities.checkLogin, 
  regValidate.updateAccountRules(), 
  regValidate.checkAccountData, 
  utilities.handleErrors(accountController.updateAccount))

//Password change route
router.post("/update-password", 
  utilities.checkLogin, 
  regValidate.updatePasswordRules(), 
  regValidate.checkAccountPassword, 
  utilities.handleErrors(accountController.updatePassword))

//logout route
router.get("/logout", utilities.handleErrors(accountController.accountLogout))


module.exports = router;
const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const accountModel = require("../models/account-model")

/*  **********************************
*  Registration Data Validation Rules
* ********************************* */
validate.registrationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the DB
      body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email) =>{
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists){
            throw new Error("Email exists. Please Log in or use a different Email.")
        }
      }),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/registration", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/* ******************************
 * Login data validation rules
 * ***************************** */
validate.loginRules = () => {
    return [
      // email is required and must be string
      body("account_email")
        .trim()
        .normalizeEmail()
        .notEmpty()
        .isEmail()
        .withMessage("Please provide your account email."), // on error this message is sent.
  
      // password is required and must be string
      body("account_password")
        .trim()
        .notEmpty()
        .withMessage("Please provide your password."), // on error this message is sent.
        ]
    }

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkloginData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    })
    return
  }
  next()
}

/* ******************************
 * Account update validation Rules
 * ***************************** */
validate.updateAccountRules = () => {
  return [
    body("account_firstname")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Please provide a first name"),

    body("account_lastname")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Please provide a last name"),

    body("account_email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("A valid email is required")
    .custom(async (account_email, { req }) => {
        const account_id = req.body.account_id
        const emailExists = await accountModel.checkExistingEmail(account_email)

        // If email exists and does NOT belong to current account → error
        if (emailExists && emailExists.account_id != account_id) {
          throw new Error("Email already exists. Please use a different email.")
        }
      }),
  ]
}

/* ******************************
 * check data and return error or continue to update account
 * ***************************** */
validate.checkAccountData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/update", {
      title: "Update Account Information",
      nav,
      errors,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/* ******************************
 * Password update validation rules
 * ***************************** */
validate.updatePasswordRules = () => {
  return [
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}
/* ******************************
 * Check data and return error or continue to change password
 * ***************************** */
validate.checkAccountPassword = async (req, res, next) => {
  const { account_id } = req.body
  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/update", {
      title: "Update Account Information",
      nav,
      errors,
      accountData: {
        account_id,
      },
    })
    return
  }
  next()
}

module.exports = validate
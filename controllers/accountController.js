const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* *****************
* Deliver Login view
******************* */
async function buildLogin(req, res, next) {
    let nav =await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null
    })
}

/* **************************
* Deliver registration view
* ************************ */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/registration", {
        title: "Register",
        nav,
        errors: null
    })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    return res.status(500).render("account/registration", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/registration", {
      title: "Registration",
      nav,
      errors: null
    })
  }
}

/* ****************************************
*  Process Login request
* *************************************** */
async function accountLogin(req,res) {
  let nav = await utilities.getNav()
  const {account_email, account_password} =req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
      return
    } 
    try {
      if(await bcrypt.compare(account_password, accountData.account_password)) {
        delete accountData.account_password
        const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000})

        if(process.env.NODE_ENV === 'development') {
          res.cookie("jwt", accessToken, {httpOnly: true, maxAge: 3600 * 1000})        
        } else {
          res.cookie("jwt", accessToken, {httpOnly: true, secure: true, maxAge: 3600 * 1000 })
        }
          req.flash("notice", "You're logged in")
          return res.redirect("/account/")
      } else {
          req.flash("notice", "Please check your credentials and try again.")
          res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
          })
        }
    } catch (error) {
      throw new Error('Access Forbidden')}
}

/* **************************
* Deliver account management view
* ************************ */
async function buildAccountManagement(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/management", {
        title: "Account Management",
        nav,
        errors: null
    })
}

/* **************************
* Deliver account update view
* ************************ */
async function buildAccountUpdate(req, res, next) {
    let nav = await utilities.getNav()
    const accountData = res.locals.accountData

    res.render("account/update", {
    title: "Update Account Information",
    nav,
    errors: null,
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email
    })
}

/* **************************
* process Account update
* ************************ */
async function updateAccount(req, res) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body;
    if (account_id != res.locals.accountData.account_id) {
    req.flash("notice", "Unauthorized action.")
    return res.redirect("/account/")
  }

  try {
    const result = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email);

    req.flash("notice", "Account information updated successfully.");
    res.redirect("/account/"); // back to account management view
  } catch (error) {
    console.error(error);
    req.flash("notice", "Unable to update account. Please try again.");
    res.redirect("/account/");
  }
}  
/* **************************
* <process change password>
* ************************ */


async function updatePassword(req, res) {
  const { account_id, account_password } = req.body;
    if (account_id != res.locals.accountData.account_id) {
    req.flash("notice", "Unauthorized action.")
    return res.redirect("/account/")
  }

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const result = await accountModel.updatePassword(account_id, hashedPassword);

    req.flash("notice", "Password updated successfully.");
    res.redirect("/account/");
  } catch (error) {
    console.error(error);
    req.flash("notice", "Unable to update password. Please try again.");
    res.redirect("/account/");
  }
}

/* *****************************
* logout function
* ***************************** */
function accountLogout(req, res) {
  res.clearCookie("jwt")
  res.redirect("/")
}

module.exports = {buildLogin, buildRegister, 
  registerAccount, accountLogin, buildAccountManagement, 
  buildAccountUpdate, updateAccount, updatePassword, accountLogout}
const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
* Constructs the nave HTML unordered list
************************ */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications()
    let list = "<ul>"
    //console.log(data)
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
        list += "<li>"
        list +=
        '<a href="/inv/type/' + row.classification_id + '" title="See our inventory of ' + row.classification_name + ' vehicles">' + row.classification_name + "</a>"
        list += "</li>"
    })
    list += "</ul>"
    return list
}

/* ************************
* Build the classification view HTML
* ************************/
Util.buildByClassificationGrid = async function(data) {
    let grid = ''
    if(data.length > 0){
        grid = '<div class="inventory-grid">'
        data.forEach(vehicle => {
            grid += '<div class="inventory-card">'
            grid += '<a href="/inv/detail/' + vehicle.inv_id + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model + 'details"><img src="' + vehicle.inv_thumbnail
            +'" alt="Image of '+ vehicle.inv_make + ' '+vehicle.inv_model +'on CSE Motors" ></a>'
            grid += '<div class="namePrice">'
            grid += '<hr >'
            grid += '<h2>'
            grid += '<a href="/inv/detail/' + vehicle.inv_id +'" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model + ' details">'
            + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
            grid += '</h2>'
            grid += '<span>$'
            + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
            grid += '</div>'
            grid += '</div>'
        })
        grid += '</div>'
    } else{
        grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}

/* ************************
* Build inventory detail view HTML
************************ */
Util.buildInventoryDetail = function(vehicle) {
    let detail = `
    <section class="inv-detail">
        <div class="inv-detail-image">
            <img src="${vehicle.inv_image}"
                alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors"></img>
        </div>

        <div class="inv-detail-info">
            <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
            <p class="inv-price">
                <strong>Price:</strong>
                $${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}
            </p>

            <p class="inv-mileage">
                <strong>Mileage:</strong>
                ${new Intl.NumberFormat("en-US").format(vehicle.inv_miles)} miles
            </p>

            <p class="inv-color">
                <strong>Color:</strong> ${vehicle.inv_color}
            </p>

            <p class="inv-description">
                <strong>Description:</strong><br>
                ${vehicle.inv_description}
            </p>
        </div>
    </section>
    `
    return detail
}

/* *************************
* Middleware For Handling Errors
* Wrap other Function in this for
*General Error Handling
***************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ************************
* Build classification list for add inventory form
************************ */
Util.buildClassificationList = async function (
    classification_id = null, 
    required = false) {
    let data = await invModel.getClassifications()

    let classificationList =
      `<select name="classification_id" id="classificationList" ${required ? "required" : ""}>`
    
      classificationList += "<option value=''>Choose a Classification</option>"

    data.rows.forEach((row) => {
      classificationList += `<option value="${row.classification_id}"`
      if (
        classification_id != null &&
        row.classification_id == classification_id
      ) {
        classificationList += " selected "
      }
      classificationList += `>${row.classification_name}</option>`
    })
    classificationList += "</select>"
    return classificationList
  }

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
    res.locals.loggedin = false

    if (req.cookies.jwt) {
    jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
        if (err) {
        req.flash("notice","Please log in")
        res.clearCookie("jwt")
        return res.redirect("/account/login")
        }
        res.locals.accountData = accountData
        res.locals.loggedin = true
        next()
        }
      )
    } else {
        next()
    }
}

/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

 /* **************************************
 * Check Account Type
 ************************************* */
Util.checkAccountType =(req, res, next) => {
    if(
        res.locals.loggedin &&
        (res.locals.accountData.account_type === "Employee" ||
            res.locals.accountData.account_type === "Admin")
        ) {
            return next()
        }
        req.flash("notice", "you must be logged in as an employee or administrator to access that page.")
        return res.redirect("/account/login")
}

module.exports = Util
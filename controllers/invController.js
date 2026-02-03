const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { validationResult } = require("express-validator")

const invCont = {}

/* *******************
* Build inventory by classification view
* ******************* */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildByClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
        title: className + "vehicles",
        nav,
        grid,
    })
}

/* ***************************
* Build inventory item detail view
**************************** */
invCont.buildInventoryDetail = async function (req, res, next) {
    const inv_id = req.params.invId

    if (!inv_id) {
        return next(new Error("No inventory ID provided"))
    }

    const vehicle = await invModel.getInventoryById(inv_id)
    if (!vehicle) {
        return next(new Error("Vehicle not found"))
    }

    const detail = utilities.buildInventoryDetail(vehicle)
    const nav = await utilities.getNav()

    res.render("./inventory/detail", {
        title: `${vehicle.inv_make} ${vehicle.inv_model}`,
        nav,
        detail,
        errors: null
    })
}

/* *****************************
*Build Management Center view
* ***************************** */
invCont.buildManagementView = async function (req, res, next) {
    let nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList()
    res.render("inventory/management", {
        title: "Inventory Management Center",
        nav,
        errors: null,
        classificationList
    })  
}

/* **********************
*Build Add Classification View
*********************** */
invCont.buildAddClassification = async function (req, res) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null
  })
}

/* ******************
*Process Add Classification
****************** */
invCont.addClassification = async function (req, res) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body

  const result = await invModel.addClassification(classification_name)

  if (result) {
    req.flash("notice", "Classification added successfully.")
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Failed to add classification.")
    res.status(500).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null
    })
  }
}

/* **********************
*Build Add Inventory View
*********************** */
invCont.buildAddInventory = async function (req, res) {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList()

    res.render("inventory/add-inventory", {
    title: "Add Inventory Item",
    nav,
    classificationList,
    errors: null,
    inv_make: "",
    inv_model: "",
    inv_year: "",
    inv_description: "",
    inv_image: "/images/vehicles/no-image.png",
    inv_thumbnail: "/images/vehicles/no-image-tn.png",
    inv_price: "",
    inv_miles: "",
    inv_color: "",
    classification_id: ""
  })
}

/* **********************
*Process Add inventory item
*********************** */
invCont.addInventory = async function (req, res) {
  let nav = await utilities.getNav()
  let { 
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id } = req.body
    inv_image = inv_image || "/images/vehicles/no-image.png"
    inv_thumbnail = inv_thumbnail || "/images/vehicles/no-image-tn.png"

    // Run server-side validation
  const errors = validationResult(req) // assuming express-validator
  if (!errors.isEmpty()) {
    // Re-render form with sticky values
    let classificationList = await utilities.buildClassificationList(classification_id)
    return res.status(400).render("inventory/add-inventory", {
      title: "Add Inventory Item",
      nav,
      classificationList,
      errors,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image: inv_image || "/images/vehicles/no-image.png",
      inv_thumbnail: inv_thumbnail || "/images/vehicles/no-image-tn.png",
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }

  const result = await invModel.addInventory(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
)

  if (result) {
    req.flash("notice", "Inventory item added successfully.")
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Failed to add inventory item.")
    let classificationList = await utilities.buildClassificationList(classification_id)

    res.status(500).render("inventory/add-inventory", {
      title: "Add Inventory Item",
      nav,
      classificationList,
      errors: null,
      //sticky values
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async function (req, res, next) {
  const classification_id = req.params.classification_id
  try {
    const inventoryData = await invModel.getInventoryByClassificationId(classification_id)
    res.json(inventoryData)
  } catch (error) {
    console.error("getInventoryJSON error:", error)
    res.status(500).json({ error: "Unable to retrieve inventory data" })
  }
}

module.exports =invCont
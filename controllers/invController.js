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

/* **********************
*Build edit Inventory View
*********************** */
invCont.editInventoryView = async function (req, res) {
    const inv_id = parseInt(req.params.inv_id)
      if (isNaN(inv_id)) {
        throw new Error("Invalid inventory ID")
      }
    let nav = await utilities.getNav()
    const inventory = await invModel.getInventoryById(inv_id)
        if (!inventory) {
          throw new Error("Inventory item not found")
        }
    let classificationList = await utilities.buildClassificationList(inventory.classification_id)
    const itemName = `${inventory.inv_make} ${inventory.inv_model}`

    res.render("inventory/edit", {
    title: `Edit ${itemName}`,
    nav,
    classificationList,
    errors: null,
    inv_id: inventory.inv_id,
    inv_make: inventory.inv_make,
    inv_model: inventory.inv_model,
    inv_year: inventory.inv_year,
    inv_description: inventory.inv_description,
    inv_image: inventory.inv_image,
    inv_thumbnail: inventory.inv_thumbnail,
    inv_price: inventory.inv_price,
    inv_miles: inventory.inv_miles,
    inv_color: inventory.inv_color,
    classification_id: inventory.classification_id
  })
}

/* **********************
* Process Update Inventory Item
*********************** */
invCont.updateInventory = async function (req, res) {
    let nav = await utilities.getNav();
    const inv_id = parseInt(req.body.inv_id)
    const {inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id } = req.body;

    const itemName = `${inv_make} ${inv_model}`

    const result = await invModel.updateInventory(
        inv_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id
    )

    if (result) {
        const itemName = `${result.inv_make} ${result.inv_model}`
        req.flash("notice", `The ${itemName} was successfully updated.`);
        res.redirect("/inv/");
    } else {
        req.flash("notice", "Failed to update inventory item.");
        let classificationList = await utilities.buildClassificationList(classification_id);

        return res.status(500).render("inventory/edit", {
            title: "Edit Inventory Item",
            nav,
            classificationList,
            errors: null,
            inv_id,
            inv_make,
            inv_model,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_year,
            inv_miles,
            inv_color,
            classification_id
        })
    }
}

/* **********************
*Build delete Inventory View
*********************** */
invCont.deleteItemView = async function (req, res) {
    const inv_id = parseInt(req.params.inv_id)
    let nav = await utilities.getNav()
    const inventory = await invModel.getInventoryById(inv_id)
    let classificationList = await utilities.buildClassificationList(inventory.classification_id)
    const itemName = `${inventory.inv_make} ${inventory.inv_model}`

    res.render("inventory/delete", {
    title: `Delete ${itemName}`,
    nav,
    classificationList,
    errors: null,
    inv_id: inventory.inv_id,
    inv_make: inventory.inv_make,
    inv_model: inventory.inv_model,
    inv_price: inventory.inv_price,
    inv_year: inventory.inv_year,

  })
}

/* **********************
* Process Delete Inventory Item
*********************** */
invCont.deleteItem = async function (req, res) {
    let nav = await utilities.getNav();
    const inv_id = parseInt(req.body.inv_id)
    if (isNaN(inv_id)) {
      req.flash("notice", "Invalid inventory ID.")
      return res.redirect("/inv/")
    }
    
    const result = await invModel.deleteInventoryItem(inv_id)

    if (result) {
        req.flash("notice", `The Inventory Item was successfully deleted.`);
        res.redirect("/inv/");
    } else {
        req.flash("notice", "Failed to Delete inventory item.");

        const inventory = await invModel.getInventoryById(inv_id)

        return res.status(500).render("inventory/edit", {
            title: "Delete Inventory Item",
            nav,
            errors: null,
            inv_id: inventory.inv_id,
            inv_make: inventory.inv_make,
            inv_model: inventory.inv_model,
            inv_year: inventory.inv_year,
            inv_price: inventory.inv_price
        })
    }
}


module.exports =invCont
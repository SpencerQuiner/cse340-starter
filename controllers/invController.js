const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

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
    })
}

module.exports =invCont
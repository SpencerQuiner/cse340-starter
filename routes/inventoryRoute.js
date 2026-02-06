//Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidate = require("../utilities/inventory-validation")

//Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to get inventory JSON for a specific classification
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON)
)
//Route to build inventory detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildInventoryDetail))

// Route to build Inventory management view
router.get("/", utilities.checkAccountType, utilities.handleErrors(invController.buildManagementView))

//add new classification
router.get("/add-classification", utilities.checkAccountType, utilities.handleErrors(invController.buildAddClassification))

router.post("/add-classification", utilities.checkAccountType, invValidate.classificationRules(), 
    invValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
)
// add new inventory item
router.get("/add-inventory", utilities.checkAccountType, utilities.handleErrors(invController.buildAddInventory))

router.post("/add-inventory", utilities.checkAccountType, invValidate.inventoryRules(),
    invValidate.checkInventoryData,
    utilities.handleErrors(invController.addInventory)
)

//route to build update detail view
router.get("/edit/:inv_id", utilities.checkAccountType, utilities.handleErrors(invController.editInventoryView))

router.post("/edit", utilities.checkAccountType, invValidate.inventoryRules(), 
    invValidate.checkInventoryData, 
    utilities.handleErrors(invController.updateInventory))

//route to build delete inventory item view
router.get("/delete/:inv_id", utilities.checkAccountType, utilities.handleErrors(invController.deleteItemView))
router.post("/delete", utilities.checkAccountType, utilities.handleErrors(invController.deleteItem))

module.exports = router; 
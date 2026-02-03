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

router.get("/",utilities.handleErrors(invController.buildManagementView))

router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))

router.post("/add-classification", invValidate.classificationRules(), 
    invValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
)

router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))

router.post("/add-inventory", invValidate.inventoryRules(),
    invValidate.checkInventoryData,
    utilities.handleErrors(invController.addInventory)
)

module.exports = router;
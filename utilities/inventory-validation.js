const utilities = require(".")
const { body, validationResult } = require("express-validator")

const validate = {}

/* **********************************
 * Classification Validation Rules
 * ********************************* */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .notEmpty()
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage(
        "Classification name cannot contain spaces or special characters."
      )
  ]
}

/* **********************************
 * Check Classification Data
 * ********************************* */
validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors,
      classification_name
    })
    return
  }
  next()
}

/* ***********************
*Inventory Validation Rules
********************** */
validate.inventoryRules = () => {
  return [
    body("inv_make")
      .trim()
      .notEmpty()
      .withMessage("Make is required")
      .matches(/^[A-Za-z0-9\s\-_]+$/)
      .withMessage("Make can only contain letters, numbers, spaces, hyphens, and underscores"),

    body("inv_model")
      .trim()
      .notEmpty()
      .withMessage("Model is required")
      .matches(/^[A-Za-z0-9\s\-]+$/)
      .withMessage("Model can only contain letters, numbers, spaces, and hyphens"),

    body("inv_year")
      .notEmpty()
      .withMessage("Year is required")
      .isInt({ min: 1900, max: 2030 })
      .withMessage("Year must be between 1900 and 2030"),

    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Description is required")
      .isLength({ max: 255 })
      .withMessage("Description must be less than 255 characters"),

    body("inv_image")
      .optional({ checkFalsy: true })
      .matches(/^\/images\/vehicles\/[A-Za-z0-9_\-]+\.(jpg|jpeg|png|gif)$/)
      .withMessage("Image path must be in /images/vehicles and end with .jpg, .jpeg, .png, or .gif"),

    body("inv_thumbnail")
      .optional({ checkFalsy: true })
      .matches(/^\/images\/vehicles\/[A-Za-z0-9_\-]+\.(jpg|jpeg|png|gif)$/)
      .withMessage("Thumbnail path must be in /images/vehicles and end with .jpg, .jpeg, .png, or .gif"),

    body("inv_price")
      .notEmpty()
      .withMessage("Price is required")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),

    body("inv_miles")
      .notEmpty()
      .withMessage("Miles is required")
      .isInt({ min: 0 })
      .withMessage("Miles must be a positive number"),

    body("inv_color")
      .trim()
      .notEmpty()
      .withMessage("Color is required")
      .matches(/^[A-Za-z\s\-\']+$/)
      .withMessage("Color can only contain letters, spaces, hyphens, and apostrophes"),

    body("classification_id")
      .notEmpty()
      .withMessage("Classification is required")
  ]
}

/* ***********************
*Check Inventory Data
********************** */

validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).render("inventory/add-inventory", {
      title: "Add Inventory Item",
      nav: await require("../utilities").getNav(),
      classificationList: await require("../utilities").buildClassificationList(req.body.classification_id),
      errors,
      ...req.body // passes all input back for sticky values
    })
  }
  next()
}

/* ***********************
*Search Validation Rules
********************** */

validate.searchValidateRules= () => {
  return [
    body("min_price")
      .optional({ checkFalsy: true })
      .isFloat({ min: 0})
      .withMessage("Minimum price must be a number"),

    body("max_price")
      .optional({ checkFalsy: true })
      .isFloat({ min: 0 })
      .withMessage("Maximum price must be a number")
      .custom((value, { req }) => {
        const minPrice = Number(req.body.min_price?.trim())
        const maxPrice = Number(value?.trim())
          if (!isNaN(minPrice) && !isNaN(maxPrice)) {
            if (maxPrice < minPrice) {
              throw new Error("Maximum price must be greater than minimum price")
          }
        }
        return true
      }),

    body("min_miles")
      .optional({ checkFalsy: true })
      .isInt({ min: 0 })
      .withMessage("Minimum miles must be a number"),

   body("max_miles")
      .optional({ checkFalsy: true })
      .isInt({ min: 0 })
      .withMessage("Maximum miles must be a number")
      .custom((value, { req }) => {
        const minMiles = Number(req.body.min_miles?.trim())
        const maxMiles = Number(value?.trim())

          // Only validate if both are numbers
          if (!isNaN(minMiles) && !isNaN(maxMiles)) {
            if (maxMiles < minMiles) {
              throw new Error("Maximum miles must be greater than minimum miles")
            }
          }
          return true
      }),
  ]
}

/* ***********************
*Validate Search
********************** */
validate.validateSearch = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const utilities = require("../utilities")
    const nav = await utilities.getNav()
    const classificationList =
      await utilities.buildClassificationList(req.body.classification_id)

    return res.status(400).render("inventory/search", {
      title: "Search Vehicle Inventory",
      nav,
      classificationList,
      errors: errors.array(),
      filters: req.body // keeps sticky values
    })
  }

  next()
}

module.exports = validate
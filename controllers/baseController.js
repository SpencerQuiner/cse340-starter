const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
    const nav = await utilities.getNav()
    res.render("index", {title: "Home", nav})
}

/* *******************
*Intentional error trigger
******************** */
baseController.triggerError = async function (req, res, next) {
    try {
        //INTENTIONAL 500 ERROR
        throw new Error("Intentional Server Error for testing")
    } catch (err) {
        err.status = 500
        next(err)
    }
}

module.exports = baseController
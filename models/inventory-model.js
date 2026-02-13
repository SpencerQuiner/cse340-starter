const pool = require("../database/")

/* *******************
* Get all classification data
* ******************* */
async function getClassifications(){
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***********************
* Get all inventory items and classification_name by classification_id
******************** */
async function getInventoryByClassificationId(classification_id) {
    try {
        const data =await pool.query(
            `SELECT * FROM public.inventory AS i
            JOIN public.classification  AS c
            ON i.classification_id = c.classification_id
            WHERE i.classification_id = $1`,
            [classification_id]
        )
        return data.rows
    } catch (error) {
        console.error("getclassificationsbyid error" + error)
    }
}

/* *************************
*Get inventory item detail information by inv_id
************************* */
async function getInventoryById(inv_id){
    try {
        const data = await pool.query(
            `SELECT *
             FROM public.inventory
             WHERE inv_id = $1`,
             [inv_id]
        )
        return data.rows[0]
    } catch (error) {
        console.error("getInventoryById error " + error)
    }
}

/* ****************************
* Add New Classification
**************************** */
async function addClassification(classification_name) {
  try {
    const sql = `
      INSERT INTO classification (classification_name)
      VALUES ($1)
      RETURNING *
    `
    const result = await pool.query(sql, [classification_name])
    return result.rows[0]
  } catch (error) {
    console.error("addClassification error:", error)
    return null
  }
}

/* ****************************
* Add New inventory Item
**************************** */
async function addInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) {
  try {
    const sql = 
    `INSERT INTO inventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`

    const result = await pool.query(sql, [
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id])

    return result.rows[0]
  } catch (error) {
    console.error("addInventory error:", error)
    return null
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
 async function deleteInventoryItem(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1'
    const data = await pool.query(sql, [inv_id])
  return data
  } catch (error) {
    new Error("Delete Inventory Error")
  }
}

/* ***************************
 *  Search Inventory
 * ************************** */
 async function searchInventory(filters) {
  try {
    let baseQuery = `SELECT * FROM inventory`
    
    const whereClauses = []
    const values = []
    let index = 1

    //make
    if (filters.inv_make) {
      whereClauses.push(`inv_make ILIKE $${index}`)
      values.push(`%${filters.inv_make}%`)
      index++
    }

    //model
    if (filters.inv_model) {
      whereClauses.push(`inv_model ILIKE $${index}`)
      values.push(`%${filters.inv_model}%`)
      index++
    }

    // Min Year
    if (filters.min_year) {
      whereClauses.push(`inv_year >= $${index}`)
      values.push(filters.min_year)
      index++
    }

    // Max Year
    if (filters.max_year) {
      whereClauses.push(`inv_year <= $${index}`)
      values.push(filters.max_year)
      index++
    }

    // Min Price
    if (filters.min_price) {
      whereClauses.push(`inv_price >= $${index}`)
      values.push(filters.min_price)
      index++
    }

    // Max Price
    if (filters.max_price) {
      whereClauses.push(`inv_price <= $${index}`)
      values.push(filters.max_price)
      index++
    }

    // Min Miles
    if (filters.min_miles) {
      whereClauses.push(`inv_miles >= $${index}`)
      values.push(filters.min_miles)
      index++
    }

    // Max Miles
    if (filters.max_miles) {
      whereClauses.push(`inv_miles <= $${index}`)
      values.push(filters.max_miles)
      index++
    }

    // Color
    if (filters.inv_color) {
      whereClauses.push(`inv_color ILIKE $${index}`)
      values.push(`%${filters.inv_color}%`)
      index++
    }

    // Classification
    if (filters.classification_id) {
      whereClauses.push(`classification_id = $${index}`)
      values.push(filters.classification_id)
      index++
    }

    // Combine WHERE clauses if any exist
    if (whereClauses.length > 0) {
      baseQuery += " WHERE " + whereClauses.join(" AND ")
    }

    // Optional ordering
    baseQuery += " ORDER BY inv_make, inv_model"
    //console.log("SQL",baseQuery)
    //console.log("Values:", values)


    const data = await pool.query({text: baseQuery, values: values})
  return data.rows
  } catch (error) {
    console.error("Search Inventory Error:", error)
    throw error
  }
}

module.exports = {
    getClassifications, 
    getInventoryByClassificationId,
    getInventoryById, 
    addClassification, 
    addInventory, 
    updateInventory, 
    deleteInventoryItem, 
    searchInventory
  };

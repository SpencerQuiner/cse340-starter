const pool= require("../database/index")

/* ***************************
* Register new account
* ************************* */

async function registerAccount(account_firstname, account_lastname, account_email, account_password){
    try{
        const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
            const result= await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
            return result.rows[0]
        } catch (error) {
        console.error("Registration Error:", error)
        return null
    }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT account_id FROM account WHERE account_email = $1"
    const result = await pool.query(sql, [account_email])
    return result.rows[0] // undefined if not found
  } catch (error) {
    throw new Error(error)
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* *****************************
* Return account data using account_id
* ***************************** */
async function getAccountById (account_id) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_id])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching account found")
  }
}

/* *****************************
* Update account Information
* ***************************** */
async function updateAccount(
  account_id,
  account_firstname,
  account_lastname,
  account_email
) {
  try {
    const sql =
      `UPDATE account
      SET 
        account_firstname = $1,
        account_lastname = $2,
        account_email = $3
      WHERE account_id = $4
      RETURNING *
      `
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_id,
    ])
    return result.rows[0]
  } catch (error){
    throw new Error("Update account failed")
  }
}

/* *****************************
* Change Password
* ***************************** */
async function updatePassword(account_id, account_password) {
  try {
    const sql = `
      UPDATE account
      SET account_password = $1
      WHERE account_id = $2
      RETURNING *
    `
    const result = await pool.query(sql, [account_password, account_id])
    return result.rows[0]
  } catch (error) {
    throw new Error("Password update failed")
  }
}


module.exports= {registerAccount, checkExistingEmail,getAccountByEmail,getAccountById, updateAccount, updatePassword}
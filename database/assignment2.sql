INSERT INTO account (account_firstname, account_lastname, account_email, account_password)
	VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

UPDATE account
SET account_type='Admin'
WHERE account_firstname= 'Tony' 
	AND account_lastname = 'Stark' 
	AND account_email = 'tony@starkent.com';

DELETE FROM account
WHERE account_firstname = 'Tony'
	AND account_lastname = 'Stark'
	AND account_email = 'tony@starkent.com';

UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM'
	AND inv_model = 'Hummer';

SELECT inventory.inv_make, inventory.inv_model
FROM inventory
INNER JOIN classification
	ON inventory.classification_id = classification.classification_id
WHERE classification.classification_name ILIKE 'sport';

UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images', '/images/vehicles'),
	inv_thumbnail = REPLACE(inv_thumbnail, '/images', '/images/vehicles')
WHERE inv_image NOT LIKE '/images/vehicles%'
   OR inv_thumbnail NOT LIKE '/images/vehicles%';
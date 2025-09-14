const validator = require("validator");

const validateSignupData = (req) => {
  const { firstName, lastName, emailID, password } = req.body;

  if (!firstName || !lastName) {
    throw new Error("name can't be empty")
  }
  else if (firstName.length < 2 || firstName.length > 50) {
    throw new Error("please enter a valid name")
  }
  else if (!validator.isEmail(emailID)) {
    throw new Error("Email is not valid")
  }
  else if (!validator.isStrongPassword(password)) {
    throw new Error("Enter a Strong password!")
  }
}

const validateProfileEdit = (req) => {
  const editableFields = ["firstName", "lastName","about", "age","gender", "skills"] 

  const isEditValid = Object.keys(req.body).every((field) => editableFields.includes(field))

  return isEditValid;
}


module.exports = { validateSignupData, validateProfileEdit };
import React, { useEffect, useState } from 'react'
import * as yup from 'yup'

// 👇 Here are the validation errors you will use with Yup.
const validationErrors = {
  fullNameTooShort: 'full name must be at least 3 characters',
  fullNameTooLong: 'full name must be at most 20 characters',
  sizeIncorrect: 'size must be S or M or L'
}

// 👇 Here you will create your schema.

const schema = yup.object().shape({
fullName: yup.string()
.trim()
.min(3, validationErrors.fullNameTooShort)
.max(20, validationErrors.fullNameTooLong)
.required("full name must be at least 3 characters"),

size: yup.string()
.oneOf(['S','M', 'L'], validationErrors.sizeIncorrect)
.required('Size is required'),

toppings: yup.array()
.of(yup.string())

})



// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppings = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
]

const sizeNames = {
S: 'small',
M: 'medium',
L: 'large'
}

export default function Form() {

const [selectedToppings, setSelectedToppings] = useState([]);
const [errors, setErrors] = useState({})
const [isSubmitting, setIsSubmitting] = useState(false)
const [successMessage, setSuccessMessage] = useState('')
const [formData, setFormData] = useState({
  fullName: '',
  size: '',
  toppings: []
})
const [isFormValid, setIsFormValid] = useState(false)
const [hasSubmitted, setHasSubmitted] = useState(false)

useEffect(() => {
  const validate = async () => {
    const currentFormData = {
      ...formData,
      toppings: selectedToppings
    };
    const isValid = await validateForm(currentFormData);
    setIsFormValid(isValid === true)
  };
  validate();
}, [formData, selectedToppings]);

const handleToppingChange = (e) => {

  const { name, checked } = e.target;
  if (checked) {
    setSelectedToppings((prev) => [...prev, name]);
  } else {
    setSelectedToppings((prev) => prev.filter((topping) => topping !== name))
  }
};

const validateForm = async (formData) => {
try {
  await schema.validate(formData, { abortEarly: false });
  return true;
} catch (error) {
  return error.inner.reduce((errors,validationError) => {
    return {
      ...errors,
      [validationError.path]: validationError.message
    };
  }, {});
}

};

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  setHasSubmitted(true);
  setSuccessMessage('');

   const currentFormData = {
    fullName: formData.fullName.trim(),
    size: formData.size,
    toppings: selectedToppings
  };

  const isValid = await validateForm(currentFormData);
  if (isValid === true) {
    console.log('form submitted:', currentFormData);
    const sizeFullName = sizeNames[currentFormData.size]
    const toppingsCount = selectedToppings.length;
    const toppingsMessage = toppingsCount > 0 ? `with ${toppingsCount} topping${toppingsCount > 1 ? 's' : ''}` : 'with no toppings';
    setSuccessMessage(`Thank you for your order, ${currentFormData.fullName}! Your ${sizeFullName} pizza ${toppingsMessage} is on the way.`);

    setFormData({
      fullName: '',
      size: '',
      toppings: []
    });
    setSelectedToppings([]);
    setErrors({});
    setIsFormValid(false);
    setHasSubmitted(false);

  } else {
    console.error('Form validation errors:', isValid);
    setErrors(isValid)
    

  }
  setIsSubmitting(false)
};

const handleChange = async (e) => {
  const {name, value} = e.target
  setFormData({
    ...formData,
    [name]: value
  });
  setErrors({});
  

  try {
    await yup.reach(schema, name).validate(value.trim())
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: undefined
    }));
  } catch (validateError) {
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: validateError.message
    }))
  }
}




  return (
    <form onSubmit={handleSubmit}>
      <h2>Order Your Pizza</h2>
      {successMessage && <div className='success'>{successMessage}</div>}
      {hasSubmitted && Object.keys(errors).length > 0 && <div className='failure'>Something went wrong</div>}

      <div className="input-group">
        <div>
          <label htmlFor="fullName">Full Name</label><br />
          <input placeholder="Type full name" id="fullName" name='fullName' type="text" value={formData.fullName} onChange={handleChange} />
        </div>
        {errors.fullName && <div className='error'>{errors.fullName}</div>}
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label><br />
          <select id="size" name='size'value={formData.size} onChange={handleChange}>
            <option value="">----Choose Size----</option>
            <option value='S'>Small</option>
            <option value='M'>Medium</option>
            <option value='L'>Large</option>
          </select>
        </div>
        {errors.size && <div className='error'>{errors.size}</div>}
      </div>

      <div className="input-group">
        {toppings.map((topping) => (
          <label key={topping.topping_id}>
            <input 
            name={topping.text}
            type='checkbox'
            checked={selectedToppings.includes(topping.text)}
            onChange={handleToppingChange}
            />
            {topping.text}<br />
          </label>
        ))}
       </div>
      {/* 👇 Make sure the submit stays disabled until the form validates! */}
      <input type="submit" disabled={!isFormValid || isSubmitting}/>
    </form>
  )
}

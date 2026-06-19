// Form validation and submission
document.addEventListener("DOMContentLoaded", () => {
  const farmerForm = document.getElementById("farmerRegistration")
  const consultationForm = document.getElementById("consultationForm")

  if (farmerForm) {
    farmerForm.addEventListener("submit", handleFarmerRegistration)
  }

  if (consultationForm) {
    consultationForm.addEventListener("submit", handleConsultation)
  }
})

function handleFarmerRegistration(e) {
  e.preventDefault()

  // Basic form validation
  const form = e.target
  const formData = new FormData(form)
  const data = Object.fromEntries(formData)

  // Validate required fields
  const requiredFields = ["name", "farmLocation", "produceType", "email", "phone"]
  const errors = validateFields(data, requiredFields)

  if (errors.length > 0) {
    showErrors(errors)
    return
  }

  // Submit form data
  console.log("Farmer registration data:", data)
  // Add your API submission logic here

  // Show success message
  showSuccess("Registration submitted successfully! We will contact you soon.")
}

function handleConsultation(e) {
  e.preventDefault()

  const form = e.target
  const formData = new FormData(form)
  const data = Object.fromEntries(formData)

  // Validate required fields
  const requiredFields = ["companyName", "industry", "needs", "email", "phone"]
  const errors = validateFields(data, requiredFields)

  if (errors.length > 0) {
    showErrors(errors)
    return
  }

  // Submit form data
  console.log("Consultation request data:", data)
  // Add your API submission logic here

  // Show success message
  showSuccess("Consultation request submitted successfully! Our team will contact you shortly.")
}

function validateFields(data, requiredFields) {
  const errors = []

  requiredFields.forEach((field) => {
    if (!data[field] || data[field].trim() === "") {
      errors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`)
    }
  })

  // Email validation
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("Please enter a valid email address")
  }

  // Phone validation
  if (data.phone && !/^\+?[\d\s-]{8,}$/.test(data.phone)) {
    errors.push("Please enter a valid phone number")
  }

  return errors
}

function showErrors(errors) {
  // Remove existing error messages
  const existingErrors = document.querySelectorAll(".error-message")
  existingErrors.forEach((error) => error.remove())

  // Create and show new error messages
  const firstInput = document.querySelector("input, select, textarea")
  const errorContainer = document.createElement("div")
  errorContainer.className = "error-message"
  errorContainer.style.color = "var(--color-error)"
  errorContainer.style.marginBottom = "var(--spacing-md)"
  errorContainer.innerHTML = errors.join("<br>")

  firstInput.parentNode.insertBefore(errorContainer, firstInput)
}

function showSuccess(message) {
  // Remove existing messages
  const existingMessages = document.querySelectorAll(".success-message")
  existingMessages.forEach((msg) => msg.remove())

  // Create and show success message
  const form = document.querySelector("form")
  const successMessage = document.createElement("div")
  successMessage.className = "success-message"
  successMessage.style.color = "var(--color-success)"
  successMessage.style.marginTop = "var(--spacing-md)"
  successMessage.style.textAlign = "center"
  successMessage.textContent = message

  form.appendChild(successMessage)

  // Clear form
  form.reset()

  // Remove success message after 5 seconds
  setTimeout(() => {
    successMessage.remove()
  }, 5000)
}

import { mockProducts, validatePromoCode, submitOrder } from "./mock-data.js";

const stepIndicators = document.querySelectorAll(".step");

const cartStep = document.getElementById("step-cart");
const shippingStep = document.getElementById("step-shipping");
const paymentStep = document.getElementById("step-payment");
const confirmationStep = document.getElementById("step-confirmation");

const cartItemsContainer = document.getElementById("cart-items");
const cartEmptyMessage = document.getElementById("cart-empty-message");
const cartSubtotal = document.getElementById("cart-subtotal");
const cartDiscount = document.getElementById("cart-discount");
const cartTax = document.getElementById("cart-tax");
const cartTotal = document.getElementById("cart-total");
const discountRow = document.getElementById("discount-row");
const promoCodeInput = document.getElementById("promo-code-input");
const applyPromoBtn = document.getElementById("apply-promo-btn");
const promoCodeMessage = document.getElementById("promo-code-message");
const promoCodeLoading = document.getElementById("promo-code-loading");

const cartNextBtn = document.getElementById("cart-next-btn");
const shippingBackBtn = document.getElementById("shipping-back-btn");
const shippingNextBtn = document.getElementById("shipping-next-btn");
const paymentBackBtn = document.getElementById("payment-back-btn");
const paymentSubmitBtn = document.getElementById("payment-submit-btn");

const shippingForm = document.getElementById("shipping-form");
const paymentForm = document.getElementById("payment-form");

const shippingFirstName = document.getElementById("shipping-first-name");
const shippingLastName = document.getElementById("shipping-last-name");
const shippingEmail = document.getElementById("shipping-email");
const shippingPhone = document.getElementById("shipping-phone");
const shippingAddress = document.getElementById("shipping-address");
const shippingCity = document.getElementById("shipping-city");
const shippingState = document.getElementById("shipping-state");
const shippingZip = document.getElementById("shipping-zip");

const cardNumber = document.getElementById("card-number");
const cardName = document.getElementById("card-name");
const cardExpiry = document.getElementById("card-expiry");
const cardCvv = document.getElementById("card-cvv");

const paymentSubtotal = document.getElementById("payment-subtotal");
const paymentDiscount = document.getElementById("payment-discount");
const paymentDiscountRow = document.getElementById("payment-discount-row");
const paymentTax = document.getElementById("payment-tax");
const paymentTotal = document.getElementById("payment-total");
const submissionLoading = document.getElementById("submission-loading");
const orderNumber = document.getElementById("order-number");
const orderDate = document.getElementById("order-date");
const confirmationTotal = document.getElementById("confirmation-total");
const resetCheckoutBtn = document.getElementById("reset-checkout-btn");

const checkoutState = {
  currentStep: 0,
  cart: [...mockProducts],
  appliedPromo: null,
  shipping: {},
  billing: {},
  payment: {},
  isSubmitting: false,
};

const stepSections = [cartStep, shippingStep, paymentStep, confirmationStep];

function updateStepIndicator() {
  stepIndicators.forEach((indicator) => {
    const index = parseInt(indicator.dataset.step);

    if (index < checkoutState.currentStep) {
      indicator.classList.add("completed");
      indicator.classList.remove("active");
    } else if (index === checkoutState.currentStep) {
      indicator.classList.add("active");
      indicator.classList.remove("completed");
    } else {
      indicator.classList.remove("completed");
      indicator.classList.remove("active");
    }
  });
}

function showStep(stepIndex) {
  stepSections.forEach((section) => {
    section.classList.remove("active");
  });

  stepSections[stepIndex].classList.add("active");
  updateStepIndicator();

  if (stepIndex === 2) {
    updatePaymentSummary();
  }
}

function goToStep(stepIndex) {
  checkoutState.currentStep = stepIndex;
  showStep(stepIndex);
}

function goToNextStep() {
  if (checkoutState.currentStep < 3) {
    goToStep(checkoutState.currentStep + 1);
  }
}

function goToPreviousStep() {
  if (checkoutState.currentStep > 0) {
    goToStep(checkoutState.currentStep - 1);
  }
}

cartNextBtn.addEventListener("click", goToNextStep);
shippingBackBtn.addEventListener("click", goToPreviousStep);
paymentBackBtn.addEventListener("click", goToPreviousStep);

function formatCurrency(amount) {
  return "$" + amount.toFixed(2);
}

function calculateTotals() {
  const subtotal = checkoutState.cart.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  let discount = 0;
  if (checkoutState.appliedPromo) {
    if (checkoutState.appliedPromo.type === "percentage") {
      discount = subtotal * (checkoutState.appliedPromo.discount / 100);
    } else if (checkoutState.appliedPromo.type === "fixed") {
      discount = checkoutState.appliedPromo.discount;
    }
  }

  const taxable = subtotal - discount;
  const tax = taxable * 0.1;
  const total = taxable + tax;

  return { subtotal, discount, tax, total };
}

function updateCartDisplay() {
  const totals = calculateTotals();

  cartSubtotal.textContent = formatCurrency(totals.subtotal);
  cartTax.textContent = formatCurrency(totals.tax);
  cartTotal.textContent = formatCurrency(totals.total);

  if (checkoutState.appliedPromo) {
    discountRow.style.display = "flex";
    cartDiscount.textContent = "-" + formatCurrency(totals.discount);
  } else {
    discountRow.style.display = "none";
  }
}

function renderCartItem(item) {
  return `
        <div class="cart-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${formatCurrency(item.price)}</div>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button class="quantity-btn" data-action="decrease">-</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" data-action="increase">+</button>
                </div>
                <button class="remove-item-btn">Remove</button>
            </div>
        </div>
    `;
}

function renderCart() {
  if (checkoutState.cart.length === 0) {
    cartItemsContainer.innerHTML = "";
    cartEmptyMessage.style.display = "block";
  } else {
    cartEmptyMessage.style.display = "none";
    const cartHTML = checkoutState.cart.map(renderCartItem).join("");
    cartItemsContainer.innerHTML = cartHTML;
  }

  updateCartDisplay();
}

function updateQuantity(productId, change) {
  const item = checkoutState.cart.find((item) => item.id === productId);

  if (item) {
    item.quantity += change;
    if (item.quantity < 1) {
      item.quantity = 1;
    }
    renderCart();
  }
}

function removeItem(productId) {
  checkoutState.cart = checkoutState.cart.filter(
    (item) => item.id !== productId,
  );
  renderCart();
}

cartItemsContainer.addEventListener("click", (event) => {
  const clickedElement = event.target;

  if (clickedElement.classList.contains("quantity-btn")) {
    const action = clickedElement.dataset.action;
    const cartItem = clickedElement.closest(".cart-item");
    const productId = parseInt(cartItem.dataset.id);

    if (action === "increase") {
      updateQuantity(productId, 1);
    } else if (action === "decrease") {
      updateQuantity(productId, -1);
    }
  }

  if (clickedElement.classList.contains("remove-item-btn")) {
    const cartItem = clickedElement.closest(".cart-item");
    const productId = parseInt(cartItem.dataset.id);
    removeItem(productId);
  }
});

function displayPromoError(message) {
  promoCodeMessage.textContent = message;
  promoCodeMessage.classList.remove("success");
  promoCodeMessage.classList.add("error");
}

function displayPromoSuccess(message) {
  promoCodeMessage.textContent = message;
  promoCodeMessage.classList.remove("error");
  promoCodeMessage.classList.add("success");
}

async function applyPromoCode() {
  const code = promoCodeInput.value.trim();

  if (code === "") {
    displayPromoError("Please enter a promo code");
    return;
  }

  if (checkoutState.appliedPromo !== null) {
    displayPromoError("A promo code is already applied");
    return;
  }

  promoCodeLoading.style.display = "block";
  applyPromoBtn.disabled = true;
  promoCodeMessage.textContent = "";

  const result = await validatePromoCode(code);

  promoCodeLoading.style.display = "none";
  applyPromoBtn.disabled = false;

  if (result.success) {
    checkoutState.appliedPromo = result.data;
    displayPromoSuccess(result.message);
    updateCartDisplay();
  } else {
    displayPromoError(result.message);
  }
}

applyPromoBtn.addEventListener("click", applyPromoCode);

promoCodeInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    applyPromoCode();
  }
});

function validateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

function validatePhone(phone) {
  const phonePattern = /^\d{8}$/;
  return phonePattern.test(phone);
}

function validateZip(zip) {
  const zipPattern = /^\d{4}$/;
  return zipPattern.test(zip);
}

function showError(inputElement, message) {
  const errorElement = inputElement.nextElementSibling;
  errorElement.textContent = message;
  inputElement.classList.add("error");
}

function clearError(inputElement) {
  const errorElement = inputElement.nextElementSibling;
  errorElement.textContent = "";
  inputElement.classList.remove("error");
}

function validateRequiredField(inputElement, fieldName) {
  const value = inputElement.value.trim();

  if (value === "") {
    showError(inputElement, `${fieldName} is required`);
    return false;
  }

  clearError(inputElement);
  return true;
}

function validateEmailField(inputElement) {
  const isRequiredValid = validateRequiredField(inputElement, "Email");

  if (!isRequiredValid) {
    return false;
  }

  const value = inputElement.value.trim();
  const isValid = validateEmail(value);

  if (!isValid) {
    showError(inputElement, "Please enter a valid email address");
    return false;
  }

  clearError(inputElement);
  return true;
}

function validatePhoneField(inputElement) {
  const isRequiredValid = validateRequiredField(inputElement, "Phone number");

  if (!isRequiredValid) {
    return false;
  }

  const value = inputElement.value.trim();
  const isValid = validatePhone(value);

  if (!isValid) {
    showError(inputElement, "Please enter a valid phone number");
    return false;
  }

  clearError(inputElement);
  return true;
}

function validateZipField(inputElement) {
  const isRequiredValid = validateRequiredField(inputElement, "ZIP code");

  if (!isRequiredValid) {
    return false;
  }

  const value = inputElement.value.trim();
  const isValid = validateZip(value);

  if (!isValid) {
    showError(inputElement, "ZIP code must be 4 digits");
    return false;
  }

  clearError(inputElement);
  return true;
}

function validateShippingForm() {
  const isFirstNameValid = validateRequiredField(
    shippingFirstName,
    "First name",
  );
  const isLastNameValid = validateRequiredField(shippingLastName, "Last name");
  const isEmailValid = validateEmailField(shippingEmail);
  const isPhoneValid = validatePhoneField(shippingPhone);
  const isAddressValid = validateRequiredField(
    shippingAddress,
    "Street address",
  );
  const isCityValid = validateRequiredField(shippingCity, "City");
  const isStateValid = validateRequiredField(shippingState, "State");
  const isZipValid = validateZipField(shippingZip);

  return (
    isFirstNameValid &&
    isLastNameValid &&
    isEmailValid &&
    isPhoneValid &&
    isAddressValid &&
    isCityValid &&
    isStateValid &&
    isZipValid
  );
}

shippingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const isValid = validateShippingForm();

  if (isValid) {
    goToNextStep();
  }
});

shippingFirstName.addEventListener("blur", () => {
  validateRequiredField(shippingFirstName, "First name");
});

shippingLastName.addEventListener("blur", () => {
  validateRequiredField(shippingLastName, "Last name");
});

shippingEmail.addEventListener("blur", () => {
  validateEmailField(shippingEmail);
});

shippingPhone.addEventListener("blur", () => {
  validatePhoneField(shippingPhone);
});

shippingAddress.addEventListener("blur", () => {
  validateRequiredField(shippingAddress, "Street address");
});

shippingCity.addEventListener("blur", () => {
  validateRequiredField(shippingCity, "City");
});

shippingState.addEventListener("blur", () => {
  validateRequiredField(shippingState, "State");
});

shippingZip.addEventListener("blur", () => {
  validateZipField(shippingZip);
});

function formatCardNumber(input) {
  const value = input.value.replace(/\D/g, "");
  const formatted = value.replace(/(\d{4})/g, "$1 ").trim();
  input.value = formatted.substring(0, 19);
}

function formatExpiryDate(input) {
  const value = input.value.replace(/\D/g, "");

  if (value.length >= 2) {
    const month = value.substring(0, 2);
    const year = value.substring(2, 4);
    const formatted = month + "/" + year;
    input.value = formatted;
  } else {
    input.value = value;
  }
}

function validateCardNumber(cardNumber) {
  const digits = cardNumber.replace(/\D/g, "");
  const digitsPattern = /^\d{16}$/;
  return digitsPattern.test(digits);
}

function validateCardNumberField(inputElement) {
  const isRequiredValid = validateRequiredField(inputElement, "Card number");

  if (!isRequiredValid) {
    return false;
  }

  const value = inputElement.value.trim();
  const isValid = validateCardNumber(value);

  if (!isValid) {
    showError(inputElement, "Card number must be 16 digits");
    return false;
  }

  clearError(inputElement);
  return true;
}

function validateCardNameField(inputElement) {
  const isRequiredValid = validateRequiredField(inputElement, "Name on card");

  if (!isRequiredValid) {
    return false;
  }

  const value = inputElement.value.trim();
  const namePattern = /^[a-zA-Z\s]{2,}$/;
  const isValid = namePattern.test(value);

  if (!isValid) {
    showError(inputElement, "Please enter a valid name");
    return false;
  }

  clearError(inputElement);
  return true;
}

function validateExpiryField(inputElement) {
  const isRequiredValid = validateRequiredField(inputElement, "Expiry date");

  if (!isRequiredValid) {
    return false;
  }

  const value = inputElement.value.trim();
  const expiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;

  if (!expiryPattern.test(value)) {
    showError(inputElement, "Please enter a valid expiry date (MM/YY)");
    return false;
  }

  const parts = value.split("/");
  const month = parseInt(parts[0]);
  const year = parseInt(parts[1]) + 2000;

  if (month < 1 || month > 12) {
    showError(inputElement, "Invalid month");
    return false;
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    showError(inputElement, "Card has expired");
    return false;
  }

  clearError(inputElement);
  return true;
}

function validateCvvField(inputElement) {
  const isRequiredValid = validateRequiredField(inputElement, "CVV");

  if (!isRequiredValid) {
    return false;
  }

  const value = inputElement.value.trim();
  const cvvPattern = /^\d{3,4}$/;
  const isValid = cvvPattern.test(value);

  if (!isValid) {
    showError(inputElement, "CVV must be 3 or 4 digits");
    return false;
  }

  clearError(inputElement);
  return true;
}

cardNumber.addEventListener("input", () => {
  formatCardNumber(cardNumber);
});

cardExpiry.addEventListener("input", () => {
  formatExpiryDate(cardExpiry);
});

cardNumber.addEventListener("blur", () => {
  validateCardNumberField(cardNumber);
});

cardName.addEventListener("blur", () => {
  validateCardNameField(cardName);
});

cardExpiry.addEventListener("blur", () => {
  validateExpiryField(cardExpiry);
});

cardCvv.addEventListener("blur", () => {
  validateCvvField(cardCvv);
});

function validatePaymentForm() {
  const isCardNumberValid = validateCardNumberField(cardNumber);
  const isCardNameValid = validateCardNameField(cardName);
  const isExpiryValid = validateExpiryField(cardExpiry);
  const isCvvValid = validateCvvField(cardCvv);

  return isCardNumberValid && isCardNameValid && isExpiryValid && isCvvValid;
}

paymentForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const isValid = validatePaymentForm();

  if (isValid) {
    submitOrderForm();
  }
});

function updatePaymentSummary() {
  const totals = calculateTotals();

  paymentSubtotal.textContent = formatCurrency(totals.subtotal);
  paymentTax.textContent = formatCurrency(totals.tax);
  paymentTotal.textContent = formatCurrency(totals.total);

  if (checkoutState.appliedPromo) {
    paymentDiscountRow.style.display = "flex";
    paymentDiscount.textContent = "-" + formatCurrency(totals.discount);
  } else {
    paymentDiscountRow.style.display = "none";
  }
}

async function submitOrderForm() {
  const totals = calculateTotals();

  const orderData = {
    cart: checkoutState.cart,
    shipping: checkoutState.shipping,
    payment: {},
    totals: totals,
    appliedPromo: checkoutState.appliedPromo,
  };

  paymentForm.style.display = "none";
  submissionLoading.style.display = "block";

  const result = await submitOrder(orderData);

  submissionLoading.style.display = "none";
  paymentForm.style.display = "block";

  if (result.success) {
    displayConfirmation(result);
    goToNextStep();
  } else {
    alert("Order submission failed. Please try again.");
  }
}

function displayConfirmation(result) {
  orderNumber.textContent = result.orderNumber;
  orderDate.textContent = result.date;

  const totals = calculateTotals();
  confirmationTotal.textContent = formatCurrency(totals.total);
}

function resetCheckout() {
  checkoutState.currentStep = 0;
  checkoutState.cart = [...mockProducts];
  checkoutState.appliedPromo = null;

  renderCart();
  showStep(0);

  shippingFirstName.value = "";
  shippingLastName.value = "";
  shippingEmail.value = "";
  shippingPhone.value = "";
  shippingAddress.value = "";
  shippingCity.value = "";
  shippingState.value = "";
  shippingZip.value = "";
  cardNumber.value = "";
  cardName.value = "";
  cardExpiry.value = "";
  cardCvv.value = "";
  promoCodeInput.value = "";

  promoCodeMessage.textContent = "";
}

resetCheckoutBtn.addEventListener("click", resetCheckout);

showStep(checkoutState.currentStep);

renderCart();

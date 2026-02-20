import { mockProducts } from "./mock-data.js";

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
shippingNextBtn.addEventListener("click", goToNextStep);
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

showStep(checkoutState.currentStep);

renderCart();

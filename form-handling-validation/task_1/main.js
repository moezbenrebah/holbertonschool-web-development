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

showStep(checkoutState.currentStep);

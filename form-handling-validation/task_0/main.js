import { mockProducts } from './mock-data.js';


const stepIndicators = document.querySelectorAll('.step');

const cartStep = document.getElementById('step-cart');
const shippingStep = document.getElementById('step-shipping');
const paymentStep = document.getElementById('step-payment');
const confirmationStep = document.getElementById('step-confirmation');

const cartItemsContainer = document.getElementById('cart-items');
const cartEmptyMessage = document.getElementById('cart-empty-message');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartDiscount = document.getElementById('cart-discount');
const cartTax = document.getElementById('cart-tax');
const cartTotal = document.getElementById('cart-total');
const discountRow = document.getElementById('discount-row');
const promoCodeInput = document.getElementById('promo-code-input');
const applyPromoBtn = document.getElementById('apply-promo-btn');
const promoCodeMessage = document.getElementById('promo-code-message');
const promoCodeLoading = document.getElementById('promo-code-loading');

const cartNextBtn = document.getElementById('cart-next-btn');
const shippingBackBtn = document.getElementById('shipping-back-btn');
const shippingNextBtn = document.getElementById('shipping-next-btn');
const paymentBackBtn = document.getElementById('payment-back-btn');
const paymentSubmitBtn = document.getElementById('payment-submit-btn');

const shippingForm = document.getElementById('shipping-form');
const paymentForm = document.getElementById('payment-form');

const checkoutState = {
    currentStep: 0,
    cart: [...mockProducts],
    appliedPromo: null,
    shipping: {},
    billing: {},
    payment: {},
    isSubmitting: false
};

console.log('Initial Checkout State:', checkoutState);

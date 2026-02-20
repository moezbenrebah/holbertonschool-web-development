// mock product data for the shopping cart
export const mockProducts = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 79.99,
    image: "assets/wireless-headphones.png",
    quantity: 1,
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 199.99,
    image: "assets/smart-watch.avif",
    quantity: 1,
  },
  {
    id: 3,
    name: "USB-C Cable",
    price: 12.99,
    image: "assets/usb-c-cable.png",
    quantity: 2,
  },
];

// mock promo codes with validation rules
export const mockPromoCodes = {
  SAVE10: {
    code: "SAVE10",
    discount: 10,
    type: "percentage",
    description: "10% off your order",
  },
  FLAT20: {
    code: "FLAT20",
    discount: 20,
    type: "fixed",
    description: "$20 off your order",
  },
  WELCOME15: {
    code: "WELCOME15",
    discount: 15,
    type: "percentage",
    description: "15% off for new customers",
  },
};

export function validatePromoCode(code) {
  return new Promise((resolve) => {
    const delay = Math.random() * 1000 + 1000;

    setTimeout(() => {
      const upperCode = code.toUpperCase().trim();
      const promoData = mockPromoCodes[upperCode];

      if (promoData) {
        resolve({
          success: true,
          data: promoData,
          message: `Promo code applied: ${promoData.description}`,
        });
      } else {
        resolve({
          success: false,
          data: null,
          message: "Invalid promo code",
        });
      }
    }, delay);
  });
}

export function submitOrder(orderData) {
  return new Promise((resolve) => {
    const delay = Math.random() * 1000 + 2000;

    setTimeout(() => {
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      resolve({
        success: true,
        orderNumber: orderNumber,
        date: new Date().toLocaleDateString(),
        message: "Order placed successfully",
      });
    }, delay);
  });
}

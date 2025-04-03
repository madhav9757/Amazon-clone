export let cart = JSON.parse(localStorage.getItem("cart")) || [];

export function saveCartToLocalStorage() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

export function addingIncart(productId) {
    let found = false;

    if (cart) {
        cart.forEach(item => {
            if (item.productId === productId) {
                item.quantity++;
                found = true;
            }
        });
    }

    if (!found) {
        cart.push({
            productId: productId,
            quantity: 1,
            deliveryOptionId: 1
        });
    }

    saveCartToLocalStorage();
}


export function getCartQuantity() {
    return cart.reduce((total, item) => Number(total) + Number(item.quantity), 0);
}

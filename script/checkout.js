import { cart, getCartQuantity, saveCartToLocalStorage } from "../data/cart.js";
import { products, loadProducts } from "../data/products.js";
import days from "../data/days.js";

loadProducts(checkoutPage);

function checkoutPage() {
    const cartProducts = document.querySelector('.order-summary');
    
    cart.forEach(cartProduct => {
        let storeCartProducts = ''; 
        
        products.forEach(product => {
            if (cartProduct.productId === product.id) {
                storeCartProducts += `
                <div class="cart-item-container" data-cart-product-id="${cartProduct.productId}">
                    <div class="delivery-date"></div>
                    <div class="cart-item-details-grid">
                        <img class="product-image" src="${product.image}">
                        <div class="cart-item-details">
                            <div class="product-name">${product.name}</div>
                            <div class="product-price">$${((product.priceCents) / 100).toFixed(2)}</div>
                            <div class="product-quantity">
                                <span>Quantity: <span class="quantity-label">${cartProduct.quantity}</span></span>
                                <span class="update-quantity-link link-primary">Update</span>
                                <input type='number' class="update-quantity-input">
                                <span class="delete-quantity-link link-primary">Delete</span>
                            </div>
                        </div>
                        <div class="delivery-options">
                            <div class="delivery-options-title">Choose a delivery option:</div>
                            <div id="delivery-container-${product.id}"></div>
                        </div>
                    </div>
                </div>`;
            }
        });
        cartProducts.innerHTML += storeCartProducts;
        deliveryOption(cartProduct.productId, cartProduct.deliveryOptionId);
    });

    document.addEventListener('DOMContentLoaded', updatePrice());
    document.querySelector('.return-to-home-link').firstChild.textContent = getCartQuantity();

    document.querySelectorAll('.delete-quantity-link').forEach(btn => {
        btn.addEventListener('click', () => {
            const itemContainer = btn.closest('.cart-item-container');
            const productId = itemContainer.dataset.cartProductId;
            
            const index = cart.findIndex(item => item.productId === productId);
            if (index !== -1) {
                cart.splice(index, 1);
                saveCartToLocalStorage();
                itemContainer.remove();
            }
            document.querySelector('.return-to-home-link').firstChild.textContent = getCartQuantity();
            updatePrice();
        });
    });

    document.querySelectorAll('.update-quantity-link').forEach(btn => {
        btn.addEventListener('click', () => {
            const itemContainer = btn.closest('.cart-item-container');
            const inputField = itemContainer.querySelector('.update-quantity-input');
            const quantitySpan = itemContainer.querySelector('.quantity-label');
            const productId = itemContainer.dataset.cartProductId;

            if (inputField.style.display === 'none' || inputField.style.display === '') {
                btn.textContent = "Save";
                inputField.style.display = 'inline-block';
                inputField.value = quantitySpan.textContent;
                inputField.focus();
            } else {
                btn.textContent = "Update";
                inputField.style.display = 'none';
                
                const index = cart.findIndex(item => item.productId === productId);
                if (index !== -1) {
                    cart[index].quantity = Math.max(1, inputField.value);
                    quantitySpan.textContent = cart[index].quantity;
                    saveCartToLocalStorage();
                }
                updatePrice();
            }
            document.querySelector('.return-to-home-link').firstChild.textContent = getCartQuantity();
        });
    });

    function deliveryOption(productId, cartDelivery) {
        const container = document.getElementById(`delivery-container-${productId}`);
        if (!container) return;
        let html = '';
        const today = dayjs();
        
        days.forEach((element) => {
            const priceDelivery = element.priceCent === 0 ? 'FREE' : `$${(element.priceCent / 100).toFixed(2)}`;
            const deliveryDate = today.add(element.day, 'days').format('dddd, MMMM D');
            const isChecked = element.id == cartDelivery;

            html += `
            <div class="delivery-option">
                <input type="radio" class="delivery-option-input" name="delivery-option-${productId}" ${isChecked ? 'checked' : ''}> 
                <div>
                    <div class="delivery-option-date">${deliveryDate}</div>
                    <div class="delivery-option-price" data-shipping-price="${element.priceCent}">${priceDelivery} - Shipping</div>
                </div>
            </div>`;
        });

        container.innerHTML = html;
        getSelectedDeliveryOption(productId);
    }

    function getSelectedDeliveryOption(productId) {
        const selectedOption = document.querySelector(`input[name="delivery-option-${productId}"]:checked`);
        const parentSelectedOption = selectedOption?.closest('.cart-item-container');

        if (selectedOption && parentSelectedOption) {
            parentSelectedOption.querySelector('.delivery-date').textContent = selectedOption.parentElement.querySelector('.delivery-option-date').outerText;
        }
    }

    document.addEventListener("change", (event) => {
        if (event.target.matches(".delivery-option-input")) {
            const productId = event.target.name.split("delivery-option-")[1];
            getSelectedDeliveryOption(productId);
            updatePrice();
        }
    });

    function updatePrice() {
        let totalProductPrice = calculateTotalProductPrice();
        let totalShippingCost = calculateTotalShipping();
        let totalBeforeTax = totalProductPrice + totalShippingCost;
        let taxCost = totalBeforeTax * 0.10;  
        let totalFinalCost = totalBeforeTax + taxCost;
        let totalProduct = cart.length;

        updateDOM(totalProductPrice, totalShippingCost, totalBeforeTax, taxCost, totalFinalCost, totalProduct);
    }

    function calculateTotalProductPrice() {
        let totalProductPrice = 0;

        cart.forEach(cartProduct => {
            const selectedOption = document.querySelector(`input[name="delivery-option-${cartProduct.id}"]:checked`);
    
            products.forEach(product => {
                if (product.id === cartProduct.productId) {
                    totalProductPrice += Number(product.priceCents) * cartProduct.quantity;
                }
            });
        });
        return totalProductPrice
    }
    

    function calculateTotalShipping() {
        let uniqueShippingPrices = new Set();
        cart.forEach(cartProduct => {
            let selectedOption = document.querySelector(`input[name="delivery-option-${cartProduct.productId}"]:checked`);
            if (selectedOption) {
                let shippingPrice = Number(selectedOption.closest('.delivery-option').querySelector('.delivery-option-price')?.dataset.shippingPrice || 0);
                uniqueShippingPrices.add(shippingPrice);
            }
        });
        return [...uniqueShippingPrices].reduce((sum, price) => sum + price, 0);
    }

    function updateDOM(totalProductPrice, totalShippingCost, totalBeforeTax, taxCost, totalFinalCost , totalProduct) {
        document.getElementById('total-product-cost').textContent = formatCurrency(totalProductPrice);
        document.getElementById('total-shipping-cost').textContent = formatCurrency(totalShippingCost);
        document.getElementById('total-before-tax').textContent = formatCurrency(totalBeforeTax);
        document.getElementById('tax-cost').textContent = formatCurrency(taxCost);
        document.getElementById('total-of-total').textContent = formatCurrency(totalFinalCost);
        document.getElementById('total-item-count').textContent = totalProduct ; 
    }
    function formatCurrency(amountInCents) {
        return `$${(amountInCents / 100).toFixed(2)}`;
    }

    document.querySelector('.place-order-button').addEventListener('click' , async () => {
        // window.location.href = 'orders.html'
        let response = await fetch('https://supersimplebackend.dev/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cart : cart
            })
        })
        const order = await response.json()
        console.log(order)
    })
}

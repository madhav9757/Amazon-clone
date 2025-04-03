import { products, loadProducts } from "../data/products.js"
import { cart, addingIncart, getCartQuantity } from "../data/cart.js"

loadProducts(displayProductGrid)

function displayProductGrid() {
  const productGrid = document.querySelector('.products-grid');
  // document.addEventListener('DOMContentLoaded', () => {
  productGrid.innerHTML = products.map(product => `
            <div class="product-container">
              <div class="product-image-container">
                <img class="product-image"
                  src="${product.image}">
              </div>
    
              <div class="product-name limit-text-to-2-lines">
                ${product.name}
              </div>
    
              <div class="product-rating-container">
                <img class="product-rating-stars"
                  src="images/ratings/rating-${(product.rating.stars) * 10}.png">
                <div class="product-rating-count link-primary">
                  ${product.rating.count}
                </div>
              </div>
    
              <div class="product-price">
                $${((product.priceCents) / 100).toFixed(2)}
              </div>
    
              <div class="product-quantity-container">
                <select>
                  <option selected value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                  <option value="9">9</option>
                  <option value="10">10</option>
                </select>
              </div>
    
              <div class="product-spacer"></div>
    
              <div class="added-to-cart">
                <img src="images/icons/checkmark.png">
                Added
              </div>
    
              <button data-product-id="${product.id}" class="add-to-cart-button button-primary">
                Add to Cart
              </button>
            </div>
        `).join('');

  // })
  document.querySelector('.cart-quantity').textContent = getCartQuantity(cart);

  document.querySelectorAll(".add-to-cart-button").forEach(button => {
    button.addEventListener("click", function () {

      addingIncart(this.dataset.productId)
      document.querySelector('.cart-quantity').textContent = getCartQuantity();

      const previousSibling = this.previousElementSibling;
      previousSibling.style.opacity = '1'

      if (previousSibling.style.opacity === "1") {
        setTimeout(() => {
          previousSibling.style.opacity = "0";
        }, 3000);
      }
    });
  });
}


const productsContainer = document.querySelector("main .container");
const cartContainer = document.querySelector("aside .products");
const toggler = document.querySelector(".cart-toggler");
const aside = cartContainer.closest("aside");
let total = localStorage.getItem("total") || 0;
const showTotal = (total = total) =>
  (document.querySelector(".total").textContent = total + " $");
showTotal(total);
const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error while fetching data from server");
  return await res.json();
};
toggler.onclick = () => aside.classList.toggle("show");
document.addEventListener("click", function (e) {
  const { target } = e;
  if (
    !target.closest("aside") &&
    !aside.contains(target) &&
    !target.closest(".cart-toggler")
  ) {
    aside.classList.remove("show");
  }
});
const products = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
const renderProducts = (data = []) => {
  productsContainer.innerHTML = data
    .map((product) => {
      const existe = cart.find((el) => el.id == product.id);
      return `
    <div class="product" id="${product.id}">
      <div class="img">
        <img src="${product.image}" />
      </div>
      <h1 class="title" >  ${product.title} </h1>
      <footer class="footer">
        <span  > ${product.price} $ </span>
        <button class="${
          existe ? "disabled" : null
        }"  onclick="AddToCart(this)" data-product-id="${
        product.id
      }">add to cart </button>
      </footer>
    </div>
    `;
    })
    .join("");
};

const getProducts = async () => {
  try {
    const res = await fetcher("../../products.json");
    products.unshift(...res);
    renderProducts(products);
  } catch (error) {
    alert(error);
  }
};

getProducts();

const renderCart = (cartProducts) => {
  if (cart.length < 1) {
    cartContainer.textContent = "no product added ";
  }
  cartContainer.innerHTML = cartProducts
    .map(
      (product) =>
        `
            <div class="product" id="${product.id}">
            <div class="img">
            <img src="${product.image}" alt="${product.title}" />
            </div>
            <div class="product-info">
            <h1> ${product.title} </h1>
            <span> ${product.price}   $</span>
            <button onclick="removeFromCart(this)" data-product-id="${product.id}" class="remove-product" > remove</button>
            </div>
            <h1> ${product.added} </h1>
            
            
            <footer class="footer">
            <input type="number"  oninput="updateQuantity(this)" min="0" max="${product.quantity}" value="${product.added}" name="quantity"  placeholder="number" >
            </footer>
            </div>
            `
    )
    .join("");
  total = cart.reduce((acc, el) => +acc + +el.price * +el.added, 0);
  showTotal(total);
  document.querySelector("header button").dataset.count = cart.length;
};
const AddToCart = (button) => {
  const productId = button.getAttribute("data-product-id");
  const selectedProduct = products.find((product) => product.id == productId);

  if (selectedProduct) {
    cart.push({
      ...selectedProduct,
      added: 1,
    });
    button.classList.add("disabled");
    button.disabled = true; // Disable the button
    renderCart(cart);
    save();
  }
  // Toggle the cart container after the cart is updated
  setTimeout(() => toggler.click(), 0);
};

const removeFromCart = (button) => {
  const productId = +button.getAttribute("data-product-id");
  const productIndex = cart.findIndex((product) => product.id == productId);

  if (productIndex !== -1) {
    cart.splice(productIndex, 1);
    renderCart(cart);
    save();

    // Re-enable the "Add to Cart" button immediately after removal
    disableBtn(productId);
  }
};
const save = () => {
  localStorage.setItem("cart", JSON.stringify(cart));
  localStorage.setItem("total", total);
};

const updateQuantity = (input) => {
  const value = input.value;
  const productId = +input.closest(".product").getAttribute("id");
  const productIndex = cart.findIndex((product) => product.id == productId);
  cart[productIndex] = {
    ...cart[productIndex],
    added: +value,
  };
  if (value == 0) {
    cart.splice(productIndex, 1);
    setTimeout(() => disableBtn(productId), 0);
  }
  renderCart(cart);
  save();
};
renderCart(cart);

const disableBtn = (productId) => {
  const addButton = document.querySelector(`[data-product-id="${productId}"]`);
  if (addButton) {
    addButton.classList.remove("disabled");
    addButton.disabled = false;
  }
};

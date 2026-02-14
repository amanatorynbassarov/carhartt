(function () {
  const CURRENCY = " ₸";
  const cart = [];
  const cartSummary = document.getElementById("cartSummary");
  const cartCount = document.getElementById("cartCount");
  const cartTotal = document.getElementById("cartTotal");
  const cartSummaryBtn = document.getElementById("cartSummaryBtn");
  const headerCartBtn = document.getElementById("headerCartBtn");
  const btnWhatsapp = document.getElementById("btnWhatsapp");
  const whatsappOrder = document.getElementById("whatsappOrder");
  const productCards = document.querySelectorAll(".product-card");
  const overlay = document.getElementById("productDetailOverlay");
  const detail = document.getElementById("productDetail");
  const detailClose = document.getElementById("productDetailClose");
  const detailMainImg = document.getElementById("productDetailMainImg");
  const detailThumbs = document.getElementById("productDetailThumbs");
  const detailName = document.getElementById("productDetailName");
  const detailPrice = document.getElementById("productDetailPrice");
  const sizeSelector = document.getElementById("sizeSelector");
  const btnAddFromDetail = document.getElementById("btnAddFromDetail");
  const btnWhatsappSingle = document.getElementById("btnWhatsappSingle");
  const cartOverlay = document.getElementById("cartOverlay");
  const cartDrawer = document.getElementById("cartDrawer");
  const cartDrawerClose = document.getElementById("cartDrawerClose");
  const cartDrawerList = document.getElementById("cartDrawerList");
  const cartDrawerTotal = document.getElementById("cartDrawerTotal");
  const btnWhatsappFromCart = document.getElementById("btnWhatsappFromCart");

  let currentProduct = null;
  let selectedSize = "";

  function formatPrice(n) {
    return n.toLocaleString("ru-RU") + CURRENCY;
  }

  function getProductImages(card) {
    const imgs = [];
    const main = card.getAttribute("data-image");
    if (main) imgs.push(main);
    for (var i = 2; i <= 8; i++) {
      var val = card.getAttribute("data-image-" + i);
      if (val) imgs.push(val);
    }
    return imgs.length ? imgs : (main ? [main] : []);
  }

  function getProductSizes(card) {
    const s = card.dataset.sizes || "";
    return s.split(",").map(function (x) { return x.trim(); }).filter(Boolean);
  }

  function getProductAvailable(card) {
    const s = card.dataset.available || "";
    return s.split(",").map(function (x) { return x.trim(); }).filter(Boolean);
  }

  function openProductDetail(card) {
    const id = card.dataset.id;
    const name = card.dataset.name;
    const price = parseInt(card.dataset.price, 10);
    const images = getProductImages(card);
    const sizes = getProductSizes(card);
    const available = getProductAvailable(card);

    currentProduct = { id: id, name: name, price: price };
    selectedSize = available.length ? available[0] : (sizes.length ? sizes[0] : "");

    detailName.textContent = name;
    detailPrice.textContent = formatPrice(price);
    detailMainImg.src = images[0];
    detailMainImg.alt = name;

    detailThumbs.innerHTML = "";
    images.forEach(function (url, i) {
      const thumb = document.createElement("button");
      thumb.type = "button";
      thumb.className = "product-detail-thumb" + (i === 0 ? " active" : "");
      thumb.innerHTML = "<img src=\"" + url + "\" alt=\"\">";
      thumb.addEventListener("click", function () {
        detailMainImg.src = url;
        detailThumbs.querySelectorAll(".product-detail-thumb").forEach(function (t) { t.classList.remove("active"); });
        thumb.classList.add("active");
      });
      detailThumbs.appendChild(thumb);
    });

    sizeSelector.innerHTML = "";
    sizes.forEach(function (size) {
      const inStock = available.indexOf(size) >= 0;
      if (inStock) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "size-btn" + (size === selectedSize ? " active" : "");
        btn.textContent = size;
        btn.addEventListener("click", function () {
          selectedSize = size;
          sizeSelector.querySelectorAll(".size-btn").forEach(function (b) { b.classList.remove("active"); });
          btn.classList.add("active");
        });
        sizeSelector.appendChild(btn);
      } else {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "size-btn size-btn-out";
        btn.textContent = size;
        btn.disabled = true;
        sizeSelector.appendChild(btn);
      }
    });

    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
  }

  function closeProductDetail() {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    currentProduct = null;
  }

  function openCart() {
    renderCartList();
    cartOverlay.classList.add("open");
    cartOverlay.setAttribute("aria-hidden", "false");
  }

  function closeCart() {
    cartOverlay.classList.remove("open");
    cartOverlay.setAttribute("aria-hidden", "true");
  }

  function renderCartList() {
    const total = cart.reduce(function (sum, item) { return sum + item.price; }, 0);
    cartDrawerTotal.textContent = formatPrice(total);

    if (cart.length === 0) {
      cartDrawerList.innerHTML = "<p class=\"cart-drawer-empty\">Корзина пуста</p>";
      return;
    }

    cartDrawerList.innerHTML = "";
    cart.forEach(function (item, index) {
      const row = document.createElement("div");
      row.className = "cart-drawer-item";
      const sizeText = item.size ? ", " + item.size : "";
      row.innerHTML =
        "<div class=\"cart-drawer-item-info\">" +
          "<span class=\"cart-drawer-item-name\">" + escapeHtml(item.name) + sizeText + "</span>" +
          "<span class=\"cart-drawer-item-price\">" + formatPrice(item.price) + "</span>" +
        "</div>" +
        "<button type=\"button\" class=\"cart-drawer-item-remove\" data-index=\"" + index + "\" aria-label=\"Удалить\">×</button>";
      const removeBtn = row.querySelector(".cart-drawer-item-remove");
      removeBtn.addEventListener("click", function () {
        cart.splice(index, 1);
        updateCartDisplay();
        renderCartList();
      });
      cartDrawerList.appendChild(row);
    });
  }

  function escapeHtml(s) {
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function updateCartDisplay() {
    const total = cart.reduce(function (sum, item) { return sum + item.price; }, 0);
    cartCount.textContent = cart.length;
    cartTotal.textContent = formatPrice(total);
    if (cartSummary) cartSummary.classList.toggle("empty", cart.length === 0);
    if (whatsappOrder) whatsappOrder.classList.toggle("has-items", cart.length > 0);
    btnWhatsapp.style.visibility = cart.length ? "visible" : "hidden";
    if (cartDrawerList && cartOverlay.classList.contains("open")) {
      renderCartList();
    }
  }

  function buildWhatsAppLink(items) {
    if (typeof WHATSAPP_NUMBER === "undefined") return "#";
    let text = (typeof WHATSAPP_GREETING !== "undefined" && WHATSAPP_GREETING) ? WHATSAPP_GREETING : "Здравствуйте! Хочу оформить заказ:\n\n";
    items.forEach(function (item) {
      if (item.size) {
        text += "• " + item.name + ", размер " + item.size + " — " + formatPrice(item.price) + "\n";
      } else {
        text += "• " + item.name + " — " + formatPrice(item.price) + "\n";
      }
    });
    const total = items.reduce(function (sum, item) { return sum + item.price; }, 0);
    text += "\nИтого: " + formatPrice(total);
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text);
  }

  productCards.forEach(function (card) {
    card.addEventListener("click", function () {
      openProductDetail(card);
    });
  });

  if (cartSummaryBtn) {
    cartSummaryBtn.addEventListener("click", openCart);
  }
  if (headerCartBtn) {
    headerCartBtn.addEventListener("click", openCart);
  }
  if (cartDrawerClose) {
    cartDrawerClose.addEventListener("click", closeCart);
  }
  if (cartOverlay) {
    cartOverlay.addEventListener("click", function (e) {
      if (e.target === cartOverlay) closeCart();
    });
  }

  if (btnWhatsappFromCart) {
    btnWhatsappFromCart.addEventListener("click", function (e) {
      if (cart.length === 0) {
        e.preventDefault();
        return;
      }
      this.href = buildWhatsAppLink(cart);
    });
  }

  if (detailClose) {
    detailClose.addEventListener("click", closeProductDetail);
  }
  if (overlay) {
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeProductDetail();
    });
  }

  if (btnAddFromDetail) {
    btnAddFromDetail.addEventListener("click", function () {
      if (!currentProduct) return;
      cart.push({
        id: currentProduct.id,
        name: currentProduct.name,
        price: currentProduct.price,
        size: selectedSize
      });
      updateCartDisplay();
      closeProductDetail();
    });
  }

  if (btnWhatsappSingle) {
    btnWhatsappSingle.addEventListener("click", function (e) {
      if (!currentProduct) {
        e.preventDefault();
        return;
      }
      var items = [{
        id: currentProduct.id,
        name: currentProduct.name,
        price: currentProduct.price,
        size: selectedSize
      }];
      this.href = buildWhatsAppLink(items);
    });
  }

  btnWhatsapp.addEventListener("click", function (e) {
    if (cart.length === 0) {
      e.preventDefault();
      return;
    }
    this.href = buildWhatsAppLink(cart);
  });

  updateCartDisplay();
  renderCartList();
})();

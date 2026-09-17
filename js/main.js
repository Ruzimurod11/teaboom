(function () {
    "use strict";

    /* ----------------------------------------------------------------------
       Format a number the Russian way: 1234.5 -> "1 234,50"
       ---------------------------------------------------------------------- */
    function formatPrice(value) {
        const num = parseFloat(value);
        const parts = num.toFixed(2).split(".");
        const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        // Drop the fractional part when it's ",00" to match the site's style
        return parts[1] === "00" ? intPart : `${intPart},${parts[1]}`;
    }

    /* ----------------------------------------------------------------------
       Pack switching: price / old price / SKU / active state
       ---------------------------------------------------------------------- */
    const packButtons = document.querySelectorAll(".pack");
    const priceEl = document.getElementById("js-price");
    const priceOldEl = document.getElementById("js-price-old");
    const skuEl = document.getElementById("js-sku");

    function selectPack(button) {
        packButtons.forEach((btn) => {
            btn.classList.remove("pack--active");
            btn.setAttribute("aria-checked", "false");
        });
        button.classList.add("pack--active");
        button.setAttribute("aria-checked", "true");

        const price = button.getAttribute("data-price");
        const oldPrice = button.getAttribute("data-old-price");
        const sku = button.getAttribute("data-sku");

        priceEl.textContent = `${formatPrice(price)} ₽`;
        skuEl.textContent = sku;

        if (oldPrice && parseFloat(oldPrice) > parseFloat(price)) {
            priceOldEl.textContent = `${formatPrice(oldPrice)} ₽`;
            priceOldEl.style.display = "";
        } else {
            priceOldEl.style.display = "none";
        }

        // Reset the "added to cart" state whenever the pack changes
        resetCartButton();
    }

    packButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            selectPack(btn);
        });

        // Allow arrow-key navigation between pack options
        btn.addEventListener("keydown", (e) => {
            const list = Array.from(packButtons);
            const idx = list.indexOf(btn);

            if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                const next = list[(idx + 1) % list.length];
                next.focus();
                selectPack(next);
            } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                const prev = list[(idx - 1 + list.length) % list.length];
                prev.focus();
                selectPack(prev);
            }
        });
    });

    /* ----------------------------------------------------------------------
       Quantity stepper
       ---------------------------------------------------------------------- */
    const qtyInput = document.getElementById("js-qty");
    const qtyMinus = document.getElementById("js-qty-minus");
    const qtyPlus = document.getElementById("js-qty-plus");

    function clampQty(value) {
        let n = parseInt(value, 10);
        if (isNaN(n) || n < 1) n = 1;
        if (n > 99) n = 99;
        return n;
    }

    qtyMinus.addEventListener("click", () => {
        qtyInput.value = clampQty(qtyInput.value) - 1 || 1;
    });
    qtyPlus.addEventListener("click", () => {
        qtyInput.value = clampQty(qtyInput.value) + 1;
    });
    qtyInput.addEventListener("change", () => {
        qtyInput.value = clampQty(qtyInput.value);
    });

    /* ----------------------------------------------------------------------
       Add to cart — visual feedback only, no real cart wired up
       ---------------------------------------------------------------------- */
    const addToCartBtn = document.getElementById("js-add-cart");
    const addToCartLabel = document.getElementById("js-add-cart-label");
    let cartTimer = null; // qiymati o'zgargani uchun let ishlatildi

    function resetCartButton() {
        clearTimeout(cartTimer);
        addToCartBtn.classList.remove("is-added");
        addToCartLabel.textContent = "В корзину";
    }

    addToCartBtn.addEventListener("click", () => {
        addToCartBtn.classList.add("is-added");
        addToCartLabel.textContent = "Добавлено";
        clearTimeout(cartTimer);
        cartTimer = setTimeout(resetCartButton, 1800);
    });
})();

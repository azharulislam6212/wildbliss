class CartRemoveButton extends HTMLElement {
  constructor() {
    super();

    this.addEventListener('click', (event) => {
      event.preventDefault();
      const cartItems = this.closest('cart-items') || this.closest('cart-drawer-items');
      cartItems.updateQuantity(this.dataset.index, 0, event);
    });
  }
}

customElements.define('cart-remove-button', CartRemoveButton);

class CartItems extends HTMLElement {
  constructor() {
    super();
    this.lineItemStatusElement =
      document.getElementById('shopping-cart-line-item-status') || document.getElementById('CartDrawer-LineItemStatus');

    const debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, ON_CHANGE_DEBOUNCE_TIMER);

    this.addEventListener('change', debouncedOnChange.bind(this));
  }

  cartUpdateUnsubscriber = undefined;

  connectedCallback() {
    this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, (event) => {
      if (event.source === 'cart-items') {
        return;
      }
      return this.onCartUpdate();
    });

     this.performRecommendations();

  }

  disconnectedCallback() {
    if (this.cartUpdateUnsubscriber) {
      this.cartUpdateUnsubscriber();
    }
  }

  resetQuantityInput(id) {
    const input = this.querySelector(`#Quantity-${id}`);
    input.value = input.getAttribute('value');
    this.isEnterPressed = false;
  }

  setValidity(event, index, message) {
    event.target.setCustomValidity(message);
    event.target.reportValidity();
    this.resetQuantityInput(index);
    event.target.select();
  }

  validateQuantity(event) {
    const inputValue = parseInt(event.target.value);
    const index = event.target.dataset.index;
    let message = '';

    if (inputValue < event.target.dataset.min) {
      message = window.quickOrderListStrings.min_error.replace('[min]', event.target.dataset.min);
    } else if (inputValue > parseInt(event.target.max)) {
      message = window.quickOrderListStrings.max_error.replace('[max]', event.target.max);
    } else if (inputValue % parseInt(event.target.step) !== 0) {
      message = window.quickOrderListStrings.step_error.replace('[step]', event.target.step);
    }

    if (message) {
      this.setValidity(event, index, message);
    } else {
      event.target.setCustomValidity('');
      event.target.reportValidity();
      this.updateQuantity(
        index,
        inputValue,
        event,
        document.activeElement.getAttribute('name'),
        event.target.dataset.quantityVariantId
      );
    }
  }

  onChange(event) {

      if (!event.target.matches('[name="updates[]"], .quantity__input')) {
    return;
  }

    this.validateQuantity(event);
  }

  onCartUpdate() {
    if (this.tagName === 'CART-DRAWER-ITEMS') {
      return fetch(`${routes.cart_url}?section_id=cart-drawer`)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(responseText, 'text/html');
          const selectors = ['cart-drawer-items', '.cart-drawer__footer'];
          for (const selector of selectors) {
            const targetElement = document.querySelector(selector);
            const sourceElement = html.querySelector(selector);
            if (targetElement && sourceElement) {
              targetElement.replaceWith(sourceElement);
            }
          }
        })
        .catch((e) => {
          console.error(e);
        });
    } else {
      return fetch(`${routes.cart_url}?section_id=main-cart-items`)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(responseText, 'text/html');
          const sourceQty = html.querySelector('cart-items');
          this.innerHTML = sourceQty.innerHTML;
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }

  getSectionsToRender() {
    return [
      {
        id: 'main-cart-items',
        section: document.getElementById('main-cart-items').dataset.id,
        selector: '.js-contents',
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section',
      },
      {
        id: 'cart-live-region-text',
        section: 'cart-live-region-text',
        selector: '.shopify-section',
      },
        {
        id: 'main-cart-sidebar',
        section: document.getElementById('main-cart-sidebar').dataset.id,
        selector: '.js-sidebar-contents',
      }
    ];
  }

  updateQuantity(line, quantity, event, name, variantId) {
    this.enableLoading(line);

    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname,
    });
    const eventTarget = event.currentTarget instanceof CartRemoveButton ? 'clear' : 'change';

    fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);

        CartPerformance.measure(`${eventTarget}:paint-updated-sections"`, () => {
          const quantityElement =
            document.getElementById(`Quantity-${line}`) || document.getElementById(`Drawer-quantity-${line}`);
          const items = document.querySelectorAll('.cart-item');

          if (parsedState.errors) {
            quantityElement.value = quantityElement.getAttribute('value');
            this.updateLiveRegions(line, parsedState.errors);
            return;
          }

          this.classList.toggle('is-empty', parsedState.item_count === 0);
          const cartDrawerWrapper = document.querySelector('cart-drawer');
          const cartSidebar = document.getElementById('main-cart-sidebar');

          if (cartSidebar) cartSidebar.classList.toggle('is-empty', parsedState.item_count === 0);
          if (cartDrawerWrapper) cartDrawerWrapper.classList.toggle('is-empty', parsedState.item_count === 0);

          this.getSectionsToRender().forEach((section) => {
  console.log("Section ID:", section.id);
  console.log("Selector:", section.selector);
  console.log("HTML:", parsedState.sections[section.section]);

    const parsed = new DOMParser().parseFromString(
    parsedState.sections[section.section],
    'text/html'
  );

  console.log("Found:", parsed.querySelector(section.selector));

  

            const elementToReplace =  document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);

            console.log("Tress",  section.selector);
            // console.log("Tress",  parsedState.sections[section.section]);


            elementToReplace.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
          });
          const updatedValue = parsedState.items[line - 1] ? parsedState.items[line - 1].quantity : undefined;
          let message = '';
          if (items.length === parsedState.items.length && updatedValue !== parseInt(quantityElement.value)) {
            if (typeof updatedValue === 'undefined') {
              message = window.cartStrings.error;
            } else {
              message = window.cartStrings.quantityError.replace('[quantity]', updatedValue);
            }
          }
          this.updateLiveRegions(line, message);

          const lineItem =
            document.getElementById(`CartItem-${line}`) || document.getElementById(`CartDrawer-Item-${line}`);
          if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
            cartDrawerWrapper
              ? trapFocus(cartDrawerWrapper, lineItem.querySelector(`[name="${name}"]`))
              : lineItem.querySelector(`[name="${name}"]`).focus();
          } else if (parsedState.item_count === 0 && cartDrawerWrapper) {
            trapFocus(cartDrawerWrapper.querySelector('.drawer__inner-empty'), cartDrawerWrapper.querySelector('a'));
          } else if (document.querySelector('.cart-item') && cartDrawerWrapper) {
            trapFocus(cartDrawerWrapper, document.querySelector('.cart-item__name'));
          }
        });

        CartPerformance.measureFromEvent(`${eventTarget}:user-action`, event);

        publish(PUB_SUB_EVENTS.cartUpdate, { source: 'cart-items', cartData: parsedState, variantId: variantId });

        this.recommendationsPerformed = false;
        this.performRecommendations();


      })
      .catch(() => {
        this.querySelectorAll('.loading__spinner').forEach((overlay) => overlay.classList.add('hidden'));
        const errors = document.getElementById('cart-errors') || document.getElementById('CartDrawer-CartErrors');
        errors.textContent = window.cartStrings.error;
      })
      .finally(() => {
        this.disableLoading(line);
      });
  }

  updateLiveRegions(line, message) {
    const lineItemError =
      document.getElementById(`Line-item-error-${line}`) || document.getElementById(`CartDrawer-LineItemError-${line}`);
    if (lineItemError) lineItemError.querySelector('.cart-item__error-text').textContent = message;

    this.lineItemStatusElement.setAttribute('aria-hidden', true);

    const cartStatus =
      document.getElementById('cart-live-region-text') || document.getElementById('CartDrawer-LiveRegionText');
    cartStatus.setAttribute('aria-hidden', false);

    setTimeout(() => {
      cartStatus.setAttribute('aria-hidden', true);
    }, 1000);
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
  }

  enableLoading(line) {
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    mainCartItems.classList.add('cart__items--disabled');

    const cartItemElements = this.querySelectorAll(`#CartItem-${line} .loading__spinner`);
    const cartDrawerItemElements = this.querySelectorAll(`#CartDrawer-Item-${line} .loading__spinner`);

    [...cartItemElements, ...cartDrawerItemElements].forEach((overlay) => overlay.classList.remove('hidden'));

    document.activeElement.blur();
    this.lineItemStatusElement.setAttribute('aria-hidden', false);
  }

  disableLoading(line) {
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    mainCartItems.classList.remove('cart__items--disabled');

    const cartItemElements = this.querySelectorAll(`#CartItem-${line} .loading__spinner`);
    const cartDrawerItemElements = this.querySelectorAll(`#CartDrawer-Item-${line} .loading__spinner`);

    cartItemElements.forEach((overlay) => overlay.classList.add('hidden'));
    cartDrawerItemElements.forEach((overlay) => overlay.classList.add('hidden'));
  }


  performRecommendations() {
  const recommendationsHolder = this.querySelector('[data-cart-drawer-upsells]');

  if (!recommendationsHolder || this.recommendationsPerformed) return;

  this.recommendationsPerformed = true;

  fetch(recommendationsHolder.dataset.url)
    .then((response) => response.text())
    .then((text) => {
      const html = new DOMParser().parseFromString(text, "text/html");
      const recommendations = html.querySelector("[data-cart-drawer-upsells]");

      if (recommendations) {
        recommendationsHolder.outerHTML = recommendations.outerHTML;
      }
    });
}


 async clearCart() {
  const response = await fetch('/cart/clear.js', {
    method: 'POST',
    headers: {
      Accept: 'application/json'
    }
  });

  const cart = await response.json();

  this.classList.toggle('is-empty', cart.item_count === 0);

  await this.onCartUpdate();

  publish(PUB_SUB_EVENTS.cartUpdate, {
    source: 'cart-items'
  });
}


}

customElements.define('cart-items', CartItems);

 


if (!customElements.get('cart-note')) {
  customElements.define(
    'cart-note',
    class CartNote extends HTMLElement {
      constructor() {
        super();

        this.addEventListener(
          'input',
          debounce((event) => {
            const body = JSON.stringify({ note: event.target.value });
            fetch(`${routes.cart_update_url}`, { ...fetchConfig(), ...{ body } })
              .then(() => CartPerformance.measureFromEvent('note-update:user-action', event));
          }, ON_CHANGE_DEBOUNCE_TIMER)
        );
      }
    }
  );
}


 

const modal = document.getElementById("CartClearModal");

document.addEventListener("click", (e) => {

    // Open
    if(e.target.closest(".clear-cart-btn")){
        e.preventDefault();
        modal.classList.remove("hidden");
        window.lenis?.stop();
    }

    // Close button
    if(e.target.closest(".cart-clear-modal__close")){
        modal.classList.add("hidden");
        window.lenis?.start();
    }

    // Overlay
    if(e.target.classList.contains("cart-clear-modal__overlay")){
        modal.classList.add("hidden");
         window.lenis?.start();
    }

    // Cancel
    if(e.target.closest(".modal-cancel")){
        modal.classList.add("hidden");
            window.lenis?.start();
    }

    // Confirm
    if (e.target.closest(".modal-confirm-clear")) {

    const btn = e.target.closest(".modal-confirm-clear");
    const spinner = btn.querySelector(".loading__spinner");

    spinner.classList.remove("hidden");
    btn.disabled = true;

    // Modal immediately close
  

    const cartItems =
        document.querySelector("cart-items") ||
        document.querySelector("cart-drawer-items");

    if (cartItems) {

        cartItems.clearCart().finally(() => {
              spinner.classList.add("hidden");
              modal.classList.add("hidden");
                    window.lenis?.start();
               btn.disabled = false;
       

        });

    }

}

});



 class DiscountCode extends HTMLElement {
  constructor() {
    super();

    this.input = this.querySelector(".promot-code-input");
    this.button = this.querySelector(".apply-button");
    this.loading__spinner  = this.querySelector(".loading__spinner");

    if (!this.input || !this.button) return;

    this.button.addEventListener("click", () => this.applyDiscount());

    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.applyDiscount();
      }
    });
  }

  async applyDiscount() {
    const code = this.input.value.trim();

    if (!code) {
      this.input.focus();
      return;
    }

    this.button.disabled = true;
    this.loading__spinner.classList.remove("hidden");

    try {
      // Apply discount
      await fetch(`/discount/${encodeURIComponent(code)}?redirect=/cart`, {
        credentials: "same-origin",
      });

      // Wait for Shopify
      await new Promise((resolve) => setTimeout(resolve, 300));

      await this.renderSections();
    } catch (error) {
      console.error(error);
    } finally {
      this.button.disabled = false;
      this.loading__spinner.classList.add("hidden");

    }
  }

  async renderSections() {
    const cartItems = document.querySelector("cart-items");

    if (!cartItems) return;

    const body = JSON.stringify({
      updates: {},
      sections: cartItems.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname,
    });

    const response = await fetch(routes.cart_update_url, {
      ...fetchConfig(),
      body,
    });

    const parsedState = await response.json();

    if (!parsedState.sections) return;

    cartItems.classList.toggle("is-empty", parsedState.item_count === 0);

 

    const cartDrawer = document.querySelector("cart-drawer");
    if (cartDrawer) {
      cartDrawer.classList.toggle("is-empty", parsedState.item_count === 0);
    }

    cartItems.getSectionsToRender().forEach((section) => {
      const container = document.getElementById(section.id);

      if (!container) return;

      const html = parsedState.sections[section.section];

      if (!html) return;

      const elementToReplace =
        container.querySelector(section.selector) || container;

      elementToReplace.innerHTML = cartItems.getSectionInnerHTML(
        html,
        section.selector
      );
    });

    cartItems.recommendationsPerformed = false;
    cartItems.performRecommendations();
  }
}

customElements.define("discount-code", DiscountCode);
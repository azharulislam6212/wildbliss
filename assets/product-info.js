/* -----------------------------------------------------------------------------
   Custom option pairing (static, product specific)

   Some option values exist as variants but never belong together: a "Loose Leaf"
   format has no "Tea Bags" sizes, and a "Tea Bags" format has no "Servings"
   sizes. Each rule greys out the values that do not apply to the value currently
   selected elsewhere in the picker.

   Rules match on VALUES, never on option names, so it does not matter whether
   the options are called Format/Size, Type/Pack or anything else:

     key   = the exact value that has to be selected for the rule to fire
     value = the text a value in ANOTHER option must contain to stay enabled

   All matching is case-insensitive; the keyword match is a substring, so one
   "tea bags" entry covers both "25 Tea Bags" and "75 Tea Bags". An option that
   offers none of the keywords (a flavour, a colour) is left alone, as is every
   product that has no value matching a key.
   ----------------------------------------------------------------------------- */
const CUSTOM_OPTION_PAIRING_RULES = [
  {
    'loose leaf': ['servings'],
    'tea bags': ['tea bags'],
  },
];

// Set to true, reload the product page, and the console reports what each rule
// matched — the quickest way to check a value's exact spelling.
const CUSTOM_OPTION_PAIRING_DEBUG = false;

const normalizeOptionText = (value) =>
  String(value ?? '')
    .replace(/\s+/g, ' ') // collapse newlines and non-breaking spaces
    .trim()
    .toLowerCase();

const isOptionInputSelected = (input) => (input.tagName === 'OPTION' ? input.selected : input.checked);

// Only the `disabled` property is touched. The picker CSS already styles
// :disabled exactly like a sold-out value, and the `.disabled` class Liquid
// puts on sold-out values is left alone.
const setCustomPairingDisabled = (input, disabled) => {
  input.disabled = disabled;

  if (disabled) input.dataset.customPairingDisabled = 'true';
  else delete input.dataset.customPairingDisabled;
};

// Selecting through a real change event keeps the stock variant flow in charge
// of everything that follows.
const selectCustomPairingInput = (input) => {
  if (input.tagName === 'OPTION') {
    const select = input.closest('select');
    if (!select) return;

    select.value = input.value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    return;
  }

  input.checked = true;
  input.dispatchEvent(new Event('change', { bubbles: true }));
};

if (!customElements.get('product-info')) {
  customElements.define(
    'product-info',
    class ProductInfo extends HTMLElement {
      quantityInput = undefined;
      quantityForm = undefined;
      onVariantChangeUnsubscriber = undefined;
      cartUpdateUnsubscriber = undefined;
      abortController = undefined;
      pendingRequestUrl = null;
      preProcessHtmlCallbacks = [];
      postProcessHtmlCallbacks = [];

      constructor() {
        super();

        this.quantityInput = this.querySelector('.quantity__input');
      }

      connectedCallback() {
        this.initializeProductSwapUtility();

        this.onVariantChangeUnsubscriber = subscribe(
          PUB_SUB_EVENTS.optionValueSelectionChange,
          this.handleOptionValueChange.bind(this)
        );

        this.initQuantityHandlers();
        this.applyCustomOptionPairing();
        this.dispatchEvent(new CustomEvent('product-info:loaded', { bubbles: true }));
      }

      addPreProcessCallback(callback) {
        this.preProcessHtmlCallbacks.push(callback);
      }

      initQuantityHandlers() {
        if (!this.quantityInput) return;

        this.quantityForm = this.querySelector('.product-form__quantity');
        if (!this.quantityForm) return;

        this.setQuantityBoundries();
        if (!this.dataset.originalSection) {
          this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, this.fetchQuantityRules.bind(this));
        }
      }

      disconnectedCallback() {
        this.onVariantChangeUnsubscriber();
        this.cartUpdateUnsubscriber?.();
      }

      initializeProductSwapUtility() {
        this.preProcessHtmlCallbacks.push((html) =>
          html.querySelectorAll('.scroll-trigger').forEach((element) => element.classList.add('scroll-trigger--cancel'))
        );
        this.postProcessHtmlCallbacks.push((newNode) => {
          window?.Shopify?.PaymentButton?.init();
          window?.ProductModel?.loadShopifyXR();
        });
      }

      handleOptionValueChange({ data: { event, target, selectedOptionValues } }) {
        if (!this.contains(event.target)) return;

        // Grey out straight away rather than waiting on the section request.
        // No auto-select here: this call sits in front of the fetch below, which
        // has already captured the option values it is about to ask for.
        this.applyCustomOptionPairing({ autoSelect: false });

        this.resetProductFormState();

        const productUrl = target.dataset.productUrl || this.pendingRequestUrl || this.dataset.url;
        this.pendingRequestUrl = productUrl;
        const shouldSwapProduct = this.dataset.url !== productUrl;
        const shouldFetchFullPage = this.dataset.updateUrl === 'true' && shouldSwapProduct;

        this.renderProductInfo({
          requestUrl: this.buildRequestUrlWithParams(productUrl, selectedOptionValues, shouldFetchFullPage),
          targetId: target.id,
          callback: shouldSwapProduct
            ? this.handleSwapProduct(productUrl, shouldFetchFullPage)
            : this.handleUpdateProductInfo(productUrl),
        });
      }

      resetProductFormState() {
        const productForm = this.productForm;
        productForm?.toggleSubmitButton(true);
        productForm?.handleErrorMessage();
      }

      handleSwapProduct(productUrl, updateFullPage) {
        return (html) => {
          this.productModal?.remove();

          const selector = updateFullPage ? "product-info[id^='MainProduct']" : 'product-info';
          const variant = this.getSelectedVariant(html.querySelector(selector));
          this.updateURL(productUrl, variant?.id);

          if (updateFullPage) {
            document.querySelector('head title').innerHTML = html.querySelector('head title').innerHTML;

            HTMLUpdateUtility.viewTransition(
              document.querySelector('main'),
              html.querySelector('main'),
              this.preProcessHtmlCallbacks,
              this.postProcessHtmlCallbacks
            );
          } else {
            HTMLUpdateUtility.viewTransition(
              this,
              html.querySelector('product-info'),
              this.preProcessHtmlCallbacks,
              this.postProcessHtmlCallbacks
            );
          }
        };
      }

      renderProductInfo({ requestUrl, targetId, callback }) {
        this.abortController?.abort();
        this.abortController = new AbortController();

        fetch(requestUrl, { signal: this.abortController.signal })
          .then((response) => response.text())
          .then((responseText) => {
            this.pendingRequestUrl = null;
            const html = new DOMParser().parseFromString(responseText, 'text/html');
            callback(html);
          })
          .then(() => {
            // set focus to last clicked option value
            document.querySelector(`#${targetId}`)?.focus();
          })
          .catch((error) => {
            if (error.name === 'AbortError') {
              console.log('Fetch aborted by user');
            } else {
              console.error(error);
            }
          });
      }

      getSelectedVariant(productInfoNode) {
        const selectedVariant = productInfoNode.querySelector('variant-selects [data-selected-variant]')?.innerHTML;
        return !!selectedVariant ? JSON.parse(selectedVariant) : null;
      }

      buildRequestUrlWithParams(url, optionValues, shouldFetchFullPage = false) {
        const params = [];

        !shouldFetchFullPage && params.push(`section_id=${this.sectionId}`);

        if (optionValues.length) {
          params.push(`option_values=${optionValues.join(',')}`);
        }

        return `${url}?${params.join('&')}`;
      }

      updateOptionValues(html) {
        const variantSelects = html.querySelector('variant-selects');
        if (variantSelects) {
          HTMLUpdateUtility.viewTransition(this.variantSelectors, variantSelects, this.preProcessHtmlCallbacks);
        }

        // The markup above came straight from the server and knows nothing
        // about the pairing rules, so they have to be re-applied.
        this.applyCustomOptionPairing();
      }

      // ---- Custom option pairing ------------------------------------------
      // Layered on top of the stock picker: it only flips `disabled` on option
      // inputs, so the default variant lookup is untouched.

      // Every option in the picker, as one array of inputs per option: radios
      // grouped by their shared name, a dropdown by its <option> list.
      customPairingGroups() {
        // Normally the picker sits inside <variant-selects>; fall back to the
        // whole product-info so a picker rendered outside it still pairs up.
        const variantSelects = this.variantSelectors?.querySelector('input[type="radio"], select')
          ? this.variantSelectors
          : this;
        if (!variantSelects) return [];

        const groups = new Map();

        variantSelects.querySelectorAll('input[type="radio"][name]').forEach((input) => {
          const key = `radio:${input.name}`;
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key).push(input);
        });

        variantSelects.querySelectorAll('select').forEach((select, index) => {
          if (select.options.length) groups.set(`select:${index}`, Array.from(select.options));
        });

        return Array.from(groups.values());
      }

      applyCustomOptionPairing({ autoSelect = true } = {}) {
        const groups = this.customPairingGroups();

        // Fewer than two options means there is nothing to pair.
        if (groups.length < 2) {
          if (CUSTOM_OPTION_PAIRING_DEBUG) console.log('[option pairing] no option groups found', groups);
          return;
        }

        CUSTOM_OPTION_PAIRING_RULES.forEach((rule, ruleIndex) => {
          const keys = Object.keys(rule).map(normalizeOptionText);

          // The controlling option is whichever one currently has a value the
          // rule names — no assumption about what that option is called.
          const controllingIndex = groups.findIndex((inputs) => {
            const selected = inputs.find(isOptionInputSelected);
            return !!selected && keys.includes(normalizeOptionText(selected.value));
          });

          if (CUSTOM_OPTION_PAIRING_DEBUG) {
            console.log(`[option pairing] rule ${ruleIndex}`, {
              keys,
              options: groups.map((inputs) => ({
                values: inputs.map(({ value }) => value),
                selected: inputs.find(isOptionInputSelected)?.value ?? null,
              })),
              controllingIndex,
            });
          }

          if (controllingIndex === -1) return;

          const selectedControl = groups[controllingIndex].find(isOptionInputSelected);
          const keywords = rule[Object.keys(rule).find((key) => normalizeOptionText(key) === normalizeOptionText(selectedControl.value))];
          if (!keywords?.length) return;

          const matchesKeyword = (input) =>
            keywords.some((keyword) => normalizeOptionText(input.value).includes(normalizeOptionText(keyword)));

          groups.forEach((inputs, index) => {
            if (index === controllingIndex) return;

            // An option that offers none of the keywords is none of this rule's
            // business — a flavour or a colour must never be greyed out.
            if (!inputs.some(matchesKeyword)) return;

            let firstAllowed = null;

            inputs.forEach((input) => {
              const isAllowed = matchesKeyword(input);
              setCustomPairingDisabled(input, !isAllowed);
              if (isAllowed && !firstAllowed) firstAllowed = input;
            });

            if (!autoSelect || !firstAllowed) return;

            // The value selected a moment ago may have just been greyed out —
            // switching to Tea Bags while "25 Servings" was selected, say. Move
            // the selection to the first value that still applies, once the
            // render in progress has finished.
            const selectedAffected = inputs.find(isOptionInputSelected);
            if (selectedAffected?.dataset.customPairingDisabled !== 'true') return;

            requestAnimationFrame(() => {
              if (!firstAllowed.isConnected || firstAllowed.disabled) return;
              selectCustomPairingInput(firstAllowed);
            });
          });
        });
      }

      handleUpdateProductInfo(productUrl) {
        return (html) => {
          const variant = this.getSelectedVariant(html);

          this.pickupAvailability?.update(variant);
          this.updateOptionValues(html);
          this.updateURL(productUrl, variant?.id);
          this.updateVariantInputs(variant?.id);

          if (!variant) {
            this.setUnavailable();
            return;
          }

           this.updateMedia(html, variant?.featured_media?.id);
     
      


          const updateSourceFromDestination = (id, shouldHide = (source) => false) => {
            const source = html.getElementById(`${id}-${this.sectionId}`);
            const destination = this.querySelector(`#${id}-${this.dataset.section}`);
            if (source && destination) {
              destination.innerHTML = source.innerHTML;
              destination.classList.toggle('hidden', shouldHide(source));
            }
          };

          updateSourceFromDestination('price');
          updateSourceFromDestination('Sku', ({ classList }) => classList.contains('hidden'));
          updateSourceFromDestination('Inventory', ({ innerText }) => innerText === '');
          updateSourceFromDestination('Volume');
          updateSourceFromDestination('Price-Per-Item', ({ classList }) => classList.contains('hidden'));

          updateSourceFromDestination('purchase-options');
          
          this.updateQuantityRules(this.sectionId, html);
          this.querySelector(`#Quantity-Rules-${this.dataset.section}`)?.classList.remove('hidden');
          this.querySelector(`#Volume-Note-${this.dataset.section}`)?.classList.remove('hidden');

          this.productForm?.toggleSubmitButton(
            html.getElementById(`ProductSubmitButton-${this.sectionId}`)?.hasAttribute('disabled') ?? true,
            window.variantStrings.soldOut
          );

          publish(PUB_SUB_EVENTS.variantChange, {
            data: {
              sectionId: this.sectionId,
              html,
              variant,
            },
          });
        };
      }

      updateVariantInputs(variantId) {
        this.querySelectorAll(
          `#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`
        ).forEach((productForm) => {
          const input = productForm.querySelector('input[name="id"]');
          input.value = variantId ?? '';
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }

      updateURL(url, variantId) {
        this.querySelector('share-button')?.updateUrl(
          `${window.shopUrl}${url}${variantId ? `?variant=${variantId}` : ''}`
        );

        if (this.dataset.updateUrl === 'false') return;
        window.history.replaceState({}, '', `${url}${variantId ? `?variant=${variantId}` : ''}`);
      }

      setUnavailable() {
        this.productForm?.toggleSubmitButton(true, window.variantStrings.unavailable);

        const selectors = ['price', 'Inventory', 'Sku', 'Price-Per-Item', 'Volume-Note', 'Volume', 'Quantity-Rules']
          .map((id) => `#${id}-${this.dataset.section}`)
          .join(', ');
        document.querySelectorAll(selectors).forEach(({ classList }) => classList.add('hidden'));
      }




      updateMedia(html, variantFeaturedMediaId) {
        if (!variantFeaturedMediaId) return;

        if (this.updateProductMediaGallery(html, variantFeaturedMediaId)) {
          this.updateMediaModal(html);
          return;
        }

        const mediaGallerySource = this.querySelector('media-gallery ul');
        const mediaGalleryDestination = html.querySelector(`media-gallery ul`);

        const refreshSourceData = () => {
          if (this.hasAttribute('data-zoom-on-hover')) enableZoomOnHover(2);
          const mediaGallerySourceItems = Array.from(mediaGallerySource.querySelectorAll('li[data-media-id]'));
          const sourceSet = new Set(mediaGallerySourceItems.map((item) => item.dataset.mediaId));
          const sourceMap = new Map(
            mediaGallerySourceItems.map((item, index) => [item.dataset.mediaId, { item, index }])
          );
          return [mediaGallerySourceItems, sourceSet, sourceMap];
        };

        if (mediaGallerySource && mediaGalleryDestination) {
          let [mediaGallerySourceItems, sourceSet, sourceMap] = refreshSourceData();
          const mediaGalleryDestinationItems = Array.from(
            mediaGalleryDestination.querySelectorAll('li[data-media-id]')
          );
          const destinationSet = new Set(mediaGalleryDestinationItems.map(({ dataset }) => dataset.mediaId));
          let shouldRefresh = false;

          // add items from new data not present in DOM
          for (let i = mediaGalleryDestinationItems.length - 1; i >= 0; i--) {
            if (!sourceSet.has(mediaGalleryDestinationItems[i].dataset.mediaId)) {
              mediaGallerySource.prepend(mediaGalleryDestinationItems[i]);
              shouldRefresh = true;
            }
          }

          // remove items from DOM not present in new data
          for (let i = 0; i < mediaGallerySourceItems.length; i++) {
            if (!destinationSet.has(mediaGallerySourceItems[i].dataset.mediaId)) {
              mediaGallerySourceItems[i].remove();
              shouldRefresh = true;
            }
          }

          // refresh
          if (shouldRefresh) [mediaGallerySourceItems, sourceSet, sourceMap] = refreshSourceData();

          // if media galleries don't match, sort to match new data order
          mediaGalleryDestinationItems.forEach((destinationItem, destinationIndex) => {
            const sourceData = sourceMap.get(destinationItem.dataset.mediaId);

            if (sourceData && sourceData.index !== destinationIndex) {
              mediaGallerySource.insertBefore(
                sourceData.item,
                mediaGallerySource.querySelector(`li:nth-of-type(${destinationIndex + 1})`)
              );

              // refresh source now that it has been modified
              [mediaGallerySourceItems, sourceSet, sourceMap] = refreshSourceData();
            }
          });
        }

        // set featured media as active in the media gallery
        this.querySelector(`media-gallery`)?.setActiveMedia?.(
          `${this.dataset.section}-${variantFeaturedMediaId}`,
          true
        );


        this.updateMediaModal(html);
      }

      updateMediaModal(html) {
        const modalContent = this.productModal?.querySelector(`.product-media-modal__content`);
        const newModalContent = html.querySelector(`product-modal .product-media-modal__content`);
        if (modalContent && newModalContent) modalContent.innerHTML = newModalContent.innerHTML;
      }

      // Moves the <product-media> slider (and its thumbs) to the variant's
      // featured image. Returns false when the section uses <media-gallery>
      // instead, so the caller falls back to that markup.
      updateProductMediaGallery(html, variantFeaturedMediaId) {
        const gallery = this.querySelector('product-media');
        if (!gallery) return false;

        const mediaIds = (root) =>
          Array.from(root.querySelectorAll('[data-media-item]'))
            .map(({ dataset }) => dataset.mediaId)
            .join(',');

        const newGallery = html.querySelector('product-media');

        // A different media set (product swap, or variant-filtered media) needs
        // fresh markup; re-inserting the element re-runs its swiper setup.
        if (newGallery && mediaIds(newGallery) !== mediaIds(gallery)) {
          gallery.replaceWith(newGallery);

          // connectedCallback defers swiper init by a frame, so select after it.
          requestAnimationFrame(() =>
            requestAnimationFrame(() =>
              this.querySelector('product-media')?.setActiveMedia?.(variantFeaturedMediaId)
            )
          );

          return true;
        }

        gallery.setActiveMedia?.(variantFeaturedMediaId);
        return true;
      }

      setQuantityBoundries() {
        const data = {
          cartQuantity: this.quantityInput.dataset.cartQuantity ? parseInt(this.quantityInput.dataset.cartQuantity) : 0,
          min: this.quantityInput.dataset.min ? parseInt(this.quantityInput.dataset.min) : 1,
          max: this.quantityInput.dataset.max ? parseInt(this.quantityInput.dataset.max) : null,
          step: this.quantityInput.step ? parseInt(this.quantityInput.step) : 1,
        };

        let min = data.min;
        const max = data.max === null ? data.max : data.max - data.cartQuantity;
        if (max !== null) min = Math.min(min, max);
        if (data.cartQuantity >= data.min) min = Math.min(min, data.step);

        this.quantityInput.min = min;

        if (max) {
          this.quantityInput.max = max;
        } else {
          this.quantityInput.removeAttribute('max');
        }
        this.quantityInput.value = min;

        publish(PUB_SUB_EVENTS.quantityUpdate, undefined);
      }

      fetchQuantityRules() {
        const currentVariantId = this.productForm?.variantIdInput?.value;
        if (!currentVariantId) return;

        this.querySelector('.quantity__rules-cart .loading__spinner').classList.remove('hidden');
        return fetch(`${this.dataset.url}?variant=${currentVariantId}&section_id=${this.dataset.section}`)
          .then((response) => response.text())
          .then((responseText) => {
            const html = new DOMParser().parseFromString(responseText, 'text/html');
            this.updateQuantityRules(this.dataset.section, html);
          })
          .catch((e) => console.error(e))
          .finally(() => this.querySelector('.quantity__rules-cart .loading__spinner').classList.add('hidden'));
      }

      updateQuantityRules(sectionId, html) {
        if (!this.quantityInput) return;
        this.setQuantityBoundries();

        const quantityFormUpdated = html.getElementById(`Quantity-Form-${sectionId}`);
        const selectors = ['.quantity__input', '.quantity__rules', '.quantity__label'];
        for (let selector of selectors) {
          const current = this.quantityForm.querySelector(selector);
          const updated = quantityFormUpdated.querySelector(selector);
          if (!current || !updated) continue;
          if (selector === '.quantity__input') {
            const attributes = ['data-cart-quantity', 'data-min', 'data-max', 'step'];
            for (let attribute of attributes) {
              const valueUpdated = updated.getAttribute(attribute);
              if (valueUpdated !== null) {
                current.setAttribute(attribute, valueUpdated);
              } else {
                current.removeAttribute(attribute);
              }
            }
          } else {
            current.innerHTML = updated.innerHTML;
            if (selector === '.quantity__label') {
              const updatedAriaLabelledBy = updated.getAttribute('aria-labelledby');
              if (updatedAriaLabelledBy) {
                current.setAttribute('aria-labelledby', updatedAriaLabelledBy);
                // Update the referenced visually hidden element
                const labelId = updatedAriaLabelledBy;
                const currentHiddenLabel = document.getElementById(labelId);
                const updatedHiddenLabel = html.getElementById(labelId);
                if (currentHiddenLabel && updatedHiddenLabel) {
                  currentHiddenLabel.textContent = updatedHiddenLabel.textContent;
                }
              }
            }
          }
        }
      }

      get productForm() {
        return this.querySelector(`product-form`);
      }

      get productModal() {
        return document.querySelector(`#ProductModal-${this.dataset.section}`);
      }

      get pickupAvailability() {
        return this.querySelector(`pickup-availability`);
      }

      get variantSelectors() {
        return this.querySelector('variant-selects');
      }

      get relatedProducts() {
        const relatedProductsSectionId = SectionId.getIdForSection(
          SectionId.parseId(this.sectionId),
          'related-products'
        );
        return document.querySelector(`product-recommendations[data-section-id^="${relatedProductsSectionId}"]`);
      }

      get quickOrderList() {
        const quickOrderListSectionId = SectionId.getIdForSection(
          SectionId.parseId(this.sectionId),
          'quick_order_list'
        );
        return document.querySelector(`quick-order-list[data-id^="${quickOrderListSectionId}"]`);
      }

      get sectionId() {
        return this.dataset.originalSection || this.dataset.section;
      }
    }
  );
}

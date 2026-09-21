/* Collection zone — region pills act as a tablist: choosing one swaps the copy
   panel and moves the highlight on the map. Everything is already in the DOM,
   so this only toggles state. */
if (!customElements.get('collection-zone')) {
  customElements.define(
    'collection-zone',
    class CollectionZone extends HTMLElement {
      connectedCallback() {
        this.pills = Array.from(this.querySelectorAll('[data-zone-pill]'));
        if (this.pills.length === 0) return;

        this.pills.forEach((pill) => {
          pill.addEventListener('click', () => this.select(pill.dataset.zonePill));
        });

        this.addEventListener('keydown', this.onKeydown.bind(this));
      }

      select(id, { focus = false } = {}) {
        this.pills.forEach((pill) => {
          const selected = pill.dataset.zonePill === id;
          pill.setAttribute('aria-selected', selected ? 'true' : 'false');
          pill.setAttribute('tabindex', selected ? '0' : '-1');
          if (selected && focus) pill.focus();
        });

        this.querySelectorAll('[data-zone-panel]').forEach((panel) => {
          panel.toggleAttribute('hidden', panel.dataset.zonePanel !== id);
        });

        this.querySelectorAll('[data-zone-pin]').forEach((pin) => {
          pin.setAttribute('aria-current', pin.dataset.zonePin === id ? 'true' : 'false');
        });
      }

      onKeydown(event) {
        const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
        if (!keys.includes(event.key)) return;

        const current = this.pills.findIndex((pill) => pill === document.activeElement);
        if (current === -1) return;

        event.preventDefault();

        let next = current;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          next = (current + 1) % this.pills.length;
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          next = (current - 1 + this.pills.length) % this.pills.length;
        } else if (event.key === 'Home') {
          next = 0;
        } else {
          next = this.pills.length - 1;
        }

        this.select(this.pills[next].dataset.zonePill, { focus: true });
      }
    }
  );
}

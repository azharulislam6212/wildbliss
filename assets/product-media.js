 
if (!customElements.get('product-media')) {
  class ProductMedia extends HTMLElement {
    constructor() {
      super();

      this.lastActiveBreakpoint = '';
      this.swiperInitialized = false;
      this.productModalHTML = {};
      this.selectors = {
        header: 'sticky-header',
        slider: '[data-slider]',
        thumbs: '[data-thumbs]',
        mediaItem: '[data-media-item]',
        mediaColor: 'data-media-color',
        thumbnail: '[data-thumbnail]'
      };
      this.filterMediaBy = this.dataset.galleryFilter;
      // Index among the visible slides only: media hidden by the alt-text
      // filter are not swiper slides, so data-index would be off.
      const visibleSlides = Array.from(
        this.querySelector(this.selectors.slider)?.querySelectorAll(`${this.selectors.mediaItem}.swiper-slide`) || []
      );
      this.selectedMediaIndex = Math.max(
        visibleSlides.findIndex(slide => slide.hasAttribute('data-selected')),
        0
      );
      
      this.breakpoints = {
        mobile: 320,
        desktop: 990,
        desktop_large: 1440
      };

      this.settings = {
        elements: {
          slider: this.querySelector(this.selectors.slider),
          thumbs: this.querySelector(this.selectors.thumbs)
        },
        instances: {
          slider: null,
          thumbs: null
        },
        options: {
          slider: {
            slidesPerView: 'auto',
            initialSlide: this.selectedMediaIndex,
            watchOverflow: true,
            watchSlidesVisibility: true,
            watchSlidesProgress: true,
            observer: true,
            observeParents: true,
            pagination: {
              el: '.swiper-pagination',
              type: 'progressbar'
            },
            navigation: {
              prevEl: '[data-arrow-prev]',
              nextEl: '[data-arrow-next]'
            },
            autoHeight: this.hasAttribute('data-slider-autoheight'),
            breakpoints: {
              [this.breakpoints.desktop]: {
                allowTouchMove: true,
                pagination: false
              }
            }
          },
          thumbs: {
            initialSlide: this.selectedMediaIndex,
            spaceBetween: 14,
            slidesPerView: this.getThumbsPerView(),
            watchOverflow: true,
            watchSlidesProgress: true,
            observer: true,
            observeParents: true,
            setWrapperSize: true,
            navigation: {
              nextEl: '[data-thumbs-next]',
              prevEl: '[data-thumbs-prev]'
            },
            direction: 'horizontal',
            breakpoints: {
              [this.breakpoints.desktop]: {
                slidesPerView: this.getThumbsPerView(),
                direction: this.hasAttribute('data-thumbs-layout')
                  ? 'vertical'
                  : 'horizontal'
              },
              [this.breakpoints.mobile]: {
                slidesPerView: this.getThumbsPerViewMobile()
              }
            }
          }
        }
      };
    }

    // How many thumbs the bottom strip shows at once, from the section
    // settings. The side layouts keep their own fixed count.
    getThumbsSetting(attribute, fallback) {
      const value = parseFloat(this.getAttribute(attribute));
      return Number.isFinite(value) && value > 0 ? value : fallback;
    }

    getThumbsPerView() {
      const useAspectRatio = this.hasAttribute('data-slider-autoheight');
      const useLayoutBottom = !this.hasAttribute('data-thumbs-layout');

      if (useLayoutBottom) return this.getThumbsSetting('data-thumbs-per-view', 4);
      if (useAspectRatio) return 'auto';
      return 5;
    }

    getThumbsPerViewMobile() {
      const useAspectRatio = this.hasAttribute('data-slider-autoheight');
      const useLayoutBottom = !this.hasAttribute('data-thumbs-layout');

      if (useLayoutBottom) return this.getThumbsSetting('data-thumbs-per-view-mobile', 3);
      if (useAspectRatio) return 'auto';
      return 5;
    }

    connectedCallback() {
      this.setThumbsHeight();
      requestAnimationFrame(() => {
        this.init();
        this.setLastActiveBreakpoint();
      });

      window.addEventListener(
        'resize',
        debounce(() => {
          this.setThumbsHeight();
          this.initSliders();
          this.setLastActiveBreakpoint();
        }, 300)
      );
    }


    init() {
      // A lightbox failure must never stop the sliders from starting.
      try {
        if (typeof PhotoSwipeLightbox !== 'undefined') {
          const photoSwipeLightboxInstance = new PhotoSwipeLightbox({
            gallery: this,
            children: 'a[data-pswp-image]',
            pswpModule: PhotoSwipe
          });

          photoSwipeLightboxInstance.init();
        }
      } catch (error) {
        console.error(error);
      }

      this.initSliders();
    }

    loadActiveVideo() {
      const activeSlide = this.settings.elements.slider.querySelector('.swiper-slide-active');
      if (!activeSlide) return;

      window.pauseAllMedia?.();

      const videoWrapper = activeSlide.querySelector('product-load-video');
      if (!videoWrapper) return;

      if (typeof videoWrapper.loadVideo === 'function') {
        videoWrapper.loadVideo();
      }
    }

    initSliders() {
      const screen = window.innerWidth <= this.breakpoints.desktop ? 'mobile' : 'desktop';
      const disabledOnDesktop = this.hasAttribute('data-slider-desktop-disabled');

      if (screen === 'mobile') {
        if (this.lastActiveBreakpoint === 'desktop' && this.swiperInitialized) {
          this.destroySwiper();
        }
        if (!this.swiperInitialized) {
          this.initSwiper();
        }
      } else if (screen === 'desktop') {
        if (disabledOnDesktop) {
          this.swiperInitialized && this.destroySwiper();
          return;
        }
        if (this.lastActiveBreakpoint === 'mobile' && this.swiperInitialized) {
          this.destroySwiper();
        }
        if (!this.swiperInitialized) {
          this.initSwiper();
        }
      }
    }

    initSwiper() {
      this.swiperInitialized = true;

      // Init thumbs
      if (this.settings.elements.thumbs) {
        this.settings.instances.thumbs = new Swiper(
          this.settings.elements.thumbs,
          this.settings.options.thumbs
        );
        this.settings.options.slider.thumbs = {
          swiper: this.settings.instances.thumbs
        };
      }

      // Init main slider
      this.settings.instances.slider = new Swiper(
        this.settings.elements.slider,
        this.settings.options.slider
      );

      // On a fresh page load swiper can measure the gallery before the section
      // CSS and images have settled, leaving the thumbs unsized (no gaps, no
      // active thumb) until a variant change calls update(). Re-measure both
      // once layout is ready.
      const refresh = () => this.updateSwipers();
      requestAnimationFrame(refresh);
      if (document.readyState === 'complete') {
        setTimeout(refresh, 100);
      } else {
        window.addEventListener('load', refresh, { once: true });
      }

      // Sync thumbs and main slider
      if (this.settings.elements.thumbs) {
        this.settings.instances.slider.on('slideChangeTransitionStart', () => {
          this.settings.instances.thumbs.slideTo(
            this.settings.instances.slider.activeIndex
          );
        });
      }

      this.settings.instances.slider.on('slideChange', () => {
        window.pauseAllMedia();
      });

      this.settings.instances.slider.on('init', () => {
        this.loadActiveVideo();
      });

      this.settings.instances.slider.on('slideChangeTransitionEnd', () => {
        this.loadActiveVideo();
      });

      // extra trigger in case "init" event fires late
      this.loadActiveVideo();
    }

    updateSwipers() {
      const { slider, thumbs } = this.settings.instances;
      [thumbs, slider].forEach(instance => {
        if (!instance || instance.destroyed) return;
        instance.updateSize();
        instance.updateSlides();
        instance.update();
      });
      if (slider && !slider.destroyed) {
        thumbs?.slideTo(slider.activeIndex, 0);
        slider.thumbs?.update?.(true);
      }
    }

    destroySwiper() {
      try {
        this.settings.instances.slider.destroy();
      } catch (error) {}

      try {
        if (this.settings.instances.thumbs) {
          this.settings.instances.thumbs.destroy();
        }
      } catch (error) {}
      this.swiperInitialized = false;
    }

    setLastActiveBreakpoint() {
      this.lastActiveBreakpoint =
        window.innerWidth <= this.breakpoints.desktop ? 'mobile' : 'desktop';
    }

    // Accepts a raw media id, or the "<section id>-<media id>" form the Dawn
    // media gallery uses, so either caller can drive the slider.
    setActiveMedia(id) {
      const mediaId = Number(String(id).split('-').pop());
      if (!mediaId) return;

      const mediaItems = Array.from(this.querySelectorAll(this.selectors.mediaItem));
      const mediaFound = mediaItems.find(
        media => Number(media.dataset.mediaId) === mediaId
      );

      if (!mediaFound || mediaFound.classList.contains('hidden')) return;

      // Position among the visible slides, so alt-text filtering is respected.
      const index = mediaItems
        .filter(media => media.classList.contains('swiper-slide'))
        .indexOf(mediaFound);

      if (!this.settings.instances.slider || this.settings.instances.slider?.destroyed) {
        // Grid layout: every image is already on the page, so only pull the
        // media into view when it is actually off screen.
        const { top, bottom } = mediaFound.getBoundingClientRect();
        if (top >= 0 && bottom <= window.innerHeight) return;

        const headerHeight = document.querySelector(this.selectors.header)?.offsetHeight || 0;
        window.scroll({
          top: top + window.scrollY - headerHeight,
          behavior: 'smooth'
        });
        return;
      }

      // Slide across at the gallery's normal speed, so a variant change reads
      // the same as swiping or using the arrows.
      this.settings.instances.slider.slideTo(index);
      this.settings.instances.thumbs?.slideTo(index);
    }

       filterMedia({ name, value }) {
      if (name !== this.filterMediaBy) return;

      const filteredMedia = this.querySelectorAll(
        `${this.selectors.mediaItem}[${this.selectors.mediaColor}="${value}"], ${this.selectors.thumbnail}[${this.selectors.mediaColor}="${value}"]`
      );
      const hasFilteredMedia = filteredMedia.length !== 0;

      this.querySelectorAll(
        `${this.selectors.mediaItem}, ${this.selectors.thumbnail}`
      ).forEach(media => {
        if (!hasFilteredMedia) {
          media.classList.add('swiper-slide');
          media.classList.remove('hidden');
        } else {
          media.classList.remove('swiper-slide');
          media.classList.add('hidden');
        }
      });

      const inactiveSliderInstance =
        !this.settings.instances.slider ||
        this.settings.instances.slider?.destroyed;

      if (!hasFilteredMedia && !inactiveSliderInstance) {
        this.settings.instances.slider.update();
        this.settings.instances.thumbs?.update();
        return;
      }

      this.querySelectorAll(
        `${this.selectors.mediaItem}[${this.selectors.mediaColor}="${value}"], ${this.selectors.thumbnail}[${this.selectors.mediaColor}="${value}"]`
      ).forEach(media => {
        media.classList.add('swiper-slide');
        media.classList.remove('hidden');
      });

      if (inactiveSliderInstance) return;

      this.settings.instances.slider.update();
      this.settings.instances.thumbs?.update();
    }

    setThumbsHeight() {
      const thumbs = this.querySelector(this.selectors.thumbs)?.parentElement;
      if (!thumbs) return;
      const slider = this.querySelector(this.selectors.slider);

      thumbs.style.maxHeight =
        this.hasAttribute('data-thumbs-layout') && window.innerWidth > this.breakpoints.desktop
          ? `${slider.clientHeight}px`
          : '';
    }
  }

  customElements.define('product-media', ProductMedia);
}

// ✅ Final ProductLoadVideo (no template, supports data-src → src)
class ProductLoadVideo extends HTMLElement {
  connectedCallback() {
         this.loadVideo();
    if (this.closest('.swiper-slide-active')) {
      this.loadVideo();
    }
  }

  loadVideo() {
    const video = this.querySelector('video');
    if (!video) return;

    const source = video.querySelector('source[data-src]');
    if (source && !source.src) {
      source.src = source.getAttribute('data-src');
      source.removeAttribute('data-src');
      video.load();
    }

    video.play().catch(() => {});
  }
}

customElements.define('product-load-video', ProductLoadVideo);

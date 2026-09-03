 
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

      this.selectedMediaIndex =
        Number(
          this.querySelector(this.selectors.slider)?.querySelector('[data-selected]')?.dataset.index
        ) || 0;

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
            spaceBetween: 8,
            slidesPerView: this.getThumbsPerView(),
            watchOverflow: true,
            watchSlidesProgress: true,
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

    getThumbsPerView(breakpoint) {
      const useAspectRatio = this.hasAttribute('data-slider-autoheight');
      const useLayoutBottom = !this.hasAttribute('data-thumbs-layout');

      if (useLayoutBottom) return breakpoint ? 9.15 : 9.26;
      if (useAspectRatio) return 'auto';
      if (!breakpoint) return 5;
      return 5;
    }

    getThumbsPerViewMobile(breakpoint) {
      const useAspectRatio = this.hasAttribute('data-slider-autoheight');
      const useLayoutBottom = !this.hasAttribute('data-thumbs-layout');

      if (useLayoutBottom) return breakpoint ? 5 : 4.9;
      if (useAspectRatio) return 'auto';
      if (!breakpoint) return 5;
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
      if (typeof PhotoSwipeLightbox !== 'undefined') {
        const photoSwipeLightboxInstance = new PhotoSwipeLightbox({
          gallery: this,
          children: 'a[data-pswp-image]',
          pswpModule: PhotoSwipe
        });

        photoSwipeLightboxInstance.init();
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

      requestAnimationFrame(() => {
        this.settings.instances.slider?.update();
        this.settings.instances.slider?.updateSlides();
        this.settings.instances.slider?.updateSize();
      });

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

    setActiveMedia(id) {
      const mediaFound = Array.from(this.querySelectorAll(this.selectors.mediaItem)).find(
        media => Number(media.dataset.mediaId) === id
      );

      if (!mediaFound) return;
      if (!this.settings.instances.slider || this.settings.instances.slider?.destroyed) {
        const headerHeight = document.querySelector(this.selectors.header)?.offsetHeight || 0;
        window.scroll({
          top: mediaFound.getBoundingClientRect().top + window.scrollY - headerHeight,
          behavior: 'smooth'
        });
        return;
      }

      this.settings.instances.slider.slideTo(Number(mediaFound.dataset.index));
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

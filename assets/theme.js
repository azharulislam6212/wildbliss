window.theme = window.theme || {};
var THMHelper = window.BEYHelper || {};
THMHelper.qs = document.querySelector.bind(document);
THMHelper.qsa = document.querySelectorAll.bind(document);
THMHelper.qid = document.getElementById.bind(document);
THMHelper.qde = document.documentElement;

var Thm = {
  init: function () {
    this.Basic.init();
  },
  Basic: {
    init: function () {
      this.smoothScroll();
      this.drawerToggler();
      this.marqueeScroller();
      this.sticky_header();
      this.slideshowSwiper();
      this.autoSlider();
      this.beforeAfter();
      this.videLoad();
      this.collapsibleContent();
      this.collapsibleContentMobile();
      this.stickyProduct();
    },
    sticky_header: function () {
      var header = document.querySelector('[data-sticky-type="always"]');

      if (header != null) {
        onScroll = () => {
          var scrolledPage = Math.round(window.pageYOffset);
          if (scrolledPage > 80) {
            header.classList.add("sticky");
          } else {
            header.classList.remove("sticky");
          }
        };
        document.addEventListener("scroll", onScroll);
      }
    },
    smoothScroll: function () {
      document
        .querySelectorAll(
          'a[href*="#"]:not([href="#"]):not([href="#0"]):not([href="#recover"]):not([href="#login"])',
        )
        .forEach((a) => {
          a.addEventListener("click", function (e) {
            if (
              location.pathname.replace(/^\//, "") ===
                this.pathname.replace(/^\//, "") &&
              location.hostname === this.hostname
            ) {
              var target =
                document.querySelector(this.hash) ||
                document.querySelector("[name=" + this.hash.slice(1) + "]");
              if (target) {
                e.preventDefault();
                window.scrollTo({ top: target.offsetTop, behavior: "smooth" });
                setTimeout(() => {
                  target.focus();
                  if (!target.matches(":focus")) {
                    target.setAttribute("tabindex", "-1");
                    target.focus();
                  }
                }, 600);
              }
            }
          });
        });
    },
    marqueeScroller: function () {
      if (!customElements.get("marquee-content")) {
        class Marquee extends HTMLElement {
          constructor() {
            super();
          }
          connectedCallback() {
            this.init();
          }
          calculationPaddingSection() {
            ((this.heightSection = this.offsetHeight),
              (this.heightSection =
                this.heightSection < 18
                  ? 18
                  : 96 < this.heightSection
                    ? 96
                    : this.heightSection),
              this.closest(".js-running-content").style.setProperty(
                "--spacing-padding-block",
                this.heightSection + "px",
              ));
          }
          init() {
            ((this.distance =
              this.querySelector(".js-marquee-item").offsetWidth),
              (this.speed = this.dataset.speed),
              this.style.setProperty(
                "--marquee-duration",
                this.distance / this.speed + "s",
              ));
          }
        }
        customElements.define("marquee-content", Marquee);
      }
    },
    drawerToggler: function () {
      const drawerToggleButtons = document.querySelectorAll(
        "[data-drawer-toggle]",
      );
      const body = document.body;

      drawerToggleButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const drawerTarget = button.getAttribute("data-drawer-toggle");
          const drawer = document.querySelector(
            `[data-drawer="${drawerTarget}"]`,
          );

          if (!drawer) return;

          const isOpen = drawer.classList.contains("drawer--visible");

          if (!isOpen) {
            openDrawer(drawer);
          } else {
            closeDrawer(drawer);
          }
        });
      });
      // Close button
      const drawerCloseButtons = document.querySelectorAll(
        ".drawer__close_button",
      );
      drawerCloseButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const drawer = button.closest("[data-drawer]");
          closeDrawer(drawer);
        });
      });

      // Underlay click
      const drawerUnderlays = document.querySelectorAll(
        "[data-drawer-underlay]",
      );
      drawerUnderlays.forEach((underlay) => {
        underlay.addEventListener("click", () => {
          const drawer = underlay.closest("[data-drawer]");
          closeDrawer(drawer);
        });
      });

      function openDrawer(drawer) {
        drawer.classList.add("drawer--visible");

        body.classList.add("drawer-open"); // for body overflow hidden
        body.style.overflow = "hidden";
      }

      function closeDrawer(drawer) {
        drawer.classList.remove("drawer--visible");

        body.classList.remove("drawer-open");
        body.style.overflow = "";
      }
    },
    slideshowSwiper: function () {
      class slideshowSwiper extends HTMLElement {
        constructor() {
          super();
        }
        connectedCallback() {
          this.sliderWrapper = this.querySelector(".slideshow__swiper");

          let centered_slides =
            this.sliderWrapper.dataset.centeredslides !== undefined
              ? JSON.parse(this.sliderWrapper.dataset.centeredslides)
              : undefined;
          let effect_fade =
            this.sliderWrapper.dataset.effectfade !== undefined
              ? JSON.parse(this.sliderWrapper.dataset.effectfade)
              : undefined;
          let next = this.querySelector(".swiper-button-next");
          let prev = this.querySelector(".swiper-button-prev");
          let pagination = this.querySelector(".swiper-pagination");
          let scroll = this.querySelector(".swiper-scrollbar");

          new Swiper(this.sliderWrapper, {
            effect: effect_fade ? "fade" : "slide",
            centeredSlides: centered_slides ? centered_slides : false,
            slidesPerView: parseInt(this.sliderWrapper.dataset.slidesmobile),
            spaceBetween: parseInt(this.sliderWrapper.dataset.mobilespace),
            grabCursor: false,
            horizontal: true,
            watchSlidesProgress: true,
            draggable: !0,
            autoHeight: !1,
            watchOverflow: !0,
            threshold: 10,
            freeMode: JSON.parse(this.sliderWrapper.dataset.freemode),
            loop: JSON.parse(this.sliderWrapper.dataset.loop),
            speed: 700,
            mousewheel: {
              forceToAxis: true,
            },
            autoplay: {
              enabled: JSON.parse(this.sliderWrapper.dataset.autoplay),
              disableOnInteraction: false,
              delay: parseInt(this.sliderWrapper.dataset.delay),
            },
            navigation: {
              nextEl: next,
              prevEl: prev,
            },
            pagination: {
              el: pagination,
              clickable: true,
            },
            scrollbar: {
              el: scroll,
              draggable: true,
            },
            breakpoints: {
              359: {
                slidesPerView: parseFloat(
                  this.sliderWrapper.dataset.slidesmobile,
                ),
                spaceBetween: parseInt(this.sliderWrapper.dataset.mobilespace),
              },
              768: {
                slidesPerView: parseFloat(this.sliderWrapper.dataset.slidestab),
                spaceBetween: parseInt(this.sliderWrapper.dataset.tabspace),
              },
              1024: {
                slidesPerView: parseFloat(
                  this.sliderWrapper.dataset.slidesdesktop,
                ),
                spaceBetween: parseInt(this.sliderWrapper.dataset.desktopspace),
              },
            },
          });
        }
      }
      customElements.define("slideshow-swiper", slideshowSwiper);
    },
    autoSlider: function () {
      class AutoSwiper extends HTMLElement {
        constructor() {
          super();
        }
        connectedCallback() {
          this.sliderWrapper = this.querySelector(".slideshow__swiper");
          if (!this.sliderWrapper) return;
          const resizeObserver = new ResizeObserver((entries) => this.init());
          resizeObserver.observe(this.sliderWrapper);
          //  console.log("testdd",this.sliderWrapper.dataset)
        }
        init() {
          let centered_slides =
            this.sliderWrapper.dataset.centeredslides !== undefined
              ? JSON.parse(this.sliderWrapper.dataset.centeredslides)
              : undefined;
          let effect_fade =
            this.sliderWrapper.dataset.effectfade !== undefined
              ? JSON.parse(this.sliderWrapper.dataset.effectfade)
              : undefined;
          let next = this.querySelector(".swiper-button-next");
          let prev = this.querySelector(".swiper-button-prev");
          let pagination = this.querySelector(".swiper-pagination");

          // console.log("Tress", centered_slides);

          const slider = new Swiper(this.sliderWrapper, {
            effect: effect_fade ? "fade" : "slide",
            centeredSlides: centered_slides ? centered_slides : false,
            slidesPerView: "auto",
            spaceBetween: parseInt(this.sliderWrapper.dataset.mobilespace),
            grabCursor: true,
            horizontal: true,
            watchSlidesProgress: true,
            draggable: !0,
            autoHeight: !1,
            watchOverflow: !0,
            threshold: 10,
            freeMode: JSON.parse(this.sliderWrapper.dataset.freemode),
            loop: JSON.parse(this.sliderWrapper.dataset.loop),
            speed: 700,
            mousewheel: {
              forceToAxis: true,
            },
            autoplay: {
              enabled: JSON.parse(this.sliderWrapper.dataset.autoplay),
              disableOnInteraction: false,
              delay: parseInt(this.sliderWrapper.dataset.delay),
            },
            navigation: {
              nextEl: next,
              prevEl: prev,
            },
            pagination: {
              el: pagination,
              clickable: true,
            },
            breakpoints: {
              359: {
                spaceBetween: parseInt(this.sliderWrapper.dataset.mobilespace),
              },
              768: {
                spaceBetween: parseInt(this.sliderWrapper.dataset.tabspace),
              },
              1024: {
                spaceBetween: parseInt(this.sliderWrapper.dataset.desktopspace),
              },
            },
          });

          return slider;
        }
      }
      customElements.define("auto-swiper", AutoSwiper);
    },
    beforeAfter: function () {
      class BeforeAfterImages extends HTMLElement {
        constructor() {
          (super(),
            (this.$ = this.querySelector.bind(this)),
            (this.$$ = this.querySelectorAll.bind(this)),
            this.init());
        }

        connectedCallback() {
          this.observeResize();
          this.animateToCenter(); // Run animation on load
        }

        observeResize() {
          ((this.resizeObserver = new ResizeObserver(() => this.init())),
            this.resizeObserver.observe(this.afterImage));
        }

        init() {
          this.afterImage = this.$(".js-after-image");
          this.splitCusor = this.$(".js-split-cursor");
          this.imageWith = this.afterImage.offsetWidth;
          this.imageHeight = this.afterImage.offsetHeight;
          this.isClicked = false;
          this.handleEvent();
        }

        handleEvent() {
          this.splitCusor.addEventListener(
            "mousedown",
            this.slideReady.bind(this),
            { passive: true },
          );
          this.splitCusor.addEventListener(
            "touchstart",
            this.slideReady.bind(this),
            { passive: true },
          );
          this.splitCusor.addEventListener(
            "mouseup",
            this.slideFinish.bind(this),
            { passive: true },
          );
          this.splitCusor.addEventListener(
            "touchend",
            this.slideFinish.bind(this),
            { passive: true },
          );
        }

        slideReady() {
          this.isClicked = true;
          document.addEventListener(
            "mousemove",
            (this.slideMoveBind = this.slideMove.bind(this)),
          );
          document.addEventListener("touchmove", this.slideMoveBind);
        }

        slideFinish() {
          this.isClicked = false;
          document.removeEventListener("mousemove", this.slideMoveBind);
          document.removeEventListener("touchmove", this.slideMoveBind);
        }

        slideMove(t) {
          if (this.isClicked) {
            const e = this.offsetLeft;
            t = (t.changedTouches ? t.changedTouches[0] : t).clientX - e;
            this.posSplitCusor = (t / this.imageWith) * 100;
            this.posSplitCusor = Math.min(100, Math.max(0, this.posSplitCusor));
            requestAnimationFrame(() => {
              this.style.setProperty(
                "--before-after-initial-drag-position",
                this.posSplitCusor + "%",
              );
            });
          }
        }

        animateToCenter() {
          // Start from 0%
          this.style.setProperty("--before-after-initial-drag-position", "0%");
          // Smoothly move to 50% after a short delay
          requestAnimationFrame(() => {
            this.style.transition =
              "--before-after-initial-drag-position 1.5s ease-in-out";
            this.style.setProperty(
              "--before-after-initial-drag-position",
              "50%",
            );
            // Remove transition after animation so manual dragging is instant
            setTimeout(() => {
              this.style.transition = "";
            }, 1600);
          });
        }
      }

      customElements.define("before-after-images", BeforeAfterImages);
    },
    videLoad: function () {
      class THMLazyLoadingVideo extends HTMLElement {
        constructor() {
          (super(),
            (this.iframe = this.querySelector("iframe")),
            (this.template = this.querySelector("template")),
            (this.isMouseenter = !1));
        }
        loadVideo() {
          var t;
          (this.iframe &&
            (this.iframe.setAttribute(
              "src",
              this.iframe.getAttribute("data-src"),
            ),
            this.iframe.addEventListener(
              "load",
              function () {
                ("youtube" == this.dataVideoType &&
                  this.iframe.contentWindow.postMessage(
                    '{"event":"command","func":"playVideo","args":""}',
                    "*",
                  ),
                  "vimeo" == this.dataVideoType &&
                    this.iframe.contentWindow.postMessage(
                      '{"method":"play"}',
                      "*",
                    ));
              }.bind(this),
            )),
            "local_video" == this.dataVideoType &&
              ((this.local_video = this.querySelector("video")),
              (t = this.local_video
                .querySelector("source")
                .getAttribute("data-src")),
              (this.local_video.src = t)));
        }
        execute() {
          Shopify.designMode
            ? this.loadVideo()
            : (["mousemove", "touchstart"].forEach(
                function (t) {
                  THMHelper.qs("body").addEventListener(
                    t,
                    function (t) {
                      (this.isMouseenter || this.loadVideo(),
                        (this.isMouseenter = !0));
                    }.bind(this),
                    { once: !0 },
                  );
                }.bind(this),
              ),
              window.addEventListener(
                "scroll",
                function (t) {
                  (this.isMouseenter || this.loadVideo(),
                    (this.isMouseenter = !0));
                }.bind(this),
                { once: !0 },
              ));
        }
        static get observedAttributes() {
          return ["data-video-type", "data-video-id"];
        }
        set dataVideoType(t) {
          this.setAttribute("data-video-type", t);
        }
        get dataVideoType() {
          return this.getAttribute("data-video-type");
        }
        set dataVideoId(t) {
          this.setAttribute("data-video-id", t);
        }
        get dataVideoId() {
          return this.getAttribute("data-video-id");
        }
        attributeChangedCallback(t, e, s) {
          e !== s && this.execute();
        }
        connectedCallback() {
          this.execute();
        }
        disconnectedCallback() {}
      }
      customElements.define("thm-load-video", THMLazyLoadingVideo);

      class THMLoadMedia extends HTMLElement {
        constructor() {
          (super(),
            (this.$ = this.querySelector.bind(this)),
            (this.sectionID = this.dataset.sectionId),
            (this.idVideo = this.dataset.idVideo),
            (this.typeVideo = this.dataset.type),
            (this.eleVideo = `shtVideo-${this.sectionID}-` + this.idVideo),
            (this.onPlayerStateYTChange =
              this.onPlayerStateYTChange.bind(this)),
            (this.onPlayerPlay = this.onPlayerPlay.bind(this)),
            (this.playPauseButton = this.$(".video-play-pause-button")),
            (this.trigger = this.$(".js-load-media-trigger")),
            this.trigger &&
              this.trigger.addEventListener(
                "click",
                this.handlePlayVideo.bind(this),
              ));

          if (this.playPauseButton) {
            this.playPauseButton.addEventListener(
              "click",
              this.togglePlayPauseVideo.bind(this),
            );
          }
        }

        togglePlayPauseVideo() {
          this.classList.add("playing");
          this.loadContent();

          const video = this.$(".js-media-item-video");

          if (!video) return;

          // First time play: pause others, play this
          if (video.paused || video.ended) {
            this.pauseAllVideo(video);
            video.play();
            this.updatePlayPauseIcon(true);
          } else {
            video.pause();
            this.updatePlayPauseIcon(false);
          }

          // ✅ If YouTube player is present
          if (this.player && typeof this.player.getPlayerState === "function") {
            const state = this.player.getPlayerState();
            if (
              state === YT.PlayerState.PAUSED ||
              state === YT.PlayerState.ENDED
            ) {
              this.pauseAllVideo(this.player);
              this.player.playVideo();
              this.updatePlayPauseIcon(true);
            } else if (state === YT.PlayerState.PLAYING) {
              this.player.pauseVideo();
              this.updatePlayPauseIcon(false);
            }
          }
        }

        updatePlayPauseIcon(isPlaying) {
          const playIcon =
            this.playPauseButton?.querySelector(".video-play-icon");
          const pauseIcon =
            this.playPauseButton?.querySelector(".video-pause-icon");

          if (!playIcon || !pauseIcon) return;

          if (isPlaying) {
            playIcon.style.display = "none";
            pauseIcon.style.display = "inline";
          } else {
            playIcon.style.display = "inline";
            pauseIcon.style.display = "none";
          }
        }

        handlePlayVideo() {
          this.classList.add("playing");
          this.loadContent();
          const t = this.querySelector(".js-media-item-video");
          t &&
            t.addEventListener("play", () => {
              (this.pauseAllVideo(t), t.play());
            });
        }
        onYouTubeIframeAPIReady() {
          if ("undefined" != typeof YT && void 0 !== YT.Player)
            try {
              this.player = new YT.Player(this.eleVideo, {
                videoId: this.idVideo,
                playerVars: { playsinline: 1 },
                events: {
                  onReady: this.onPlayerYTReady,
                  onStateChange: this.onPlayerStateYTChange,
                },
              });
            } catch (t) {
              console.error("Lỗi khi tạo trình phát YouTube:", t);
            }
          else {
            var t = document.createElement("script"),
              e =
                ((t.src = "https://www.youtube.com/iframe_api"),
                (t.onload = () => {
                  this.onYouTubeIframeAPIReady();
                }),
                document.getElementsByTagName("script")[0]);
            e.parentNode.insertBefore(t, e);
          }
        }
        onVimeoIframeAPIReady() {
          if ("undefined" != typeof Vimeo && void 0 !== Vimeo.Player)
            try {
              var t = { id: this.idVideo, autoplay: 1 };
              ((this.playerVimeo = new Vimeo.Player(this.eleVideo, t)),
                this.playerVimeo.on("play", () => {
                  this.pauseAllVideo(this.playerVimeo);
                }));
            } catch (t) {
              console.error("Lỗi khi tạo trình phát Vimeo:", t);
            }
          else {
            var t = document.createElement("script"),
              e =
                ((t.src = "https://player.vimeo.com/api/player.js"),
                (t.onload = () => {
                  this.onVimeoIframeAPIReady();
                }),
                document.getElementsByTagName("script")[0]);
            e.parentNode.insertBefore(t, e);
          }
        }
        onPlayerYTReady = () => {
          (this.pauseAllVideo(this.player), this.player.playVideo());
        };
        // onPlayerStateYTChange = (t) => {
        //   1 == t.data && this.onPlayerPlay();
        // };

        onPlayerStateYTChange = (t) => {
          const state = t.data;

          if (state === YT.PlayerState.PLAYING) {
            this.onPlayerPlay(); // pause other videos
            this.updatePlayPauseIcon(true); // 👈 show pause icon
          } else if (
            state === YT.PlayerState.PAUSED ||
            state === YT.PlayerState.ENDED
          ) {
            this.updatePlayPauseIcon(false); // 👈 show play icon
          }
        };

        onPlayerPlay = () => {
          this.pauseAllVideo(this.player);
        };
        loadContent() {
          if (!this.getAttribute("loaded")) {
            if (this.$("template")) {
              var t =
                this.$("template").content.firstElementChild.cloneNode(!0);
              (this.appendChild(t),
                this.isLoaded(!0),
                this.trigger && this.trigger.remove());

              // 🔽 ADD HERE AFTER APPENDING VIDEO
              const video = this.$(".js-media-item-video");
              if (video && !video.hasAttribute("data-listeners-added")) {
                video.addEventListener("play", () =>
                  this.updatePlayPauseIcon(true),
                );
                video.addEventListener("pause", () =>
                  this.updatePlayPauseIcon(false),
                );
                video.addEventListener("ended", () =>
                  this.updatePlayPauseIcon(false),
                );
                video.setAttribute("data-listeners-added", "true");
              }
            } else {
              if ("youtube" == this.typeVideo) this.onYouTubeIframeAPIReady();
              else {
                if ("vimeo" != this.typeVideo) return !0;
                this.onVimeoIframeAPIReady();
              }
              (this.trigger?.classList.add("d-none"),
                this.$(".js-media-item").classList.add("d-flex"));

              // 🔽 ALSO ADD HERE in case video is not loaded via <template>
              const video = this.$(".js-media-item-video");
              if (video && !video.hasAttribute("data-listeners-added")) {
                video.addEventListener("play", () =>
                  this.updatePlayPauseIcon(true),
                );
                video.addEventListener("pause", () =>
                  this.updatePlayPauseIcon(false),
                );
                video.addEventListener("ended", () =>
                  this.updatePlayPauseIcon(false),
                );
                video.setAttribute("data-listeners-added", "true");
              }
            }
            return !0;
          }
        }
        pauseAllVideo(e) {
          (THMHelper.qsa(
            ".js-product-media-deferred-video:has([data-type='youtube']",
          ).forEach((t) => {
            t.player && e !== t.player && t.player?.pauseVideo();
          }),
            THMHelper.qsa(
              ".js-product-media-deferred-video:has([data-type='vimeo'])",
            ).forEach((t) => {
              t.playerVimeo !== e && t.playerVimeo?.pause();
            }),
            THMHelper.qsa(".js-media-item-video").forEach((t) => {
              t !== e && t.pause();
            }));
        }
        isLoaded(t) {
          t ? this.setAttribute("loaded", !0) : this.removeAttribute("loaded");
        }
      }
      customElements.define("thm-load-media", THMLoadMedia);

      class DeferredMediaCustom extends HTMLElement {
        constructor() {
          super();

          this.$ = this.querySelector.bind(this);

          this.sectionID = this.dataset.sectionId;
          this.idVideo = this.dataset.idVideo;
          this.typeVideo = this.dataset.type;
          this.eleVideo = `DeferredVideo-${this.sectionID}-` + this.idVideo;

          this.trigger = this.$(".js-load-media-trigger");
          this.playPauseButton = this.$(".video-play-pause-button");

          this.onPlayerStateYTChange = this.onPlayerStateYTChange.bind(this);
          this.onPlayerPlay = this.onPlayerPlay.bind(this);

          this.trigger?.addEventListener("click", () => this.handleToggle());
        }

        connectedCallback() {
          if (
            Shopify &&
            Shopify.designMode &&
            this.getAttribute("data-autoplay") === "true"
          ) {
            this.loadContent();
          } else if (this.getAttribute("data-autoplay") === "true") {
            this.loadContent();
          }
        }

        /* ===============================
           TOGGLE
        =============================== */
        handleToggle() {
          this.classList.add("playing");
          this.loadContent();

          const video =
            this.$(".js-media-item-video") ||
            this.$(".js-media-item-video-mobile");

          if (video) {
            if (video.paused || video.ended) {
              this.pauseAllVideo(video);
              video.play();
              this.setButtonState(true);
            } else {
              video.pause();
              this.setButtonState(false);
            }
          }

          if (this.player && typeof this.player.getPlayerState === "function") {
            const state = this.player.getPlayerState();

            if (
              state === YT.PlayerState.PAUSED ||
              state === YT.PlayerState.ENDED
            ) {
              this.pauseAllVideo(this.player);
              this.player.playVideo();
              this.setButtonState(true);
            } else if (state === YT.PlayerState.PLAYING) {
              this.player.pauseVideo();
              this.setButtonState(false);
            }
          }
        }

        /* ===============================
           BUTTON STATE
        =============================== */
        setButtonState(isPlaying) {
          if (!this.playPauseButton) return;
          this.playPauseButton.dataset.playing = isPlaying ? "true" : "false";
        }

        /* ===============================
           YOUTUBE
        =============================== */
        onYouTubeIframeAPIReady() {
          if (this.player) return;

          if (typeof YT !== "undefined" && YT.Player) {
            this.player = new YT.Player(this.eleVideo, {
              videoId: this.idVideo,
              playerVars: { playsinline: 1 },
              events: {
                onReady: this.onPlayerYTReady,
                onStateChange: this.onPlayerStateYTChange,
              },
            });
            return;
          }

          // load script only once
          if (
            !document.querySelector(
              'script[src="https://www.youtube.com/iframe_api"]',
            )
          ) {
            const script = document.createElement("script");
            script.src = "https://www.youtube.com/iframe_api";
            document.head.appendChild(script);
          }

          // IMPORTANT: global callback (YouTube requirement)
          window.onYouTubeIframeAPIReady = () => {
            this.onYouTubeIframeAPIReady();
          };
        }

        onPlayerYTReady = () => {
          this.pauseAllVideo(this.player);
          this.player.playVideo();
        };

        onPlayerStateYTChange(t) {
          if (t.data === YT.PlayerState.PLAYING) {
            this.onPlayerPlay();
            this.setButtonState(true);
          } else if (
            t.data === YT.PlayerState.PAUSED ||
            t.data === YT.PlayerState.ENDED
          ) {
            this.setButtonState(false);
          }
        }

        onPlayerPlay() {
          this.pauseAllVideo(this.player);
        }

        /* ===============================
           VIMEO
        =============================== */

        createVimeoPlayer() {
          if (this.playerVimeo) return;

          this.playerVimeo = new Vimeo.Player(this.eleVideo, {
            id: this.idVideo,
            autoplay: true,
          });

          this.playerVimeo.on("play", () => {
            this.pauseAllVideo(this.playerVimeo);
          });
        }

        onVimeoIframeAPIReady() {
          if (typeof Vimeo !== "undefined" && Vimeo.Player) {
            this.createVimeoPlayer();
            return;
          }

          const src = "https://player.vimeo.com/api/player.js";

          // prevent duplicate script injection
          let script = document.querySelector(`script[src="${src}"]`);

          if (!script) {
            script = document.createElement("script");
            script.src = src;

            script.onload = () => {
              this.createVimeoPlayer();
            };

            document.head.appendChild(script);
            return;
          }

          // script already exists → wait until Vimeo becomes available
          const check = setInterval(() => {
            if (typeof Vimeo !== "undefined" && Vimeo.Player) {
              clearInterval(check);
              this.createVimeoPlayer();
            }
          }, 50);
        }
        /* ===============================
           LOAD CONTENT
        =============================== */

        loadContent() {
          if (this.hasAttribute("loaded")) return;

          // 🔹 YOUTUBE / VIMEO → hide trigger only
          if (this.typeVideo === "youtube" || this.typeVideo === "vimeo") {
            this.trigger?.classList.add("d-none");
          }

          // 🔹 Load template if exists
          if (this.$("template")) {
            const node =
              this.$("template").content.firstElementChild.cloneNode(true);
            this.appendChild(node);
          } else {
            if (this.typeVideo === "youtube") {
              this.onYouTubeIframeAPIReady();
              this.buttonWrapper?.classList.add("display-none");
            }

            if (this.typeVideo === "vimeo") {
              this.onVimeoIframeAPIReady();
            }
          }

          // 🔹 Handle autoplay (lazy-load logic)
          if (this.getAttribute("data-autoplay") === "true") {
            // HTML5 video
            const localVideo = this.$("video");

            if (localVideo) {
              const source = localVideo.querySelector("source");
              const src = source?.getAttribute("data-src");
              if (src) {
                source.setAttribute("src", src);
                localVideo.load();
                localVideo.muted = true;
                localVideo.play().catch((err) => {
                  console.warn("Autoplay failed:", err);
                });
              } else {
                console.warn("Missing data-src on local video source.");
              }
            }

            // iframe video (YouTube/Vimeo)
            const iframe = this.$("iframe");
            if (iframe) {
              const src = iframe.getAttribute("data-src");
              if (src) {
                iframe.setAttribute("src", src);

                iframe.addEventListener(
                  "load",
                  () => {
                    if (this.typeVideo === "youtube") {
                      iframe.contentWindow.postMessage(
                        '{"event":"command","func":"playVideo","args":""}',
                        "*",
                      );
                    }

                    if (this.typeVideo === "vimeo") {
                      iframe.contentWindow.postMessage(
                        '{"method":"play"}',
                        "*",
                      );
                    }
                  },
                  { once: true },
                );
              }
            }
          }

          this.isLoaded(true);

          // 🔹 Trigger listeners remain
          const video = this.$(".js-media-item-video");
          if (video && !video.dataset.listenersAdded) {
            video.addEventListener("play", () => this.setButtonState(true));
            video.addEventListener("pause", () => this.setButtonState(false));
            video.addEventListener("ended", () => this.setButtonState(false));
            video.dataset.listenersAdded = "true";
          }
        }

        /* ===============================
           PAUSE ALL
        =============================== */
        pauseAllVideo(current) {
          document
            .querySelectorAll(".js-media-item-video:has([data-type='youtube'])")
            .forEach((el) => {
              el.player && el.player !== current && el.player.pauseVideo();
            });

          document
            .querySelectorAll(".js-media-item-video:has([data-type='vimeo'])")
            .forEach((el) => {
              el.playerVimeo &&
                el.playerVimeo !== current &&
                el.playerVimeo.pause();
            });

          document
            .querySelectorAll(".js-media-item-video")
            .forEach((v) => v !== current && v.pause());
        }

        isLoaded(val) {
          val
            ? this.setAttribute("loaded", "")
            : this.removeAttribute("loaded");
        }
      }

      customElements.define("deferred-media-custom", DeferredMediaCustom);
    },
    collapsibleContent: function () {
      if (!customElements.get("collapsible-content")) {
        class collapsibleContent extends HTMLElement {
          constructor() {
            super();
            this.disclosure = this.querySelector("details");
            this.parentdiv = this.querySelector(".disclosure__flex");
            this.toggle = this.querySelector("summary");
            this.panel = this.toggle.nextElementSibling;
            this.init();
          }

          init() {
            // Check if the content element has a CSS transition.
            if (
              window.getComputedStyle(this.panel).transitionDuration !== "0s"
            ) {
              this.toggle.addEventListener(
                "click",
                this.handleToggle.bind(this),
              );
              this.disclosure.addEventListener(
                "transitionend",
                this.handleTransitionEnd.bind(this),
              );
            }
          }

          /**
           * Handles 'click' events on the summary element.
           * @param {object} evt - Event object.
           */
          handleToggle(evt) {
            evt.preventDefault();

            if (!this.disclosure.open) {
              this.open();
              this.parentdiv?.classList.add("open");
            } else {
              this.close();
              this.parentdiv?.classList.remove("open");
            }
          }

          /**
           * Handles 'transitionend' events on the details element.
           * @param {object} evt - Event object.
           */
          handleTransitionEnd(evt) {
            if (evt.target !== this.panel) return;

            if (this.disclosure.classList.contains("is-closing")) {
              this.disclosure.classList.remove("is-closing");
              this.disclosure.open = false;
            }

            this.panel.removeAttribute("style");
          }

          /**
           * Adds inline 'height' style to the content element, to trigger open transition.
           */
          addContentHeight() {
            this.panel.style.height = `${this.panel.scrollHeight}px`;
          }

          /**
           * Opens the details element.
           */
          open() {
            // Set content 'height' to zero before opening the details element.
            this.panel.style.height = "0";

            // Open the details element
            this.disclosure.open = true;

            // Set content 'height' to its scroll height, to enable CSS transition.
            this.addContentHeight();
          }

          /**
           * Closes the details element.
           */
          close() {
            // Set content height to its scroll height, to enable transition to zero.
            this.addContentHeight();

            // Add class to enable styling of content or toggle icon before or during close transition.
            this.disclosure.classList.add("is-closing");

            // Set content height to zero to trigger the transition.
            // Slight delay required to allow scroll height to be applied before changing to '0'.
            setTimeout(() => {
              this.panel.style.height = "0";
            });
          }
        }
        customElements.define("collapsible-content", collapsibleContent);
      }
    },

    collapsibleContentMobile: function () {
      if (!customElements.get("collapsible-mobilecontent")) {
        class CollapsibleMobileContent extends HTMLElement {
          constructor() {
            super();
            this.detailsList = Array.from(this.querySelectorAll("details"));
            this.isMobile = window.innerWidth < 768;

            this.boundHandleResize = this.handleResize.bind(this);
            this.boundToggleHandlers = new Map();

            this.init();
            window.addEventListener("resize", this.boundHandleResize);
          }

          init() {
            if (this.isMobile) {
              this.enableAccordion();
            } else {
              this.disableAccordion();
            }
          }

          handleResize() {
            const nowMobile = window.innerWidth < 768;
            if (nowMobile !== this.isMobile) {
              this.isMobile = nowMobile;
              if (this.isMobile) {
                this.enableAccordion();
              } else {
                this.disableAccordion();
              }
            }
          }

          enableAccordion() {
            this.detailsList.forEach((details) => {
              const toggle = details.querySelector("summary");
              const panel = toggle.nextElementSibling;

              // Reset for mobile mode
              panel.style.height = "0";
              details.open = false;
              details.classList.remove("is-closing");

              // Create click handler for this details
              const handler = (evt) => {
                evt.preventDefault();
                if (!details.open) {
                  // Opening animation
                  panel.style.height = "0";
                  details.open = true;
                  requestAnimationFrame(() => {
                    panel.style.height = `${panel.scrollHeight}px`;
                  });
                } else {
                  // Closing animation
                  panel.style.height = `${panel.scrollHeight}px`;
                  details.classList.add("is-closing");
                  setTimeout(() => {
                    panel.style.height = "0";
                  }, 10);
                }
              };

              if (!this.boundToggleHandlers.has(details)) {
                toggle.addEventListener("click", handler);
                this.boundToggleHandlers.set(details, handler);

                // Transition end cleanup
                panel.addEventListener("transitionend", (evt) => {
                  if (evt.target !== panel) return;
                  if (details.classList.contains("is-closing")) {
                    details.classList.remove("is-closing");
                    details.open = false;
                    panel.style.height = "";
                  }
                });
              }
            });
          }

          disableAccordion() {
            this.detailsList.forEach((details) => {
              const toggle = details.querySelector("summary");
              const panel = toggle.nextElementSibling;

              // Remove click handlers if present
              const handler = this.boundToggleHandlers.get(details);
              if (handler) {
                toggle.removeEventListener("click", handler);
                this.boundToggleHandlers.delete(details);
              }

              // Reset styles for desktop view
              panel.style.height = "";
              details.classList.remove("is-closing");
              details.open = true;
            });
          }

          disconnectedCallback() {
            window.removeEventListener("resize", this.boundHandleResize);
            this.detailsList.forEach((details) => {
              const toggle = details.querySelector("summary");
              const handler = this.boundToggleHandlers.get(details);
              if (handler) {
                toggle.removeEventListener("click", handler);
              }
            });
            this.boundToggleHandlers.clear();
          }
        }

        customElements.define(
          "collapsible-mobilecontent",
          CollapsibleMobileContent,
        );
      }
    },

    stickyProduct: function () {
      function TopOffset(el) {
        let rect = el.getBoundingClientRect(),
          scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        return { top: rect.top + scrollTop };
      }

      class Stickybar extends HTMLElement {
        constructor() {
          super();
          this.sticky_close = this.querySelector(".sticky-product__close");
          this.sticky_close.addEventListener(
            "click",
            this.closeSticky.bind(this),
          );
        }
        connectedCallback() {
          this.initSticky();
        }

        closeSticky() {
          this.remove();
        }
        initSticky() {
          const productForm = document.querySelector(".product-form"),
            productStickyWrapper = document.querySelector(".sticky-product");
          window.addEventListener("scroll", function () {
            let productFormTopffset = TopOffset(productForm).top;
            window.scrollY > productFormTopffset
              ? (productStickyWrapper.classList.add("sticky_bar"),
                document.body.classList.add("sticky__cart"))
              : (productStickyWrapper.classList.remove("sticky_bar"),
                document.body.classList.remove("sticky__cart"));
          });
        }
      }
      customElements.define("sticky-component", Stickybar);
    },
  },
};

document.addEventListener("DOMContentLoaded", function () {
  Thm.init();
});

function buildAnimation() {
  const button = gsap.utils.toArray(".button");

  if (button != null) {
    button.forEach((item) => {
      let span = item.querySelector(".button--text");
      let tl = gsap.timeline({ paused: true });
      if (span != null) {
        tl.to(span, { duration: 0.2, xPercent: 150, ease: "power2.in" });
        tl.set(span, { xPercent: -150 });
        tl.to(span, { duration: 0.2, xPercent: 0 });
        item.addEventListener("mouseenter", () => tl.play(0));
        item.addEventListener("mouseleave", () => tl.reverse());
      }
    });
  }
}

function initBlogIsotope(section) {
  // section is optional: if provided, scope querySelector inside it
  var scope = section || document;
  var elem = scope.querySelector(".blog-articles");

  if (!elem) return;

  // Destroy previous Isotope instance if it exists
  if (elem._isotopeInstance) {
    elem._isotopeInstance.destroy();
  }

  // Initialize Isotope
  var grid = new Isotope(elem, {
    itemSelector: ".article__item",
    layoutMode: "fitRows",
  });

  // Store instance for later cleanup
  elem._isotopeInstance = grid;

  // Filter select
  var select = scope.querySelector(".blog-filter-select");
  if (select) {
    select.addEventListener("change", function () {
      var filterValue = this.value;
      filterValue =
        (window.filterFns && window.filterFns[filterValue]) || filterValue;
      grid.arrange({ filter: filterValue });
    });
  }
}

// Initial call on page load
document.addEventListener("DOMContentLoaded", function () {
  initBlogIsotope();
  buildAnimation();
});

// Shopify section/block events
document.addEventListener("shopify:section:load", function (event) {
  initBlogIsotope(event.target);
  buildAnimation(event.target);
});

document.addEventListener("shopify:section:reorder", function (event) {
  initBlogIsotope(event.target);
  buildAnimation(event.target);
});

document.addEventListener("shopify:block:select", function (event) {
  initBlogIsotope(event.target);
  buildAnimation(event.target);
});

if (!customElements.get("tabbed-content")) {
  class Tabs extends HTMLElement {
    constructor() {
      super();
      this.tabList = this.querySelector('[role="tablist"]');
      this.activeTab = this.tabList.querySelector('[aria-selected="true"]');
      this.isVerticalTablist =
        this.tabList.getAttribute("aria-orientation") === "vertical";
      this.tabs = this.querySelectorAll('[role="tab"]');
      this.panels = this.querySelectorAll('[role="tabpanel"]');

      // If no tab is active by default, activate the first tab.
      if (!this.activeTab) {
        this.activeTab = this.tabs[0];
        this.activateTab(this.activeTab);
      }

      this.addListeners();
    }

    addListeners() {
      this.tabList.addEventListener("click", this.handleClick.bind(this));
      this.tabList.addEventListener("keydown", this.handleKeydown.bind(this));
    }

    handleClick(evt) {
      if (!evt.target.matches('[role="tab"]') || evt.target === this.activeTab)
        return;
      this.activateTab(evt.target);
    }

    handleKeydown(evt) {
      switch (evt.key) {
        case "ArrowLeft":
        case "ArrowRight":
          evt.preventDefault();
          if (!this.isVerticalTablist) {
            this.switchTabOnKeyPress(evt.key);
          }
          break;

        case "ArrowUp":
        case "ArrowDown":
          evt.preventDefault();
          if (this.isVerticalTablist) {
            this.switchTabOnKeyPress(evt.key);
          }
          break;

        case "Home":
          evt.preventDefault();
          this.activateTab(this.tabs[0]);
          break;

        case "End":
          evt.preventDefault();
          this.activateTab(this.tabs[this.tabs.length - 1]);
          break;
      }
    }

    switchTabOnKeyPress(key) {
      if (key === "ArrowRight" || key === "ArrowDown") {
        if (this.activeTab === this.tabs[this.tabs.length - 1]) {
          this.activateTab(this.tabs[0]);
        } else {
          this.activateTab(this.activeTab.nextElementSibling);
        }
      } else if (key === "ArrowLeft" || key === "ArrowUp") {
        if (this.activeTab === this.tabs[0]) {
          this.activateTab(this.tabs[this.tabs.length - 1]);
        } else {
          this.activateTab(this.activeTab.previousElementSibling);
        }
      }
    }

    activateTab(tab) {
      this.deactivateActiveTab();

      Tabs.setTabState(tab, true);
      tab.removeAttribute("tabindex");
      this.activeTab = tab;

      const panelId = tab.getAttribute("aria-controls");
      const panel = document.getElementById(panelId);

      if (panel) {
        panel.classList.add("fade-in"); // Add animation class

        setTimeout(() => {
          panel.classList.remove("fade-in");
        }, 500);
      }

      if (document.activeElement.matches(".tablist__tab")) {
        tab.focus();
      }
    }

    deactivateActiveTab() {
      Tabs.setTabState(this.activeTab, false);
      this.activeTab.setAttribute("tabindex", "-1");
      this.activeTab = null;
    }

    static setTabState(tab, active) {
      tab.setAttribute("aria-selected", active);

      const panelId = tab.getAttribute("aria-controls");
      const panel = document.getElementById(panelId);

      if (panel) {
        if (active) {
          panel.hidden = false;
        } else {
          panel.hidden = true;
        }
      }
    }
  }

  customElements.define("tabbed-content", Tabs);
}

// Money format handler
Shopify.money_format = "${{amount_no_decimals}}";
Shopify.formatMoney = function (cents, format) {
  if (typeof cents == "string") cents = cents.replace(".", "");
  var value = "";
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = format || this.money_format;

  function defaultOption(opt, def) {
    return typeof opt === "undefined" ? def : opt;
  }

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultOption(precision, 2);
    thousands = defaultOption(thousands, ",");
    decimal = defaultOption(decimal, ".");

    if (isNaN(number) || number == null) return 0;
    number = (number / 100.0).toFixed(precision);
    var parts = number.split("."),
      dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + thousands),
      cents = parts[1] ? decimal + parts[1] : "";
    return dollars + cents;
  }

  var match = formatString.match(placeholderRegex);
  if (!match) return formatString;

  switch (match[1]) {
    case "amount":
      value = formatWithDelimiters(cents, 2);
      break;
    case "amount_no_decimals":
      value = formatWithDelimiters(cents, 0);
      break;
    case "amount_with_comma_separator":
      value = formatWithDelimiters(cents, 2, ".", ",");
      break;
    case "amount_no_decimals_with_comma_separator":
      value = formatWithDelimiters(cents, 0, ".", ",");
      break;
  }

  return formatString.replace(placeholderRegex, value);
};

class VariantWeightSelect extends HTMLElement {
  constructor() {
    super();

    this.selectedOptions = {};
  }

  connectedCallback() {
    this.box = this.querySelector(".vs-box");
    this.items = this.querySelectorAll(".vs-item");
    this.selected = this.querySelector(".vs-selected");

    this.productCard = this.closest(".product-card-wrapper");
    this.form = this.productCard?.querySelector(".js-product-form");

    this.bindEvents();
  }

  bindEvents() {
    // Dropdown toggle
    this.box?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.classList.toggle("open");
    });

    // Option select
    this.items.forEach((item) => {
      item.addEventListener("click", () => {
        this.selectOption(item);
      });
    });

    // Outside click close
    document.addEventListener("click", (e) => {
      if (!this.contains(e.target)) {
        this.classList.remove("open");
      }
    });
  }

  selectOption(item) {
    const value = item.dataset.value;
    const position = item.dataset.position;

    this.selected.textContent = value;
    this.classList.remove("open");

    this.selectedOptions[position] = value;

    const variant = this.getVariant(value);

    if (!variant) return;
    this.updatePrice(variant);
    this.updateForm(variant);
  }

  getVariants() {
    const variantsScript = this.productCard?.querySelector(
      '[type="application/json"][data-variants]',
    );

    return variantsScript ? JSON.parse(variantsScript.textContent) : [];
  }

  getVariant(value) {
    const variants = this.getVariants();

    return variants.find((variant) =>
      [variant.option1, variant.option2, variant.option3].includes(value),
    );
  }

  async updatePrice(variant) {
    const handle = this.productCard.dataset.productHandle;

    const response = await fetch(
      `/products/${handle}?variant=${variant.id}&section_id=card-product`,
    );

    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const newPrice = doc.querySelector(".price");
    const currentPrice = this.productCard.querySelector(".price");

    if (newPrice && currentPrice) {
      currentPrice.innerHTML = newPrice.innerHTML;
    }
  }

  updateForm(variant) {
    const input = this.form?.querySelector('[name="id"]');
    const button = this.form?.querySelector('[name="add"]');
    const text = button?.querySelector("span");

    if (!input || !button) return;

    input.value = variant.id;

    if (variant.available) {
      button.disabled = false;
      if (text) text.textContent = "Add to cart";
    } else {
      button.disabled = true;
      if (text) text.textContent = "Sold out";
    }

    input.dispatchEvent(
      new Event("change", {
        bubbles: true,
      }),
    );

    this.form.dispatchEvent(
      new Event("change", {
        bubbles: true,
      }),
    );
  }
}

customElements.define("variant-weight-select", VariantWeightSelect);

if (!customElements.get("tabbed-content")) {
  class Tabs extends HTMLElement {
    constructor() {
      super();
      this.tabList = this.querySelector('[role="tablist"]');
      this.activeTab = this.tabList.querySelector('[aria-selected="true"]');
      this.isVerticalTablist =
        this.tabList.getAttribute("aria-orientation") === "vertical";
      this.tabs = this.querySelectorAll('[role="tab"]');
      this.panels = this.querySelectorAll('[role="tabpanel"]');

      // If no tab is active by default, activate the first tab.
      if (!this.activeTab) {
        this.activeTab = this.tabs[0];
        this.activateTab(this.activeTab);
      }

      this.addListeners();
    }

    addListeners() {
      this.tabList.addEventListener("click", this.handleClick.bind(this));
      this.tabList.addEventListener("keydown", this.handleKeydown.bind(this));
    }

    handleClick(evt) {
      if (!evt.target.matches('[role="tab"]') || evt.target === this.activeTab)
        return;
      this.activateTab(evt.target);
    }

    handleKeydown(evt) {
      switch (evt.key) {
        case "ArrowLeft":
        case "ArrowRight":
          evt.preventDefault();
          if (!this.isVerticalTablist) {
            this.switchTabOnKeyPress(evt.key);
          }
          break;

        case "ArrowUp":
        case "ArrowDown":
          evt.preventDefault();
          if (this.isVerticalTablist) {
            this.switchTabOnKeyPress(evt.key);
          }
          break;

        case "Home":
          evt.preventDefault();
          this.activateTab(this.tabs[0]);
          break;

        case "End":
          evt.preventDefault();
          this.activateTab(this.tabs[this.tabs.length - 1]);
          break;
      }
    }

    switchTabOnKeyPress(key) {
      if (key === "ArrowRight" || key === "ArrowDown") {
        if (this.activeTab === this.tabs[this.tabs.length - 1]) {
          this.activateTab(this.tabs[0]);
        } else {
          this.activateTab(this.activeTab.nextElementSibling);
        }
      } else if (key === "ArrowLeft" || key === "ArrowUp") {
        if (this.activeTab === this.tabs[0]) {
          this.activateTab(this.tabs[this.tabs.length - 1]);
        } else {
          this.activateTab(this.activeTab.previousElementSibling);
        }
      }
    }

    activateTab(tab) {
      this.deactivateActiveTab();

      Tabs.setTabState(tab, true);
      tab.removeAttribute("tabindex");
      this.activeTab = tab;

      const panelId = tab.getAttribute("aria-controls");
      const panel = document.getElementById(panelId);

      if (panel) {
        panel.classList.add("fade-in"); // Add animation class

        setTimeout(() => {
          panel.classList.remove("fade-in");
        }, 500);
      }

      if (document.activeElement.matches(".tablist__tab")) {
        tab.focus();
      }
    }

    deactivateActiveTab() {
      Tabs.setTabState(this.activeTab, false);
      this.activeTab.setAttribute("tabindex", "-1");
      this.activeTab = null;
    }

    static setTabState(tab, active) {
      tab.setAttribute("aria-selected", active);

      const panelId = tab.getAttribute("aria-controls");
      const panel = document.getElementById(panelId);

      if (panel) {
        if (active) {
          panel.hidden = false;
        } else {
          panel.hidden = true;
        }
      }
    }
  }

  customElements.define("tabbed-content", Tabs);
}

document.querySelectorAll(".product--spacific--block").forEach((block) => {
  const content = block.querySelector(".product--spacific__text");
  const button = block.querySelector(".product--spacific__toggle");

  if (!content || !button) return;

  const collapsedHeight = 126;

  if (content.scrollHeight <= collapsedHeight) {
    button.style.display = "none";
    return;
  }

  button.addEventListener("click", () => {
    const expanded = button.classList.contains("is-expanded");

    if (expanded) {
      content.style.maxHeight = collapsedHeight + "px";
      button.classList.remove("is-expanded");
      button.innerHTML = "View More <span>▼</span>";
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
      button.classList.add("is-expanded");
      button.innerHTML = "View Less <span>▼</span>";
    }
  });
});

class CountdownTimer extends HTMLElement {
  constructor() {
    super();
    this.interval = null;
  }

  connectedCallback() {
    this.startTimer();
  }

  disconnectedCallback() {
    clearInterval(this.interval);
  }

  parseEndTimeUTCMinus4(str) {
    const date = new Date(str);
    const localOffset = date.getTimezoneOffset();
    const targetOffset = 4 * 60;
    return date.getTime() + (localOffset + targetOffset) * 60 * 1000;
  }

  createDigits(value) {
    return value
      .split("")
      .map(
        (digit) => `
          <span class="timer-digit">${digit}</span>
        `,
      )
      .join("");
  }

  renderTimer(days, hours, mins, secs) {
    this.innerHTML = `
      <div class="countdown-wrap">

        <div class="timer-group">
          <div class="timer-digits">
            ${this.createDigits(days)}
          </div>
          <span class="timer-label">DAY</span>
        </div>

        <span class="timer-separator">:</span>

        <div class="timer-group">
          <div class="timer-digits">
            ${this.createDigits(hours)}
          </div>
          <span class="timer-label">HOUR</span>
        </div>

        <span class="timer-separator">:</span>

        <div class="timer-group">
          <div class="timer-digits">
            ${this.createDigits(mins)}
          </div>
          <span class="timer-label">MINS</span>
        </div>

        <span class="timer-separator">:</span>

        <div class="timer-group">
          <div class="timer-digits">
            ${this.createDigits(secs)}
          </div>
          <span class="timer-label">SECS</span>
        </div>

      </div>
    `;
  }

  startTimer() {
    const endDate = this.dataset.endDate;
    if (!endDate) return;

    const endTime = this.parseEndTimeUTCMinus4(endDate);

    const update = () => {
      const now = Date.now();
      let timeLeft = Math.floor((endTime - now) / 1000);

      if (timeLeft <= 0) {
        this.renderTimer("00", "00", "00", "00");
        clearInterval(this.interval);
        return;
      }

      const days = String(Math.floor(timeLeft / 86400)).padStart(2, "0");

      timeLeft %= 86400;
      const hours = String(Math.floor(timeLeft / 3600)).padStart(2, "0");

      timeLeft %= 3600;
      const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");

      const secs = String(timeLeft % 60).padStart(2, "0");

      this.renderTimer(days, hours, mins, secs);
    };

    update();
    this.interval = setInterval(update, 1000);
  }
}

customElements.define("countdown-timer", CountdownTimer);

document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(
    ".testimonial-grid .testimonial-card",
  );
  const button = document.querySelector(".view-more-btn");

  const itemsPerClick = 3;
  let visibleItems = 6;

  // Initial
  items.forEach((item, index) => {
    item.classList.toggle("hidden", index >= visibleItems);
  });
  if (!button) return;

  if (items.length <= visibleItems) {
    button.parentElement.style.display = "none";
  }

  button.addEventListener("click", () => {
    visibleItems += itemsPerClick;

    items.forEach((item, index) => {
      if (index < visibleItems) {
        item.classList.remove("hidden");
      }
    });

    if (visibleItems >= items.length) {
      button.parentElement.style.display = "none";
    }
  });
});

class PurchaseOptions extends HTMLElement {
  constructor() {
    super();
  }

  get radios() {
    return this.querySelectorAll(".purchase-option");
  }

  get select() {
    return this.querySelector("#selling-plan-select");
  }

  get cards() {
    return this.querySelectorAll(".purchase-card");
  }

  connectedCallback() {
    this.planData = JSON.parse(
      document.getElementById("selling-plans-data").textContent,
    );

    this.addEventListener("change", (event) => {
      if (event.target.matches(".purchase-option")) {
        this.updatePurchaseOption();
      }

      if (event.target.matches("#selling-plan-select")) {
        this.updateSellingPlan();
      }
    });

    // Start observer
    this.observeSellingPlanInput();

    this.variantChangeUnsubscriber = subscribe(
      PUB_SUB_EVENTS.variantChange,
      this.handleVariantChange.bind(this),
    );

    // Initial UI
    // this.updateSellingPlan();
    this.updatePurchaseOption();
  }

  handleVariantChange({ data }) {
    const productInfo = this.closest("product-info");

    if (!productInfo || productInfo.dataset.section !== data.sectionId) {
      return;
    }

    // নতুন plan data
    const script = this.querySelector("#selling-plans-data");

    if (script) {
      this.planData = JSON.parse(script.textContent);
    }

    // UI sync
    this.updatePurchaseOption();
  }

  disconnectedCallback() {
    this.variantChangeUnsubscriber?.();
  }

  observeSellingPlanInput() {
    if (this.observer) return;

    this.observer = new MutationObserver(() => {
      const hiddenInput = this.getSellingPlanInput();

      if (!hiddenInput) return;

      this.updateHiddenInput();
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Initial attempt
    this.updateHiddenInput();
  }

  updateHiddenInput() {
    const hiddenInput = this.getSellingPlanInput();

    if (!hiddenInput) return;

    const checked = this.querySelector(".purchase-option:checked");

    hiddenInput.value =
      checked && checked.value !== ""
        ? this.select?.value || checked.value
        : "";

    hiddenInput.dispatchEvent(
      new Event("change", {
        bubbles: true,
      }),
    );
  }

  getSellingPlanInput() {
    // 1. যদি component form-এর ভিতরে থাকে
    let form = this.closest("form");

    if (form) {
      return form.querySelector('input[name="selling_plan"]');
    }

    // 2. একই product section-এর product-form খুঁজুন
    const section = this.closest(".shopify-section");

    if (section) {
      form = section.querySelector("product-form form");

      if (form) {
        return form.querySelector('input[name="selling_plan"]');
      }
    }

    // 3. Fallback (শেষ চেষ্টা)
    form = document.querySelector("product-form form");

    return form?.querySelector('input[name="selling_plan"]');
  }

  updateSellingPlan() {
    const hiddenInput = this.getSellingPlanInput();

    if (!this.select) return;

    // Auto select subscription
    const subscriptionRadio = this.querySelector(
      ".purchase-card.subscribe .purchase-option",
    );

    if (subscriptionRadio) {
      subscriptionRadio.checked = true;
    }

    this.cards.forEach((card) => card.classList.remove("active"));
    this.querySelector(".purchase-card.subscribe")?.classList.add("active");

    const option = this.select.options[this.select.selectedIndex];

    const planId = this.select.value;
    const plan = this.planData[planId];

    if (!plan) return;

    const salePrice = Number(plan.price);
    const comparePrice = Number(plan.compare_price);

    const save = comparePrice - salePrice;
    const savePercent = Math.round((save / comparePrice) * 100);

    this.querySelector(".sale-price").textContent = Shopify.formatMoney(
      salePrice,
      "${{amount}}",
    );

    this.querySelector(".compare-price").textContent = Shopify.formatMoney(
      comparePrice,
      "${{amount}}",
    );

    this.querySelector(".save-badge").textContent = `SAVE ${savePercent}%`;

    this.querySelector(".subscription-save-text").textContent =
      `Save ${Shopify.formatMoney(save, "${{amount}}")} today and on every shipment`;

    // Update hidden input
    this.updateHiddenInput();
  }

  updatePurchaseOption() {
    const checked = this.querySelector(".purchase-option:checked");

    // Active class
    this.cards.forEach((card) => card.classList.remove("active"));

    if (checked) {
      checked.closest(".purchase-card").classList.add("active");
    }

    // Subscription হলে price/updateHiddenInput update হবে
    if (checked && checked.value !== "") {
      if (this.select) {
        this.updateSellingPlan();
      } else {
        this.updateHiddenInput();
      }
    } else {
      // One Time Purchase
      const hiddenInput = this.getSellingPlanInput();

      if (hiddenInput) {
        hiddenInput.value = "";

        hiddenInput.dispatchEvent(
          new Event("change", {
            bubbles: true,
          }),
        );
      }
    }
  }
}

customElements.define("purchase-options", PurchaseOptions);

const customSelects = document.querySelectorAll(".custom-select");

customSelects.forEach((wrapper) => {
  const select = wrapper.querySelector("select");

  select.addEventListener("mousedown", () => {
    wrapper.classList.toggle("open");
  });

  select.addEventListener("blur", () => {
    wrapper.classList.remove("open");
  });

  select.addEventListener("change", () => {
    wrapper.classList.remove("open");
  });
});

class ShippingBar extends HTMLElement {
  constructor() {
    super();
    this.currentCurrency = Shopify.currency.active;
    this.conversionRate = Shopify.currency.rate;
    this.threshold = this.dataset.threshold;
    this.convertedThreshold = 0;
    this.totalPrice = this.dataset.totalPrice;
    this.moneyFormat = this.dataset.moneyFormat;
    this.empty = this.dataset.empty === "true";
    this.showCurrencyCode = this.dataset.showCurrencyCode === "true";
  }

  connectedCallback() {
    this.calculateConvertedPrices();
    if (this.empty) {
      this.emptyText = this.querySelector("[data-empty-text]");
      this.showEmptyText();
      return;
    }
    this.successText = this.querySelector("[data-success-text]");
    this.progressText = this.querySelector("[data-progress-text]");
    this.progressBar = this.querySelector("[data-progress-bar]");

    const thresholdIsPassed = Number(this.totalPrice) > Number(this.threshold);
    if (!thresholdIsPassed && Number(this.threshold) > 0) {
      this.showProgress();
      return;
    }
    // this.progressBar.style.width = '100%';
    this.progressBar.parentElement.style.setProperty("--width", `100%`);

    this.progressBar.parentElement.classList.remove("hidden");
    this.successText.classList.remove("hidden");
  }

  showEmptyText() {
    this.emptyText.innerHTML = this.emptyText.innerHTML.replace(
      "[amount]",
      this.getFormattedPrice(this.threshold),
    );
    this.emptyText.classList.remove("hidden");
  }

  calculateConvertedPrices() {
    this.threshold = (this.threshold * (this.conversionRate || 1)).toFixed(0);
  }

  showProgress() {
    // Calculate progress percent
    const progressPercent = (this.totalPrice * 100) / this.threshold;
    // this.progressBar.style.width = `${progressPercent}%`;
    this.progressBar.parentElement.style.setProperty(
      "--width",
      `${progressPercent}%`,
    );
    // Replace price
    const progressText = this.progressText.innerHTML.replace(
      "[amount]",
      this.getFormattedPrice(this.threshold - this.totalPrice),
    );
    this.progressText.innerHTML = progressText;

    this.progressBar.parentElement.classList.remove("hidden");
    this.progressText.classList.remove("hidden");
  }

  getFormattedPrice(price) {
    const formattedPrice = Shopify.formatMoney(price, this.moneyFormat);
    return this.showCurrencyCode
      ? `${formattedPrice} ${this.currentCurrency}`
      : formattedPrice;
  }
}

customElements.define("shipping-bar", ShippingBar);











document.addEventListener("DOMContentLoaded", function () {
 

  function openDrawer(id) {
    closeDrawers();

    const drawer = document.getElementById(id);

    if (!drawer) return;
    drawer.classList.add("active");
 
    document.body.classList.add("overflow-hidden");
  }

  function closeDrawers() {
    document.querySelectorAll(".bottom-drawer").forEach(function (drawer) {
      drawer.classList.remove("active");
    });

 

    document.body.classList.remove("overflow-hidden");
  }

  function refreshCartDrawer(callback) {
    fetch("?section_id=cart-drawer")
      .then((response) => response.text())
      .then((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const newDrawer = doc.querySelector("#CartDrawer");
        if (newDrawer && document.querySelector("#CartDrawer")) {
          document.querySelector("#CartDrawer").replaceWith(newDrawer);
        }

        if (typeof callback === "function") {
          callback();
        }
      });
  }

  document.addEventListener("click", function (e) {
    const trigger = e.target.closest(".drawer-trigger");

    if (trigger) {
      e.preventDefault();

      openDrawer(trigger.dataset.target);
    }
  });

  document.addEventListener("click", function (e) {
    if (e.target.closest(".drawer-close")) {
      closeDrawers();
    }
  });


  

  document.addEventListener("keyup", function (e) {
    if (e.key === "Escape") {
      closeDrawers();
    }
  });

  // ORDER NOTE

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".save-order-note")) return;

    const btn = e.target;

    btn.disabled = true;

    fetch("/cart/update.js", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        note: document.getElementById("cart-note").value,
      }),
    })
      .then((res) => res.json())

      .then(() => {
        refreshCartDrawer(function () {
          closeDrawers();
          btn.disabled = false;
          const drawer = document.querySelector("#CartDrawer");
          if (drawer) {
            drawer.classList.add("active");

            document.body.classList.add("overflow-hidden");
          }
        });
      });
  });

  // GIFT NOTE

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".save-gift-note")) return;

    const btn = e.target;
    btn.disabled = true;
    fetch("/cart/update.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        attributes: {
          "Gift Note": document.getElementById("gift-note").value,
        },
      }),
    })
      .then((res) => res.json())

      .then(() => {
        refreshCartDrawer(function () {
          closeDrawers();
          btn.disabled = false;
          const drawer = document.querySelector("#CartDrawer");
          if (drawer) {
            drawer.classList.add("active");
            document.body.classList.add("overflow-hidden");
          }
        });
      });
  });

  // PROMO CODE

  document.addEventListener("click", function (e) {
    if (!e.target.closest("#applyDiscount")) return;

    const btn = e.target;

    const code = document.getElementById("discountCode").value.trim();

    if (!code) {
      alert("Enter promo code");
      return;
    }

    btn.disabled = true;

    btn.classList.add("loading");

    document.cookie = `discount_code=${code}; path=/`;

    fetch(`/discount/${code}`)
      .then(function () {
        return fetch("/cart/update.js", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            updates: {},
          }),
        });
      })

      .then(function () {
        refreshCartDrawer(function () {
          btn.disabled = false;
          btn.classList.remove("loading");
          closeDrawers();
          const drawer = document.querySelector("#CartDrawer");
          if (drawer) {
            drawer.classList.add("active");
            document.body.classList.add("overflow-hidden");
          }
        });
      })

      .catch(function (error) {
        console.error(error);
        btn.disabled = false;
        btn.classList.remove("loading");
      });
  });
});





document.addEventListener("DOMContentLoaded", () => {

  const shippingBtn = document.getElementById("ShowPickupAvailabilityDrawer");

  if (!shippingBtn) return;

  shippingBtn.addEventListener("click", function () {

    const pickupAvailability = document.querySelector("pickup-availability");

    if (!pickupAvailability) return;

    const jsonScript = pickupAvailability.querySelector(
      'script[type="application/json"]'
    );

    if (!jsonScript) return;

    const data = JSON.parse(jsonScript.textContent);

    const wrapper = document.getElementById("pickupLocations");

    if (!wrapper) return;

    wrapper.innerHTML = "";

    if (!data.store_availabilities.length) {

      wrapper.innerHTML = `
        <div class="pickup-empty">
          No pickup locations available.
        </div>
      `;

      return;
    }

    data.store_availabilities.forEach((store) => {

      wrapper.insertAdjacentHTML(
        "beforeend",
        `
        <div class="pickup-item">

          <div class="pickup-icon">

            <svg viewBox="0 0 24 24" fill="none">

              <path
                d="M12 22C12 22 19 16 19 10.5C19 6.36 15.87 3 12 3C8.13 3 5 6.36 5 10.5C5 16 12 22 12 22Z"
                stroke="currentColor"
                stroke-width="2"
              />

              <circle
                cx="12"
                cy="10.5"
                r="3"
                stroke="currentColor"
                stroke-width="2"
              />

            </svg>

          </div>

          <div class="pickup-content">

            <h4>${store.location.name}</h4>

            <p>

              ${store.location.address.address1 || ""}

              ${store.location.address.city || ""}

              ${store.location.address.province || ""}

            </p>

            <span>${store.pick_up_time}</span>

          </div>

        </div>
        `
      );

    });

  });

});




document.addEventListener("click", function (e) {

    const trigger = e.target.closest(".drawer-trigger");

    if (!trigger) return;

    openDrawer(trigger.dataset.target);

});





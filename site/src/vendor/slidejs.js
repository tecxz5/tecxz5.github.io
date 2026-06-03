class SlideJS {
  constructor(options = {}) {
    this.opts = {
      parentSelector: '.slide-box',
      itemSelector: '.slide-item',
      itemDocSelector: null,
      width: null,
      height: null,
      transitionDuration: 500,
      transitionTimingFunction: 'ease',
      transitionDelay: 0,
      activeIndex: 0,
      loop: false,
      scrollSensitivity: 300,
      beforeSlide() {},
      afterSlide() {}
    };

    for (const key in options) {
      this.opts[key] = options[key];
    }

    this.activeIndex = this.opts.activeIndex;
    this.sliding = false;
    this.contentScrolling = false;
    this.resizeHandler = () => this.adapt();
    this.contentScrollTimers = new WeakMap();

    this.init();
  }

  init() {
    const parent = document.querySelector(this.opts.parentSelector);

    if (!parent?.querySelectorAll) {
      throw new Error('Invalid parentSelector for SlideJS');
    }

    this.domSlidBox = parent;
    this.domSlidItems = [...parent.querySelectorAll(this.opts.itemSelector)];

    if (!this.domSlidItems.length) {
      throw new Error('Invalid itemSelector for SlideJS');
    }

    this.adapt();
    this.addEvents();
  }

  addEvents() {
    window.addEventListener('resize', this.resizeHandler);

    this.domSlidItems.forEach((domItem) => {
      domItem.addEventListener(
        'scroll',
        () => {
          this.contentScrolling = true;
          window.clearTimeout(this.contentScrollTimers.get(domItem));

          const timeout = window.setTimeout(() => {
            this.contentScrolling = false;
          }, this.opts.scrollSensitivity);

          this.contentScrollTimers.set(domItem, timeout);
        },
        { passive: true }
      );
    });
  }

  resolveDimension(value, fallback) {
    if (typeof value === 'function') {
      return value();
    }

    return value ?? fallback;
  }

  animateItem(dom, index, activeIndex) {
    const innerHeight = this.resolveDimension(this.opts.height, window.innerHeight);

    if (index < activeIndex) {
      dom.style.top = `${-innerHeight}px`;
      dom.style.opacity = '0';
      return;
    }

    if (index > activeIndex) {
      dom.style.top = `${innerHeight}px`;
      dom.style.opacity = '0';
      return;
    }

    dom.style.top = '0';
    dom.style.opacity = '1';
    dom.scrollTop = 0;
  }

  adapt() {
    const innerWidth = this.resolveDimension(this.opts.width, window.innerWidth);
    const innerHeight = this.resolveDimension(this.opts.height, window.innerHeight);
    const transitionStyle = `all ${this.opts.transitionDuration}ms ${this.opts.transitionTimingFunction} ${this.opts.transitionDelay}ms`;

    this.domSlidBox.style.position = 'fixed';
    this.domSlidBox.style.width = `${innerWidth}px`;
    this.domSlidBox.style.height = `${innerHeight}px`;
    this.domSlidBox.style.left = '0';
    this.domSlidBox.style.top = '0';
    this.domSlidBox.style.overflow = 'hidden';

    this.domSlidItems.forEach((domItem, index) => {
      domItem.style.position = 'absolute';
      domItem.style.width = `${innerWidth}px`;
      domItem.style.height = `${innerHeight}px`;
      domItem.style.overflow = 'auto';
      domItem.style.transition = transitionStyle;
      domItem.style.msTransition = transitionStyle;
      domItem.style.webkitTransition = transitionStyle;
      domItem.style.oTransition = transitionStyle;
      domItem.style.mozTransition = transitionStyle;
      this.animateItem(domItem, index, this.activeIndex);
    });
  }

  slideNext() {
    if (this.sliding || this.contentScrolling) {
      return;
    }

    let targetIndex = this.activeIndex + 1;

    if (targetIndex > this.domSlidItems.length - 1) {
      if (!this.opts.loop) {
        return;
      }

      targetIndex = 0;
    }

    this.slideTo(targetIndex);
  }

  slidePrev() {
    if (this.sliding || this.contentScrolling) {
      return;
    }

    let targetIndex = this.activeIndex - 1;

    if (targetIndex < 0) {
      if (!this.opts.loop) {
        return;
      }

      targetIndex = this.domSlidItems.length - 1;
    }

    this.slideTo(targetIndex);
  }

  slideTo(index) {
    const prevIndex = this.activeIndex;

    if (index === prevIndex || this.sliding || this.contentScrolling) {
      return;
    }

    if (this.opts.beforeSlide(prevIndex, index) === 'stop') {
      return;
    }

    this.sliding = true;
    window.setTimeout(() => {
      this.sliding = false;
      this.opts.afterSlide(prevIndex, index);
    }, this.opts.transitionDuration + 500);

    this.domSlidItems.forEach((domItem, itemIndex) => {
      this.animateItem(domItem, itemIndex, index);
    });

    this.activeIndex = index;
  }
}

export default SlideJS;

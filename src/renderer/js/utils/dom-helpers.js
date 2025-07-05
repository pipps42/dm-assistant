/**
 * DOM Helper Utilities - Funzioni helper per manipolazione DOM
 */

/**
 * Query selectors with error handling
 */
export function querySelector(selector, context = document) {
  try {
    return context.querySelector(selector);
  } catch (error) {
    console.error(`Invalid selector: ${selector}`, error);
    return null;
  }
}

export function querySelectorAll(selector, context = document) {
  try {
    return Array.from(context.querySelectorAll(selector));
  } catch (error) {
    console.error(`Invalid selector: ${selector}`, error);
    return [];
  }
}

/**
 * Element creation helpers
 */
export function createElement(tag, options = {}) {
  const element = document.createElement(tag);

  if (options.className) {
    element.className = options.className;
  }

  if (options.id) {
    element.id = options.id;
  }

  if (options.innerHTML) {
    element.innerHTML = options.innerHTML;
  }

  if (options.textContent) {
    element.textContent = options.textContent;
  }

  if (options.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }

  if (options.style) {
    Object.assign(element.style, options.style);
  }

  if (options.events) {
    Object.entries(options.events).forEach(([event, handler]) => {
      element.addEventListener(event, handler);
    });
  }

  return element;
}

export function createElementFromHTML(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstChild;
}

/**
 * Class manipulation helpers
 */
export function addClass(element, ...classes) {
  if (!element) return;
  element.classList.add(...classes);
}

export function removeClass(element, ...classes) {
  if (!element) return;
  element.classList.remove(...classes);
}

export function toggleClass(element, className, force) {
  if (!element) return;
  return element.classList.toggle(className, force);
}

export function hasClass(element, className) {
  if (!element) return false;
  return element.classList.contains(className);
}

/**
 * Style helpers
 */
export function setStyle(element, styles) {
  if (!element) return;
  Object.assign(element.style, styles);
}

export function getStyle(element, property) {
  if (!element) return null;
  return getComputedStyle(element).getPropertyValue(property);
}

export function show(element, display = "block") {
  if (!element) return;
  element.style.display = display;
}

export function hide(element) {
  if (!element) return;
  element.style.display = "none";
}

export function toggle(element, display = "block") {
  if (!element) return;
  if (element.style.display === "none") {
    show(element, display);
  } else {
    hide(element);
  }
}

/**
 * Event helpers
 */
export function on(element, event, handler, options = {}) {
  if (!element) return;
  element.addEventListener(event, handler, options);
}

export function off(element, event, handler, options = {}) {
  if (!element) return;
  element.removeEventListener(event, handler, options);
}

export function once(element, event, handler, options = {}) {
  if (!element) return;
  element.addEventListener(event, handler, { ...options, once: true });
}

export function delegate(parent, selector, event, handler) {
  if (!parent) return;

  parent.addEventListener(event, (e) => {
    const target = e.target.closest(selector);
    if (target && parent.contains(target)) {
      handler.call(target, e);
    }
  });
}

/**
 * Animation helpers
 */
export function fadeIn(element, duration = 300) {
  if (!element) return Promise.resolve();

  return new Promise((resolve) => {
    element.style.opacity = "0";
    element.style.display = "block";

    const start = performance.now();

    function animate(currentTime) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);

      element.style.opacity = progress;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(animate);
  });
}

export function fadeOut(element, duration = 300) {
  if (!element) return Promise.resolve();

  return new Promise((resolve) => {
    const start = performance.now();
    const startOpacity = parseFloat(getStyle(element, "opacity")) || 1;

    function animate(currentTime) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);

      element.style.opacity = startOpacity * (1 - progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.style.display = "none";
        resolve();
      }
    }

    requestAnimationFrame(animate);
  });
}

export function slideUp(element, duration = 300) {
  if (!element) return Promise.resolve();

  return new Promise((resolve) => {
    const startHeight = element.offsetHeight;
    element.style.height = startHeight + "px";
    element.style.overflow = "hidden";

    const start = performance.now();

    function animate(currentTime) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);

      element.style.height = startHeight * (1 - progress) + "px";

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.style.display = "none";
        element.style.height = "";
        element.style.overflow = "";
        resolve();
      }
    }

    requestAnimationFrame(animate);
  });
}

export function slideDown(element, duration = 300) {
  if (!element) return Promise.resolve();

  return new Promise((resolve) => {
    element.style.display = "block";
    element.style.height = "0px";
    element.style.overflow = "hidden";

    const targetHeight = element.scrollHeight;
    const start = performance.now();

    function animate(currentTime) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);

      element.style.height = targetHeight * progress + "px";

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.style.height = "";
        element.style.overflow = "";
        resolve();
      }
    }

    requestAnimationFrame(animate);
  });
}

/**
 * Position and dimension helpers
 */
export function getOffset(element) {
  if (!element) return { top: 0, left: 0 };

  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    height: rect.height,
  };
}

export function getViewportSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

export function isInViewport(element) {
  if (!element) return false;

  const rect = element.getBoundingClientRect();
  const viewport = getViewportSize();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= viewport.height &&
    rect.right <= viewport.width
  );
}

/**
 * Form helpers
 */
export function getFormData(form) {
  if (!form) return {};

  const formData = new FormData(form);
  const data = {};

  for (const [key, value] of formData.entries()) {
    if (data[key]) {
      if (Array.isArray(data[key])) {
        data[key].push(value);
      } else {
        data[key] = [data[key], value];
      }
    } else {
      data[key] = value;
    }
  }

  return data;
}

export function setFormData(form, data) {
  if (!form || !data) return;

  Object.entries(data).forEach(([key, value]) => {
    const input = form.querySelector(`[name="${key}"]`);
    if (input) {
      if (input.type === "checkbox") {
        input.checked = Boolean(value);
      } else if (input.type === "radio") {
        if (input.value === String(value)) {
          input.checked = true;
        }
      } else {
        input.value = value || "";
      }
    }
  });
}

export function clearForm(form) {
  if (!form) return;

  form.reset();

  // Clear any custom validation states
  querySelectorAll(".invalid", form).forEach((element) => {
    removeClass(element, "invalid");
  });

  querySelectorAll(".validation-message", form).forEach((element) => {
    element.remove();
  });
}

/**
 * Data attribute helpers
 */
export function getData(element, key) {
  if (!element) return null;
  return element.dataset[key];
}

export function setData(element, key, value) {
  if (!element) return;
  element.dataset[key] = value;
}

/**
 * Scroll helpers
 */
export function scrollTo(element, options = {}) {
  if (!element) return;

  element.scrollIntoView({
    behavior: options.smooth ? "smooth" : "auto",
    block: options.block || "start",
    inline: options.inline || "nearest",
  });
}

export function scrollToTop(smooth = true) {
  window.scrollTo({
    top: 0,
    behavior: smooth ? "smooth" : "auto",
  });
}

/**
 * Utility functions
 */
export function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

export function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export default {
  querySelector,
  querySelectorAll,
  createElement,
  createElementFromHTML,
  addClass,
  removeClass,
  toggleClass,
  hasClass,
  setStyle,
  getStyle,
  show,
  hide,
  toggle,
  on,
  off,
  once,
  delegate,
  fadeIn,
  fadeOut,
  slideUp,
  slideDown,
  getOffset,
  getViewportSize,
  isInViewport,
  getFormData,
  setFormData,
  clearForm,
  getData,
  setData,
  scrollTo,
  scrollToTop,
  ready,
  debounce,
  throttle,
};

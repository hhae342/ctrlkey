const motion = {
  fast: 280,
  normal: 760,
  easeIn: "cubic-bezier(0.42, 0, 1, 1)",
  easeOut: "cubic-bezier(0.22, 1, 0.36, 1)",
  easeInOut: "cubic-bezier(0.65, 0, 0.35, 1)",
};

function animateElement(element, keyframes, options) {
  if (!element) return null;
  return element.animate(keyframes, {
    fill: "forwards",
    easing: motion.easeIn,
    ...options,
  });
}

function initLanding() {
  const landing = document.querySelector(".landing-section");
  const video = document.querySelector("[data-landing-video]");
  if (landing && video) {
    video.addEventListener("canplay", () => {
      landing.classList.add("is-video-ready");
      video.play().catch(() => landing.classList.remove("is-video-ready"));
    });
    video.addEventListener("error", () => landing.classList.remove("is-video-ready"));
  }

  const items = document.querySelectorAll(".landing-reveal");
  items.forEach((item, index) => {
    item.classList.add("is-preparing-reveal");
    animateElement(
      item,
      [
        { opacity: 0, transform: "translateY(28px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: index === 0 ? 900 : 720, delay: 120 + index * 180 }
    );
  });
}

function initCustomCursor() {
  let cursorStep = 1;
  let cursorLoop = 0;

  const applyCursorStep = () => {
    document.body.classList.remove("is-cursor-click-02", "is-cursor-click-03");
    if (cursorStep === 2) document.body.classList.add("is-cursor-click-02");
    if (cursorStep === 3) document.body.classList.add("is-cursor-click-03");
  };

  const advanceCursor = () => {
    cursorStep = cursorStep === 3 ? 1 : cursorStep + 1;
    applyCursorStep();
  };

  const restartCursorLoop = () => {
    if (cursorLoop) window.clearInterval(cursorLoop);
    cursorLoop = window.setInterval(advanceCursor, 5000);
  };

  restartCursorLoop();
}

function initNavigation() {
  const links = [...document.querySelectorAll("[data-nav-target]")];
  const sections = [...document.querySelectorAll("[data-section]")];

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      const target = href ? document.querySelector(href) : null;
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  const sectionToNav = {
    home: "home",
    overview: "home",
    problem: "problem",
    insight: "problem",
    product: "product",
    solution: "product",
    goal: "product",
    strategy: "problem",
    copy: "problem",
    footer: "problem",
  };

  const updateActiveLink = () => {
    const focusY = window.innerHeight * 0.38;
    const activeSection =
      sections.find((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= focusY && rect.bottom > focusY;
      }) ||
      sections
        .map((section) => ({ section, distance: Math.abs(section.getBoundingClientRect().top - focusY) }))
        .sort((a, b) => a.distance - b.distance)[0]?.section;
    if (!activeSection) return;
    const sectionName = activeSection.dataset.section;
    const activeTarget = sectionToNav[sectionName] || sectionName;
    links.forEach((link) => {
      link.classList.toggle("is-active", link.dataset.navTarget === activeTarget);
    });
  };

  window.addEventListener("scroll", updateActiveLink, { passive: true });
  window.addEventListener("resize", updateActiveLink);
  updateActiveLink();
}

function initProductPage() {
  const productShell = document.querySelector(".product-shell");
  if (!productShell) return;

  const hero = document.querySelector(".product-hero-section");
  const heroCopySmall = document.querySelector(".product-hero-copy-small");
  const heroCopyMain = document.querySelector(".product-hero-copy-main");
  const updateHeroCopyScroll = () => {
    if (!hero) return;
    const shellScale = productShell.getBoundingClientRect().width / productShell.offsetWidth || 1;
    const mainDestinationBottom = hero.offsetHeight - 80;
    const smallDestinationBottom = mainDestinationBottom - (heroCopyMain?.offsetHeight || 0) - 44;
    const viewportDesignHeight = window.innerHeight / shellScale;
    const endScroll = Math.max(mainDestinationBottom - viewportDesignHeight, hero.offsetHeight * 0.82);
    const progress = mapProgress(window.scrollY - hero.offsetTop, 0, endScroll);
    const easedProgress = progress * progress;

    [
      { element: heroCopySmall, destinationBottom: smallDestinationBottom },
      { element: heroCopyMain, destinationBottom: mainDestinationBottom },
    ].forEach(({ element, destinationBottom }) => {
      if (!element) return;
      const startBottom = Number.parseFloat(window.getComputedStyle(element).top) || 0;
      const maxTravel = Math.max(destinationBottom - startBottom, 0);
      element.style.setProperty("--hero-copy-scroll-y", `${easedProgress * maxTravel}px`);
    });
  };

  const revealItems = [
    ...document.querySelectorAll(
      "[data-product-reveal], [data-product-fade], .product-detail-section [data-product-type-group]"
    ),
  ];
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -80px 0px" }
  );
  revealItems.forEach((item) => revealObserver.observe(item));

  const getTypewriterText = (element) => {
    const readNode = (node) => {
      if (node.nodeType === 3) return node.textContent;
      if (node.nodeName === "BR") return "\n";
      return [...node.childNodes].map(readNode).join("");
    };
    return [...element.childNodes]
      .map(readNode)
      .join("")
      .replace(/[ \t]+/g, " ")
      .replace(/ *\n */g, "\n")
      .trim();
  };

  const typeTargets = [...document.querySelectorAll("[data-product-typewriter]")].map((element) => ({
    element,
    text: getTypewriterText(element),
  }));

  typeTargets.forEach(({ element }) => {
    element.textContent = "";
  });

  const typeElement = ({ element, text }) => {
    if (element.dataset.typed === "true") return;
    element.dataset.typed = "true";
    let index = 0;
    const tick = () => {
      index += element.tagName === "H2" || element.tagName === "H1" ? 2 : 3;
      element.textContent = text.slice(0, index);
      if (index < text.length) window.setTimeout(tick, 12);
    };
    tick();
  };

  const typeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const target = typeTargets.find(({ element }) => element === entry.target);
        if (entry.isIntersecting && target) typeElement(target);
      });
    },
    { threshold: 0.35 }
  );
  typeTargets.forEach(({ element }) => typeObserver.observe(element));

  const design = document.querySelector("[data-product-design]");
  const leftCard = document.querySelector('[data-product-design-card="left"]');
  const rightCard = document.querySelector('[data-product-design-card="right"]');
  const updateDesignCards = () => {
    if (!design || !leftCard || !rightCard) return;
    const rect = design.getBoundingClientRect();
    const progress = mapProgress(window.innerHeight - rect.top, 0, window.innerHeight * 0.8);
    const easedProgress = progress * progress;
    leftCard.style.opacity = `${easedProgress}`;
    leftCard.style.transform = `translateY(${(1 - easedProgress) * 260}px)`;
    rightCard.style.opacity = `${easedProgress}`;
    rightCard.style.transform = `translateY(${(1 - easedProgress) * 260}px)`;
  };

  window.addEventListener("scroll", updateDesignCards, { passive: true });
  window.addEventListener("resize", updateDesignCards);
  window.addEventListener("scroll", updateHeroCopyScroll, { passive: true });
  window.addEventListener("resize", updateHeroCopyScroll);
  updateDesignCards();
  updateHeroCopyScroll();

  const carousels = [...document.querySelectorAll(".product-carousel")];
  carousels.forEach((carousel) => {
    let isDragging = false;
    let startX = 0;
    let startScrollLeft = 0;
    let didDrag = false;
    let targetScrollLeft = carousel.scrollLeft;
    let velocity = 0;
    let animationFrame = 0;
    let lastX = 0;
    let lastTime = 0;

    carousel.querySelectorAll("img").forEach((image) => {
      image.draggable = false;
    });

    const getScale = () => carousel.getBoundingClientRect().width / carousel.offsetWidth || 1;

    const animateScroll = () => {
      carousel.scrollLeft += (targetScrollLeft - carousel.scrollLeft) * 0.28;
      if (Math.abs(targetScrollLeft - carousel.scrollLeft) > 0.4 || Math.abs(velocity) > 0.02) {
        if (!isDragging) {
          targetScrollLeft += velocity;
          velocity *= 0.9;
        }
        animationFrame = window.requestAnimationFrame(animateScroll);
        return;
      }
      carousel.scrollLeft = targetScrollLeft;
      animationFrame = 0;
    };

    const requestScrollAnimation = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(animateScroll);
    };

    const stopDragging = () => {
      if (!isDragging) return;
      isDragging = false;
      carousel.classList.remove("is-dragging");
      requestScrollAnimation();
    };

    carousel.addEventListener("pointerdown", (event) => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      isDragging = true;
      didDrag = false;
      startX = event.clientX;
      lastX = event.clientX;
      lastTime = performance.now();
      startScrollLeft = carousel.scrollLeft;
      targetScrollLeft = carousel.scrollLeft;
      velocity = 0;
      carousel.classList.add("is-dragging");
      carousel.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    carousel.addEventListener("pointermove", (event) => {
      if (!isDragging) return;
      const deltaX = event.clientX - startX;
      const now = performance.now();
      const frameDelta = (event.clientX - lastX) / getScale();
      const frameTime = Math.max(now - lastTime, 16);
      if (Math.abs(deltaX) > 3) didDrag = true;
      targetScrollLeft = startScrollLeft - deltaX / getScale();
      velocity = (-frameDelta / frameTime) * 16;
      lastX = event.clientX;
      lastTime = now;
      requestScrollAnimation();
      event.preventDefault();
    });

    carousel.addEventListener("pointerup", stopDragging);
    carousel.addEventListener("pointercancel", stopDragging);
    carousel.addEventListener("lostpointercapture", stopDragging);
    carousel.addEventListener(
      "click",
      (event) => {
        if (didDrag) event.preventDefault();
      },
      true
    );
  });
}

function initProblem() {
  document.querySelectorAll("[data-problem-card]").forEach((card) => {
    card.setAttribute("tabindex", "0");
  });
}

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function mapProgress(value, start, end) {
  return clamp((value - start) / (end - start));
}

function initInsightScroll() {
  const left = document.querySelector('[data-insight-card="left"]');
  const right = document.querySelector('[data-insight-card="right"]');
  if (!left || !right) return;
  left.style.transform = "none";
  right.style.transform = "none";
}

function initSolutionCards() {
  const viewport = document.querySelector(".solution-viewport");
  const track = document.querySelector("[data-solution-track]");
  if (!viewport || !track) return;

  let isDragging = false;
  let startX = 0;
  let startScrollLeft = 0;

  const stopDragging = () => {
    isDragging = false;
    viewport.classList.remove("is-dragging");
  };

  viewport.addEventListener("pointerdown", (event) => {
    isDragging = true;
    startX = event.clientX;
    startScrollLeft = viewport.scrollLeft;
    viewport.classList.add("is-dragging");
    viewport.setPointerCapture(event.pointerId);
  });

  viewport.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    event.preventDefault();
    const delta = event.clientX - startX;
    viewport.scrollLeft = startScrollLeft - delta;
  });

  viewport.addEventListener("pointerup", stopDragging);
  viewport.addEventListener("pointercancel", stopDragging);
  viewport.addEventListener("mouseleave", stopDragging);
}

function initTypewriters() {
  const groups = [...document.querySelectorAll("[data-typewriter-group]")];
  const write = (element, text, done, group) => {
    let index = 0;
    element.textContent = "";
    element.classList.add("is-typing");
    const tick = () => {
      index += element.closest(".strategy-copy") ? 4 : 1;
      element.textContent = text.slice(0, index);
      if (index < text.length) {
        const progress = index / text.length;
        const easeInDelay = 24 - progress * progress * 14;
        const baseDelay = group?.dataset.typewriterEase === "in" ? easeInDelay : text[index - 1] === " " ? 8 : 14;
        window.setTimeout(tick, element.closest(".strategy-copy") ? 8 : baseDelay);
      } else if (done) {
        element.classList.remove("is-typing");
        window.setTimeout(done, 80);
      } else {
        element.classList.remove("is-typing");
      }
    };
    tick();
  };

  groups.forEach((group) => {
    const items = [...group.querySelectorAll("[data-typewriter]")].map((element) => ({
      element,
      text: element.textContent.trim(),
    }));
    items.forEach(({ element }) => {
      element.textContent = "";
    });

    const run = () => {
      if (group.dataset.typed === "true") return;
      group.dataset.typed = "true";
      let cursor = 0;
      const next = () => {
        const item = items[cursor];
        if (!item) return;
        write(item.element, item.text, () => {
          cursor += 1;
          next();
        }, group);
      };
      next();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) run();
      },
      { threshold: 0.45 }
    );
    observer.observe(group);
  });
}

function initFallingCopy() {
  const copy = document.querySelector("[data-falling-copy]");
  if (!copy) return;
  const configs = [
    { startX: 0, floor: 210, rotateY: 0, delay: 0, vx: -0.12, rotation: -20, vr: 0 },
    { startX: 0, floor: 72, rotateY: 10 + Math.random() * 10, delay: 24, vx: 0.03, rotation: 1.6, vr: -0.04 },
    { startX: 0, floor: -64, rotateY: 0, delay: 48, vx: 0.16, rotation: 10 + Math.random() * 10, vr: 0.06 },
  ];
  const words = [...copy.querySelectorAll("[data-physics-word]")].map((element, index) => {
    const config = configs[index] || configs[0];
    return {
      element,
      x: config.startX,
      startX: config.startX,
      y: -620 - index * 130,
      vx: config.vx,
      vy: 0,
      rotation: config.rotation,
      rotateY: config.rotateY,
      vr: config.vr,
      delay: Number(element.dataset.physicsDelay || config.delay),
      floor: config.floor,
      config,
    };
  });

  let running = false;
  let frame = 0;
  let raf = null;

  const reset = () => {
    frame = 0;
    words.forEach((word, index) => {
      word.x = word.startX;
      word.y = -620 - index * 130;
      word.vx = word.config.vx;
      word.vy = 0;
      word.rotation = index === 2 ? 10 + Math.random() * 10 : word.config.rotation;
      word.rotateY = index === 1 ? 10 + Math.random() * 10 : word.config.rotateY;
      word.vr = word.config.vr;
      word.element.style.opacity = "0";
      word.element.style.transform = `translate3d(${word.x}px, ${word.y}px, 0) rotateY(${word.rotateY}deg) rotate(${word.rotation}deg)`;
    });
  };

  const step = () => {
    frame += 1;
    let active = false;
    words.forEach((word) => {
      if (frame < word.delay) {
        active = true;
        return;
      }
      word.element.style.opacity = "1";
      word.vy += 1.25;
      word.vx *= 0.992;
      word.y += word.vy;
      word.x += word.vx;
      word.rotation += word.vr;
      if (word.y > word.floor) {
        word.y = word.floor;
        word.vy *= -0.42;
        word.vx *= 0.78;
        word.vr *= 0.62;
      }
      if (Math.abs(word.vy) > 0.2 || Math.abs(word.y - word.floor) > 0.2 || frame < 90) {
        active = true;
      }
      word.element.style.transform = `translate3d(${word.x}px, ${word.y}px, 0) rotateY(${word.rotateY}deg) rotate(${word.rotation}deg)`;
    });

    if (active) {
      raf = requestAnimationFrame(step);
    } else {
      running = false;
    }
  };

  reset();

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        reset();
        raf = requestAnimationFrame(step);
      }
      if (!entry.isIntersecting) {
        if (raf) cancelAnimationFrame(raf);
        running = false;
        reset();
      }
    },
    { threshold: 0.45 }
  );
  observer.observe(copy);
}

function scaleDesktopCanvas() {
  const shell = document.querySelector(".site-shell");
  if (!shell) return;
  const scale = window.innerWidth / 1920;
  document.documentElement.style.setProperty("--canvas-scale", scale.toString());
  document.documentElement.style.setProperty("--footer-padding-top", `${200 / scale}px`);
  document.documentElement.style.setProperty("--footer-padding-bottom", `${400 / scale}px`);
  shell.style.transform = `scale(${scale})`;
  shell.style.marginLeft = "0px";
  document.body.style.minHeight = `${shell.offsetHeight * scale}px`;
}

function init() {
  scaleDesktopCanvas();
  initCustomCursor();
  initNavigation();
  initLanding();
  initProductPage();
  initProblem();
  initInsightScroll();
  initSolutionCards();
  initTypewriters();
  initFallingCopy();
}

window.addEventListener("resize", scaleDesktopCanvas);
window.addEventListener("DOMContentLoaded", init);

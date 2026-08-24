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
  const applyCursorStep = () => {
    document.body.classList.remove("is-cursor-loop-02", "is-cursor-loop-03");
    if (cursorStep === 2) document.body.classList.add("is-cursor-loop-02");
    if (cursorStep === 3) document.body.classList.add("is-cursor-loop-03");
  };
  window.setInterval(() => {
    cursorStep = cursorStep === 3 ? 1 : cursorStep + 1;
    applyCursorStep();
  }, 5000);
  applyCursorStep();
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
    insight: "home",
    product: "product",
    solution: "home",
    goal: "home",
    strategy: "home",
    copy: "home",
    footer: "home",
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

const experienceTypingTokens = new WeakMap();

function typeExperienceText(element, text, done) {
  if (!element) {
    if (done) done();
    return;
  }
  const token = Symbol("experience-typewriter");
  experienceTypingTokens.set(element, token);
  element.textContent = "";
  element.classList.add("is-typing");
  let index = 0;
  const source = text || "";

  const tick = () => {
    if (experienceTypingTokens.get(element) !== token) return;
    index += element.tagName === "H2" ? 1 : 2;
    element.textContent = source.slice(0, index);
    if (index < source.length) {
      const progress = source.length ? index / source.length : 1;
      const delay = Math.max(12, 38 - progress * progress * 22);
      window.setTimeout(tick, delay);
      return;
    }
    element.classList.remove("is-typing");
    if (done) window.setTimeout(done, 90);
  };

  tick();
}

function typeExperienceSequence(items) {
  let cursor = 0;
  const next = () => {
    const item = items[cursor];
    if (!item) return;
    typeExperienceText(item.element, item.text, () => {
      cursor += 1;
      next();
    });
  };
  next();
}

function initExperienceGradientBands(section) {
  const layer = section.querySelector("[data-experience-gradient]");
  if (!layer) return;
  const bands = [...layer.querySelectorAll(".experience-gradient-band")];
  const BASE_GREEN = 40.281;
  const BASE_FADE = 26.854;
  const configs = [
    { amp: 18, fadeAmp: 6, speed: 2.1, phase: 0 },
    { amp: 22, fadeAmp: 7, speed: 1.82, phase: 0.9 },
    { amp: 15, fadeAmp: 5, speed: 2.35, phase: 1.7 },
    { amp: 24, fadeAmp: 8, speed: 1.68, phase: 2.6 },
    { amp: 20, fadeAmp: 6, speed: 1.94, phase: 3.4 },
    { amp: 17, fadeAmp: 7, speed: 2.18, phase: 4.1 },
    { amp: 23, fadeAmp: 5, speed: 1.74, phase: 4.9 },
    { amp: 16, fadeAmp: 8, speed: 2.28, phase: 5.7 },
    { amp: 19, fadeAmp: 6, speed: 1.88, phase: 6.5 },
  ];
  let isPlaying = false;
  let animationTime = 0;
  let lastTime = performance.now();

  const render = (time) => {
    const isPageActive = section.dataset.experiencePage === "2";
    const delta = Math.min(time - lastTime, 80);
    lastTime = time;
    if (isPageActive && isPlaying) animationTime += delta / 1000;

    bands.forEach((band, index) => {
      const config = configs[index] || configs[0];
      const wave = Math.sin(animationTime * config.speed + config.phase) - Math.sin(config.phase);
      const fadePhase = config.phase * 1.17;
      const fadeWave = Math.cos(animationTime * (config.speed * 0.76) + fadePhase) - Math.cos(fadePhase);
      const greenEnd = clamp(BASE_GREEN + wave * config.amp, 10, 72);
      const fadeWidth = clamp(BASE_FADE + fadeWave * config.fadeAmp, 16, 42);
      const whiteStart = clamp(greenEnd + fadeWidth, greenEnd + 12, 96);
      band.style.setProperty("--green-end", `${greenEnd.toFixed(2)}%`);
      band.style.setProperty("--white-start", `${whiteStart.toFixed(2)}%`);
    });

    window.requestAnimationFrame(render);
  };

  section.addEventListener("click", (event) => {
    if (section.dataset.experiencePage !== "2") return;
    if (event.target.closest("a, button")) return;
    isPlaying = !isPlaying;
  });

  window.requestAnimationFrame(render);
}

function initExperienceColorGradient(section) {
  const layer = section.querySelector("[data-experience-color]");
  if (!layer) return;
  const green = { r: 158, g: 255, b: 67 };
  const blue = { r: 25, g: 163, b: 255 };
  const cycleDuration = 12000;
  let animationTime = 0;
  let lastTime = performance.now();

  const mix = (start, end, progress) => Math.round(start + (end - start) * progress);

  const render = (time) => {
    const delta = Math.min(time - lastTime, 80);
    lastTime = time;
    if (section.dataset.experiencePage === "3") animationTime += delta;

    const phase = (animationTime % cycleDuration) / cycleDuration;
    const progress = (1 - Math.cos(phase * Math.PI * 2)) / 2;
    const color = [
      mix(green.r, blue.r, progress),
      mix(green.g, blue.g, progress),
      mix(green.b, blue.b, progress),
    ].join(", ");
    layer.style.setProperty("--temperature-color-rgb", color);

    window.requestAnimationFrame(render);
  };

  window.requestAnimationFrame(render);
}

function initExperiencePages() {
  const section = document.querySelector(".experience-section");
  if (!section) return;
  initExperienceGradientBands(section);
  initExperienceColorGradient(section);
  const buttons = [...section.querySelectorAll("[data-experience-target]")];
  const title = section.querySelector("[data-experience-title]");
  const prompt = section.querySelector("[data-experience-prompt]");
  const description = section.querySelector("[data-experience-description]");
  const meta = section.querySelector("[data-experience-meta]");
  const pages = {
    1: {
      title: "grounding 01\n호흡하기",
      prompt: "긴장 상태에서는 호흡이 짧고 얕아진다\n호흡의 리듬에 집중해보세요",
      description:
        "호흡은 가장 기본적인 신체 감각 신호입니다.\n긴장된 순간, 짧아진 호흡을 천천히 인식하는 것은 현재의 몸으로 돌아오는 시작점이 됩니다. CTRL KEY는 일정한 리듬을 통해 사용자가 자신의 호흡 속도를 다시 인식하도록 돕습니다.",
      meta: "Sense     호흡\nMode      Breathing Reset\nPattern   들숨 / 날숨 / 리듬\nEffect     긴장 완화 · 현재 인식",
    },
    2: {
      title: "grounding 02\n진동하기",
      prompt: "팀메신저 알림이 울릴 때마다 심장이 철렁했다면\n진동의 리듬에 집중해보세요",
      description:
        "진동은 몸에 직접 전달되는 촉각 신호입니다.\n갑작스러운 자극과 긴장의 순간, 주의는 외부 상황에 쉽게 머무릅니다. CTRL KEY는 일정한 진동 리듬을 통해 몸의 감각을 인식하고, 현재로 주의를 전환하도록 돕습니다.",
      meta: "Sense     진동\nMode      Rhythm Reset\nPattern   반복 / 리듬 / 촉각\nEffect     긴장 완화 · 신체 감각 인식",
    },
    3: {
      title: "grounding 03\n온도를 느끼기",
      prompt: "상사의 말 한마디가 계속 머릿속에 남아있다면\n차갑고 따뜻한 감각에 집중해보세요",
      description:
        "온도 변화는 흐려진 감각을 즉각적으로 깨우는 신체 신호입니다.\n긴장이 남아 있거나 생각이 반복되는 순간, 차갑고 따뜻한 접촉은 주의를 현재의 몸으로 되돌립니다. CTRL KEY는 미세한 냉감과 온감 변화를 통해 감각을 환기하고, 지금 느껴지는 상태에 집중하도록 돕습니다.",
      meta: "Sense     온도\nMode      Thermal Reset\nPattern   냉감 / 중립 / 온감\nEffect     감각 환기 · 긴장 완화 · 현재 인식",
    },
    4: {
      title: "grounding 04\n압력을 체험하기",
      prompt: "회의실 문 앞에서 심장이 빨라지고 손이 차가워졌다면\n손끝의 압력에 집중해보세요",
      description:
        "압력은 몸에 직접 전달되는 안정적인 감각 신호입니다.\n긴장이 높아지는 순간, 주의는 외부 상황에 머물고 몸은 쉽게 굳어집니다. CTRL KEY는 일정한 압력의 변화를 통해 몸의 감각을 인식하고, 현재의 상태로 돌아오도록 돕습니다.",
      meta: "Sense     압력\nMode      Pressure Reset\nPattern   누름 / 유지 / 이완\nEffect     주의 전환 · 긴장 완화 · 현재 인식",
    },
    5: {
      title: "grounding 05\n저주파를 체험하기",
      prompt: "회의가 끝난 뒤에도 어깨와 턱에 힘이 풀리지 않는다면\n저주파의 리듬에 집중해보세요",
      description:
        "저주파는 낮고 일정한 리듬으로 전달되는 감각 신호입니다.\n긴장이 지속되는 순간, 몸은 쉽게 굳고 불편한 감각이 남을 수 있습니다. CTRL KEY는 부드러운 저주파 흐름을 통해 신체의 변화를 인식하고, 현재의 감각으로 돌아오도록 돕습니다.",
      meta: "Sense     저주파\nMode      Frequency Reset\nPattern   파동 / 반복 / 흐름\nEffect     긴장 이완 · 신체 감각 인식",
    },
  };

  const render = (page, updateRoute = true) => {
    const content = pages[page] || pages[1];
    const popupItems = [
      { element: title, text: content.title },
      { element: prompt, text: content.prompt },
      { element: description, text: content.description },
      { element: meta, text: content.meta },
    ];
    section.dataset.experiencePage = page;
    popupItems.forEach(({ element }) => {
      if (!element) return;
      experienceTypingTokens.set(element, Symbol("experience-reset"));
      element.textContent = "";
      element.classList.remove("is-typing");
    });
    typeExperienceSequence(popupItems);
    buttons.forEach((button) => {
      const isActive = button.dataset.experienceTarget === page;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
    if (updateRoute) window.history.replaceState(null, "", `#experience-${page}`);
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      render(button.dataset.experienceTarget || "1");
    });
  });

  const initialHash = window.location.hash.match(/^#experience-([1-5])$/);
  render(initialHash?.[1] || "1", false);
  typeExperienceSequence(
    [...section.querySelectorAll(".experience-intro [data-experience-static-typewriter]")].map((element) => ({
      element,
      text: element.textContent.trim(),
    }))
  );
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
  const isSingleExperiencePage = !!shell.querySelector(".experience-section") && !shell.querySelector(".footer-section");
  const widthScale = window.innerWidth / 1920;
  const scale = widthScale;
  document.documentElement.style.setProperty("--canvas-scale", scale.toString());
  document.documentElement.style.setProperty("--footer-padding-top", `${200 / scale}px`);
  document.documentElement.style.setProperty("--footer-padding-bottom", `${90 / scale}px`);
  shell.style.transform = `scale(${scale})`;
  shell.style.marginLeft = "0px";
  document.body.style.minHeight = isSingleExperiencePage ? `${window.innerHeight}px` : `${shell.offsetHeight * scale}px`;
  document.body.style.overflowY = isSingleExperiencePage ? "hidden" : "";
  document.documentElement.style.overflowY = isSingleExperiencePage ? "hidden" : "";
}

function init() {
  scaleDesktopCanvas();
  initCustomCursor();
  initNavigation();
  initLanding();
  initProductPage();
  initProblem();
  initExperiencePages();
  initInsightScroll();
  initSolutionCards();
  initTypewriters();
  initFallingCopy();
}

window.addEventListener("resize", scaleDesktopCanvas);
window.addEventListener("DOMContentLoaded", init);

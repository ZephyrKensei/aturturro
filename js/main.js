// ------------- VARIABLES ------------- //
let ticking = false;
const isFirefox = /Firefox/i.test(navigator.userAgent);
const scrollSensitivitySetting = 30; // Increase/decrease this number to change sensitivity to trackpad gestures (up = less sensitive; down = more sensitive)
const slideDurationSetting = 600; // Amount of time for which slide is "locked"
let currentSlideNumber = 0;
const backgrounds = document.querySelectorAll(".background");
const totalSlideNumber = backgrounds.length;

// ------------- DETERMINE DELTA/SCROLL DIRECTION ------------- //
function parallaxScroll(evt) {
  let delta;
  if (isFirefox) {
    // Set delta for Firefox
    delta = evt.detail * -120;
  } else {
    // Set delta for all other browsers
    delta = evt.wheelDelta;
  }

  if (!ticking) {
    if (delta <= -scrollSensitivitySetting) {
      // Down scroll
      ticking = true;
      if (currentSlideNumber !== totalSlideNumber - 1) {
        currentSlideNumber++;
        nextItem();
      }
      slideDurationTimeout(slideDurationSetting);
    }
    if (delta >= scrollSensitivitySetting) {
      // Up scroll
      ticking = true;
      if (currentSlideNumber !== 0) {
        currentSlideNumber--;
      }
      previousItem();
      slideDurationTimeout(slideDurationSetting);
    }
  }
}

// ------------- SET TIMEOUT TO TEMPORARILY "LOCK" SLIDES ------------- //
function slideDurationTimeout(slideDuration) {
  setTimeout(function () {
    ticking = false;
  }, slideDuration);
}

// ------------- ADD EVENT LISTENER ------------- //
const mousewheelEvent = isFirefox ? "DOMMouseScroll" : "wheel";
window.addEventListener(mousewheelEvent, throttle(parallaxScroll, 60), false);

// ------------- SLIDE MOTION ------------- //
function nextItem() {
  const previousSlide = backgrounds[currentSlideNumber - 1];
  previousSlide.classList.remove("up-scroll");
  previousSlide.classList.add("down-scroll");
}

function previousItem() {
  const currentSlide = backgrounds[currentSlideNumber];
  currentSlide.classList.remove("down-scroll");
  currentSlide.classList.add("up-scroll");
}

// Text Animation
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    } else {
      entry.target.classList.remove("show");
    }
  });
});
const hiddenElm = document.querySelectorAll(".hidden");
hiddenElm.forEach((el) => observer.observe(el));

// Section 3 Carousel
let progress = 10;
let startX = 0;
let active = 0;
let isDown = false;
const speedWheel = 0.02;
const speedDrag = -0.1;

// Get Z
const getZindex = (array, index) =>
  array.map((_, i) =>
    index === i ? array.length : array.length - Math.abs(index - i)
  );

// Items
const items = document.querySelectorAll(".carousel-item");
const cursors = document.querySelectorAll(".cursor");

const displayItems = (item, index, active) => {
  const zIndex = getZindex([...items], active)[index];
  item.style.setProperty("--zIndex", zIndex);
  item.style.setProperty("--active", (index - active) / items.length);
};

// Animate
const animate = () => {
  progress = Math.max(0, Math.min(progress, 100));
  active = Math.floor((progress / 100) * (items.length - 1));

  items.forEach((item, index) => displayItems(item, index, active));
};
animate();

// Click on Items
items.forEach((item, i) => {
  item.addEventListener("click", () => {
    progress = (i / items.length) * 100 + 10;
    animate();
  });
});

// Handlers
const handleWheel = (e) => {
  const wheelProgress = e.deltaY * speedWheel;
  progress += wheelProgress;
  animate();
};

const handleMouseMove = (e) => {
  if (e.type === "mousemove") {
    cursors.forEach((cursor) => {
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });
  }
  if (!isDown) return;
  const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
  const mouseProgress = (x - startX) * speedDrag;
  progress += mouseProgress;
  startX = x;
  animate();
};

const handleMouseDown = (e) => {
  isDown = true;
  startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
};

const handleMouseUp = () => {
  isDown = false;
};

// Listeners
document.addEventListener("mousewheel", handleWheel);
document.addEventListener("mousedown", handleMouseDown);
document.addEventListener("mousemove", handleMouseMove);
document.addEventListener("mouseup", handleMouseUp);
document.addEventListener("touchstart", handleMouseDown);
document.addEventListener("touchmove", handleMouseMove);
document.addEventListener("touchend", handleMouseUp);

// Throttle function
function throttle(func, limit) {
  let lastFunc;
  let lastRan;
  return function() {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function() {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}
// ------------- VARIABLES ------------- //
let ticking = false;
const isFirefox = /Firefox/i.test(navigator.userAgent);
const scrollSensitivitySetting = 30; // Sensitivity for trackpad gestures
const slideDurationSetting = 600; // Duration for which slide is "locked"
let currentSlideNumber = 0;
const backgrounds = document.querySelectorAll(".background");
const totalSlideNumber = backgrounds.length;

// ------------- DETERMINE DELTA/SCROLL DIRECTION ------------- //
function parallaxScroll(delta) {
  if (!ticking) {
    if (delta >= scrollSensitivitySetting && currentSlideNumber < totalSlideNumber - 1) {
      // Up scroll (swipe up)
      ticking = true;
      currentSlideNumber++;
      nextItem();
      slideDurationTimeout(slideDurationSetting);
    } else if (delta <= -scrollSensitivitySetting && currentSlideNumber > 0) {
      // Down scroll (swipe down)
      ticking = true;
      currentSlideNumber--;
      previousItem();
      slideDurationTimeout(slideDurationSetting);
    }
  }
}

// ------------- SET TIMEOUT TO TEMPORARILY "LOCK" SLIDES ------------- //
function slideDurationTimeout(slideDuration) {
  setTimeout(() => {
    ticking = false;
  }, slideDuration);
}

// ------------- ADD EVENT LISTENERS ------------- //
const mousewheelEvent = isFirefox ? "DOMMouseScroll" : "wheel";
window.addEventListener(mousewheelEvent, throttle((e) => {
  const delta = e.deltaY || -e.detail; // Get delta for scrolling
  parallaxScroll(delta);
}, 60), false);

// Touch event handling
let initialTouchY = null;

window.addEventListener("touchstart", (e) => {
  initialTouchY = e.touches[0].clientY; // Store the initial touch position
}, { passive: false });

window.addEventListener("touchmove", (e) => {
  const currentTouchY = e.touches[0].clientY; // Get the current touch position
  const deltaY = initialTouchY - currentTouchY; // Calculate the change in Y

  // Check if the swipe is significant enough to trigger parallax
  if (Math.abs(deltaY) > scrollSensitivitySetting) {
    e.preventDefault(); // Prevent default scrolling
    parallaxScroll(deltaY); // Call parallaxScroll with the delta
  }
}, { passive: false });

window.addEventListener("touchend", () => {
  initialTouchY = null; // Reset the initial touch position
});

// ------------- SLIDE MOTION ------------- //
function nextItem() {
  if (currentSlideNumber > 0) {
    const previousSlide = backgrounds[currentSlideNumber - 1];
    previousSlide.classList.remove("up-scroll");
    previousSlide.classList.add("down-scroll");
  }
}

function previousItem() {
  if (currentSlideNumber < totalSlideNumber - 1) {
    const currentSlide = backgrounds[currentSlideNumber];
    currentSlide.classList.remove("down-scroll");
    currentSlide.classList.add("up-scroll");
  }
}

// ------------- TEXT ANIMATION ------------- //
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    entry.target.classList.toggle("show", entry.isIntersecting);
  });
});
const hiddenElm = document.querySelectorAll(".hidden");
hiddenElm.forEach((el) => observer.observe(el));

// ------------- SECTION 3 CAROUSEL ------------- //
let progress = 10;
let startX = 0;
let active = 0;
let isDown = false;
const speedWheel = 0.02;
const speedDrag = -0.1;

// Get Z-index for carousel items
const getZindex = (array, index) =>
  array.map((_, i) => (index === i ? array.length : array.length - Math.abs(index - i)));

// Items
const items = document.querySelectorAll(".carousel-item");
const cursors = document.querySelectorAll(".cursor");

const displayItems = (item, index, active) => {
  const zIndex = getZindex([...items], active)[index];
  item.style.setProperty("--zIndex", zIndex);
  item.style.setProperty("--active", (index - active) / items.length);
};

// Animate carousel items
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

// ------------- HANDLERS ------------- //
const handleWheel = (e) => {
  const wheelProgress = e.deltaY * speedWheel;
  progress += wheelProgress;
  animate();
};

const handleMouseMove = (e) => {
  const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
  cursors.forEach((cursor) => {
    cursor.style.transform = `translate(${x}px, ${e.clientY}px)`;
  });

  if (!isDown) return;
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

// ------------- LISTENERS ------------- //
document.addEventListener("wheel", handleWheel);
document.addEventListener("mousedown", handleMouseDown);
document.addEventListener("mousemove", handleMouseMove);
document.addEventListener("mouseup", handleMouseUp);
document.addEventListener("touchstart", handleMouseDown);
document.addEventListener("touchmove", handleMouseMove);
document.addEventListener("touchend", handleMouseUp);

// ------------- THROTTLE FUNCTION ------------- //
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
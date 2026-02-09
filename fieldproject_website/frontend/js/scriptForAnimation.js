//Marque
const marqueeText = document.querySelector(".marquee-text");
if (marqueeText) {
  gsap.to(".marquee-text", {
    xPercent: -100,
    repeat: -1,
    duration: 12,
    ease: "linear"
  });
}

// Signup/Signin containers
const signupContainer = document.querySelector('.signup-container');
if (signupContainer) {
  gsap.from('.signup-container', { opacity: 0, y: 20, duration: 1, ease: 'power2.out' });
}

const signinContainer = document.querySelector('.signin-container');
if (signinContainer) {
  gsap.from('.signin-container', { opacity: 0, y: 20, duration: 1, ease: 'power2.out' });
}

//animation of home page (1st section)
const thoughts = document.querySelectorAll('.thought');

if (thoughts.length > 0) {
  thoughts.forEach((thought, index) => {
    gsap.to(thought, {
      opacity: 1,
      scale: 1,
      duration: 1,
      delay: 1.5 + index * 1.2,
      ease: "back.out(1.7)"
    });
  });
}

// Animate left headline & paragraph
const section1H1 = document.querySelector(".section1 .lt h1");
if (section1H1) {
  gsap.to(".section1 .lt h1", { opacity: 1, x: 0, duration: 1.5, ease: "back.out(8)" });
}

const section1P = document.querySelector(".section1 .lt p");
if (section1P) {
  gsap.to(".section1 .lt p", { opacity: 1, x: 0, duration: 1.5, delay: 0.5, ease: "back.out(5)" });
}

// Animate CTA button last
const getStarted = document.querySelector(".get-started");
if (getStarted) {
  gsap.to(".get-started", {
    opacity: 1,
    y: 0,
    duration: 1,
    delay: 1 ,
    ease: "power2.out"
  });
}



//home page (section3)

//home page (section4)


gsap.registerPlugin(ScrollTrigger);

/* ========= TEXT CONTENT ========= */

const texts = [
  "To create a future where every student truly remembers what they learn.",
  "RecallBot adapts to each learner, making revision effortless and knowledge lasting.",
  "We envision a world where every study session leads to mastery, not forgetfulness."
];

const lines = document.querySelectorAll(".vision-line");
let lineIndex = 0;
let charIndex = 0;

function typeLine() {
  if (lineIndex >= texts.length) return;

  if (charIndex < texts[lineIndex].length) {
    lines[lineIndex].textContent += texts[lineIndex][charIndex];
    charIndex++;
    setTimeout(typeLine, 28);
  } else {
    lineIndex++;
    charIndex = 0;
    setTimeout(typeLine, 200);
  }
}

/* ========= INITIAL STATES ========= */

gsap.set(".vision", {opacity:0, y:20});
gsap.set(".vision-line", {opacity:1});
gsap.set(".image-container", {opacity:0, rotation:-30, scale:0.85});

/* ========= SCROLL TRIGGER ========= */

ScrollTrigger.create({
  trigger: ".section4",
  start: "top 70%",
  once: true,
  onEnter: () => {

    // title appear
    gsap.to(".vision", {
      opacity:1,
      y:0,
      duration:0.6
    });

    // image tilt → straight FIRST
    gsap.to(".image-container", {
      opacity:1,
      rotation:0,
      scale:1,
      duration:2.0,
      ease:"back.out(1.7)"
    });

    // start typing after small delay
    setTimeout(typeLine, 700);
  }
});


//Lenis smooth scroll
if (typeof Lenis !== 'undefined') {
  const lenis = new Lenis({
    smooth: true
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
}
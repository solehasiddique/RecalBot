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
    delay: 1 + thoughts.length * 1.2 + 0.5,
    ease: "power2.out"
  });
}

//animation home page (2nd section)
const cards = document.querySelectorAll('.card');
const steps = document.querySelectorAll('.step');
const total = cards.length;
let current = 0;

if (cards.length > 0 && steps.length > 0) {
  function updateStack() {
    cards.forEach((card, i) => {
      let offset = (i - current + total) % total;
      if (offset > total / 2) offset -= total;

      if (offset === 0) {
        card.classList.add('top-card');
        card.style.zIndex = total;
        card.style.transform = 'translate(-50%, -50%) scale(1) rotateX(0deg)';
        card.style.opacity = '1';
      } else {
        card.classList.remove('top-card');
        const depth = Math.abs(offset) * 35;
        const scale = 1 - (Math.abs(offset) * 0.055);
        const direction = offset > 0 ? 1 : -1;
        card.style.zIndex = total - Math.abs(offset);
        card.style.transform = `translate(-50%, -50%) translateY(${direction * depth}px) scale(${scale}) rotateX(${offset * 2.5}deg)`;
        card.style.opacity = Math.max(0.35, 1 - Math.abs(offset) * 0.13);
      }
    });

    // ---------- STEPS ----------
    let activeStep = document.querySelector('.step.active');

    if (activeStep) {
      activeStep.classList.remove('active');

      setTimeout(() => {
        activeStep.style.display = 'none';

        let nextStep = steps[current];
        nextStep.style.display = 'block';
        nextStep.offsetHeight;
        nextStep.classList.add('active');
      }, 400);
    } else {
      let firstStep = steps[current];
      firstStep.style.display = 'block';
      firstStep.offsetHeight;
      firstStep.classList.add('active');
    }
  }

  function nextCard() {
    current = (current + 1) % total;
    updateStack();
  }

  function prevCard() {
    current = (current - 1 + total) % total;
    updateStack();
  }

  // Click to select
  cards.forEach((card, i) => card.addEventListener('click', () => {
    current = i;
    updateStack();
  }));

  // Button event listeners
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  
  if (prevBtn) prevBtn.addEventListener('click', prevCard);
  if (nextBtn) nextBtn.addEventListener('click', nextCard);

  updateStack();
}

// Section 2 animations
const workingLt = document.querySelector(".section2 .working_lt");
if (workingLt) {
  gsap.to(".section2 .working_lt", {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".section2",
      start: "top 80%",
      toggleActions: "play none none none"
    }
  });
}

const workingRt = document.querySelector(".section2 .working_rt");
if (workingRt) {
  gsap.to(".section2 .working_rt", {
    opacity: 1,
    y: 0,
    duration: 1,
    delay: 0.2,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".section2",
      start: "top 80%",
      toggleActions: "play none none none"
    }
  });
}

//home page (section3)
const section3Right = document.querySelector(".section3_right");
if (section3Right) {
  gsap.registerPlugin(ScrollTrigger);
  
  gsap.to(".section3_right", {
    opacity: 1,
    y: 0,
    duration: 5,
    ease: "slow",
    scrollTrigger: {
      trigger: ".section3",
      start: "top 70%",
      end: "top 60%",
      scrub: 2
    }
  });
}

//home page (section4)
const visionLines = document.querySelectorAll(".vision-line");
if (visionLines.length > 0) {
  gsap.registerPlugin(ScrollTrigger);
  
  gsap.to(".vision-line", {
    opacity: 1,
    y: 0,
    stagger: 0.5,
    scrollTrigger: {
      trigger: ".section4",
      start: "top 70%",
      end: "top 30%",
      scrub: 2
    },
    ease: "power2.out"
  });
}

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
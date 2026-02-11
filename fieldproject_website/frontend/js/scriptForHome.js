//Section 2
// Get all cards and buttons
const cards = document.querySelectorAll(".card");
const learnMoreButtons = document.querySelectorAll(".card-button");
const closeButtons = document.querySelectorAll(".close-button");

// Function to close all cards
function closeAllCards() {
  cards.forEach((card) => card.classList.remove("active"));
}

// Function to open a specific card
function openCard(index) {
  closeAllCards();
  cards[index].classList.add("active");

  // Scroll card into view smoothly
  cards[index].scrollIntoView({
    behavior: "smooth",
    block: "nearest",
    inline: "center",
  });
}

// Add click event to "Learn More" buttons
learnMoreButtons.forEach((button, index) => {
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    openCard(index);
  });
});

// Add click event to "Close" buttons
closeButtons.forEach((button, index) => {
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    cards[index].classList.remove("active");
  });
});

// Optional: Click on card to expand (except when already active)
cards.forEach((card, index) => {
  card.addEventListener("click", () => {
    if (!card.classList.contains("active")) {
      openCard(index);
    }
  });
});

// Close card when clicking outside
document.addEventListener("click", (e) => {
  if (!e.target.closest(".card")) {
    closeAllCards();
  }
});

// Section 3
// Section 3 - Animation on scroll into view
const section3 = document.querySelector(".section3");
const typedTextElement = document.getElementById("typed-text");

if (section3 && typedTextElement) {
  const text = "About RecallBot";
  let index = 0;
  let animationStarted = false;

  function typeText() {
    if (index < text.length) {
      typedTextElement.textContent += text.charAt(index);
      index++;
      setTimeout(typeText, 100);
    }
  }

  function startSection3Animations() {
    if (animationStarted) return;
    animationStarted = true;

    // Add animation class to section to trigger CSS animations
    section3.classList.add("animate");

    // Start typing after 0.5s
    setTimeout(typeText, 500);
  }

  // Intersection Observer to detect when section comes into view
  const section3Observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startSection3Animations();
          section3Observer.unobserve(entry.target); // Stop observing after animation starts
        }
      });
    },
    {
      threshold: 0.3, // Trigger when 30% of section is visible
    },
  );

  // Start observing the section
  section3Observer.observe(section3);
}

async function checkAuth() {
  try {
    const res = await fetch("http://localhost:8000/api/auth/profile", {
      credentials: "include",
    });

    if (!res.ok) return;

    const data = await res.json();

    const navAuth = document.getElementById("nav-auth");

    navAuth.innerHTML = `
      <a href="../html/dashboard.html" class="signin">Dashboard</a>
      <a href="#" id="logoutBtn" class="signin">Logout</a>
    `;

    document.getElementById("logoutBtn").addEventListener("click", async () => {
      await fetch("http://localhost:8000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      window.location.href = "../html/index.html"; // your home
    });
  } catch (err) {
    // not logged in → do nothing
  }
}

checkAuth();

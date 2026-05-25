document.addEventListener("DOMContentLoaded", function () {
  const header = document.querySelector(".header");
  const dashboard = document.querySelector(".dashboard-window");

  /* HEADER SHADOW */
  window.addEventListener("scroll", function () {
    if (window.scrollY > 40) {
      header.classList.add("header-scrolled");
    } else {
      header.classList.remove("header-scrolled");
    }
  });

  /* FAQ ACCORDION */
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach(function (item) {
    const question = item.querySelector(".faq-question");

    question.addEventListener("click", function () {
      const isActive = item.classList.contains("active");

      faqItems.forEach(function (faq) {
        faq.classList.remove("active");
      });

      if (!isActive) {
        item.classList.add("active");
      }
    });
  });

  /* REVEAL ANIMATION */
  const revealElements = document.querySelectorAll(
    ".stat-card, .dashboard-window, .prospection-dashboard, .pain-card, .feature-card, .pack-card, .story-card, .pricing-card, .faq-item"
  );

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.15 }
  );

  revealElements.forEach(function (element) {
    element.classList.add("reveal");
    observer.observe(element);
  });

  /* HERO FLOATING DASHBOARD */
  if (dashboard) {
    let angle = 0;

    setInterval(function () {
      angle += 0.018;
      dashboard.style.transform = `translateY(${Math.sin(angle) * 7}px)`;
    }, 30);
  }
});
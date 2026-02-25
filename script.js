document.addEventListener("DOMContentLoaded", () => {
  // --- Translation Logic ---
  let translations = {};
  const langBtns = document.querySelectorAll(".lang-btn");

  async function loadTranslations() {
    try {
      const response = await fetch("translations.json");
      translations = await response.json();

      // Get saved language or default to Spanish
      const savedLang = localStorage.getItem("preferredLanguage") || "es";
      setLanguage(savedLang);
    } catch (error) {
      console.error("Error loading translations:", error);
    }
  }

  function setLanguage(lang) {
    document.documentElement.lang = lang;
    localStorage.setItem("preferredLanguage", lang);

    // Update active button state
    langBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });

    // Update all elements with data-i18n attribute
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (translations[lang] && translations[lang][key]) {
        el.innerHTML = translations[lang][key];
      }
    });

    // Update placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (translations[lang] && translations[lang][key]) {
        el.placeholder = translations[lang][key];
      }
    });
  }

  langBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      setLanguage(btn.dataset.lang);
    });
  });

  // Initialize translations
  loadTranslations();

  // --- Existing Functionality ---
  // 1. Mobile menu toggle with ARIA support
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const navLinks = document.querySelector(".nav-links");

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", () => {
      const isExpanded = mobileMenuBtn.getAttribute("aria-expanded") === "true";
      mobileMenuBtn.setAttribute("aria-expanded", !isExpanded);
      navLinks.classList.toggle("active");
    });
  }

  // 2. Optimized Navbar Scroll Effect
  const navbar = document.querySelector(".navbar");
  let lastScrollY = window.scrollY;
  let ticking = false;

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
          } else {
            navbar.classList.remove("scrolled");
          }
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true },
  );

  // 3. GSAP Animations & ScrollTrigger
  if (typeof gsap !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    let ctx = gsap.context(() => {
      const isMobile = window.innerWidth <= 768;

      // Paint Splatter Animations (Hero & Equipo)
      if (!isMobile) {
        // Seleccionamos las manchas de cada sección para que se animen con su respectivo disparador
        gsap.utils.toArray(".paint-hero-left").forEach((splatter) => {
          const section = splatter.closest("section");
          gsap.to(splatter, {
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "bottom top",
              scrub: 0.5,
            },
            x: 100,
            y: 100,
            scale: 1.2,
            ease: "power2.out",
          });
        });

        gsap.utils.toArray(".paint-hero-right").forEach((splatter) => {
          const section = splatter.closest("section");
          gsap.to(splatter, {
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "bottom top",
              scrub: 0.5,
            },
            x: -150,
            y: 80,
            scale: 1.2,
            ease: "power2.out",
          });
        });

        gsap.utils.toArray(".paint-hero-yellow").forEach((splatter) => {
          const section = splatter.closest("section");
          gsap.to(splatter, {
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "bottom top",
              scrub: 0.5,
            },
            x: -100,
            y: -100,
            scale: 1.1,
            ease: "power2.out",
          });
        });
      } else {
        // Animación más simple para mobile para ahorrar recursos
        gsap.to(".paint-splatter", {
          scrollTrigger: {
            trigger: ".hero, .team-section",
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
          y: 30,
          opacity: 0.15,
          ease: "none",
        });
      }

      // Floating animation for splatters
      gsap.utils.toArray(".paint-splatter").forEach((splatter, i) => {
        gsap.to(splatter, {
          y: isMobile ? "10" : "20",
          x: isMobile ? "8" : "15",
          duration: 4 + i,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });

      // Hero Entrance
      const heroTL = gsap.timeline();
      heroTL
        .from(".hero h1", {
          y: 50,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
        })
        .from(
          ".hero-subtext",
          { y: 30, opacity: 0, duration: 0.8, ease: "power3.out" },
          "-=0.6",
        )
        .from(
          ".hero-btns",
          { y: 20, opacity: 0, duration: 0.6, ease: "power3.out" },
          "-=0.4",
        );

      // Sticky "How It Works" Section Logic
      const steps = document.querySelectorAll(".step-trigger");
      const visuals = document.querySelectorAll(".visual-item");

      steps.forEach((step, i) => {
        ScrollTrigger.create({
          trigger: step,
          start: window.innerWidth > 960 ? "top center+=100" : "top 80%",
          end: "bottom center",
          toggleActions: "play reverse play reverse",
          onToggle: (self) => {
            if (self.isActive) {
              updateVisual(i);
              steps.forEach((s) => s.classList.remove("active"));
              step.classList.add("active");
            }
          },
        });

        // Text animation within the step
        gsap.to(step.querySelectorAll(".animate-text"), {
          scrollTrigger: {
            trigger: step,
            start: window.innerWidth > 960 ? "top center+=200" : "top 90%",
            toggleActions: "play none none reverse",
          },
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
        });
      });

      function updateVisual(index) {
        visuals.forEach((visual, i) => {
          if (i === index) {
            visual.classList.add("active");
            if (window.innerWidth <= 960) {
              visual.style.display = "flex";
            }
            gsap.killTweensOf(visual);
            gsap.fromTo(
              visual,
              { opacity: 0, scale: 0.8, y: 50 },
              { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "power2.out" },
            );
          } else {
            visual.classList.remove("active");
            if (window.innerWidth <= 960) {
              visual.style.display = "none";
            }
          }
        });
      }

      // Features Entrance (Robust version)
      gsap.fromTo(
        ".feature-card",
        {
          y: 50,
          opacity: 0,
        },
        {
          scrollTrigger: {
            trigger: ".features",
            start: "top 85%",
            toggleActions: "play none none none",
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          clearProps: "all", // Importante: limpia los estilos de GSAP al terminar
        },
      );

      // 4. Interacción Dinámica de Color de Fondo (Versión Sutil)
      const featureCards = document.querySelectorAll(".feature-card");

      featureCards.forEach((card) => {
        const title = card.querySelector("h3");
        const color = window.getComputedStyle(title).color;

        card.addEventListener("mouseenter", () => {
          // Resaltamos la card actual con un borde sutil y sombra
          gsap.to(card, {
            borderColor: color,
            boxShadow: `0 15px 40px ${color.replace("rgb", "rgba").replace(")", ", 0.15)")}`,
            y: -10,
            duration: 0.4,
          });
        });

        card.addEventListener("mouseleave", () => {
          // Restauramos card
          gsap.to(card, {
            borderColor: "rgba(0,0,0,0.05)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
            y: 0,
            duration: 0.4,
          });
        });
      });
    });
  }

  // 4. Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#") return;

      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const navHeight = document.querySelector(".navbar").offsetHeight;
        const targetPosition =
          target.getBoundingClientRect().top + window.pageYOffset - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });

        // Close mobile menu if open
        if (navLinks.classList.contains("active")) {
          navLinks.classList.remove("active");
          mobileMenuBtn.setAttribute("aria-expanded", "false");
        }
      }
    });
  });

  // 5. Optimized Video Play logic
  const videoPlaceholder = document.querySelector(".video-placeholder");
  if (videoPlaceholder) {
    videoPlaceholder.addEventListener(
      "click",
      () => {
        const container = document.querySelector(".video-container");
        const iframe = document.createElement("iframe");
        // Simplificamos la URL y eliminamos origin por si estás probando en local
        iframe.setAttribute(
          "src",
          "https://www.youtube.com/embed/ixGd6KK2XGU?si=4qwHl9QZxjG_w3Nr",
        );
        iframe.setAttribute("title", "YouTube video player");
        iframe.setAttribute("frameborder", "0");
        iframe.setAttribute(
          "allow",
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
        );
        iframe.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
        iframe.setAttribute("allowfullscreen", "");
        iframe.style.position = "absolute";
        iframe.style.top = "0";
        iframe.style.left = "0";
        iframe.style.width = "100%";
        iframe.style.height = "100%";

        container.innerHTML = "";
        container.appendChild(iframe);
      },
      { once: true },
    );
  }

  // 6. FAQ Accordion with accessibility support
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    const btn = item.querySelector(".faq-question");
    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("active");

      // Close others
      faqItems.forEach((i) => {
        i.classList.remove("active");
        i.querySelector(".faq-question").setAttribute("aria-expanded", "false");
      });

      // Toggle current
      if (!isOpen) {
        item.classList.add("active");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  // 7. Optimized Form Submission with Toast Feedback
  const contactForm = document.querySelector(".contact-form");

  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
            <div class="toast-icon">✓</div>
            <div class="toast-message">${message}</div>
        `;
    toastContainer.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add("show"), 100);

    // Remove toast
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 500);
    }, 4000);
  }

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      const formData = new FormData(contactForm);

      submitBtn.disabled = true;
      submitBtn.textContent =
        document.documentElement.lang === "en" ? "Sending..." : "Enviando...";

      fetch(contactForm.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      })
        .then(async (response) => {
          if (response.ok) {
            const name = document.getElementById("name").value;
            const successMsg =
              document.documentElement.lang === "en"
                ? `Thank you ${name}! Your story inspires us. We will be in touch soon.`
                : `¡Gracias ${name}! Tu historia nos inspira pronto nos podremos en contacto.`;
            showToast(successMsg);
            contactForm.reset();
          } else {
            const json = await response.json();
            showToast(json.error || json.message || "Error");
          }
        })
        .catch((error) => {
          console.log(error);
          showToast(
            document.documentElement.lang === "en"
              ? "Something went wrong!"
              : "¡Algo salió mal!",
          );
        })
        .then(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        });
    });
  }

  // Newsletter Form Submission
  const newsletterForm = document.querySelector(".newsletter-form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const submitBtn = newsletterForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      const formData = new FormData(newsletterForm);

      submitBtn.disabled = true;
      submitBtn.textContent =
        document.documentElement.lang === "en"
          ? "Subscribing..."
          : "Suscribiendo...";

      fetch(newsletterForm.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      })
        .then(async (response) => {
          if (response.ok) {
            const successMsg =
              document.documentElement.lang === "en"
                ? `Thank you for subscribing to our blog!`
                : `¡Gracias por suscribirte a nuestro blog!`;
            showToast(successMsg);
            newsletterForm.reset();
          } else {
            const json = await response.json();
            showToast(json.error || json.message || "Error");
          }
        })
        .catch((error) => {
          showToast(
            document.documentElement.lang === "en"
              ? "Something went wrong!"
              : "¡Algo salió mal!",
          );
        })
        .then(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        });
    });
  }

  // 5. Team Entrance Animation (Editorial Style)
  const teamCards = document.querySelectorAll(".team-card");

  teamCards.forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
      y: 100,
      rotation: i % 2 === 0 ? -5 : 5,
      opacity: 0,
      duration: 1.2,
      ease: "expo.out",
    });

    gsap.from(card.querySelectorAll(".team-details li"), {
      scrollTrigger: {
        trigger: card,
        start: "top 70%",
      },
      x: -20,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      delay: 0.3,
      ease: "power2.out",
    });
  });

  // 6. FAQ Parallax Shapes (Subtle Floating & Scroll effect)
  const shapes = document.querySelectorAll(".faq-shape");

  shapes.forEach((shape, i) => {
    // Parallax suave al hacer scroll
    gsap.to(shape, {
      scrollTrigger: {
        trigger: ".faq-section",
        start: "top bottom",
        end: "bottom top",
        scrub: 1.5,
      },
      y: i % 2 === 0 ? -80 : 80, // Movimientos opuestos sutiles
      rotation: i % 2 === 0 ? 15 : -15, // Rotación mínima para que no queden de cabeza
      ease: "none",
    });

    // Animación de flotación continua (Levitación sutil)
    gsap.to(shape, {
      y: "+=15",
      x: "+=10",
      rotation: "+=5",
      duration: 3 + i,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: i * 0.5,
    });
  });
});

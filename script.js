/**
 * Careers Form Interaction and Validation Script
 * Core features: Real-time validation, telephone masking, light/dark mode toggling,
 * success canvas confetti, and fluid states.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const htmlElement = document.documentElement;
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  
  const form = document.getElementById('jobApplicationForm');
  const fullNameInput = document.getElementById('fullName');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const messageInput = document.getElementById('message');
  const charCounter = document.getElementById('charCount');
  
  const submitBtn = document.getElementById('submitBtn');
  const successCard = document.getElementById('successCard');
  const resetBtn = document.getElementById('resetBtn');
  
  const successUserName = document.getElementById('successUserName');
  const successUserEmail = document.getElementById('successUserEmail');
  const confettiCanvas = document.getElementById('confettiCanvas');

  // --- Theme Toggle Management ---
  const currentTheme = localStorage.getItem('theme') || 'dark';
  htmlElement.setAttribute('data-theme', currentTheme);

  themeToggleBtn.addEventListener('click', () => {
    const activeTheme = htmlElement.getAttribute('data-theme');
    const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  // --- Phone Masking ---
  phoneInput.addEventListener('input', (e) => {
    const input = e.target;
    // Keep track of cursor position to prevent jumping
    let selectionStart = input.selectionStart;
    const oldLength = input.value.length;
    
    // Format the value
    const formatted = formatPhoneNumber(input.value);
    input.value = formatted;
    
    // Adjust cursor position
    const newLength = input.value.length;
    selectionStart = selectionStart + (newLength - oldLength);
    input.setSelectionRange(selectionStart, selectionStart);
  });

  function formatPhoneNumber(value) {
    if (!value) return value;
    const cleanValue = value.replace(/[^\d]/g, '');
    const length = cleanValue.length;
    
    if (length === 0) return '';
    if (length < 4) return `(${cleanValue}`;
    if (length < 7) return `(${cleanValue.slice(0, 3)}) ${cleanValue.slice(3)}`;
    return `(${cleanValue.slice(0, 3)}) ${cleanValue.slice(3, 6)}-${cleanValue.slice(6, 10)}`;
  }

  // --- Character Counter for Textarea ---
  messageInput.addEventListener('input', () => {
    const length = messageInput.value.length;
    charCounter.textContent = length;
    
    // Optional styling for close-to-limit warnings
    const parentCounter = charCounter.parentElement;
    if (length >= 950) {
      parentCounter.style.color = 'var(--color-error)';
    } else {
      parentCounter.style.color = 'var(--text-muted)';
    }
  });

  // --- Validation Rules ---
  const validationRules = {
    fullName: (value) => {
      const cleanValue = value.trim();
      if (cleanValue.length < 2) return 'Full name must be at least 2 characters.';
      // Allow letters, spaces, hyphens, and apostrophes
      const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;
      if (!nameRegex.test(cleanValue)) return 'Please enter a valid name (letters only).';
      return '';
    },
    email: (value) => {
      const cleanValue = value.trim();
      if (!cleanValue) return 'Email address is required.';
      // HTML5 Spec compliant email regex
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(cleanValue)) return 'Please enter a valid email address.';
      return '';
    },
    phone: (value) => {
      const cleanValue = value.replace(/[^\d]/g, '');
      if (cleanValue.length === 0) return 'Phone number is required.';
      if (cleanValue.length !== 10) return 'Phone number must be exactly 10 digits.';
      return '';
    },
    message: (value) => {
      const cleanValue = value.trim();
      if (cleanValue.length === 0) return 'Cover letter / message is required.';
      if (cleanValue.length < 20) return 'Please tell us a bit more (minimum 20 characters).';
      if (cleanValue.length > 1000) return 'Message cannot exceed 1000 characters.';
      return '';
    }
  };

  // --- Real-time Validation Flow ---
  const fields = [
    { input: fullNameInput, group: document.getElementById('nameGroup'), errorEl: document.getElementById('nameError'), rule: validationRules.fullName },
    { input: emailInput, group: document.getElementById('emailGroup'), errorEl: document.getElementById('emailError'), rule: validationRules.email },
    { input: phoneInput, group: document.getElementById('phoneGroup'), errorEl: document.getElementById('phoneError'), rule: validationRules.phone },
    { input: messageInput, group: document.getElementById('messageGroup'), errorEl: document.getElementById('messageError'), rule: validationRules.message }
  ];

  // Track if fields have been touched/interacted with
  const touchedFields = new Set();

  fields.forEach(({ input, group, errorEl, rule }) => {
    // Validate on focus out (blur)
    input.addEventListener('blur', () => {
      touchedFields.add(input.id);
      validateField(input, group, errorEl, rule);
    });

    // Validate on input, but ONLY if they already triggered a blur (prevent immediate annoying errors)
    input.addEventListener('input', () => {
      if (touchedFields.has(input.id)) {
        validateField(input, group, errorEl, rule);
      }
    });
  });

  function validateField(input, group, errorEl, rule) {
    const errorMsg = rule(input.value);
    
    if (errorMsg) {
      group.classList.remove('is-valid');
      group.classList.add('is-invalid');
      errorEl.textContent = errorMsg;
      return false;
    } else {
      group.classList.remove('is-invalid');
      group.classList.add('is-valid');
      errorEl.textContent = '';
      return true;
    }
  }

  // --- Form Submission Handling ---
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Trigger validation on all fields & mark them as touched
    let isFormValid = true;
    let firstInvalidInput = null;

    fields.forEach(({ input, group, errorEl, rule }) => {
      touchedFields.add(input.id);
      const isValid = validateField(input, group, errorEl, rule);
      if (!isValid) {
        isFormValid = false;
        if (!firstInvalidInput) {
          firstInvalidInput = input;
        }
      }
    });

    if (!isFormValid) {
      // Focus on the first invalid field to aid usability
      if (firstInvalidInput) {
        firstInvalidInput.focus();
      }
      return;
    }

    // Form is valid - enter loading state
    setLoadingState(true);

    // Mock API Submission call
    setTimeout(() => {
      // Set success details
      successUserName.textContent = fullNameInput.value.trim().split(' ')[0]; // First name
      successUserEmail.textContent = emailInput.value.trim();
      
      // Transition out form card contents
      setLoadingState(false);
      
      // Hide form elements, show success card
      form.style.display = 'none';
      document.querySelector('.form-header').style.display = 'none';
      successCard.style.display = 'flex';
      
      // Launch Confetti Party
      startConfetti();
    }, 1500);
  });

  function setLoadingState(isLoading) {
    if (isLoading) {
      submitBtn.disabled = true;
      submitBtn.classList.add('is-loading');
      submitBtn.querySelector('.btn-text').textContent = 'Submitting...';
      fields.forEach(f => f.input.disabled = true);
    } else {
      submitBtn.disabled = false;
      submitBtn.classList.remove('is-loading');
      submitBtn.querySelector('.btn-text').textContent = 'Submit Application';
      fields.forEach(f => f.input.disabled = false);
    }
  }

  // --- Form Resetting ---
  resetBtn.addEventListener('click', () => {
    // Reset Form fields
    form.reset();
    charCounter.textContent = '0';
    
    // Clear validation classes & touched tracking
    touchedFields.clear();
    fields.forEach(({ input, group, errorEl }) => {
      group.classList.remove('is-valid', 'is-invalid');
      errorEl.textContent = '';
    });
    
    // Reset displays
    successCard.style.display = 'none';
    form.style.display = 'block';
    document.querySelector('.form-header').style.display = 'block';
    
    // Stop Confetti animation
    stopConfetti();
  });

  // ==========================================================================
  // Canvas Confetti Celebration Module (Self-Contained Engine)
  // ==========================================================================
  let confettiActive = false;
  let confettiInterval = null;
  const particles = [];
  const colors = [
    '#8b5cf6', // Primary Violet
    '#06b6d4', // Accent Cyan
    '#ec4899', // Pink
    '#10b981', // Success Emerald
    '#3b82f6', // Blue
    '#f59e0b'  // Amber
  ];

  function resizeConfettiCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }

  class ConfettiParticle {
    constructor() {
      this.x = Math.random() * confettiCanvas.width;
      this.y = Math.random() * -confettiCanvas.height - 20;
      this.size = Math.random() * 8 + 6;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.speedX = Math.random() * 4 - 2;
      this.speedY = Math.random() * 3 + 4;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 4 - 2;
      this.opacity = 1;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.rotation += this.rotationSpeed;
      
      // Slow fade down near bottom
      if (this.y > confettiCanvas.height * 0.7) {
        this.opacity -= 0.02;
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      
      // Draw a rectangular confetti strip
      ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
      ctx.restore();
    }
  }

  function animateConfetti() {
    if (!confettiActive) return;
    
    const ctx = confettiCanvas.getContext('2d');
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    
    // Update and draw existing particles
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw(ctx);
      
      // Remove dead particles
      if (particles[i].opacity <= 0 || particles[i].y > confettiCanvas.height) {
        particles.splice(i, 1);
      }
    }

    // Continue animation loop
    if (confettiActive && (particles.length > 0 || particles.length < 150)) {
      requestAnimationFrame(animateConfetti);
    } else {
      confettiCanvas.style.display = 'none';
    }
  }

  function startConfetti() {
    confettiActive = true;
    confettiCanvas.style.display = 'block';
    resizeConfettiCanvas();
    window.addEventListener('resize', resizeConfettiCanvas);
    
    // Spawn initial particles burst
    for (let i = 0; i < 120; i++) {
      particles.push(new ConfettiParticle());
    }

    // Keep spawning particles for a short while
    confettiInterval = setInterval(() => {
      if (particles.length < 180) {
        for (let i = 0; i < 5; i++) {
          particles.push(new ConfettiParticle());
        }
      }
    }, 100);

    animateConfetti();

    // Automatically stop spawning after 4.5 seconds
    setTimeout(() => {
      clearInterval(confettiInterval);
      // Wait for existing particles to fade out naturally
      setTimeout(() => {
        if (confettiActive) {
          stopConfetti();
        }
      }, 3000);
    }, 4500);
  }

  function stopConfetti() {
    confettiActive = false;
    clearInterval(confettiInterval);
    particles.length = 0;
    const ctx = confettiCanvas.getContext('2d');
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiCanvas.style.display = 'none';
    window.removeEventListener('resize', resizeConfettiCanvas);
  }
});

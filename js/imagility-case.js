/* ==========================================================================
   Imagility Case Study — PIN gate
   Client-side gate only (not real security) — it just hides confidential
   client work behind a shareable 6-letter code, e.g. "IMGLTY".
   Change CASE_STUDY_PIN below to whatever you want to hand out.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const CASE_STUDY_PIN = 'IMGLTY'; // <-- change this to your own 6-letter code
  const STORAGE_KEY = 'imagility_case_unlocked';

  const gate = document.getElementById('pinGate');
  const card = gate ? gate.querySelector('.pin-gate__card') : null;
  const inputs = Array.from(document.querySelectorAll('.pin-inputs input'));
  const errorEl = document.getElementById('pinError');
  const successEl = document.getElementById('pinSuccess');
  const form = document.getElementById('pinForm');

  if (!gate || !inputs.length) return;

  const unlock = (persist = true) => {
    gate.classList.add('is-unlocked');
    document.body.classList.remove('is-locked');
    if (successEl) successEl.classList.add('is-visible');
    if (persist) {
      try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (e) { /* ignore */ }
    }
  };

  // Skip the gate if already unlocked earlier in this browser session
  try {
    if (sessionStorage.getItem(STORAGE_KEY) === '1') {
      unlock(false);
    } else {
      document.body.classList.add('is-locked');
    }
  } catch (e) {
    document.body.classList.add('is-locked');
  }

  const showError = (message) => {
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('is-visible');
    }
    if (card) {
      card.classList.remove('is-shake');
      // Force reflow so the animation can replay
      void card.offsetWidth;
      card.classList.add('is-shake');
    }
  };

  const clearError = () => {
    if (errorEl) errorEl.classList.remove('is-visible');
  };

  const checkPin = () => {
    const value = inputs.map((i) => i.value.trim()).join('').toUpperCase();
    if (value.length < inputs.length) return;

    if (value === CASE_STUDY_PIN.toUpperCase()) {
      clearError();
      unlock();
    } else {
      showError('That PIN doesn\u2019t match — please try again.');
      inputs.forEach((i) => { i.value = ''; });
      inputs[0].focus();
    }
  };

  inputs.forEach((input, idx) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 1).toUpperCase();
      clearError();
      if (input.value && idx < inputs.length - 1) {
        inputs[idx + 1].focus();
      }
      checkPin();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && idx > 0) {
        inputs[idx - 1].focus();
      }
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasted = (e.clipboardData || window.clipboardData).getData('text');
      const chars = pasted.replace(/[^a-zA-Z0-9]/g, '').slice(0, inputs.length).split('');
      chars.forEach((ch, i) => {
        if (inputs[i]) inputs[i].value = ch.toUpperCase();
      });
      const nextEmpty = inputs.findIndex((i) => !i.value);
      (inputs[nextEmpty] || inputs[inputs.length - 1]).focus();
      checkPin();
    });
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      checkPin();
    });
  }
});

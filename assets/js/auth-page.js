import { createClient } from '../../vendor/supabase.js';

const SUPABASE_URL = window.__ENV__?.SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = window.__ENV__?.SUPABASE_ANON_KEY || 'placeholder-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const tabs = document.querySelectorAll('.auth-tab');
const signInPanel = document.getElementById('sign-in-panel');
const signUpPanel = document.getElementById('sign-up-panel');
const signInForm = document.getElementById('sign-in-form');
const signUpForm = document.getElementById('sign-up-form');
const signInError = document.getElementById('sign-in-error');
const signUpError = document.getElementById('sign-up-error');
const signUpSuccess = document.getElementById('sign-up-success');

// Check if already logged in
async function checkExistingSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    window.location.href = 'index.html';
  }
}

checkExistingSession();

// Tab switching
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.getAttribute('data-tab');

    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    if (target === 'sign-in') {
      signInPanel.classList.add('active');
      signInPanel.hidden = false;
      signUpPanel.classList.remove('active');
      signUpPanel.hidden = true;
    } else {
      signUpPanel.classList.add('active');
      signUpPanel.hidden = false;
      signInPanel.classList.remove('active');
      signInPanel.hidden = true;
    }

    // Clear errors
    hideError(signInError);
    hideError(signUpError);
    hideMessage(signUpSuccess);
  });
});

function showError(el, message) {
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
}

function hideError(el) {
  if (!el) return;
  el.textContent = '';
  el.hidden = true;
}

function showMessage(el, message) {
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
}

function hideMessage(el) {
  if (!el) return;
  el.textContent = '';
  el.hidden = true;
}

// Sign In
if (signInForm) {
  signInForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError(signInError);

    const email = document.getElementById('signInEmail').value.trim();
    const password = document.getElementById('signInPassword').value;

    if (!email || !password) {
      showError(signInError, 'Please fill in all fields.');
      return;
    }

    const submitBtn = signInForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      window.location.href = 'index.html';
    } catch (err) {
      showError(signInError, err.message || 'Failed to sign in.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
    }
  });
}

// Sign Up
if (signUpForm) {
  signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError(signUpError);
    hideMessage(signUpSuccess);

    const email = document.getElementById('signUpEmail').value.trim();
    const password = document.getElementById('signUpPassword').value;
    const confirm = document.getElementById('signUpConfirm').value;

    if (!email || !password || !confirm) {
      showError(signUpError, 'Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      showError(signUpError, 'Password must be at least 6 characters.');
      return;
    }

    if (password !== confirm) {
      showError(signUpError, 'Passwords do not match.');
      return;
    }

    const submitBtn = signUpForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) throw error;

      showMessage(signUpSuccess, 'Account created! Check your email to confirm, then sign in.');
      signUpForm.reset();
    } catch (err) {
      showError(signUpError, err.message || 'Failed to create account.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
    }
  });
}
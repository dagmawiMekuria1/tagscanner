import { createClient } from '../../vendor/supabase.js';

const SUPABASE_URL = window.__ENV__?.SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = window.__ENV__?.SUPABASE_ANON_KEY || 'placeholder-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// State
let currentStep = 1;
let capturedImageBlob = null;
let capturedImageUrl = null;
let analysisResult = null;
let mediaStream = null;

// DOM Elements
const steps = document.querySelectorAll('.capture-step');
const indicators = document.querySelectorAll('.step-indicator');
const cameraBtn = document.getElementById('camera-btn');
const uploadBtn = document.getElementById('upload-btn');
const fileInput = document.getElementById('file-input');
const cameraPreview = document.getElementById('camera-preview');
const cameraCanvas = document.getElementById('camera-canvas');
const shutterBtn = document.getElementById('shutter-btn');
const retakeBtn = document.getElementById('retake-btn');
const imagePreview = document.getElementById('image-preview');
const uploadPreview = document.getElementById('upload-preview');
const analysisStatus = document.getElementById('analysis-status');
const analysisSpinner = document.getElementById('analysis-spinner');
const reviewImage = document.getElementById('review-image');
const itemName = document.getElementById('item-name');
const itemCategory = document.getElementById('item-category');
const itemDescription = document.getElementById('item-description');
const itemCondition = document.getElementById('item-condition');
const itemNotes = document.getElementById('item-notes');
const saveStatus = document.getElementById('save-status');
const captureAnotherBtn = document.getElementById('capture-another-btn');
const viewInventoryBtn = document.getElementById('view-inventory-btn');
const signOutBtn = document.getElementById('signOutBtn');
const mobileSignOutBtn = document.getElementById('mobileSignOutBtn');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileNav = document.getElementById('mobileNav');

// Mobile menu toggle
if (mobileMenuBtn && mobileNav) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
    mobileMenuBtn.classList.toggle('open');
  });
}

// Auth check
async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = 'auth.html';
    return null;
  }
  return session;
}

// Sign out
async function handleSignOut() {
  stopCamera();
  await supabase.auth.signOut();
  window.location.href = 'auth.html';
}

if (signOutBtn) signOutBtn.addEventListener('click', handleSignOut);
if (mobileSignOutBtn) mobileSignOutBtn.addEventListener('click', handleSignOut);

// Step navigation
function goToStep(step) {
  currentStep = step;

  steps.forEach(s => {
    const stepNum = parseInt(s.getAttribute('data-step'));
    if (stepNum === step) {
      s.classList.add('active');
      s.hidden = false;
    } else {
      s.classList.remove('active');
      s.hidden = true;
    }
  });

  indicators.forEach(ind => {
    const indStep = parseInt(ind.getAttribute('data-step'));
    ind.classList.toggle('active', indStep <= step);
    ind.classList.toggle('completed', indStep < step);
  });
}

// Wire up prev/next buttons via event delegation
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('prev-btn')) {
    if (currentStep > 1) {
      if (currentStep === 2) {
        stopCamera();
      }
      goToStep(currentStep - 1);
    }
  }
  if (e.target.classList.contains('next-btn')) {
    if (currentStep < 5) {
      if (currentStep === 2) {
        startAnalysis();
      }
      goToStep(currentStep + 1);
    }
  }
  if (e.target.classList.contains('save-btn')) {
    saveItem();
  }
});

// Step 1: Choose method
if (cameraBtn) {
  cameraBtn.addEventListener('click', async () => {
    goToStep(2);
    await startCamera();
  });
}

if (uploadBtn) {
  uploadBtn.addEventListener('click', () => {
    fileInput.click();
  });
}

if (fileInput) {
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    capturedImageBlob = file;

    const reader = new FileReader();
    reader.onload = (ev) => {
      capturedImageUrl = ev.target.result;
      goToStep(2);

      // Hide camera elements, show preview
      if (cameraPreview) cameraPreview.hidden = true;
      if (shutterBtn) shutterBtn.hidden = true;
      if (imagePreview) {
        imagePreview.src = capturedImageUrl;
        imagePreview.hidden = false;
      }
      if (retakeBtn) retakeBtn.hidden = false;

      // Enable next
      enableNextBtn();
    };
    reader.readAsDataURL(file);
  });
}

function enableNextBtn() {
  const currentStepEl = document.querySelector('.capture-step[data-step="' + currentStep + '"]');
  if (currentStepEl) {
    const nextBtn = currentStepEl.querySelector('.next-btn');
    if (nextBtn) nextBtn.disabled = false;
  }
}

// Camera
async function startCamera() {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });
    if (cameraPreview) {
      cameraPreview.srcObject = mediaStream;
      cameraPreview.hidden = false;
    }
    if (imagePreview) imagePreview.hidden = true;
    if (shutterBtn) shutterBtn.hidden = false;
    if (retakeBtn) retakeBtn.hidden = true;
  } catch (err) {
    console.error('Camera access denied:', err);
    if (analysisStatus) {
      analysisStatus.textContent = 'Camera access denied. Please use the upload option.';
    }
  }
}

function stopCamera() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
  if (cameraPreview) cameraPreview.srcObject = null;
}

// Shutter
if (shutterBtn) {
  shutterBtn.addEventListener('click', () => {
    if (!cameraCanvas || !cameraPreview) return;

    const ctx = cameraCanvas.getContext('2d');
    cameraCanvas.width = cameraPreview.videoWidth;
    cameraCanvas.height = cameraPreview.videoHeight;
    ctx.drawImage(cameraPreview, 0, 0);

    cameraCanvas.toBlob((blob) => {
      capturedImageBlob = blob;
      capturedImageUrl = cameraCanvas.toDataURL('image/jpeg');

      if (imagePreview) {
        imagePreview.src = capturedImageUrl;
        imagePreview.hidden = false;
      }
      if (cameraPreview) cameraPreview.hidden = true;
      if (shutterBtn) shutterBtn.hidden = true;
      if (retakeBtn) retakeBtn.hidden = false;

      stopCamera();
      enableNextBtn();
    }, 'image/jpeg', 0.85);
  });
}

// Retake
if (retakeBtn) {
  retakeBtn.addEventListener('click', async () => {
    capturedImageBlob = null;
    capturedImageUrl = null;
    if (imagePreview) imagePreview.hidden = true;
    if (retakeBtn) retakeBtn.hidden = true;

    // Disable next
    const currentStepEl = document.querySelector('.capture-step[data-step="2"]');
    if (currentStepEl) {
      const nextBtn = currentStepEl.querySelector('.next-btn');
      if (nextBtn) nextBtn.disabled = true;
    }

    await startCamera();
  });
}

// Step 3: AI Analysis (simulated)
async function startAnalysis() {
  if (analysisStatus) analysisStatus.textContent = 'Analyzing your image...';
  if (analysisSpinner) analysisSpinner.hidden = false;

  // Enable next on step 3 after analysis
  const step3 = document.querySelector('.capture-step[data-step="3"]');
  const nextBtn3 = step3 ? step3.querySelector('.next-btn') : null;
  if (nextBtn3) nextBtn3.disabled = true;

  try {
    // Simulate AI analysis with a delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    analysisResult = {
      name: 'Equipment Item',
      category: 'General',
      description: 'AI-detected equipment item. Please review and update the details.',
      condition: 'good'
    };

    if (analysisStatus) analysisStatus.textContent = 'Analysis complete! Review the details.';
    if (analysisSpinner) analysisSpinner.hidden = true;
    if (nextBtn3) nextBtn3.disabled = false;

    // Pre-fill review form
    if (reviewImage) reviewImage.src = capturedImageUrl;
    if (itemName) itemName.value = analysisResult.name;
    if (itemCategory) itemCategory.value = analysisResult.category;
    if (itemDescription) itemDescription.value = analysisResult.description;
    if (itemCondition) itemCondition.value = analysisResult.condition;
  } catch (err) {
    console.error('Analysis failed:', err);
    if (analysisStatus) analysisStatus.textContent = 'Analysis failed. You can still enter details manually.';
    if (analysisSpinner) analysisSpinner.hidden = true;
    if (nextBtn3) nextBtn3.disabled = false;
  }
}

// Step 4: Save item
async function saveItem() {
  if (saveStatus) {
    saveStatus.textContent = 'Saving...';
    saveStatus.hidden = false;
  }

  // Disable save button
  const step4 = document.querySelector('.capture-step[data-step="4"]');
  const saveBtn = step4 ? step4.querySelector('.save-btn') : null;
  if (saveBtn) saveBtn.disabled = true;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    let imageUrl = null;

    // Upload image to storage
    if (capturedImageBlob) {
      const fileName = 'capture-' + Date.now() + '.jpg';
      const filePath = session.user.id + '/' + fileName;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('captures')
        .upload(filePath, capturedImageBlob);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('captures')
        .getPublicUrl(filePath);

      imageUrl = urlData.publicUrl;
    }

    // Insert record
    const { error: insertError } = await supabase
      .from('captures')
      .insert({
        user_id: session.user.id,
        name: itemName ? itemName.value : '',
        category: itemCategory ? itemCategory.value : '',
        description: itemDescription ? itemDescription.value : '',
        condition: itemCondition ? itemCondition.value : 'good',
        notes: itemNotes ? itemNotes.value : '',
        image_url: imageUrl,
        created_at: new Date().toISOString()
      });

    if (insertError) throw insertError;

    goToStep(5);
  } catch (err) {
    console.error('Save failed:', err);
    if (saveStatus) {
      saveStatus.textContent = 'Failed to save: ' + (err.message || 'Unknown error');
    }
  } finally {
    if (saveBtn) saveBtn.disabled = false;
  }
}

// Step 5: Capture another
if (captureAnotherBtn) {
  captureAnotherBtn.addEventListener('click', () => {
    // Reset state
    capturedImageBlob = null;
    capturedImageUrl = null;
    analysisResult = null;

    // Reset form fields
    if (itemName) itemName.value = '';
    if (itemCategory) itemCategory.value = '';
    if (itemDescription) itemDescription.value = '';
    if (itemCondition) itemCondition.value = 'good';
    if (itemNotes) itemNotes.value = '';
    if (saveStatus) saveStatus.hidden = true;
    if (imagePreview) imagePreview.hidden = true;
    if (fileInput) fileInput.value = '';

    goToStep(1);
  });
}

// Initialize
async function init() {
  const session = await checkAuth();
  if (!session) return;

  // Initialize - show step 1, hide others
  goToStep(1);
}

init();
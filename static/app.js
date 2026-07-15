if (!document.querySelector('#analysis-form')) {
  document.querySelector('[data-download-report]')?.addEventListener('click', () => window.print());
} else {
const $ = (selector, root = document) => root.querySelector(selector);
const fileInput = $('#resume'), textarea = $('#job-description'), dropZone = $('[data-drop-zone]');
const emptyUpload = $('[data-upload-empty]'), selectedUpload = $('[data-upload-selected]');
const fileName = $('[data-file-name]'), fileError = $('[data-file-error]'), jobError = $('[data-job-error]');
const submit = $('[data-submit]'), submitText = $('[data-submit-text]'), spinner = $('.spinner', submit);
let selectedFile = null;

function setFile(file) {
  fileError.textContent = '';
  if (!file) { selectedFile = null; emptyUpload.hidden = false; selectedUpload.hidden = true; fileInput.value = ''; updateValidity(); return; }
  if (!(file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) { fileError.textContent = 'Please add a PDF resume to continue.'; return; }
  if (file.size > 5 * 1024 * 1024) { fileError.textContent = 'This file is larger than 5 MB. Choose a smaller PDF.'; return; }
  selectedFile = file; fileName.textContent = file.name; emptyUpload.hidden = true; selectedUpload.hidden = false; updateValidity();
}
function updateCounter() { $('[data-counter]').textContent = `${textarea.value.length.toLocaleString()} characters`; jobError.textContent = ''; updateValidity(); }
function updateValidity() { const valid = Boolean(selectedFile && textarea.value.trim()); $('[data-mobile-cta]').hidden = !valid; }
fileInput.addEventListener('change', () => setFile(fileInput.files[0]));
$('[data-file-button]').addEventListener('click', () => fileInput.click());
$('[data-remove-file]').addEventListener('click', () => setFile(null));
dropZone.addEventListener('click', e => { if (!e.target.closest('button')) fileInput.click(); });
dropZone.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); } });
['dragenter', 'dragover'].forEach(type => dropZone.addEventListener(type, e => { e.preventDefault(); dropZone.classList.add('dragging'); }));
['dragleave', 'drop'].forEach(type => dropZone.addEventListener(type, e => { e.preventDefault(); dropZone.classList.remove('dragging'); }));
dropZone.addEventListener('drop', e => setFile(e.dataTransfer.files[0]));
textarea.addEventListener('input', updateCounter);

$('#analysis-form').addEventListener('submit', e => {
  e.preventDefault(); let valid = true;
  if (!selectedFile) { fileError.textContent = 'Please add a PDF resume to continue.'; valid = false; }
  if (!textarea.value.trim()) { jobError.textContent = 'Please paste a job description to generate the match analysis.'; valid = false; }
  if (!valid) return;
  submit.disabled = true; submitText.textContent = 'Analyzing resume and role requirements…'; spinner.hidden = false;
  e.currentTarget.submit();
});
$('[data-sample]').addEventListener('click', () => { textarea.value = 'Product Designer\nWe are looking for a product designer with strong Figma, user research, prototyping, product strategy, and cross-functional collaboration skills. Experience with B2B SaaS and design systems is preferred.'; updateCounter(); const demo = new File(['Sample resume'], 'jordan-taylor-resume.pdf', { type: 'application/pdf' }); setFile(demo); });
const $$ = (selector) => [...document.querySelectorAll(selector)];
$$('[data-analysis-link]').forEach(link => link.addEventListener('click', () => setTimeout(() => dropZone.focus(), 550)));
 $('[data-sample-focus]').addEventListener('click', () => { const result = $('[data-result]'); result.hidden = false; result.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
const menuButton = $('[data-menu]'), menu = $('#mobile-menu');
menuButton.addEventListener('click', () => { const open = menu.hidden; menu.hidden = !open; menuButton.setAttribute('aria-expanded', String(open)); });
$$('#mobile-menu a').forEach(a => a.addEventListener('click', () => { menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); }));
const modal = $('[data-modal]');
$$('[data-signup]').forEach(button => button.addEventListener('click', () => { modal.hidden = false; $('#email').focus(); }));
$('[data-close-modal]').addEventListener('click', () => modal.hidden = true);
modal.addEventListener('click', e => { if (e.target === modal) modal.hidden = true; });
$('[data-create-account]').addEventListener('click', () => { const email = $('#email'); $('[data-modal-message]').textContent = email.validity.valid ? 'Thanks — account setup is a demo in this preview.' : 'Please enter a valid work email.'; });
const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { threshold: .12 });
$$('.reveal').forEach(el => observer.observe(el));
}

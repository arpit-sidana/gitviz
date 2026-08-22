const form = document.querySelector('#repo-form');
const input = document.querySelector('#repo-url');
const note = document.querySelector('#form-note');

function explore(url) {
  if (!url) return;
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'github.com' || parsed.pathname.split('/').filter(Boolean).length < 2) throw new Error();
    note.textContent = `Demo shell ready for ${parsed.pathname.replaceAll('/', ' / ').replace(/\.git$/, '')}. Analysis ingestion is the next build step.`;
    note.style.color = '#d5f36b';
  } catch {
    note.textContent = 'Please enter a public GitHub repository URL, for example https://github.com/owner/repository.';
    note.style.color = '#f29b8f';
  }
}

form.addEventListener('submit', (event) => { event.preventDefault(); explore(input.value.trim()); });
document.querySelectorAll('[data-repo]').forEach((card) => card.addEventListener('click', () => { input.value = card.dataset.repo; explore(card.dataset.repo); }));

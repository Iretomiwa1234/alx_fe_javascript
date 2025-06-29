let quotes = [];

// Load from localStorage or default
function loadQuotes() {
  const stored = localStorage.getItem('quotes');
  quotes = stored ? JSON.parse(stored) : [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Stay hungry, stay foolish.", category: "Inspiration" }
  ];
}

// Save to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
  populateCategories();
}

// Populate dropdown
function populateCategories() {
  const unique = [...new Set(quotes.map(q => q.category))];
  const dropdown = document.getElementById('categoryFilter');
  dropdown.innerHTML = '<option value="all">All Categories</option>';

  unique.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    dropdown.appendChild(option);
  });

  const lastSelected = localStorage.getItem('lastSelectedCategory');
  if (lastSelected && unique.includes(lastSelected)) {
    dropdown.value = lastSelected;
  } else {
    dropdown.value = 'all';
  }

  filterQuotes();
}

// Filter by category
function filterQuotes() {
  const selected = document.getElementById('categoryFilter').value;
  localStorage.setItem('lastSelectedCategory', selected);

  const display = document.getElementById('filteredQuotesDisplay');
  display.innerHTML = '';

  const filtered = selected === 'all'
    ? quotes
    : quotes.filter(q => q.category === selected);

  if (filtered.length === 0) {
    display.textContent = 'No quotes in this category.';
    return;
  }

  filtered.forEach(q => {
    const p = document.createElement('p');
    p.textContent = `"${q.text}" — ${q.category}`;
    display.appendChild(p);
  });
}

// Show random quote
function showRandomQuote() {
  const selected = document.getElementById('categoryFilter').value;
  const filtered = selected === 'all'
    ? quotes
    : quotes.filter(q => q.category === selected);

  if (filtered.length === 0) return alert('No quotes in this category.');

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  alert(`"${random.text}" — ${random.category}`);
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(random));
}

// Add quote + simulate server POST
function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();

  if (!text || !category) return alert('Please fill in both fields.');

  const newQuote = { text, category };
  quotes.push(newQuote);

  saveQuotes();
  filterQuotes();
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
  alert('Quote added!');

  postQuoteToServer(newQuote);
}

// 🔁 Sync with mock server (structured version)
function syncQuotes() {
  fetch('https://jsonplaceholder.typicode.com/posts?_limit=5')
    .then(res => res.json())
    .then(data => {
      const serverQuotes = data.map(item => ({
        text: item.title,
        category: 'Server'
      }));

      const result = resolveConflicts(serverQuotes);
      if (result.updated) {
        quotes = result.quotes;
        saveQuotes();
        filterQuotes();
        notifyUser('📡 Quotes synced with server.');
      }
    })
    .catch(() => notifyUser('❌ Failed to sync with server.'));
}

// ☁️ Simulate POSTing to server (mock API)
function postQuoteToServer(quote) {
  fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    body: JSON.stringify(quote),
    headers: { 'Content-type': 'application/json; charset=UTF-8' }
  })
    .then(res => res.json())
    .then(() => {
      notifyUser('✅ Quote posted to server (simulated).');
    })
    .catch(() => {
      notifyUser('⚠️ Failed to post quote to server.');
    });
}

// Conflict handling: server wins
function resolveConflicts(serverQuotes) {
  const localTexts = new Set(quotes.map(q => q.text));
  let updated = false;
  const merged = [...quotes];

  serverQuotes.forEach(q => {
    if (!localTexts.has(q.text)) {
      merged.push(q);
      updated = true;
    }
  });

  return { quotes: merged, updated };
}

// Notification UI
function notifyUser(msg) {
  const banner = document.createElement('div');
  banner.textContent = msg;
  banner.style.cssText = 'background:#f0a500;color:#000;padding:10px;margin-top:10px;font-weight:bold;';
  document.body.insertBefore(banner, document.body.firstChild);
  setTimeout(() => banner.remove(), 4000);
}

// Export JSON
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Import JSON
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        filterQuotes();
        alert('Quotes imported!');
      } else {
        alert('Invalid file format. Expected JSON array.');
      }
    } catch {
      alert('Error reading file.');
    }
  };
  reader.readAsText(file);
}

// Init everything
window.onload = () => {
  loadQuotes();
  populateCategories();

  document.getElementById('newQuote').addEventListener('click', showRandomQuote);
  document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
  document.getElementById('exportBtn').addEventListener('click', exportQuotes);
  document.getElementById('importFile').addEventListener('change', importFromJsonFile);

  // ✅ Start periodic sync
  syncQuotes(); // initial
  setInterval(syncQuotes, 30000); // every 30s
};

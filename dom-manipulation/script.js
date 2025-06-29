let quotes = [];

// ✅ 1. Load quotes from localStorage or use default
function loadQuotes() {
  const stored = localStorage.getItem('quotes');
  quotes = stored ? JSON.parse(stored) : [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Stay hungry, stay foolish.", category: "Inspiration" }
  ];
}

// ✅ 2. Save to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
  populateCategories();
}

// ✅ 3. Populate category dropdown and restore last selected
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

  const last = localStorage.getItem('lastSelectedCategory');
  if (last && unique.includes(last)) {
    dropdown.value = last;
  } else {
    dropdown.value = 'all';
  }

  filterQuotes();
}

// ✅ 4. Filter and display quotes
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

// ✅ 5. Show a random quote
function showRandomQuote() {
  const selected = document.getElementById('categoryFilter').value;
  const filtered = selected === 'all'
    ? quotes
    : quotes.filter(q => q.category === selected);

  if (filtered.length === 0) return alert('No quotes available in this category.');

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  alert(`"${random.text}" — ${random.category}`);
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(random));
}

// ✅ 6. Add a new quote and sync to server
function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();

  if (!text || !category) return alert('Please fill in both fields.');

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  filterQuotes();

  postQuoteToServer(newQuote); // ✅ posting to server
  alert('Quote added!');
}

// ✅ 7. Export quotes as JSON
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
}

// ✅ 8. Import quotes from file
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes.push(...imported);
        saveQuotes();
        filterQuotes();
        alert('Quotes imported!');
      } else {
        alert('Invalid format.');
      }
    } catch {
      alert('Error reading file.');
    }
  };
  reader.readAsText(file);
}

// ✅ 9. Fetch quotes from mock API (e.g. JSONPlaceholder)
function fetchQuotesFromServer() {
  fetch('https://jsonplaceholder.typicode.com/posts?_limit=5')
    .then(res => res.json())
    .then(data => {
      const serverQuotes = data.map(post => ({
        text: post.title,
        category: 'Server'
      }));
      handleServerSync(serverQuotes);
    })
    .catch(() => notifyUser('❌ Failed to fetch server quotes'));
}

// ✅ 10. Post single quote to server (simulation)
function postQuoteToServer(quote) {
  fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    body: JSON.stringify(quote),
    headers: { 'Content-Type': 'application/json' }
  })
    .then(res => res.json())
    .then(() => notifyUser('✅ Quote posted to server'))
    .catch(() => notifyUser('⚠️ Failed to post quote'));
}

// ✅ 11. Merge quotes and handle conflict (server wins)
function handleServerSync(serverQuotes) {
  const localTexts = new Set(quotes.map(q => q.text));
  let updated = false;

  serverQuotes.forEach(q => {
    if (!localTexts.has(q.text)) {
      quotes.push(q);
      updated = true;
    }
  });

  if (updated) {
    saveQuotes();
    filterQuotes();
    notifyUser('🔁 Synced new quotes from server');
  }
}

// ✅ 12. UI Notification
function notifyUser(message) {
  const div = document.createElement('div');
  div.textContent = message;
  div.style.cssText = 'background:#f0a500;color:#000;padding:10px;margin:10px;font-weight:bold;';
  document.body.insertBefore(div, document.body.firstChild);
  setTimeout(() => div.remove(), 4000);
}

// ✅ 13. Periodic Sync Function (every 30s)
function syncQuotes() {
  fetchQuotesFromServer();
}

// ✅ Init
window.onload = () => {
  loadQuotes();
  populateCategories();
  syncQuotes(); // initial fetch

  // Event listeners
  document.getElementById('newQuote').addEventListener('click', showRandomQuote);
  document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
  document.getElementById('exportBtn').addEventListener('click', exportQuotes);
  document.getElementById('importFile').addEventListener('change', importFromJsonFile);

  // ✅ Periodic sync every 30 seconds
  setInterval(syncQuotes, 30000);
};

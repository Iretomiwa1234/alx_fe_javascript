let quotes = [];

// Load from localStorage or initialize default quotes
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  quotes = storedQuotes ? JSON.parse(storedQuotes) : [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Stay hungry, stay foolish.", category: "Inspiration" }
  ];
}

// Save quotes to localStorage and update dropdown
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
  populateCategories();
}

// Populate category filter dropdown and restore selected filter
function populateCategories() {
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  const filterDropdown = document.getElementById('categoryFilter');
  filterDropdown.innerHTML = '<option value="all">All Categories</option>';

  uniqueCategories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    filterDropdown.appendChild(option);
  });

  const lastSelected = localStorage.getItem('lastSelectedCategory');
  if (lastSelected && uniqueCategories.includes(lastSelected)) {
    filterDropdown.value = lastSelected;
  } else {
    filterDropdown.value = 'all';
  }

  filterQuotes();
}

// Filter and display quotes
function filterQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  localStorage.setItem('lastSelectedCategory', selectedCategory);

  const display = document.getElementById('filteredQuotesDisplay');
  display.innerHTML = '';

  const filtered = selectedCategory === 'all'
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

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

// Show a random quote and store in sessionStorage
function showRandomQuote() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  const filtered = selectedCategory === 'all'
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    alert('No quotes available in this category.');
    return;
  }

  const randomQuote = filtered[Math.floor(Math.random() * filtered.length)];
  alert(`"${randomQuote.text}" — ${randomQuote.category}`);
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
}

// Add a new quote
function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();

  if (!text || !category) {
    alert('Please fill in both fields.');
    return;
  }

  quotes.push({ text, category });
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
  saveQuotes();
  filterQuotes();
  alert('Quote added!');
}

// Export quotes to JSON file
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
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
        alert('Invalid format: Must be a JSON array.');
      }
    } catch {
      alert('Error reading file.');
    }
  };
  reader.readAsText(file);
}

// Sync: Fetch quotes from mock server (JSONPlaceholder)
function fetchQuotesFromServer() {
  fetch('https://jsonplaceholder.typicode.com/posts?_limit=5')
    .then(response => response.json())
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
        notifyUser("Quotes updated from server.");
      }
    })
    .catch(() => {
      notifyUser("Failed to sync with server.");
    });
}

// Merge new server quotes if not already in local quotes
function resolveConflicts(serverQuotes) {
  const existingTexts = new Set(quotes.map(q => q.text));
  let updated = false;

  const merged = [...quotes];

  serverQuotes.forEach(serverQ => {
    if (!existingTexts.has(serverQ.text)) {
      merged.push(serverQ);
      updated = true;
    }
  });

  return { quotes: merged, updated };
}

// Show notifications
function notifyUser(message) {
  const notice = document.createElement('div');
  notice.textContent = message;
  notice.style.background = '#f0a500';
  notice.style.color = '#000';
  notice.style.padding = '10px';
  notice.style.marginTop = '10px';
  notice.style.fontWeight = 'bold';

  document.body.insertBefore(notice, document.body.firstChild);

  setTimeout(() => notice.remove(), 4000);
}

// On page load
window.onload = function () {
  loadQuotes();
  populateCategories();

  // Event listeners
  document.getElementById('newQuote').addEventListener('click', showRandomQuote);
  document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
  document.getElementById('exportBtn').addEventListener('click', exportQuotes);
  document.getElementById('importFile').addEventListener('change', importFromJsonFile);

  // Start sync with mock server
  fetchQuotesFromServer();                     // Initial sync
  setInterval(fetchQuotesFromServer, 30000);   // Repeat every 30s
};

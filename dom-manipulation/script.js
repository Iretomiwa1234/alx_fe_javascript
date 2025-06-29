let quotes = [];

// Load quotes from localStorage or use default quotes
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  quotes = storedQuotes ? JSON.parse(storedQuotes) : [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Stay hungry, stay foolish.", category: "Inspiration" }
  ];
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
  populateCategories();
}

// Populate category filter dropdown and restore last selected category
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
  const allOptions = [...filterDropdown.options].map(opt => opt.value);
  if (lastSelected && allOptions.includes(lastSelected)) {
    filterDropdown.value = lastSelected;
  } else {
    filterDropdown.value = 'all';
  }

  filterQuotes(); // Ensure display updates after setting dropdown value
}

// Filter and display quotes by selected category
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

// Show a random quote in an alert
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

// Add a new quote and update storage and display
function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();

  if (text && category) {
    quotes.push({ text, category });
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    saveQuotes();      // save and repopulate category dropdown
    filterQuotes();    // refresh displayed quotes
    alert('Quote added!');
  } else {
    alert('Please fill in both fields.');
  }
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
        saveQuotes();   // updates categories and localStorage
        filterQuotes(); // re-display filtered quotes
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

// Ensure DOM is ready before attaching event listeners
window.onload = function () {
  loadQuotes();
  populateCategories(); // includes filterQuotes call inside

  // Event listeners
  document.getElementById('newQuote').addEventListener('click', showRandomQuote);
  document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
  document.getElementById('exportBtn').addEventListener('click', exportQuotes);
  document.getElementById('importFile').addEventListener('change', importFromJsonFile);
};

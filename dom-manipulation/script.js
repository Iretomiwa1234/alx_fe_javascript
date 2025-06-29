let quotes = [];

function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  quotes = storedQuotes ? JSON.parse(storedQuotes) : [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Stay hungry, stay foolish.", category: "Inspiration" }
  ];
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
  populateCategories();
}

function populateCategories() {
  const categorySelect = document.getElementById('categorySelect');
  categorySelect.innerHTML = '<option value="all">All</option>';
  const categories = new Set(quotes.map(q => q.category));
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

function showRandomQuote() {
  const selectedCategory = document.getElementById('categorySelect').value;
  const filtered = selectedCategory === 'all' ? quotes : quotes.filter(q => q.category === selectedCategory);
  const quoteDisplay = document.getElementById('quoteDisplay');

  if (filtered.length === 0) {
    quoteDisplay.textContent = 'No quotes available in this category.';
    return;
  }

  const randomQuote = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = `"${randomQuote.text}" — ${randomQuote.category}`;

  sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
}

function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();

  if (text && category) {
    quotes.push({ text, category });
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    saveQuotes();
    alert('Quote added successfully!');
  } else {
    alert('Please fill in both fields.');
  }
}

function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
}

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
        alert('Quotes imported successfully!');
      } else {
        alert('Invalid JSON format.');
      }
    } catch (err) {
      alert('Error reading JSON file.');
    }
  };
  reader.readAsText(file);
}

function restoreLastViewedQuote() {
  const saved = sessionStorage.getItem('lastViewedQuote');
  if (saved) {
    const quote = JSON.parse(saved);
    document.getElementById('quoteDisplay').textContent = `"${quote.text}" — ${quote.category}`;
  }
}

// Event listeners
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
document.getElementById('exportBtn').addEventListener('click', exportQuotes);
document.getElementById('importFile').addEventListener('change', importFromJsonFile);

// Init
loadQuotes();
populateCategories();
restoreLastViewedQuote();

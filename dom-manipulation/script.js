// Load from localStorage or use default
let quotes = [];
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  quotes = storedQuotes ? JSON.parse(storedQuotes) : [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Stay hungry, stay foolish.", category: "Inspiration" }
  ];
}

// Save to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
  populateCategories(); // refresh category dropdown
}

// Populate the category dropdown
function populateCategories() {
  const categorySet = new Set(quotes.map(q => q.category));
  const categorySelect = document.getElementById('categorySelect');
  categorySelect.innerHTML = '<option value="all">All</option>';

  categorySet.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

// Show a random quote
function showRandomQuote() {
  const selectedCategory = document.getElementById('categorySelect').value;
  const filteredQuotes = selectedCategory === 'all'
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  const quoteDisplay = document.getElementById('quoteDisplay');
  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = 'No quotes available in this category.';
    return;
  }

  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  quoteDisplay.textContent = `"${randomQuote.text}" — ${randomQuote.category}`;

  // Save last viewed quote to sessionStorage
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
}

// Add a new quote
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (text && category) {
    quotes.push({ text, category });
    textInput.value = '';
    categoryInput.value = '';
    saveQuotes();
    alert('Quote added successfully!');
  } else {
    alert('Please fill in both quote and category.');
  }
}

// Optional: Load last viewed quote from session
function restoreLastViewedQuote() {
  const lastViewed = sessionStorage.getItem('lastViewedQuote');
  if (lastViewed) {
    const q = JSON.parse(lastViewed);
    document.getElementById('quoteDisplay').textContent = `"${q.text}" — ${q.category}`;
  }
}

// Event listeners
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
document.getElementById('addQuoteBtn').addEventListener('click', addQuote);

// Initialize app
loadQuotes();
populateCategories();
restoreLastViewedQuote();

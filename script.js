// Initial set of quotes
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Stay hungry, stay foolish.", category: "Inspiration" }
];

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

// Display a random quote based on selected category
function showRandomQuote() {
  const selectedCategory = document.getElementById('categorySelect').value;
  const filteredQuotes = selectedCategory === 'all'
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    document.getElementById('quoteDisplay').textContent = 'No quotes available in this category.';
    return;
  }

  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  document.getElementById('quoteDisplay').textContent = `"${randomQuote.text}" — ${randomQuote.category}`;
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
    populateCategories();
    alert('Quote added successfully!');
  } else {
    alert('Please fill in both quote and category.');
  }
}

// Event listeners
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
document.getElementById('addQuoteBtn').addEventListener('click', addQuote);

// Initial load
populateCategories();

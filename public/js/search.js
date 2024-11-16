document.getElementById('search-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const searchTerm = document.getElementById('search-input').value.trim();
    
    if (searchTerm) {
        window.location.href = `/?search=${encodeURIComponent(searchTerm)}`;
    }
});
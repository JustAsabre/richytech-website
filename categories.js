// Store all products for filtering
let allProducts = [];
let currentFilters = {
    category: 'all',
    search: '',
    priceMin: null,
    priceMax: null
};

document.addEventListener('DOMContentLoaded', () => {
    // Initialize products array
    const productElements = document.querySelectorAll('#product-grid .product');
    productElements.forEach(product => {
        allProducts.push({
            element: product,
            name: product.querySelector('h3').textContent,
            price: parseFloat(product.dataset.price),
            category: product.dataset.category
        });
    });

    // Initialize event listeners
    initializeEventListeners();
    
    // Initial display
    filterProducts('all');
    updateWishlistIcon();
});

function initializeEventListeners() {
    // Category filter
    document.querySelectorAll('#category-list li').forEach(li => {
        li.addEventListener('click', () => {
            const category = li.dataset.category;
            currentFilters.category = category;
            applyFilters();
            updateActiveCategory(category);
        });
    });

    // Search functionality
    const searchInput = document.getElementById('product-search');
    const searchBtn = document.getElementById('search-btn');

    searchInput.addEventListener('input', debounce(() => {
        currentFilters.search = searchInput.value.toLowerCase();
        applyFilters();
    }, 300));

    searchBtn.addEventListener('click', () => {
        currentFilters.search = searchInput.value.toLowerCase();
        applyFilters();
    });

    // Sort functionality
    document.getElementById('sort-products').addEventListener('change', (e) => {
        sortProducts(e.target.value);
    });

    // Price filter
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const applyPriceFilterBtn = document.getElementById('apply-price-filter');

    applyPriceFilterBtn.addEventListener('click', () => {
        currentFilters.priceMin = minPriceInput.value ? parseFloat(minPriceInput.value) : null;
        currentFilters.priceMax = maxPriceInput.value ? parseFloat(maxPriceInput.value) : null;
        applyFilters();
    });

    // Quick view functionality
    document.querySelectorAll('.quick-view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const product = btn.closest('.product');
            showQuickView(product);
        });
    });

    // Modal close button
    document.querySelector('.close-modal').addEventListener('click', () => {
        document.getElementById('quick-view-modal').style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('quick-view-modal');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Quantity selector in quick view
    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.parentElement.querySelector('input');
            const currentValue = parseInt(input.value);
            if (btn.classList.contains('minus')) {
                if (currentValue > 1) input.value = currentValue - 1;
            } else {
                if (currentValue < 10) input.value = currentValue + 1;
            }
        });
    });
}

function applyFilters() {
    const filteredProducts = allProducts.filter(product => {
        // Category filter
        const categoryMatch = currentFilters.category === 'all' || product.category === currentFilters.category;
        
        // Search filter
        const searchMatch = !currentFilters.search || 
            product.name.toLowerCase().includes(currentFilters.search);
        
        // Price filter
        const priceMatch = (!currentFilters.priceMin || product.price >= currentFilters.priceMin) &&
            (!currentFilters.priceMax || product.price <= currentFilters.priceMax);

        return categoryMatch && searchMatch && priceMatch;
    });

    // Update UI
    allProducts.forEach(product => {
        product.element.style.display = 'none';
    });

    filteredProducts.forEach(product => {
        product.element.style.display = 'block';
    });

    updateActiveFilters();
}

function updateActiveFilters() {
    const activeFiltersContainer = document.getElementById('active-filters');
    activeFiltersContainer.innerHTML = '';

    if (currentFilters.category !== 'all') {
        addFilterTag('Category: ' + currentFilters.category, () => {
            currentFilters.category = 'all';
            updateActiveCategory('all');
            applyFilters();
        });
    }

    if (currentFilters.search) {
        addFilterTag('Search: ' + currentFilters.search, () => {
            currentFilters.search = '';
            document.getElementById('product-search').value = '';
            applyFilters();
        });
    }

    if (currentFilters.priceMin || currentFilters.priceMax) {
        const priceText = `Price: $${currentFilters.priceMin || '0'} - $${currentFilters.priceMax || '∞'}`;
        addFilterTag(priceText, () => {
            currentFilters.priceMin = null;
            currentFilters.priceMax = null;
            document.getElementById('min-price').value = '';
            document.getElementById('max-price').value = '';
            applyFilters();
        });
    }
}

function addFilterTag(text, removeCallback) {
    const activeFiltersContainer = document.getElementById('active-filters');
    const tag = document.createElement('div');
    tag.className = 'filter-tag';
    tag.innerHTML = `
        ${text}
        <button onclick="event.stopPropagation();">×</button>
    `;
    tag.querySelector('button').addEventListener('click', removeCallback);
    activeFiltersContainer.appendChild(tag);
}

function updateActiveCategory(category) {
    document.querySelectorAll('#category-list li').forEach(li => {
        li.classList.toggle('active', li.dataset.category === category);
    });
}

function sortProducts(sortType) {
    const productGrid = document.getElementById('product-grid');
    const products = Array.from(productGrid.children);

    products.sort((a, b) => {
        const priceA = parseFloat(a.dataset.price);
        const priceB = parseFloat(b.dataset.price);
        const nameA = a.querySelector('h3').textContent;
        const nameB = b.querySelector('h3').textContent;

        switch (sortType) {
            case 'price-low':
                return priceA - priceB;
            case 'price-high':
                return priceB - priceA;
            case 'name-asc':
                return nameA.localeCompare(nameB);
            case 'name-desc':
                return nameB.localeCompare(nameA);
            default:
                return 0;
        }
    });

    // Re-append sorted products
    products.forEach(product => productGrid.appendChild(product));
}

function showQuickView(product) {
    const modal = document.getElementById('quick-view-modal');
    const name = product.querySelector('h3').textContent;
    const price = product.dataset.price;
    const image = product.querySelector('img').src;
    const rating = product.querySelector('.product-rating').innerHTML;

    modal.querySelector('.quick-view-image img').src = image;
    modal.querySelector('.product-name').textContent = name;
    modal.querySelector('.product-price').textContent = `$${price}`;
    modal.querySelector('.product-rating').innerHTML = rating;

    // Reset quantity
    modal.querySelector('.quantity-selector input').value = 1;

    // Update action buttons
    modal.querySelector('.add-to-cart-btn').onclick = () => {
        const quantity = parseInt(modal.querySelector('.quantity-selector input').value);
        addToCart(name, price, image, quantity);
    };
    modal.querySelector('.add-to-wishlist-btn').onclick = () => {
        addToWishlist(name, price, image);
    };

    modal.style.display = 'block';
}

function addToCart(name, price, image, quantity = 1) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ name, price, image, quantity });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartIcon();
    alert(`${quantity} ${name}${quantity > 1 ? 's' : ''} added to cart!`);
}

function addToWishlist(name, price, image) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    
    if (!wishlist.some(item => item.name === name)) {
        wishlist.push({ name, price, image });
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        updateWishlistIcon();
        alert(`${name} added to wishlist!`);
    } else {
        alert(`${name} is already in your wishlist.`);
    }
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Function to filter products based on category
function filterProducts(category) {
    const products = document.querySelectorAll('#product-grid .product');
    const categoryLinks = document.querySelectorAll('#category-list li');

    products.forEach(product => {
        const matchesCategory = (category === 'all' || product.dataset.category === category);
        // Use a display style consistent with the grid parent
        product.style.display = matchesCategory ? 'block' : 'none'; // 'block' works fine for grid items too
    });

    // Add/Remove 'active' class to highlight selected category
    categoryLinks.forEach(link => {
        // Check if the category matches the link's onclick attribute content
        // A more robust way would be to use data attributes on the links,
        // e.g., <li data-category="electronics" onclick="filterProducts('electronics')">
        if (link.getAttribute('onclick') === `filterProducts('${category}')`) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Function to add items to wishlist (using localStorage)
function addToWishlist(name, price, image) {
    console.log("Adding to wishlist:", { name, price, image }); // Debugging info
    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    const isAlreadyInWishlist = wishlist.some(item => item.name === name);

    if (!isAlreadyInWishlist) {
        // Ensure image path is relative to root if needed, e.g. remove initial '../' if present
        let imagePath = image;
        // if (imagePath.startsWith('../')) {
        //     imagePath = imagePath.substring(3); // Adjust based on actual structure
        // }

        wishlist.push({ name, price, image: imagePath }); // Store potentially adjusted path
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        alert(`${name} added to Wishlist!`);
        updateWishlistIcon(); // Update icon count
    } else {
        alert(`${name} is already in your Wishlist.`);
    }
    // Update wishlist icon count if you implement one
    // updateWishlistIconCount();
}

// --- Wishlist Icon Update Function --- (Needs access to the badge element)
// It's better if this is defined globally in script.js and called from here.
// If script.js loads first, this should work.
function updateWishlistIcon() {
        if (typeof window.updateWishlistIcon === 'function') {
             window.updateWishlistIcon();
        } else {
            console.warn("Global updateWishlistIcon function not available.");
            // Optional: Implement fallback here if needed, duplicating logic from script.js
            const wishlistItemCountBadge = document.getElementById('wishlist-item-count');
            const currentWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
             if (wishlistItemCountBadge) {
                if (currentWishlist.length > 0) {
                    wishlistItemCountBadge.textContent = currentWishlist.length;
                    wishlistItemCountBadge.style.display = 'inline-block';
                } else {
                   wishlistItemCountBadge.style.display = 'none';
                }
            }
        }
    }
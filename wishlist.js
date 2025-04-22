document.addEventListener("DOMContentLoaded", function() {
    console.log("Wishlist script loaded");

    const wishlistGrid = document.getElementById('wishlist-items-grid');
    const emptyMessage = document.querySelector('.empty-wishlist-message');

    // --- Function to load and display wishlist items ---
    function loadWishlistItems() {
        if (!wishlistGrid || !emptyMessage) {
            console.error("Wishlist grid or empty message element not found.");
            return;
        }

        const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        const cart = JSON.parse(localStorage.getItem('cart')) || []; // Get cart for checking status
        wishlistGrid.innerHTML = ''; // Clear current items before loading

        if (wishlist.length === 0) {
            emptyMessage.style.display = 'block'; // Show empty message
        } else {
            emptyMessage.style.display = 'none'; // Hide empty message

            wishlist.forEach((item, index) => {
                 let imagePath = item.image || 'Images/placeholder.jpg';
                 // Add path adjustment logic here if needed, e.g.:
                 // if (!imagePath.startsWith('http') && !imagePath.startsWith('Images/')) {
                 //     imagePath = `../${imagePath}`; // Assuming wishlist.html is root and images are stored relative to subfolders
                 // }

                const itemElement = document.createElement('div');
                itemElement.classList.add('wishlist-item');
                itemElement.dataset.itemName = item.name; // Store name for cart check
                itemElement.innerHTML = `
                    <img src="${imagePath}" alt="${item.name || 'Wishlist Item'}">
                    <h3>${item.name || 'Unknown Item'}</h3>
                    <p>${item.price || 'Price not available'}</p>
                    <div class="btn-actions">
                         <button class="btn-add-to-cart-wishlist" data-index="${index}" title="Add to Cart">
                            <i class='bx bx-cart-add'></i> Cart
                         </button>
                         <button class="btn-remove-wishlist" data-index="${index}" title="Remove from Wishlist">
                            <i class='bx bx-trash'></i> Remove
                         </button>
                    </div>
                `;

                // Check if item is already in cart and update button state
                const isInCart = cart.some(cartItem => cartItem.name === item.name);
                const addToCartBtn = itemElement.querySelector('.btn-add-to-cart-wishlist');
                if (isInCart && addToCartBtn) {
                    addToCartBtn.innerHTML = '<i class="bx bx-check"></i> Added';
                    addToCartBtn.disabled = true;
                    addToCartBtn.style.backgroundColor = '#aaa';
                    addToCartBtn.style.cursor = 'not-allowed';
                }

                wishlistGrid.appendChild(itemElement);
            });

            // Add event listeners AFTER items are appended
            addEventListenersToButtons();
        }

        // Always update the main sidebar icon using the global function
        if (typeof window.updateWishlistIcon === 'function') {
            window.updateWishlistIcon();
        } else {
             console.error("window.updateWishlistIcon is not defined. Ensure script.js loads first.");
        }
    }

    // --- Function to add event listeners to buttons ---
    function addEventListenersToButtons() {
        // Use event delegation on the grid container for efficiency
        wishlistGrid.addEventListener('click', function(event) {
            const removeButton = event.target.closest('.btn-remove-wishlist');
            const addButton = event.target.closest('.btn-add-to-cart-wishlist');

            if (removeButton) {
                handleRemoveClick(removeButton);
            } else if (addButton && !addButton.disabled) { // Only trigger if not disabled
                handleAddToCartClick(addButton);
            }
        });
    }

    // --- Event Handlers ---
    function handleRemoveClick(button) {
        const index = parseInt(button.getAttribute('data-index'));
        if (!isNaN(index)) {
            removeFromWishlist(index);
        }
    }

    function handleAddToCartClick(button) {
        const index = parseInt(button.getAttribute('data-index'));
        if (!isNaN(index)) {
            const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
            const itemToAdd = wishlist[index];
            if (itemToAdd) {
                if (addToCartFromWishlist(itemToAdd)) { // Check if added successfully
                    // Visual feedback
                    button.innerHTML = '<i class="bx bx-check"></i> Added';
                    button.disabled = true;
                    button.style.backgroundColor = '#aaa';
                    button.style.cursor = 'not-allowed';
                }
            }
        }
    }


    // --- Function to remove item from wishlist ---
    function removeFromWishlist(index) {
        let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        if (index >= 0 && index < wishlist.length) {
            const removedItemName = wishlist[index].name;
            wishlist.splice(index, 1);
            localStorage.setItem("wishlist", JSON.stringify(wishlist));
            console.log(`Removed ${removedItemName} from wishlist`);
            loadWishlistItems(); // Reload display which also updates icon
        }
    }

     // --- Function to add item to cart (from wishlist item data) ---
     // Returns true if added, false if already exists
     function addToCartFromWishlist(itemData) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const itemPrice = parseFloat(String(itemData.price || '0').replace(/[^0-9.]/g, '')) || 0;

        const isAlreadyInCart = cart.some(cartItem => cartItem.name === itemData.name);
        if(isAlreadyInCart) {
             alert(`${itemData.name} is already in your Cart!`);
             return false; // Indicate not added
        }

        cart.push({
            name: itemData.name || 'Unknown Item',
            price: itemPrice,
            imageSrc: itemData.image || 'Images/placeholder.jpg'
        });
        localStorage.setItem('cart', JSON.stringify(cart));
        localStorage.setItem('cartItemCount', cart.length);

        if (typeof window.updateCartIcon === 'function') {
            window.updateCartIcon();
        } else {
             console.error("window.updateCartIcon is not defined.");
        }

        alert(`${itemData.name} added to Cart!`);
        return true; // Indicate added successfully
     }


    // --- Initial load ---
    loadWishlistItems(); // Load items on page entry
    addEventListenersToButtons(); // Add initial listeners using delegation

}); // End of DOMContentLoaded
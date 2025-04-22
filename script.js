document.addEventListener("DOMContentLoaded", function() {
    console.log("Main script loaded successfully");

    // --- Element References ---
    const logoutButton = document.querySelector("#log_out");
    const welcomeTextElement = document.querySelector('.home-section .text');
    const scrollTopBtn = document.getElementById("scrollTopBtn"); // Get scroll button

    // --- Cart Icon Update Function ---
    function updateCartIcon() {
        const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartItemCountBadge = document.getElementById('cart-item-count');
        if (cartItemCountBadge) {
            if (currentCart.length > 0) {
                cartItemCountBadge.textContent = currentCart.length;
                cartItemCountBadge.style.display = 'inline-block';
            } else {
                cartItemCountBadge.style.display = 'none';
            }
        }
    }
    window.updateCartIcon = updateCartIcon;


    // --- Wishlist Icon Update Function ---
    function updateWishlistIcon() {
        const currentWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        const wishlistItemCountBadge = document.getElementById('wishlist-item-count');
        if (wishlistItemCountBadge) {
            if (currentWishlist.length > 0) {
                wishlistItemCountBadge.textContent = currentWishlist.length;
                wishlistItemCountBadge.classList.add('visible');
            } else {
                wishlistItemCountBadge.classList.remove('visible');
            }
        }
    }
    window.updateWishlistIcon = updateWishlistIcon;


    // --- Add to Cart Logic (Event Delegation) ---
    const productContainer = document.querySelector('.shop-items') || document.querySelector('#product-grid');
    productContainer?.addEventListener('click', function(event) {
        const cartButton = event.target.closest('.add-to-cart-btn');
        if (cartButton) {
            const item = cartButton.closest('.item') || cartButton.closest('.product');
            if (!item) return;

            const itemName = item.querySelector('h3')?.textContent || 'Unknown Item';
            const itemPriceText = item.querySelector('p')?.textContent || '0';
            const itemPrice = parseFloat(itemPriceText.replace(/[^0-9.]/g, '')) || 0;
            const itemImageElement = item.querySelector('img');
            const itemImageSrc = itemImageElement ? itemImageElement.getAttribute('src') : '';

            // Feedback animation
            const originalButtonText = cartButton.textContent;
            cartButton.textContent = 'Adding...'; // Indicate process
            cartButton.disabled = true;

            // Simulate adding (replace with actual logic if needed)
            setTimeout(() => {
                // Update cart data
                const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
                currentCart.push({ name: itemName, price: itemPrice, imageSrc: itemImageSrc });
                localStorage.setItem('cart', JSON.stringify(currentCart));
                localStorage.setItem('cartItemCount', currentCart.length);
                updateCartIcon();
                console.log(`Added to Cart: ${itemName}`);

                // Update button text after success
                cartButton.textContent = 'Added!';
                cartButton.style.backgroundColor = '#28a745'; // Success color

                // Revert after a delay (optional)
                // setTimeout(() => {
                //    if (cartButton.textContent === 'Added!') {
                //        cartButton.textContent = originalButtonText;
                //        cartButton.style.backgroundColor = '';
                //        cartButton.disabled = false;
                //    }
                // }, 1500);

            }, 300); // Short delay for feedback
        }
    });


     // --- Add to Wishlist Logic (Event Delegation) ---
     productContainer?.addEventListener('click', function(event) {
         const wishlistButton = event.target.closest('.add-to-wishlist-btn');
         if (wishlistButton) {
             if (wishlistButton.disabled) return;

             const item = wishlistButton.closest('.item') || wishlistButton.closest('.product');
             if (!item) return;

             const itemName = item.querySelector('h3')?.textContent || 'Unknown Item';
             const itemPriceText = item.querySelector('p')?.textContent || '0';
             const itemPrice = itemPriceText;
             const itemImageElement = item.querySelector('img');
             const itemImageSrc = itemImageElement ? itemImageElement.getAttribute('src') : '';

             addToWishlist(itemName, itemPrice, itemImageSrc, wishlistButton);
         }
     });


    // --- Shared addToWishlist Function ---
    function addToWishlist(name, price, image, buttonElement) {
        console.log("Adding to wishlist:", { name });
        let currentWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        const isAlreadyInWishlist = currentWishlist.some(item => item.name === name);

        if (!isAlreadyInWishlist) {
            currentWishlist.push({ name, price, image });
            localStorage.setItem("wishlist", JSON.stringify(currentWishlist));
            // Use a less intrusive confirmation? Maybe update button only.
            // alert(`${name} added to Wishlist!`);
            window.updateWishlistIcon();

             if (buttonElement) {
                 buttonElement.classList.add('in-wishlist');
                 buttonElement.innerHTML = "<i class='bx bxs-heart' style='color:white;'></i>";
                 buttonElement.disabled = true;
                 // Optional: Add tooltip or title change
                 buttonElement.title = "In Wishlist";
             }
        } else {
            // alert(`${name} is already in your Wishlist.`); // Avoid alert if button is disabled
        }
    }

     // --- Check Wishlist Status on Load for Items ---
     function checkInitialWishlistStatus() {
        const currentWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        document.querySelectorAll(".item .add-to-wishlist-btn, .product .add-to-wishlist-btn, .product button[onclick*='addToWishlist']").forEach(button => {
             const itemDiv = button.closest('.item') || button.closest('.product');
             if (!itemDiv) return;
             const itemName = itemDiv.querySelector('h3')?.textContent;
             if (itemName) {
                const isInWishlist = currentWishlist.some(item => item.name === itemName);
                if (isInWishlist) {
                    button.classList.add('in-wishlist');
                    if(button.querySelector('i')) button.innerHTML = "<i class='bx bxs-heart' style='color:white;'></i>";
                    else button.textContent = "In Wishlist";
                    button.disabled = true;
                    button.title = "In Wishlist"; // Update tooltip/title
                } else {
                     // Ensure button is in default state if not in wishlist
                     button.classList.remove('in-wishlist');
                      if(button.querySelector('i')) button.innerHTML = "<i class='bx bx-heart'></i>";
                     else button.textContent = "Add to Wishlist"; // Assuming default text
                     button.disabled = false;
                     button.title = "Add to Wishlist";
                }
             }
        });
     }


    // --- Logout Logic ---
    if (logoutButton) {
        logoutButton.addEventListener("click", function() {
            if (confirm("Are you sure you want to log out?")) {
                localStorage.removeItem('username');
                localStorage.removeItem('cart');
                localStorage.removeItem('cartItemCount');
                localStorage.removeItem('wishlist');
                alert("You have been logged out.");
                updateCartIcon();
                updateWishlistIcon();
                const pathPrefix = window.location.pathname.split('/').length > 2 ? '../' : '';
                window.location.href = `${pathPrefix}index.html`;
            }
        });
    }


    // --- Welcome Message ---
    const username = localStorage.getItem('username');
    if (welcomeTextElement) {
        if (username) {
            welcomeTextElement.textContent = `Welcome, ${username}`;
        } else {
            welcomeTextElement.textContent = 'Home'; // Default text
        }
    }


    // --- Sidebar Toggle Functionality ---
    let sidebar = document.querySelector(".sidebar");
    let closeBtn = document.querySelector("#btn");
    let searchInput = document.querySelector(".sidebar input[placeholder='Search...']");
    let searchIcon = searchInput ? searchInput.closest('li').querySelector('i.bx-search') : null;

    closeBtn?.addEventListener("click", () => {
        sidebar?.classList.toggle("open");
        menuBtnChange();
    });

    if(searchIcon) {
        searchIcon.style.cursor = 'pointer';
        searchIcon.addEventListener("click", () => {
            sidebar?.classList.toggle("open");
            menuBtnChange();
            if(sidebar?.classList.contains("open")) {
                // Delay focus slightly to ensure input is visible after transition
                setTimeout(() => searchInput?.focus(), 500);
            }
        });
    }

    function menuBtnChange() {
        if (!sidebar || !closeBtn) return;
        if (sidebar.classList.contains("open")) {
            closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");
        } else {
            closeBtn.classList.replace("bx-menu-alt-right", "bx-menu");
        }
    }

    // --- Scroll-to-Top Button Logic ---
    function handleScroll() {
        if (scrollTopBtn) {
            if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
                scrollTopBtn.style.display = "block";
                 // Trigger fade-in (optional, can use CSS transitions)
                 // requestAnimationFrame(() => scrollTopBtn.style.opacity = '0.8');
            } else {
                 scrollTopBtn.style.display = "none";
                // scrollTopBtn.style.opacity = '0';
            }
        }
    }

    function scrollToTop() {
        window.scrollTo({top: 0, behavior: 'smooth'});
    }

    // Add scroll listener
    window.addEventListener('scroll', handleScroll);
    // Add click listener to the button
    scrollTopBtn?.addEventListener('click', scrollToTop);


    // --- Initial Setup Calls ---
    // Use minimal timeout to ensure DOM is fully ready
    setTimeout(() => {
        menuBtnChange();
        updateCartIcon();
        updateWishlistIcon();
        checkInitialWishlistStatus();
        // Check initial scroll position for scroll-to-top button
        handleScroll();
        console.log("Initial setup complete.");
    }, 50);

}); // End of DOMContentLoaded
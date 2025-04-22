document.addEventListener("DOMContentLoaded", function() {
    console.log("Order page script loaded successfully");

    // --- Element References ---
    const placeOrderBtn = document.querySelector(".btn-place-order");
    const cancelOrderBtn = document.querySelector(".btn-cancel");
    const orderItemsContainer = document.querySelector('.order-items');
    const orderTotalElement = document.querySelector('.order-total');
    const orderForm = document.querySelector("form"); // Assuming one main form for shipping/payment

    // Input Fields
    const nameInput = document.getElementById('name');
    const addressInput = document.getElementById('address');
    const phoneInput = document.getElementById('phone');
    const cardNameInput = document.getElementById('card-name');
    const cardNumberInput = document.getElementById('card-number');
    const expiryDateInput = document.getElementById('expiry-date');
    const cvvInput = document.getElementById('cvv');
    const paymentMethodRadios = document.querySelectorAll('input[name="payment"]');
    const creditCardDetailsDiv = document.querySelector('.credit-card-details'); // Get the container

    // Error Spans (Ensure these IDs exist in your HTML next to inputs)
    const nameError = document.getElementById('name-error');
    const addressError = document.getElementById('address-error');
    const phoneError = document.getElementById('phone-error');
    const cardNameError = document.getElementById('card-name-error');
    const cardNumberError = document.getElementById('card-number-error');
    const expiryDateError = document.getElementById('expiry-date-error');
    const cvvError = document.getElementById('cvv-error');

    // --- Validation Helper Functions ---
    function showError(inputElement, errorElement, message) {
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block'; // Show error message
        }
        if (inputElement) inputElement.classList.add('invalid');
    }

    function clearError(inputElement, errorElement) {
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none'; // Hide error message
        }
        if (inputElement) inputElement.classList.remove('invalid');
    }

    // --- Specific Validation Functions ---
    function validateRequired(inputElement, errorElement, fieldName) {
        clearError(inputElement, errorElement);
        if (!inputElement || inputElement.value.trim() === '') {
            showError(inputElement, errorElement, `${fieldName} is required.`);
            return false;
        }
        return true;
    }

    function validatePhone(inputElement, errorElement) {
        if (!validateRequired(inputElement, errorElement, 'Phone Number')) return false;
        // Basic Ghana mobile format check (allows optional +233, starts with 0, then 2/3/5)
        const phoneRegex = /^(?:\+?233|0)?(?:[235]\d{8})$/;
        if (inputElement && !phoneRegex.test(inputElement.value.replace(/\s|-/g, ''))) {
            showError(inputElement, errorElement, 'Enter a valid Ghana phone number (e.g., 024xxxxxxx).');
            return false;
        }
        return true;
    }

    function validateCardNumber(inputElement, errorElement) {
        if (!validateRequired(inputElement, errorElement, 'Card Number')) return false;
        // Basic check for 13-16 digits
        const cardNumberRegex = /^\d{13,16}$/;
        if (inputElement && !cardNumberRegex.test(inputElement.value.replace(/\s/g, ''))) {
            showError(inputElement, errorElement, 'Enter a valid 13-16 digit card number.');
            return false;
        }
        // Basic Luhn algorithm check (optional but recommended for real use)
        if (inputElement && !luhnCheck(inputElement.value.replace(/\s/g, ''))) {
             showError(inputElement, errorElement, 'Card number seems invalid.');
             return false;
        }
        return true;
    }

    // Basic Luhn algorithm implementation
    function luhnCheck(val) {
        let sum = 0;
        let shouldDouble = false;
        for (let i = val.length - 1; i >= 0; i--) {
            let digit = parseInt(val.charAt(i));
            if (shouldDouble) {
                if ((digit *= 2) > 9) digit -= 9;
            }
            sum += digit;
            shouldDouble = !shouldDouble;
        }
        return (sum % 10) === 0;
    }


    function validateExpiryDate(inputElement, errorElement) {
        if (!validateRequired(inputElement, errorElement, 'Expiry Date')) return false;
        const expiryRegex = /^(0[1-9]|1[0-2])\/?(\d{2})$/; // MM/YY or MMYY
        const match = inputElement ? inputElement.value.match(expiryRegex) : null;
        if (!match) {
            showError(inputElement, errorElement, 'Use MM/YY format.');
            return false;
        }
        const month = parseInt(match[1], 10);
        const year = parseInt(`20${match[2]}`, 10); // Assume 20xx
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        // Check if the year is in the past or the current year but month is in the past
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            showError(inputElement, errorElement, 'Card has expired.');
            return false;
        }
        return true;
    }

    function validateCVV(inputElement, errorElement) {
        if (!validateRequired(inputElement, errorElement, 'CVV')) return false;
        const cvvRegex = /^\d{3,4}$/; // 3 or 4 digits
        if (inputElement && !cvvRegex.test(inputElement.value)) {
            showError(inputElement, errorElement, 'Enter a valid 3 or 4 digit CVV.');
            return false;
        }
        return true;
    }

    // --- Master Validation Function ---
    function validateForm() {
        // Clear all previous errors first
        document.querySelectorAll('.error-message').forEach(span => span.style.display = 'none');
        document.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));

        let isValid = true;
        isValid &= validateRequired(nameInput, nameError, 'Full Name');
        isValid &= validateRequired(addressInput, addressError, 'Shipping Address');
        isValid &= validatePhone(phoneInput, phoneError);

        let selectedPaymentMethod = document.querySelector('input[name="payment"]:checked')?.value;

        if (selectedPaymentMethod === 'credit') {
            isValid &= validateRequired(cardNameInput, cardNameError, 'Name on Card');
            isValid &= validateCardNumber(cardNumberInput, cardNumberError);
            isValid &= validateExpiryDate(expiryDateInput, expiryDateError);
            isValid &= validateCVV(cvvInput, cvvError);
        } else {
            // Clear potential card errors if a different method is selected
            clearError(cardNameInput, cardNameError);
            clearError(cardNumberInput, cardNumberError);
            clearError(expiryDateInput, expiryDateError);
            clearError(cvvInput, cvvError);
        }
        console.log("Form validation result:", isValid);
        return !!isValid; // Ensure boolean return
    }

    // --- Toggle Credit Card Details Visibility ---
    function toggleCreditCardDetails() {
        const selectedPaymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
        if (creditCardDetailsDiv) {
            creditCardDetailsDiv.style.display = (selectedPaymentMethod === 'credit') ? 'block' : 'none';
        }
    }

    // Add event listeners to payment radio buttons
    paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', toggleCreditCardDetails);
    });


    // --- Cart Display Function ---
    function displayOrderItems() {
        if (!orderItemsContainer || !orderTotalElement) {
             console.error("Order items or total container not found.");
             if(placeOrderBtn) placeOrderBtn.disabled = true;
             return;
        }

        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        orderItemsContainer.innerHTML = ''; // Clear existing

        if (cart.length === 0) {
            orderItemsContainer.innerHTML = '<p>Your cart is empty. Add items from the shop!</p>';
            orderTotalElement.innerHTML = `
                <p>Subtotal: <span>GH₵0.00</span></p>
                <p>Shipping: <span>GH₵0.00</span></p>
                <h3>Total: <span>GH₵0.00</span></h3>
            `;
            if(placeOrderBtn) placeOrderBtn.disabled = true; // Disable order button if cart empty
            return;
        }

        let subtotal = 0;
        cart.forEach((item, index) => {
            const itemPrice = parseFloat(item.price) || 0;
            // Adjust path relative to order page (if needed)
            let imagePath = item.imageSrc || '../Images/placeholder.jpg';
             if (imagePath && !imagePath.startsWith('../') && !imagePath.startsWith('http')) {
                 imagePath = '../' + imagePath; // Prepend ../ if path is relative to root
             }

            const itemElement = document.createElement('div');
            itemElement.classList.add('order-item');
            // ADDED ICON to remove button HTML
            itemElement.innerHTML = `
                <img src="${imagePath}" alt="${item.name || 'Product Image'}">
                <div class="item-details">
                    <h3>${item.name || 'Unknown Item'}</h3>
                    <p>Price: GH₵${itemPrice.toFixed(2)}</p>
                    <button class="remove-item-btn" data-index="${index}" aria-label="Remove ${item.name || 'item'}">
                         <i class='bx bx-trash'></i> Remove
                    </button>
                </div>
            `;
            orderItemsContainer.appendChild(itemElement);
            subtotal += itemPrice;
        });

        // Add remove item functionality using event delegation on the container
        orderItemsContainer.addEventListener('click', function(event) {
             if (event.target.classList.contains('remove-item-btn') || event.target.closest('.remove-item-btn')) {
                const button = event.target.closest('.remove-item-btn');
                const itemIndex = parseInt(button.getAttribute('data-index'));
                if (!isNaN(itemIndex)) {
                    const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
                    if (confirm(`Remove ${currentCart[itemIndex]?.name || 'this item'} from cart?`)) {
                         currentCart.splice(itemIndex, 1); // Remove item
                         localStorage.setItem('cart', JSON.stringify(currentCart));
                         localStorage.setItem('cartItemCount', currentCart.length);
                         displayOrderItems(); // Re-render cart display
                         if (typeof window.updateCartIcon === 'function') {
                            window.updateCartIcon(); // Update main sidebar icon
                         }
                    }
                }
             }
        });


        const shippingCost = subtotal > 0 ? 5.99 : 0; // Example fixed shipping
        const total = subtotal + shippingCost;

        // Updated total display with spans for potential styling
        orderTotalElement.innerHTML = `
            <p>Subtotal: <span>GH₵${subtotal.toFixed(2)}</span></p>
            <p>Shipping: <span>GH₵${shippingCost.toFixed(2)}</span></p>
            <h3>Total: <span>GH₵${total.toFixed(2)}</span></h3>
        `;
        if(placeOrderBtn) placeOrderBtn.disabled = false; // Enable order button
    }

    // --- Event Listeners ---
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener("click", function(event) {
            event.preventDefault();
            console.log("Place order clicked");

            if (validateForm()) {
                console.log("Form is valid, confirming order...");
                // Simulate order placement
                placeOrderBtn.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> Placing..."; // Loading state
                placeOrderBtn.disabled = true;
                cancelOrderBtn.disabled = true;

                setTimeout(() => { // Simulate network delay
                    if (confirm("Confirm Order Submission?")) {
                        alert("Order placed successfully! Thank you for shopping.");
                        localStorage.removeItem('cart'); // Clear cart
                        localStorage.removeItem('cartItemCount'); // Clear count
                         // Redirect to home page
                        window.location.href = "../index.html";
                    } else {
                         // Re-enable buttons if confirmation failed
                         placeOrderBtn.innerHTML = "<i class='bx bx-check-shield'></i> Place Order";
                         placeOrderBtn.disabled = false;
                         cancelOrderBtn.disabled = false;
                    }
                }, 1500); // 1.5 second delay simulation

            } else {
                console.log("Form is invalid.");
                alert("Please correct the errors highlighted in the form before placing the order.");
                // Scroll to the first invalid field
                const firstError = document.querySelector('.invalid');
                firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError?.focus();
            }
        });
    } else {
        console.error("Place Order button not found.");
    }

    if (cancelOrderBtn) {
        cancelOrderBtn.addEventListener("click", function() {
            if (confirm("Are you sure you want to cancel this order and return to the shop?")) {
                alert("Order cancelled");
                // Optionally clear form fields or leave them
                window.location.href = "../index.html"; // Redirect to home
            }
        });
    }

    // --- Real-time Validation Listeners (on blur) ---
    nameInput?.addEventListener('blur', () => validateRequired(nameInput, nameError, 'Full Name'));
    addressInput?.addEventListener('blur', () => validateRequired(addressInput, addressError, 'Shipping Address'));
    phoneInput?.addEventListener('blur', () => validatePhone(phoneInput, phoneError));
    // Only add card validation listeners if the elements exist
    if (cardNameInput) cardNameInput.addEventListener('blur', () => document.querySelector('input[name="payment"]:checked')?.value === 'credit' && validateRequired(cardNameInput, cardNameError, 'Name on Card'));
    if (cardNumberInput) cardNumberInput.addEventListener('blur', () => document.querySelector('input[name="payment"]:checked')?.value === 'credit' && validateCardNumber(cardNumberInput, cardNumberError));
    if (expiryDateInput) expiryDateInput.addEventListener('blur', () => document.querySelector('input[name="payment"]:checked')?.value === 'credit' && validateExpiryDate(expiryDateInput, expiryDateError));
    if (cvvInput) cvvInput.addEventListener('blur', () => document.querySelector('input[name="payment"]:checked')?.value === 'credit' && validateCVV(cvvInput, cvvError));


    // --- Initial Setup Calls ---
    displayOrderItems(); // Display cart items on load
    toggleCreditCardDetails(); // Show/hide CC details based on initial selection


    // --- Sidebar Toggle Functionality (Copied from main script - Ensure consistency) ---
    // Note: Assumes sidebar HTML structure is identical and script.js is loaded
    let sidebar = document.querySelector(".sidebar");
    let closeBtn = document.querySelector("#btn");

    closeBtn?.addEventListener("click", () => {
        sidebar?.classList.toggle("open");
        menuBtnChange();
    });
    // Removed search button logic as it might not be relevant/present here

    function menuBtnChange() {
        if (!sidebar || !closeBtn) return;
        if (sidebar.classList.contains("open")) {
            closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");
        } else {
            closeBtn.classList.replace("bx-menu-alt-right", "bx-menu");
        }
    }
    menuBtnChange(); // Set initial state for sidebar button icon

}); // End DOMContentLoaded
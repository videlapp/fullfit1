// Inicializar AOS
AOS.init();

// Base de datos de productos
const products = [
    {
        id: 1,
        name: "Whey Protein Premium",
        price: 29.99,
        category: "suplementos",
        image: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500",
        description: "Proteína de suero de leche de alta calidad"
    },
    {
        id: 2,
        name: "Pre-Workout Explosive",
        price: 34.99,
        category: "suplementos",
        image: "https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=500",
        description: "Máxima energía para tu entrenamiento"
    },
    {
        id: 3,
        name: "BCAA Complex",
        price: 24.99,
        category: "suplementos",
        image: "https://images.unsplash.com/photo-1557142046-c704a3adf364?w=500",
        description: "Aminoácidos esenciales para recuperación"
    },
    {
        id: 4,
        name: "Camiseta Deportiva",
        price: 19.99,
        category: "ropa",
        image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
        description: "Camiseta transpirable para entrenamiento"
    },
    {
        id: 5,
        name: "Guantes de Entrenamiento",
        price: 15.99,
        category: "accesorios",
        image: "https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?w=500",
        description: "Guantes con soporte para muñeca"
    }
];

// Configuración del carrito
const SHIPPING_THRESHOLD = 50; // Envío gratis a partir de $50
const SHIPPING_COST = 5; // Costo de envío base

// Inicializar carrito
let cart = JSON.parse(localStorage.getItem('cart')) || {
    items: [],
    total: 0
};

// Función para mostrar productos
function displayProducts(productsToShow = products) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    productsGrid.innerHTML = productsToShow.map(product => `
        <div class="col-md-4 mb-4" data-aos="fade-up">
            <div class="card product-card h-100">
                <div class="product-image">
                    <img src="${product.image}" class="card-img-top" alt="${product.name}">
                    <div class="product-overlay">
                        <button class="btn btn-primary" onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                            Añadir al Carrito
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">${product.description}</p>
                    <p class="card-text"><strong>$${product.price.toFixed(2)}</strong></p>
                </div>
            </div>
        </div>
    `).join('');
}

// Función para actualizar el carrito
function updateCart() {
    const emptyCartElement = document.getElementById('emptyCart');
    const cartContentElement = document.getElementById('cartContent');
    const cartItemsElement = document.getElementById('cartItems');
    const cartCountElement = document.getElementById('cartCount');
    const cartSubtotalElement = document.getElementById('cartSubtotal');
    const cartShippingElement = document.getElementById('cartShipping');
    const cartTotalElement = document.getElementById('cartTotal');
    const checkoutButton = document.getElementById('checkoutButton');

    // Calcular totales
    const subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const total = subtotal + shipping;

    // Actualizar contador del carrito
    if (cartCountElement) {
        const totalItems = cart.items.reduce((count, item) => count + item.quantity, 0);
        cartCountElement.textContent = totalItems;
        cartCountElement.style.display = totalItems > 0 ? 'inline' : 'none';
    }

    // Mostrar carrito vacío o con productos
    if (emptyCartElement && cartContentElement) {
        if (cart.items.length === 0) {
            emptyCartElement.style.display = 'block';
            cartContentElement.style.display = 'none';
        } else {
            emptyCartElement.style.display = 'none';
            cartContentElement.style.display = 'block';
        }
    }

    // Actualizar items en el carrito
    if (cartItemsElement) {
        cartItemsElement.innerHTML = cart.items.map(item => `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${item.image}" alt="${item.name}" 
                             style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">
                        <div>
                            <h6 class="mb-0">${item.name}</h6>
                            <small class="text-muted">${item.category}</small>
                        </div>
                    </div>
                </td>
                <td>$${item.price.toFixed(2)}</td>
                <td>
                    <div class="input-group input-group-sm" style="width: 100px;">
                        <button class="btn btn-outline-secondary" type="button" 
                                onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <input type="number" class="form-control text-center" value="${item.quantity}" 
                               onchange="updateQuantity(${item.id}, this.value)">
                        <button class="btn btn-outline-secondary" type="button" 
                                onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                </td>
                <td>$${(item.price * item.quantity).toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Actualizar totales
    if (cartSubtotalElement) cartSubtotalElement.textContent = subtotal.toFixed(2);
    if (cartShippingElement) {
        cartShippingElement.textContent = shipping.toFixed(2);
        if (shipping === 0) {
            cartShippingElement.parentElement.innerHTML += ' <span class="badge bg-success">¡Envío Gratis!</span>';
        }
    }
    if (cartTotalElement) cartTotalElement.textContent = total.toFixed(2);

    // Habilitar/deshabilitar botón de checkout
    if (checkoutButton) {
        checkoutButton.disabled = cart.items.length === 0;
    }

    // Guardar en localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Función para actualizar cantidad
function updateQuantity(productId, newQuantity) {
    newQuantity = parseInt(newQuantity);
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }

    const item = cart.items.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        updateCart();
        showNotification('Cantidad actualizada');
    }
}

// Función para añadir al carrito
function addToCart(product) {
    const existingItem = cart.items.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.items.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCart();
    showNotification(`${product.name} añadido al carrito`);
}

// Función para eliminar del carrito
function removeFromCart(productId) {
    const itemIndex = cart.items.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        const removedItem = cart.items[itemIndex];
        cart.items.splice(itemIndex, 1);
        updateCart();
        showNotification(`${removedItem.name} eliminado del carrito`);
    }
}

// Función para filtrar productos
function filterProducts() {
    let filteredProducts = [...products];
    
    // Filtrar por búsqueda
    const searchTerm = document.getElementById('searchProducts')?.value.toLowerCase();
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filtrar por categoría
    const selectedCategories = Array.from(document.querySelectorAll('.filter-category:checked'))
        .map(checkbox => checkbox.value);
    if (selectedCategories.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
            selectedCategories.includes(product.category)
        );
    }
    
    // Filtrar por precio
    const maxPrice = document.getElementById('priceRange')?.value || 200;
    filteredProducts = filteredProducts.filter(product => product.price <= maxPrice);
    
    // Ordenar
    const sortValue = document.getElementById('sortBy')?.value;
    if (sortValue) {
        switch(sortValue) {
            case 'price-low':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }
    }
    
    displayProducts(filteredProducts);
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                           type === 'error' ? 'exclamation-circle' : 
                           'info-circle'}"></i>
        </div>
        <div class="notification-message">${message}</div>
    `;
    document.body.appendChild(notification);
    
    // Animación de entrada
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar productos y carrito
    displayProducts();
    updateCart();
    
    // Event listeners para filtros
    document.getElementById('searchProducts')?.addEventListener('input', filterProducts);
    document.getElementById('sortBy')?.addEventListener('change', filterProducts);
    document.getElementById('priceRange')?.addEventListener('input', (e) => {
        document.getElementById('priceValue').textContent = `$${e.target.value}`;
        filterProducts();
    });
    document.querySelectorAll('.filter-category').forEach(checkbox => {
        checkbox.addEventListener('change', filterProducts);
    });
    
    // Event listener para el botón del carrito
    document.getElementById('cartButton')?.addEventListener('click', () => {
        const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
        cartModal.show();
    });
    
    // Event listener para checkout
    document.getElementById('checkoutButton')?.addEventListener('click', () => {
        if (cart.items.length === 0) {
            showNotification('El carrito está vacío', 'error');
            return;
        }
        
        showNotification('Procesando tu compra...', 'success');
        setTimeout(() => {
            cart.items = [];
            updateCart();
            const modal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
            modal.hide();
            showNotification('¡Compra realizada con éxito!', 'success');
        }, 2000);
    });
});
// Funciones mejoradas para el buscador
function applySearch(term) {
    const searchInput = document.getElementById('searchProducts');
    searchInput.value = term;
    filterProducts();
    showSearchResults();
}

function showSearchResults() {
    const searchTerm = document.getElementById('searchProducts').value.toLowerCase();
    const searchResults = document.getElementById('searchResults');
    const resultCount = document.getElementById('resultCount');
    const quickResults = document.getElementById('quickResults');
    const searchSuggestions = document.getElementById('searchSuggestions');

    if (searchTerm) {
        // Filtrar productos
        const filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );

        // Mostrar resultados
        searchResults.classList.remove('d-none');
        searchSuggestions.classList.add('d-none');
        resultCount.textContent = filteredProducts.length;

        // Mostrar resultados rápidos
        if (quickResults) {
            quickResults.innerHTML = filteredProducts
                .slice(0, 5)
                .map(product => `
                    <div class="list-group-item list-group-item-action">
                        <div class="d-flex align-items-center">
                            <img src="${product.image}" alt="${product.name}" 
                                 style="width: 50px; height: 50px; object-fit: cover; margin-right: 15px;">
                            <div>
                                <h6 class="mb-0">${product.name}</h6>
                                <small class="text-muted">${product.category} - $${product.price}</small>
                            </div>
                        </div>
                    </div>
                `).join('');
        }
    } else {
        searchResults.classList.add('d-none');
        searchSuggestions.classList.remove('d-none');
    }

    filterProducts();
}

// Event Listeners para el buscador mejorado
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchProducts');
    const clearButton = document.getElementById('clearSearch');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            showSearchResults();
            clearButton.style.display = searchInput.value ? 'block' : 'none';
        });
    }

    if (clearButton) {
        clearButton.addEventListener('click', () => {
            searchInput.value = '';
            showSearchResults();
            clearButton.style.display = 'none';
            document.getElementById('searchResults').classList.add('d-none');
            document.getElementById('searchSuggestions').classList.remove('d-none');
            filterProducts();
        });
    }
});
// Función para manejar la búsqueda desde el navbar
function handleNavbarSearch() {
    const searchTerm = document.getElementById('navbarSearch').value;
    if (searchTerm) {
        // Si estamos en index.html
        if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
            window.location.href = 'pages/productos.html?search=' + encodeURIComponent(searchTerm);
        } 
        // Si estamos en productos.html
        else {
            const searchInput = document.getElementById('searchProducts');
            if (searchInput) {
                searchInput.value = searchTerm;
                filterProducts();
                showSearchResults();
            }
        }
    }
}

// Verificar si hay término de búsqueda en la URL al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Código existente del DOMContentLoaded...

    // Añadir esto para manejar búsquedas desde el index
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('search');
    
    if (searchTerm) {
        const searchInput = document.getElementById('searchProducts');
        const navbarSearch = document.getElementById('navbarSearch');
        
        if (searchInput) {
            searchInput.value = searchTerm;
            filterProducts();
            showSearchResults();
        }
        
        if (navbarSearch) {
            navbarSearch.value = searchTerm;
        }
    }

    // Añadir evento para la tecla Enter en el buscador del navbar
    const navbarSearch = document.getElementById('navbarSearch');
    if (navbarSearch) {
        navbarSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleNavbarSearch();
            }
        });
    }
});
// Efecto de scroll en el navbar
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.padding = '0.3rem 0';
    } else {
        navbar.style.padding = '0.5rem 0';
    }
});
// Función para manejar los filtros de categoría
function handleCategoryFilter(category) {
    // Remover clase active de todos los botones
    document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.classList.remove('active');
    });

    // Añadir clase active al botón seleccionado
    const selectedButton = document.querySelector(`[data-filter="${category}"]`);
    if (selectedButton) {
        selectedButton.classList.add('active');
    }

    // Filtrar productos
    let filteredProducts;
    if (category === 'todos') {
        filteredProducts = [...products];
    } else {
        filteredProducts = products.filter(product => product.category === category);
    }

    // Mostrar productos filtrados
    displayProducts(filteredProducts);
}

// Agregar event listeners a los botones de filtro
document.addEventListener('DOMContentLoaded', function() {
    // Agregar listeners a los botones de filtro
    document.querySelectorAll('[data-filter]').forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-filter');
            handleCategoryFilter(category);
        });
    });

    // Mostrar todos los productos inicialmente
    displayProducts(products);
});
// Función mejorada para mostrar notificaciones
function showNotification(message, type = 'success') {
    const toast = document.getElementById(type === 'success' ? 'successToast' : 'errorToast');
    const messageElement = document.getElementById(type === 'success' ? 'successToastMessage' : 'errorToastMessage');
    
    if (toast && messageElement) {
        messageElement.textContent = message;
        const bsToast = new bootstrap.Toast(toast, {
            animation: true,
            autohide: true,
            delay: 3000
        });
        bsToast.show();
    }
}

// Función mejorada para añadir al carrito
function addToCart(product) {
    const existingItem = cart.items.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
        showNotification(`Se aumentó la cantidad de ${product.name} en tu carrito`);
    } else {
        cart.items.push({
            ...product,
            quantity: 1
        });
        showNotification(`${product.name} añadido al carrito`);
    }
    
    updateCart();
}

// Función mejorada para eliminar del carrito
function removeFromCart(productId) {
    const itemIndex = cart.items.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        const removedItem = cart.items[itemIndex];
        cart.items.splice(itemIndex, 1);
        updateCart();
        showNotification(`${removedItem.name} eliminado del carrito`, 'error');
    }
}

// Función mejorada para actualizar cantidad
function updateQuantity(productId, newQuantity) {
    newQuantity = parseInt(newQuantity);
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }

    const item = cart.items.find(item => item.id === productId);
    if (item) {
        const oldQuantity = item.quantity;
        item.quantity = newQuantity;
        updateCart();
        if (newQuantity > oldQuantity) {
            showNotification(`Se aumentó la cantidad de ${item.name}`);
        } else if (newQuantity < oldQuantity) {
            showNotification(`Se redujo la cantidad de ${item.name}`);
        }
    }
}

// Inicializar los toasts cuando el documento esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar todos los toasts
    const toasts = document.querySelectorAll('.toast');
    toasts.forEach(toast => {
        new bootstrap.Toast(toast, {
            animation: true,
            autohide: true,
            delay: 3000
        });
    });
});

// Manejar evento de clic en el botón de checkout
document.addEventListener('DOMContentLoaded', function() {
    const checkoutButton = document.getElementById('checkoutButton');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function() {
            const cartData = JSON.parse(localStorage.getItem('cart')) || { items: [], total: 0 };
            
            // Verificar si hay productos en el carrito
            if (cartData.items.length === 0) {
                alert('Tu carrito está vacío. Agrega productos antes de finalizar la compra.');
                return;
            }
            
            // Sincronizar cartItems para compatibilidad con la página de checkout
            localStorage.setItem('cartItems', JSON.stringify(cartData.items));
            
            // Redirigir a la página de checkout
            // Comprobar si ya estamos en una página dentro de 'pages' o en la raíz
            const isInPagesDir = window.location.pathname.includes('/pages/');
            if (isInPagesDir) {
                window.location.href = 'checkout.html';
            } else {
                window.location.href = 'pages/checkout.html';
            }
        });
    }
});
// Unity Ads Configuration
const unityAdsConfig = {
    gameId: '5801296', // Unity Ads Game ID
    bannerPlacementId: 'banner', // Banner placement ID
    testMode: false // Set to false for production
};

// Initialize Unity Ads
function initializeUnityAds() {
    if (typeof UnityAds !== 'undefined') {
        // Initialize Unity Ads
        UnityAds.init(unityAdsConfig.gameId, unityAdsConfig.testMode, {
            onInitialized: () => {
                console.log('Unity Ads initialized successfully');
                // Wait for initialization to complete before showing banner
                setTimeout(() => {
                    UnityAds.setBannerPlacement(unityAdsConfig.bannerPlacementId);
                    UnityAds.showBanner();
                }, 1000);
            },
            onError: (error) => {
                console.error('Unity Ads initialization failed:', error);
            }
        });
    } else {
        console.error('Unity Ads SDK not loaded');
    }
}

// Load Unity Ads SDK
function loadUnityAdsSDK() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.unityads.unity3d.com/unity-ads.min.js';
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Initialize Unity Ads when SDK is loaded
loadUnityAdsSDK()
    .then(() => {
        console.log('Unity Ads SDK loaded successfully');
        initializeUnityAds();
    })
    .catch(error => {
        console.error('Failed to load Unity Ads SDK:', error);
    });

// DOM Elements
const wallets = document.querySelectorAll('.wallet');
const filterButtons = document.querySelectorAll('.filter-btn');
const cashInBtn = document.getElementById('cashInBtn');
const cashOutBtn = document.getElementById('cashOutBtn');
const transactionModal = document.getElementById('transactionModal');
const closeModal = document.getElementById('closeModal');
const transactionForm = document.getElementById('transactionForm');
const transactionsContainer = document.getElementById('transactions');
const modalTitle = document.getElementById('modalTitle');

// State
let currentWallet = 'Main Wallet';
let currentFilter = 'All';
let transactions = [];

// Category Management
let categories = ['salary', 'business', 'food', 'transport', 'shopping'];
const categoryList = document.getElementById('categoryList');
const addCategoryBtn = document.getElementById('addCategoryBtn');

// Create category modal
const categoryModal = document.createElement('div');
categoryModal.className = 'category-modal';
categoryModal.innerHTML = `
    <div class="category-modal-content">
        <h3>Add New Category</h3>
        <input type="text" id="newCategoryName" placeholder="Enter category name">
        <div class="category-modal-buttons">
            <button class="cancel-btn" id="cancelCategoryBtn">Cancel</button>
            <button class="save-btn" id="saveCategoryBtn">Save</button>
        </div>
    </div>
`;
document.body.appendChild(categoryModal);

// Event Listeners
wallets.forEach(wallet => {
    wallet.addEventListener('click', () => {
        wallets.forEach(w => w.classList.remove('active'));
        wallet.classList.add('active');
        currentWallet = wallet.querySelector('h3').textContent;
        updateTransactions();
    });
});

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentFilter = button.textContent;
        updateTransactions();
    });
});

cashInBtn.addEventListener('click', () => {
    modalTitle.textContent = 'Cash In';
    transactionForm.dataset.type = 'income';
    openModal();
});

cashOutBtn.addEventListener('click', () => {
    modalTitle.textContent = 'Cash Out';
    transactionForm.dataset.type = 'expense';
    openModal();
});

closeModal.addEventListener('click', closeModalHandler);

transactionForm.addEventListener('submit', handleTransactionSubmit);

// Functions
function openModal() {
    transactionModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModalHandler() {
    transactionModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    transactionForm.reset();
}

function handleTransactionSubmit(e) {
    e.preventDefault();
    
    const type = transactionForm.dataset.type;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    
    const transaction = {
        id: Date.now(),
        type,
        amount,
        category,
        description,
        wallet: currentWallet,
        date: new Date().toISOString()
    };
    
    transactions.push(transaction);
    updateWalletBalance();
    updateTransactions();
    closeModalHandler();
}

function updateWalletBalance() {
    const currentWalletElement = document.querySelector('.wallet.active');
    const balanceElement = currentWalletElement.querySelector('.balance');
    
    const walletTransactions = transactions.filter(t => t.wallet === currentWallet);
    const balance = walletTransactions.reduce((total, t) => {
        return total + (t.type === 'income' ? t.amount : -t.amount);
    }, 0);
    
    balanceElement.textContent = `৳${balance.toFixed(2)}`;
}

function updateTransactions() {
    transactionsContainer.innerHTML = '';
    
    let filteredTransactions = transactions.filter(t => t.wallet === currentWallet);
    
    if (currentFilter !== 'All') {
        const now = new Date();
        filteredTransactions = filteredTransactions.filter(t => {
            const transactionDate = new Date(t.date);
            switch (currentFilter) {
                case 'Week':
                    return now - transactionDate <= 7 * 24 * 60 * 60 * 1000;
                case 'Month':
                    return now.getMonth() === transactionDate.getMonth() && 
                           now.getFullYear() === transactionDate.getFullYear();
                case 'Year':
                    return now.getFullYear() === transactionDate.getFullYear();
                default:
                    return true;
            }
        });
    }
    
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    filteredTransactions.forEach(transaction => {
        const transactionElement = document.createElement('div');
        transactionElement.className = 'transaction-item';
        
        const date = new Date(transaction.date).toLocaleDateString();
        
        transactionElement.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-category">${transaction.category}</div>
                <div class="transaction-description">${transaction.description}</div>
                <div class="transaction-date">${date}</div>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${transaction.type === 'income' ? '+' : '-'}৳${transaction.amount.toFixed(2)}
            </div>
        `;
        
        transactionsContainer.appendChild(transactionElement);
    });
}

// Update category list in select and display
function updateCategoryList() {
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    
    categoryList.innerHTML = '';
    
    categories.forEach(category => {
        // Add to select
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categorySelect.appendChild(option);
        
        // Add to category list display
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        categoryItem.innerHTML = `
            <span>${category.charAt(0).toUpperCase() + category.slice(1)}</span>
            <button class="delete-category-btn" data-category="${category}">
                <i class="fas fa-times"></i>
            </button>
        `;
        categoryList.appendChild(categoryItem);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const categoryToDelete = e.target.closest('.delete-category-btn').dataset.category;
            deleteCategory(categoryToDelete);
        });
    });
}

// Add new category
function addCategory(name) {
    if (name && !categories.includes(name.toLowerCase())) {
        categories.push(name.toLowerCase());
        updateCategoryList();
    }
}

// Delete category
function deleteCategory(category) {
    categories = categories.filter(c => c !== category);
    updateCategoryList();
}

// Event Listeners for category management
addCategoryBtn.addEventListener('click', () => {
    categoryModal.style.display = 'block';
    document.getElementById('newCategoryName').focus();
});

document.getElementById('cancelCategoryBtn').addEventListener('click', () => {
    categoryModal.style.display = 'none';
    document.getElementById('newCategoryName').value = '';
});

document.getElementById('saveCategoryBtn').addEventListener('click', () => {
    const newCategory = document.getElementById('newCategoryName').value.trim();
    if (newCategory) {
        addCategory(newCategory);
        categoryModal.style.display = 'none';
        document.getElementById('newCategoryName').value = '';
    }
});

// Close category modal when clicking outside
categoryModal.addEventListener('click', (e) => {
    if (e.target === categoryModal) {
        categoryModal.style.display = 'none';
        document.getElementById('newCategoryName').value = '';
    }
});

// Initialize category list
updateCategoryList();

// Initialize
updateTransactions(); 
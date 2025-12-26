// Configuration
const SERVICE_FEE = 20;

// DOM elements
const guestsInput = document.getElementById('guests');
const roomTypeSelect = document.getElementById('roomType');
const calculateButton = document.getElementById('calculatePrice');
const priceDisplay = document.getElementById('priceDisplay');
const roomPriceElement = document.getElementById('roomPrice');
const serviceFeeElement = document.getElementById('serviceFee');
const totalPriceElement = document.getElementById('totalPrice');
const finalPriceElement = document.getElementById('finalPrice');
const apiStatusElement = document.getElementById('apiStatus');
const testConnectionButton = document.getElementById('testConnection');

// Google Sheets configuration elements
const sheetIdInput = document.getElementById('sheetId');
const apiKeyInput = document.getElementById('apiKey');
const sheetRangeInput = document.getElementById('sheetRange');

// Cache for fetched prices
let priceCache = {};
let lastFetchTime = 0;
const CACHE_DURATION = 300000; // 5 minutes

// Default configuration (you can pre-fill these)
const DEFAULT_CONFIG = {
    sheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms', // Example sheet
    apiKey: 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY', // Example key
    range: 'Sheet1!A1:D10'
};

// Load saved configuration
function loadConfig() {
    const savedSheetId = localStorage.getItem('hotelSheetId');
    const savedApiKey = localStorage.getItem('hotelApiKey');
    const savedRange = localStorage.getItem('hotelRange');
    
    sheetIdInput.value = savedSheetId || DEFAULT_CONFIG.sheetId;
    apiKeyInput.value = savedApiKey || DEFAULT_CONFIG.apiKey;
    sheetRangeInput.value = savedRange || DEFAULT_CONFIG.range;
}

// Save configuration
function saveConfig() {
    localStorage.setItem('hotelSheetId', sheetIdInput.value);
    localStorage.setItem('hotelApiKey', apiKeyInput.value);
    localStorage.setItem('hotelRange', sheetRangeInput.value);
}

// Fetch room price from Google Sheets
async function fetchPriceFromGoogleSheets(roomCode) {
    const sheetId = sheetIdInput.value.trim();
    const apiKey = apiKeyInput.value.trim();
    const range = sheetRangeInput.value.trim();
    
    if (!sheetId || !apiKey || !range) {
        throw new Error('Please configure Google Sheets API settings first');
    }
    
    // Check cache
    const cacheKey = `${sheetId}-${range}`;
    const now = Date.now();
    
    if (priceCache[cacheKey] && (now - lastFetchTime) < CACHE_DURATION) {
        console.log('Using cached prices');
        return findPriceInData(priceCache[cacheKey], roomCode);
    }
    
    // Build the Google Sheets API URL
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
    
    // Show loading status
    apiStatusElement.textContent = 'Fetching prices from Google Sheets...';
    apiStatusElement.className = 'status loading';
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.values || data.values.length === 0) {
            throw new Error('No data found in the specified range');
        }
        
        // Cache the data
        priceCache[cacheKey] = data.values;
        lastFetchTime = now;
        
        // Update status
        apiStatusElement.textContent = `Prices loaded successfully (${data.values.length} rows)`;
        apiStatusElement.className = 'status success';
        
        // Find the price for the requested room
        return findPriceInData(data.values, roomCode);
        
    } catch (error) {
        apiStatusElement.textContent = `Error: ${error.message}`;
        apiStatusElement.className = 'status error';
        throw error;
    }
}

// Find price in Google Sheets data
function findPriceInData(sheetData, roomCode) {
    // Try to find room code in first column
    for (let i = 0; i < sheetData.length; i++) {
        const row = sheetData[i];
        if (row[0] && row[0].trim().toUpperCase() === roomCode.toUpperCase()) {
            // Try to find price in the row (check different columns)
            for (let j = 1; j < row.length; j++) {
                const priceMatch = row[j]?.match(/(\d+\.?\d*)/);
                if (priceMatch) {
                    return parseFloat(priceMatch[1]);
                }
            }
        }
    }
    
    // Fallback: Use default prices if not found
    const defaultPrices = {
        'A': 800,
        'B': 1000,
        'C': 1500,
        'D': 1800
    };
    
    return defaultPrices[roomCode] || 1000;
}

// Calculate and display the total price
async function calculateTotalPrice() {
    const guests = parseInt(guestsInput.value) || 1;
    const roomCode = roomTypeSelect.value;
    
    // Show loading state
    calculateButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching from Google Sheets...';
    calculateButton.disabled = true;
    priceDisplay.style.display = 'none';
    
    try {
        // Fetch the base room price from Google Sheets
        const basePrice = await fetchPriceFromGoogleSheets(roomCode);
        
        // Calculate total
        const totalPrice = basePrice + SERVICE_FEE;
        
        // Update the display
        roomPriceElement.textContent = `$${basePrice.toFixed(2)}`;
        serviceFeeElement.textContent = `$${SERVICE_FEE.toFixed(2)}`;
        totalPriceElement.textContent = `$${totalPrice.toFixed(2)}`;
        finalPriceElement.textContent = `$${totalPrice.toFixed(2)}`;
        
        // Show the price display
        priceDisplay.style.display = 'block';
        
        // Update button text
        calculateButton.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Price';
        
        // Log for debugging
        console.log(`Price calculated: Base $${basePrice} + Service $${SERVICE_FEE} = Total $${totalPrice}`);
    } catch (error) {
        console.error('Error fetching room price:', error);
        
        // Show error to user
        apiStatusElement.textContent = `Error: ${error.message}. Using default price.`;
        apiStatusElement.className = 'status error';
        
        // Use default price as fallback
        const defaultPrices = {
            'A': 800,
            'B': 1000,
            'C': 1500,
            'D': 1800
        };
        
        const basePrice = defaultPrices[roomCode] || 1000;
        const totalPrice = basePrice + SERVICE_FEE;
        
        roomPriceElement.textContent = `$${basePrice.toFixed(2)}`;
        serviceFeeElement.textContent = `$${SERVICE_FEE.toFixed(2)}`;
        totalPriceElement.textContent = `$${totalPrice.toFixed(2)}`;
        finalPriceElement.textContent = `$${totalPrice.toFixed(2)}`;
        priceDisplay.style.display = 'block';
        
        calculateButton.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Try Again';
    } finally {
        calculateButton.disabled = false;
    }
}

// Test Google Sheets connection
async function testConnection() {
    saveConfig();
    
    try {
        apiStatusElement.textContent = 'Testing connection to Google Sheets...';
        apiStatusElement.className = 'status loading';
        
        // Try to fetch a small range to test connection
        const testData = await fetchPriceFromGoogleSheets('A');
        
        apiStatusElement.textContent = `Connection successful! Sample price: $${testData}`;
        apiStatusElement.className = 'status success';
        
        // Auto-calculate price after successful connection
        setTimeout(calculateTotalPrice, 500);
        
    } catch (error) {
        apiStatusElement.textContent = `Connection failed: ${error.message}`;
        apiStatusElement.className = 'status error';
    }
}

// Handle booking confirmation
function confirmBooking() {
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    
    if (!fullName || !email) {
        alert('Please fill in your name and email to confirm booking.');
        return;
    }
    
    const roomType = roomTypeSelect.options[roomTypeSelect.selectedIndex].text;
    const guests = guestsInput.value;
    const totalPrice = totalPriceElement.textContent;
    
    alert(`Booking confirmed for ${guests} guest(s) in ${roomType}!\nTotal: ${totalPrice}\nConfirmation will be sent to ${email}`);
    
    // Reset form
    document.getElementById('fullName').value = '';
    document.getElementById('email').value = '';
    document.getElementById('arrivalDate').value = '';
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set default arrival date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('arrivalDate').valueAsDate = tomorrow;
    
    // Load saved configuration
    loadConfig();
    
    // Event listeners
    calculateButton.addEventListener('click', calculateTotalPrice);
    testConnectionButton.addEventListener('click', testConnection);
    document.getElementById('confirmBooking').addEventListener('click', confirmBooking);
    
    // Save config when inputs change
    sheetIdInput.addEventListener('change', saveConfig);
    apiKeyInput.addEventListener('change', saveConfig);
    sheetRangeInput.addEventListener('change', saveConfig);
    
    // Auto-calculate price on room type change
    roomTypeSelect.addEventListener('change', calculateTotalPrice);
    
    // Show initial instructions
    apiStatusElement.textContent = 'Configure Google Sheets API to get started';
    apiStatusElement.className = 'status';
    
    // Auto-test connection if config exists
    if (sheetIdInput.value && apiKeyInput.value) {
        setTimeout(testConnection, 1000);
    }
});
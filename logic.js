
        // Mock API to simulate fetching room prices
        // In production, replace this with a real API call
        const mockRoomPrices = {
            'standard': { basePrice: 800, name: 'Standard Room' },
            'deluxe': { basePrice: 1000, name: 'Deluxe Room' },
            'suite': { basePrice: 1500, name: 'Executive Suite' },
            'family': { basePrice: 1800, name: 'Family Suite' }
        };
        
        // Service fee (fixed)
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
        const confirmBookingButton = document.getElementById('confirmBooking');
        const arrivalTimeElement = document.getElementById('arrivalTime');
        
        // Simulate fetching room price from API
        function fetchRoomPrice(roomType) {
            // In production, replace this with:
            // fetch('https://your-api-endpoint.com/room-price')
            //   .then(response => response.json())
            //   .then(data => data.price)
            
            // For demo, simulate API delay
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(mockRoomPrices[roomType].basePrice);
                }, 300);
            });
        }
        
        // Calculate and display the total price
        async function calculateTotalPrice() {
            const guests = parseInt(guestsInput.value) || 1;
            const roomType = roomTypeSelect.value;
            
            // Show loading state
            calculateButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';
            calculateButton.disabled = true;
            
            try {
                // Fetch the base room price (simulated API call)
                const basePrice = await fetchRoomPrice(roomType);
                
                // Calculate total
                const totalPrice = basePrice + SERVICE_FEE;
                
                // Update the display
                roomPriceElement.textContent = `$${basePrice}`;
                serviceFeeElement.textContent = `$${SERVICE_FEE}`;
                totalPriceElement.textContent = `$${totalPrice}`;
                finalPriceElement.textContent = `$${totalPrice}`;
                
                // Show the price display
                priceDisplay.style.display = 'block';
                
                // Update button text
                calculateButton.innerHTML = '<i class="fas fa-sync-alt"></i> Recalculate Price';
                
                // Log for debugging
                console.log(`Price calculated: Base $${basePrice} + Service $${SERVICE_FEE} = Total $${totalPrice}`);
            } catch (error) {
                console.error('Error fetching room price:', error);
                alert('Unable to fetch room price. Please try again.');
            } finally {
                calculateButton.disabled = false;
            }
        }
        
        // Generate random arrival time (for demo purposes)
        function updateArrivalTime() {
            const times = ['30 minutes', '45 minutes', '1 hour', '1 hour 15 minutes', '1.5 hours'];
            const randomTime = times[Math.floor(Math.random() * times.length)];
            arrivalTimeElement.textContent = randomTime;
        }
        
        // Handle booking confirmation
        function confirmBooking() {
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            
            if (!fullName || !email) {
                alert('Please fill in your name and email to confirm booking.');
                return;
            }
            
            const roomType = roomTypeSelect.value;
            const roomName = mockRoomPrices[roomType].name;
            const guests = guestsInput.value;
            const totalPrice = totalPriceElement.textContent;
            
            // In production, this would send data to your backend
            alert(`Booking confirmed for ${guests} guest(s) in ${roomName}!\nTotal: ${totalPrice}\nConfirmation will be sent to ${email}\n\nNote: This is a demo. Tomorrow we'll connect to your Excel data.`);
            
            // Reset form for demo purposes
            document.getElementById('fullName').value = '';
            document.getElementById('email').value = '';
            document.getElementById('phone').value = '';
            document.getElementById('arrivalDate').value = '';
            document.getElementById('specialRequests').value = '';
        }
        
        // Event listeners
        calculateButton.addEventListener('click', calculateTotalPrice);
        confirmBookingButton.addEventListener('click', confirmBooking);
        
        // Initialize the demo
        document.addEventListener('DOMContentLoaded', function() {
            // Set default arrival date to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            document.getElementById('arrivalDate').valueAsDate = tomorrow;
            
            // Set initial arrival time
            updateArrivalTime();
            
            // Calculate initial price
            calculateTotalPrice();
            
            // Update arrival time every 30 seconds for demo effect
            setInterval(updateArrivalTime, 30000);
            
            // Log instructions for tomorrow's integration
            console.log('DEMO INSTRUCTIONS FOR TOMORROW:');
            console.log('1. Replace fetchRoomPrice() function with actual API call to your backend');
            console.log('2. The API should return the base price for the selected room type');
            console.log('3. The system will automatically add $20 service fee');
            console.log('4. Connect to your Excel sheet via backend API');
        });
document.getElementById('analyze-btn').addEventListener('click', async () => {
    const feelingText = document.getElementById('feeling-text').value;
    const predictionOutput = document.getElementById('prediction-output');
    
    // --- Step 1: Prepare the UI ---
    // Hide all recommendation sections before starting a new analysis
    const recommendationSections = document.querySelectorAll('.recommendation');
    recommendationSections.forEach(el => el.classList.add('hidden'));

    if (!feelingText.trim()) {
        predictionOutput.textContent = 'Please enter how you are feeling.';
        return;
    }

    const API_ENDPOINT = 'https://mental-wellness-analyzer.onrender.com/predict'; 

    predictionOutput.textContent = 'Analyzing... Please wait.';

    try {
        // --- Step 2: Make the API Call ---
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: feelingText }) 
        });

        if (!response.ok) {
            const errorBody = await response.text(); 
            throw new Error(`HTTP error! Status: ${response.status}. Response: ${errorBody.substring(0, 100)}...`);
        }

        const data = await response.json();
        
        // --- Step 3: Process the Prediction ---
        let prediction = data.prediction || data.state;
        
        if (!prediction) {
             throw new Error("API response is missing the 'prediction' or 'state' key.");
        }

        // 1. Convert to lowercase: 'High risk' -> 'high risk'
        prediction = prediction.toLowerCase(); 

        // 2. Sanitize to get the core state (high, low, stable)
        // This ensures 'high risk' becomes 'high', 'stable' becomes 'stable', etc.
        const sanitizedPrediction = prediction.replace(/[^a-z0-9]/g, ' ').trim().split(' ')[0];

        // Display the prediction text using the sanitized prediction for the CSS class
        predictionOutput.innerHTML = `**Assessment Result:** <span class="state-${sanitizedPrediction}">${prediction.charAt(0).toUpperCase() + prediction.slice(1)}</span>`;

        // --- Step 4: Show the Correct Recommendation ---
        const recommendationId = `recommendation-${sanitizedPrediction}`;
        const recommendationElement = document.getElementById(recommendationId);
        
        if (recommendationElement) {
            // Remove the 'hidden' class to make the section visible
            recommendationElement.classList.remove('hidden');
        } else {
            // This error should now only occur if the model returns something completely unexpected (e.g., 'neutral')
            predictionOutput.innerHTML += `<br><small style="color:red;">Error: Unknown prediction state received: ${prediction}</small>`;
        }

    } catch (error) {
        // --- Step 5: Handle Errors ---
        console.error('Error analyzing mental state:', error);
        predictionOutput.textContent = 'Error: Could not complete analysis. Check the console for API connection issues or HTTP errors.';
    }
});
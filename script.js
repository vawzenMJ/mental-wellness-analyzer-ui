document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('mental-state-form');
    // Target container for the prediction text output
    const predictionOutputContainer = document.getElementById('prediction-output-container'); 
    
    // --- Configuration ---
    // The specific Render URL provided by the user
    const API_ENDPOINT = 'https://mental-wellness-analyzer.onrender.com/prdict;'

    // Get all recommendation divs
    const highRecommendation = document.getElementById('recommendation-high');
    const lowRecommendation = document.getElementById('recommendation-low');
    const stableRecommendation = document.getElementById('recommendation-stable');

    // Function to hide all recommendations and clear output
    const hideAllRecommendations = () => {
        highRecommendation.classList.add('hidden');
        lowRecommendation.classList.add('hidden');
        stableRecommendation.classList.add('hidden');
        predictionOutputContainer.innerHTML = ''; 
    };

    // Function to display the correct recommendation based on the prediction string
    const displayRecommendation = (predictionText) => {
        hideAllRecommendations();

        let recommendationElement = null;
        let riskLevel = predictionText;

        // 1. Populate the analysis result text container
        predictionOutputContainer.innerHTML = `
            <div class="analysis-result-box">
                <h2>✅ Analysis Complete</h2>
                <p>Your estimated mental state is: <strong>${riskLevel}</strong></p>
            </div>
        `;

        // 2. The prediction text from the ML model determines the display
        const text = predictionText.toLowerCase();
        
        if (text.includes('high risk') || text.includes('severe')) {
            recommendationElement = highRecommendation;
        } else if (text.includes('stable') || text.includes('low risk') || text.includes('minimal')) {
            recommendationElement = lowRecommendation;
        } else {
            // Catches Mild, Moderate, or other intermediate states
            recommendationElement = stableRecommendation;
        }
        
        // 3. Display the results and scroll to them
        if (recommendationElement) {
            recommendationElement.classList.remove('hidden');
            recommendationElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        hideAllRecommendations();
        
        // Show loading message
        predictionOutputContainer.innerHTML = `
            <div class="loading-message">
                <p>Analyzing... Please wait. Connecting to the remote analysis service.</p>
            </div>
        `;

        const formData = new FormData(form);
        const inputData = {};

        // --- Validation and Data Prep ---
        for (const [key, value] of formData.entries()) {
            // Basic validation: Ensure all questions are answered
            if (value === "") {
                predictionOutputContainer.innerHTML = '<p style="color: red; text-align: center;">Please answer all questions before analyzing.</p>';
                return;
            }
            // Convert to integer as expected by the ML model
            inputData[key] = parseInt(value, 10);
        }

        // --- API Call ---
        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(inputData),
            });

            if (!response.ok) {
                // Handle non-200 responses (e.g., 404, 500)
                throw new Error(`API call failed with status: ${response.status}`);
            }

            const data = await response.json();
            
            // Assume the API returns the prediction text in a key like 'prediction' or 'state'
            const resultKey = data.prediction || data.state || 'Unknown State';
            
            displayRecommendation(resultKey);

        } catch (error) {
            console.error('Error fetching prediction:', error);
            predictionOutputContainer.innerHTML = `
                <div class="error-message">
                    <h2>Analysis Error</h2>
                    <p>Could not connect to the analysis service. Check the API link or the browser console for details.</p>
                </div>
            `;
        }
    });
});
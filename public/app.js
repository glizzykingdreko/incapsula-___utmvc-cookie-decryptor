// Load saved data on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check URL parameters first
    const urlParams = new URLSearchParams(window.location.search);
    const cookieFromUrl = urlParams.get('__utmvc');
    const keyFromUrl = urlParams.get('decryptionKey');

    if (cookieFromUrl || keyFromUrl) {
        // If URL parameters exist, use them
        if (cookieFromUrl) document.getElementById('cookie').value = cookieFromUrl;
        if (keyFromUrl) document.getElementById('script').value = keyFromUrl;
        
        // Auto-analyze if both parameters are present
        if (cookieFromUrl && keyFromUrl) {
            document.getElementById('analyze').click();
        }
    } else {
        // If no URL parameters, try localStorage
        const savedCookie = localStorage.getItem('savedCookie');
        const savedScript = localStorage.getItem('savedScript');
        
        if (savedCookie) document.getElementById('cookie').value = savedCookie;
        if (savedScript) document.getElementById('script').value = savedScript;
    }
});

// Analyze button click handler
document.getElementById('analyze').addEventListener('click', async () => {
    const analyzeBtn = document.getElementById('analyze');
    const cookie = document.getElementById('cookie').value;
    const script = document.getElementById('script').value;

    if (!cookie || !script) {
        showError('Please provide both cookie and script values');
        clearUrlParams();
        return;
    }

    // Clear previous results
    clearResults();

    // Save to localStorage
    localStorage.setItem('savedCookie', cookie);
    localStorage.setItem('savedScript', script);

    // Show loading state
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';

    try {
        const response = await fetch('/decrypt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cookie, script })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        displayResults(data);
        // Update URL with the cookie and decryption key
        updateUrlParams(cookie, data.decryptionKey || script);
    } catch (error) {
        showError(error.message);
        clearUrlParams();
    } finally {
        // Reset button state
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analyze';
    }
});

// Copy button functionality
document.getElementById('copy-decoded').addEventListener('click', async () => {
    const decodedText = document.getElementById('details').textContent;
    const btn = document.getElementById('copy-decoded');
    
    try {
        await navigator.clipboard.writeText(decodedText);
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        btn.classList.add('copied', 'copy-feedback');
        showSuccess('Decrypted cookie copied to clipboard');
        
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-copy"></i> Copy';
            btn.classList.remove('copied', 'copy-feedback');
        }, 2000);
    } catch (err) {
        showError('Failed to copy text');
    }
});

// Copy analysis button functionality
document.getElementById('copy-analysis').addEventListener('click', async () => {
    const analysisData = {};
    const examinedValues = document.querySelectorAll('.examined-value');
    
    examinedValues.forEach(value => {
        const key = value.querySelector('strong').textContent;
        const val = value.querySelector('span').textContent;
        analysisData[key] = val === 'Not Available' ? null : val;
    });
    
    const formattedJson = JSON.stringify(analysisData, null, 4);
    const btn = document.getElementById('copy-analysis');
    
    try {
        await navigator.clipboard.writeText(formattedJson);
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        btn.classList.add('copied', 'copy-feedback');
        showSuccess('Analysis copied to clipboard');
        
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-copy"></i> Copy';
            btn.classList.remove('copied', 'copy-feedback');
        }, 2000);
    } catch (err) {
        showError('Failed to copy analysis');
    }
});

function displayResults(data) {
    const results = document.getElementById('results');
    results.classList.add('active');

    // Display details
    const decodedData = typeof data.details === 'object' 
        ? JSON.stringify(data.details, null, 2)
        : data.details;
    document.getElementById('details').textContent = decodedData;

    // Handle encryption key if present
    if (data['decryptionKey']) {
        const scriptInput = document.getElementById('script');
        scriptInput.value = data['decryptionKey'];
        localStorage.setItem('savedScript', data['decryptionKey']);
        
        // Add visual feedback
        scriptInput.style.transition = 'background-color 0.3s ease';
        scriptInput.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
        setTimeout(() => {
            scriptInput.style.backgroundColor = '';
        }, 1500);
    }

    // Display examined values
    const examinedContainer = document.getElementById('examined');
    examinedContainer.innerHTML = '';

    Object.entries(data.examinated).forEach(([key, value]) => {
        const div = document.createElement('div');
        div.className = 'examined-value';
        div.innerHTML = `
            <strong>${key}</strong>
            <span>${value === null ? 'Not Available' : value}</span>
        `;
        examinedContainer.appendChild(div);
    });
}

// Create toast container if it doesn't exist
function getToastContainer() {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'toast error';
    toast.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        ${message}
    `;
    getToastContainer().appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => {
            toast.remove();
            // Remove container if it's empty
            const container = document.querySelector('.toast-container');
            if (container && !container.hasChildNodes()) {
                container.remove();
            }
        }, 300);
    }, 3000);
}

function showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        ${message}
    `;
    getToastContainer().appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => {
            toast.remove();
            // Remove container if it's empty
            const container = document.querySelector('.toast-container');
            if (container && !container.hasChildNodes()) {
                container.remove();
            }
        }, 300);
    }, 3000);
}

// Function to clear previous results
function clearResults() {
    const results = document.getElementById('results');
    const details = document.getElementById('details');
    const examined = document.getElementById('examined');

    // Clear content
    details.textContent = '';
    examined.innerHTML = '';

    // Hide results section with fade out
    if (results.classList.contains('active')) {
        results.style.opacity = '0';
        results.style.transform = 'translateY(20px)';
        setTimeout(() => {
            results.classList.remove('active');
            results.style.removeProperty('opacity');
            results.style.removeProperty('transform');
        }, 300);
    }
}

function updateUrlParams(cookie, key) {
    const url = new URL(window.location);
    
    // Update URL parameters
    if (cookie) url.searchParams.set('__utmvc', cookie);
    if (key) url.searchParams.set('decryptionKey', key);
    
    // Update browser history without reloading
    window.history.pushState({}, '', url);
}

function clearUrlParams() {
    const url = new URL(window.location);
    url.searchParams.delete('__utmvc');
    url.searchParams.delete('decryptionKey');
    window.history.pushState({}, '', url);
} 
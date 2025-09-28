// Service worker for Apply Anywhere extension
console.log('Apply Anywhere extension background script loaded');

chrome.runtime.onInstalled.addListener((details) => {
  console.log('Apply Anywhere extension installed:', details.reason);
  
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.local.set({
      extensionEnabled: true,
      allowedDomains: []
    });
  }
});

// Future: Add message routing, domain allow-list logic, and telemetry

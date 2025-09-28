# Apply Anywhere - Chrome Extension

A Chrome extension that automatically fills job application forms across multiple platforms including LinkedIn Easy Apply, Greenhouse, Lever, and Workday.

## Features

- **Multi-Platform Support**: Works with LinkedIn Easy Apply, Greenhouse, Lever, Workday, and generic forms
- **Secure Profile Storage**: Encrypts your profile data locally with a passphrase
- **Smart Field Matching**: Automatically detects and matches form fields using AI-powered matching
- **Confirmation Panel**: Shows you what will be filled before confirming
- **Voluntary Disclosures**: Always asks for confirmation before filling demographic information
- **Never Auto-Submits**: You always have final control over form submission

## Installation

1. **Build the Extension**:
   ```bash
   npm install
   npm run build
   ```

2. **Load in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from this project

3. **Pin the Extension**:
   - Click the puzzle piece icon in Chrome toolbar
   - Pin "Apply Anywhere" for easy access

## Usage

### Setting Up Your Profile

1. Click the Apply Anywhere extension icon
2. Fill in your personal information:
   - First Name, Last Name
   - Email Address, Phone Number
   - Work Authorization status
   - Voluntary disclosures (optional)
3. Set a passphrase for encryption
4. Click "Save Profile"

### Using the Extension

1. Navigate to any job application page
2. The extension will automatically detect form fields
3. A confirmation panel will appear showing what will be filled
4. Review and edit values if needed
5. Click "Confirm & Fill" to fill the form
6. Complete any remaining steps manually and submit

## Supported Platforms

- **LinkedIn Easy Apply**: Detects modals and dynamic content
- **Greenhouse**: Handles standard application forms
- **Lever**: Supports common field patterns
- **Workday**: Waits for dynamic content to load
- **Generic Forms**: Works with any standard HTML form

## Development

### Running Tests

```bash
# Unit tests
npm test

# E2E tests (requires mock server)
npm run serve:mocks  # In one terminal
npm run test:e2e     # In another terminal
```

### Development Build

```bash
npm run dev  # Watches for changes and rebuilds
```

## Security

- All profile data is encrypted locally using AES-GCM
- No data is transmitted to external servers
- Passphrase is required to encrypt/decrypt profile data
- Clear data option available in popup

## Privacy

- Extension only runs on job application pages
- No tracking or analytics
- All data stays on your device
- No network requests except for the job application sites

## Troubleshooting

**Extension not working?**
- Check that the extension is enabled in Chrome
- Refresh the page and try again
- Check browser console for errors

**Fields not being detected?**
- Some sites may have custom field names
- Try refreshing the page
- Check if the site is supported

**Panel not appearing?**
- Make sure you're on a job application page
- Check that form fields are visible
- Try scrolling to make sure fields are in view

## File Structure

```
apply-anywhere-ext/
├── src/
│   ├── background.ts          # Service worker
│   ├── content/               # Content script files
│   │   ├── content.ts         # Main orchestrator
│   │   ├── dom.ts            # DOM utilities
│   │   ├── matcher.ts        # Field matching logic
│   │   ├── fill.ts           # Form filling logic
│   │   ├── panel.ts          # Confirmation panel UI
│   │   ├── crypto.ts         # Encryption utilities
│   │   └── adapters/         # Site-specific adapters
│   ├── popup/                # React popup UI
│   └── types.ts              # TypeScript definitions
├── tests/                    # Unit and E2E tests
├── dist/                     # Built extension files
└── manifest.json             # Chrome extension manifest
```

## License

MIT License - see LICENSE file for details

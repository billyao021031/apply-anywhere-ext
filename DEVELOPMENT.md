# Development Guide

## Auto-Update Extension During Development

### Method 1: Watch Mode (Recommended)
```bash
npm run build:watch
```
This will automatically rebuild the extension whenever you make changes to the source code.

### Method 2: Manual Rebuild
```bash
npm run build
```
Then refresh the extension in Chrome.

## How to Refresh Extension in Chrome

1. **Go to Extensions Page**: `chrome://extensions/`
2. **Find Your Extension**: Look for "Apply Anywhere"
3. **Click Refresh Button**: Click the circular refresh icon next to your extension
4. **Test Changes**: Navigate to a job application page to test

## Development Workflow

1. **Start Watch Mode**:
   ```bash
   npm run build:watch
   ```

2. **Load Extension in Chrome**:
   - Go to `chrome://extensions/`
   - Enable Developer mode
   - Click "Load unpacked"
   - Select the `dist` folder

3. **Make Changes**:
   - Edit files in `src/`
   - Watch the terminal for build completion

4. **Refresh Extension**:
   - Click the refresh button in Chrome extensions page
   - Or reload the page you're testing on

5. **Test Changes**:
   - Navigate to job application pages
   - Check browser console for logs
   - Test the extension popup

## Debugging Tips

### Check Console Logs
- Open Chrome DevTools (F12)
- Go to Console tab
- Look for "Apply Anywhere:" messages

### Check Extension Errors
- Go to `chrome://extensions/`
- Click "Errors" button next to your extension
- Check for any build or runtime errors

### Test on Mock Pages
```bash
npm run serve:mocks
```
Then visit `http://localhost:3000/greenhouse.html`

## Common Issues

### Extension Not Loading
- Check that all files are in `dist/` folder
- Verify `manifest.json` is present
- Check Chrome extensions page for errors

### Changes Not Appearing
- Make sure you're running `npm run build:watch`
- Refresh the extension in Chrome
- Clear browser cache if needed

### Profile Not Loading
- Make sure you've saved your profile in the popup
- Check that passphrase is correct
- Look for error messages in console

## File Structure for Development

```
src/
├── background.ts          # Service worker
├── content/               # Content scripts
│   ├── content.ts         # Main orchestrator
│   ├── dom.ts            # DOM utilities
│   ├── matcher.ts        # Field matching
│   ├── fill.ts           # Form filling
│   ├── panel.ts          # Confirmation panel
│   ├── crypto.ts         # Encryption
│   └── adapters/         # Site-specific code
├── popup/                # React popup UI
│   ├── main.tsx          # Popup entry point
│   └── ProfileEditor.tsx # Profile management
└── types.ts              # TypeScript definitions
```

## Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
# Terminal 1: Start mock server
npm run serve:mocks

# Terminal 2: Run E2E tests
npm run test:e2e
```

## Building for Production

```bash
npm run build
```

This creates optimized files in the `dist/` folder ready for distribution.

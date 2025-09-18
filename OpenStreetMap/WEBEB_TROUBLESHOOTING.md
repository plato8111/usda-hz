# WeWeb Element Loading Issues - Troubleshooting Guide

## Problem: Old Version Loading Instead of New Version

This is a common issue with WeWeb elements where the platform caches previous versions. Here's how to resolve it:

## Immediate Solutions

### 1. Force Rebuild and Clear Cache

```bash
# Clean rebuild
npm run rebuild

# Or manually:
rm -rf dist
npm run build
```

### 2. Version Increment
Always increment the version number in `package.json` when making changes:

```json
{
  "name": "OpenStreetMap",
  "version": "0.0.3",  // Increment this number
  ...
}
```

### 3. Clear WeWeb Cache
In WeWeb editor:
1. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Clear browser cache**: Developer tools → Application → Clear storage
3. **Re-add element**: Remove and re-add the element from the library

### 4. Check Build Output
Verify the build is creating updated files:

```bash
# Check if dist folder has recent timestamp
ls -la dist/

# Check build timestamp
stat dist/manager.js
```

## Common Causes and Solutions

### Cause 1: WeWeb CDN Cache
**Solution**: Wait 5-10 minutes after build, then refresh

### Cause 2: Browser Cache
**Solution**: 
- Open in incognito/private mode
- Clear browser cache completely
- Try different browser

### Cause 3: Element Library Cache
**Solution**:
1. Go to WeWeb **Elements** section
2. Find your OpenStreetMap element
3. Click **Update** or **Refresh**
4. Re-add to your page

### Cause 4: Version Conflicts
**Solution**:
- Ensure version in `package.json` matches `weweb.config.js`
- Check for multiple versions in WeWeb library

## Build Process Verification

### Step 1: Verify Build Success
```bash
npm run build
# Should show: "Component Path : "./src/wwElement.vue"
```

### Step 2: Check Distribution Files
```bash
ls -la dist/
# Should contain: manager.js, *.png files
```

### Step 3: Verify File Contents
```bash
# Check if your changes are in the built file
grep -i "user" dist/manager.js
# Should find references to user configuration
```

## WeWeb Integration Steps

### 1. Proper Build Command
Always use the correct build command:
```bash
npx weweb build name=OpenStreetMap type=wwobject
```

### 2. Element Registration
Ensure your element is properly registered in WeWeb:
- Check **Elements** library in WeWeb
- Verify element name matches exactly
- Look for version number in element details

### 3. Page Integration
When adding to page:
1. **Remove old element** completely
2. **Refresh element library**
3. **Add fresh element** from library
4. **Reconfigure all properties**

## Advanced Troubleshooting

### Check Element Configuration
Verify `ww-config.js` has proper structure:
```javascript
export default {
  editor: {
    label: {
      en: "OpenStreetMap",
    },
  },
  properties: {
    // Your properties here
  }
}
```

### Debug Mode
Enable debug mode in your element:
1. Set `showDebug: true` in element properties
2. Check browser console for loading messages
3. Look for version information in debug panel

### Network Tab Inspection
1. Open browser developer tools
2. Go to **Network** tab
3. Reload WeWeb page
4. Look for element loading requests
5. Check response headers for caching info

## Prevention Strategies

### 1. Version Management
- Always increment version for changes
- Use semantic versioning (0.0.1, 0.0.2, etc.)
- Document changes in commit messages

### 2. Build Verification
- Always verify build output
- Check file timestamps
- Test in incognito mode first

### 3. Deployment Process
1. Make changes to source files
2. Increment version number
3. Build and verify output
4. Wait 5-10 minutes for CDN update
5. Test in WeWeb

## Quick Fix Checklist

When experiencing loading issues:

- [ ] Increment version in `package.json`
- [ ] Run `npm run rebuild`
- [ ] Wait 5-10 minutes
- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Clear browser cache
- [ ] Try incognito/private mode
- [ ] Remove and re-add element in WeWeb
- [ ] Check WeWeb element library for updates

## Still Having Issues?

If problems persist:

1. **Check WeWeb Status**: Visit status.weweb.io
2. **Community Support**: Ask in WeWeb Discord/forum
3. **Element Inspector**: Use browser dev tools to inspect loaded element
4. **Compare Versions**: Check if old vs new code is loading
5. **Network Analysis**: Examine network requests for element files

## Element-Specific Issues

For OpenStreetMap element:

### Map Not Loading
- Check browser console for Leaflet errors
- Verify internet connection for tile loading
- Check for CORS issues with map tiles

### User Markers Not Appearing
- Enable debug mode to check data loading
- Verify collection data binding
- Check coordinate field mapping
- Ensure `showCollectionMarkers` is enabled

### Configuration Not Saving
- Check for JavaScript errors in console
- Verify property names in `ww-config.js`
- Ensure proper data types for properties
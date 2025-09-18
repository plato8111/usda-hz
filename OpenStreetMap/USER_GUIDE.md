# OpenStreetMap - Database Users Integration Guide

## Overview

Your OpenStreetMap element now supports displaying users from your database as markers on the map. This guide explains how to connect your database users to the map element.

## How It Works

The map element uses the `collectionData` property to display markers. When you bind a collection of users with location data (latitude/longitude), the map will automatically display them as interactive markers.

## Step-by-Step Setup

### 1. Prepare Your User Data

Your database users need to have location coordinates. The map accepts these coordinate formats:
- `latitude`/`longitude` (preferred)
- `lat`/`lng`
- `y`/`x`
- `latitud`/`longitud`

**Example user data structure:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "status": "online",
  "role": "admin"
}
```

### 2. Create a Collection Query in WeWeb

1. Go to your WeWeb project
2. Navigate to **Collections** in the left sidebar
3. Click **+ New Collection**
4. Set up your data source:
   - **Source**: Your database (e.g., Supabase, Xano, Airtable)
   - **Collection Name**: `UsersWithLocation`
   - **Query**: Select users with location data

**Example SQL query (if using SQL database):**
```sql
SELECT id, name, email, latitude, longitude, status, role 
FROM users 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL
```

### 3. Configure the Map Element

1. Add your OpenStreetMap element to a page
2. In the element properties, find **Collection Data (Geolocations)**
3. Bind it to your `UsersWithLocation` collection
4. Configure user-specific settings:

#### User Data Configuration
- **User Data Source**: Select "Database Users" for user-specific styling
- **User Name Field**: Field containing user names (default: "name")
- **User Email Field**: Field containing user emails (default: "email")
- **User Status Field**: Field containing user status (default: "status")
- **User Role Field**: Field containing user roles (default: "role")

#### Display Options
- **Show user email in popup**: Toggle email display
- **Show user status in popup**: Toggle status display
- **Show user role in popup**: Toggle role display

### 4. Advanced Configuration

#### Popup Templates
Choose from three popup templates:
- **Default**: Basic user info with name and coordinates
- **Detailed**: Comprehensive info with email, status, role, and coordinates
- **Minimal**: Just the user name and status

#### User Status Styling
When **User Data Source** is set to "Database Users", markers are styled based on user status:
- **Online users**: Green markers (`#00ff00`)
- **Offline users**: Red markers (`#ff6666`)

#### Marker Clustering
Enable clustering to group nearby users:
- Toggle **Marker Clustering** ON
- Adjust **Cluster Radius** (1-200 km)
- Clusters show user count and expand on click

## Example WeWeb Collection Setup

### For Supabase Users
```javascript
// Collection query
const { data, error } = await supabase
  .from('users')
  .select('id, name, email, latitude, longitude, status, role')
  .not('latitude', 'is', null)
  .not('longitude', 'is', null);
```

### For Xano Users
```javascript
// API endpoint setup
GET /api/users/with-location
Response: {
  users: [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com", 
      latitude: 40.7128,
      longitude: -74.0060,
      status: "online",
      role: "admin"
    }
  ]
}
```

## Troubleshooting

### Markers Not Appearing
1. Check that your collection has data
2. Verify coordinate fields are populated
3. Ensure coordinates are valid numbers
4. Check browser console for errors

### Wrong Field Mapping
1. Verify field names in your database match the configuration
2. Use the debug panel to inspect data structure
3. Check field name case sensitivity

### Performance Issues
1. Limit the number of users displayed (use pagination)
2. Enable marker clustering for large datasets
3. Consider filtering users by geographic bounds

## Advanced Features

### Real-time Updates
The map automatically updates when your collection data changes. Set up real-time subscriptions in your WeWeb collection for live user location updates.

### Custom User Styling
Modify the `getUserMarkerStyle()` method in the component to implement custom styling logic based on user properties.

### Geographic Filtering
Add filters to your collection query to show only users within specific geographic bounds or regions.

## Configuration Reference

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `userDataSource` | Select | "collection" | Data source type (collection/users/custom) |
| `userNameField` | Text | "name" | Field containing user names |
| `userEmailField` | Text | "email" | Field containing user emails |
| `userStatusField` | Text | "status" | Field containing user status |
| `userRoleField` | Text | "role" | Field containing user roles |
| `showUserEmail` | OnOff | true | Show email in popups |
| `showUserStatus` | OnOff | true | Show status in popups |
| `showUserRole` | OnOff | false | Show role in popups |

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify your data structure matches the expected format
3. Test with the built-in dummy markers first
4. Enable the debug panel for detailed logging
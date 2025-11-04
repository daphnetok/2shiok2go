# Firebase Setup Instructions

## Firestore Indexes Setup

The HawkerAnalytics dashboard requires a composite index to efficiently query orders. Follow these steps to create the required index:

### Option 1: Automatic Deployment (Requires Firebase Admin Access)

1. Ensure you're logged in to Firebase:
   ```bash
   firebase login
   ```

2. Deploy the indexes configuration:
   ```bash
   firebase deploy --only firestore:indexes
   ```

### Option 2: Manual Creation via Firebase Console

If you encounter permission errors during deployment, create the index manually:

1. Open the [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **test-25bd6**
3. Navigate to **Firestore Database** → **Indexes** tab
4. Click **Create Index**
5. Add the following configuration:

   **Collection ID:** `orders`
   
   **Fields to index:**
   - Field: `hawkerId` | Order: Ascending
   - Field: `timestamp` | Order: Descending
   
   **Query scope:** Collection

6. Click **Create Index**
7. Wait for the index to build (usually takes a few minutes)

### Required Indexes

The `firestore.indexes.json` file includes the following indexes:

1. **Orders by Hawker (with timestamp)**
   - Collection: `orders`
   - Fields: `hawkerId` (ASC), `timestamp` (DESC)
   - Purpose: Fetch hawker's orders sorted by most recent

2. **Orders by Buyer (with timestamp)**
   - Collection: `orders`
   - Fields: `buyerId` (ASC), `timestamp` (DESC)
   - Purpose: Fetch buyer's orders sorted by most recent

## Firestore Security Rules

The security rules have been updated to ensure proper access control:

- **Orders**: Only accessible by the hawker or buyer associated with the order
- **Hawker Listings**: Public read access, write restricted to the owner
- **Todo Lists & Calendar Events**: Only accessible by the hawker who owns them

To deploy updated rules:
```bash
firebase deploy --only firestore:rules
```

## Troubleshooting

### Error: "The query requires an index"

**Solution:** Follow the index setup instructions above. The application includes fallback logic to query without the index, but performance will be slower.

### Error: "Missing or insufficient permissions"

**Possible causes:**
1. User not authenticated - ensure you're logged in
2. Trying to access another user's data - check that the userId/hawkerId matches
3. Security rules need updating - redeploy the rules

**Solution:** 
- Check the browser console for detailed error messages
- Verify the user is authenticated
- Ensure Firestore rules are deployed correctly

### Charts Not Loading

**Possible causes:**
1. No orders in the database for the current hawker
2. Firebase connection issues
3. Missing required indexes

**Solution:**
- Check the browser console for errors
- Verify orders exist in Firestore for your hawker account
- Create the required indexes (see above)

## Verifying Setup

After setting up indexes and rules:

1. Reload the HawkerAnalytics page
2. Open the browser console (F12)
3. Look for these success messages:
   - ✅ User authenticated
   - ✅ Hawker profile loaded
   - ✅ Loaded orders: [number]
   - ✅ Todos loaded
   - ✅ Calendar events loaded

If you see error messages, refer to the troubleshooting section above.

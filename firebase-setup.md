# Firebase Setup Instructions

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `genealogy-record-builder` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Google" provider
5. Add your project's support email
6. Click "Save"

## 3. Create Firestore Database

1. Go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location for your database
5. Click "Done"

## 4. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Web" icon (`</>`)
4. Register your app with a nickname
5. Copy the Firebase configuration object

## 5. Update Configuration in index.html

Replace the placeholder configuration in `index.html` with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};
```

## 6. Set Up Firestore Security Rules

In the Firestore Database section, go to "Rules" tab and replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 7. Deploy Your App

You can deploy your app to:
- **Firebase Hosting**: Free hosting with custom domain support
- **GitHub Pages**: Free static hosting
- **Netlify**: Free hosting with continuous deployment
- **Vercel**: Free hosting with excellent performance

### Firebase Hosting (Recommended)

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Deploy: `firebase deploy`

## 8. Features Included

✅ **Google Authentication**: Users sign in with their Google account
✅ **Auto-save**: Data saves automatically every 2 seconds
✅ **Cloud Sync**: Data syncs across all user's devices
✅ **Offline Fallback**: Falls back to localStorage if Firebase is unavailable
✅ **Real-time Updates**: Changes sync in real-time
✅ **User Data Isolation**: Each user only sees their own data

## 9. Data Structure

The app stores data in Firestore with this structure:

```
users/{userId}
├── recordDate: string
├── father: object
│   ├── name: string
│   ├── father: string
│   ├── mother: string
│   └── events: array
├── mother: object
│   ├── name: string
│   ├── father: string
│   ├── mother: string
│   └── events: array
├── children: array
├── preparer: object
├── comments: string
├── lastUpdated: timestamp
└── userId: string
```

## 10. Troubleshooting

### Common Issues:

1. **"Firebase not loaded"**: Check your Firebase configuration
2. **Authentication errors**: Ensure Google sign-in is enabled
3. **Permission denied**: Check your Firestore security rules
4. **CORS errors**: Make sure your domain is added to authorized domains

### Debug Mode:

Open browser console to see detailed logs of Firebase operations.

## 11. Production Considerations

1. **Security Rules**: Update Firestore rules for production
2. **Domain Restrictions**: Add your production domain to Firebase
3. **Error Monitoring**: Consider adding Firebase Crashlytics
4. **Performance**: Monitor Firestore usage and optimize queries
5. **Backup**: Set up regular database backups

## 12. Cost Estimation

- **Firebase Authentication**: Free for up to 10,000 users
- **Firestore**: Free for up to 1GB storage and 50,000 reads/writes per day
- **Firebase Hosting**: Free for up to 10GB storage and 10GB transfer per month

For most genealogy projects, this will be completely free!

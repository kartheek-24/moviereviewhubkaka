# MovieReviewHub By Kaka

A mobile-first movie review app where users can discover, share, and discuss movie reviews across multiple languages. Available on the Apple App Store.

**App Store:** https://apps.apple.com/app/moviereviewhubbykaka/id6759014502

## About the App

MovieReviewHub By Kaka is a community-driven movie review platform that lets users:

- Browse and search movie reviews filtered by language
- Read detailed reviews with star ratings
- Post comments and react to other users' comments
- Get real-time updates when new reviews or comments are added
- Share reviews with friends
- Receive push notifications for new activity
- Submit and manage reviews (admin)

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **UI:** shadcn/ui + Tailwind CSS
- **Backend:** Supabase (database, auth, realtime)
- **Mobile:** Capacitor (iOS & Android)

## Getting Started

**Requirements:** Node.js & npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

```sh
# Clone the repository
git clone https://github.com/kartheek-24/moviereviewhubkaka.git

# Navigate to the project directory
cd moviereviewhubkaka

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Mobile Builds

This app uses Capacitor for iOS and Android.

```sh
# Build the web app
npm run build

# Sync to native projects
npx cap sync

# Open in Xcode (iOS)
npx cap open ios

# Open in Android Studio
npx cap open android
```

## Deployment

The iOS app is deployed to the Apple App Store. Web builds are generated via `npm run build` and synced to native projects using Capacitor.

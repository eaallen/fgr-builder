# Genealogy Record Builder

A web application for building family group records with Firebase integration, now using Vite and npm for modern development.

## Features

- Create and edit family group records
- Firebase authentication with Google Sign-In
- Auto-save functionality
- Export records as text files
- Responsive design
- Modern ES6+ JavaScript with modules

## Prerequisites

- Node.js (version 16 or higher)
- npm (comes with Node.js)

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Development

To start the development server:

```bash
npm run dev
```

This will start Vite's development server, typically on `http://localhost:3000`. The application will automatically open in your browser.

## Building for Production

To build the application for production:

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
├── index.html          # Main HTML file
├── main.js            # Application entry point
├── styles.css         # Application styles
├── js/
│   ├── auth/          # Authentication module
│   ├── components/    # UI components
│   ├── firestore/     # Firestore integration
│   ├── form/          # Form management
│   ├── utils/         # Utility functions
│   └── van/           # Van.js integration
├── package.json       # Dependencies and scripts
├── vite.config.js     # Vite configuration
└── .gitignore         # Git ignore rules
```

## Technologies Used

- **Vite** - Build tool and development server
- **Firebase** - Authentication and database
- **Van.js** - Minimal reactive framework
- **ES6 Modules** - Modern JavaScript module system

## Migration Notes

This project has been migrated from:
- CDN-based Firebase imports → npm packages
- CDN-based Van.js → npm package
- Inline scripts → ES6 modules
- Manual script loading → Vite bundling

## Firebase Configuration

The Firebase configuration is included in `main.js`. Make sure to update the configuration with your own Firebase project settings if needed.

## Browser Support

This application uses modern JavaScript features and requires a browser that supports:
- ES6 modules
- Firebase v9+ SDK
- Modern CSS features

Recommended browsers: Chrome 80+, Firefox 72+, Safari 13+, Edge 80+

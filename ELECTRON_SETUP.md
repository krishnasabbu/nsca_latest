# Cricket Academy Manager - Desktop Application

Your Cricket Academy Manager is now configured as a Windows desktop application using Electron.

## Development

To run the app in development mode as a desktop application:

```bash
npm run electron:dev
```

This will:
1. Start the Vite dev server
2. Wait for the server to be ready
3. Launch the Electron window

## Building Windows Executable

To create a Windows .exe installer:

```bash
npm run electron:build:win
```

This will:
1. Build the React application for production
2. Package it with Electron
3. Create a Windows installer in the `release/` directory

The installer will be located at: `release/Cricket Academy Manager Setup 1.0.0.exe`

## Running the Installer

Once built, you can:
1. Navigate to the `release/` folder
2. Double-click `Cricket Academy Manager Setup 1.0.0.exe`
3. Follow the installation wizard
4. The app will be installed and a desktop shortcut will be created

## Building for Other Platforms

To build for all platforms:
```bash
npm run electron:build
```

Note: Building for macOS requires a Mac, and building for Linux requires Linux or appropriate configuration.

## Application Features

- Runs as a native Windows desktop application
- No browser required
- Desktop and Start Menu shortcuts
- Auto-updates capability (can be configured)
- Offline capable (after initial setup)

## System Requirements

- Windows 10 or later (64-bit)
- 4GB RAM minimum
- 500MB free disk space

## Notes

- The application still requires internet connection to connect to your Supabase database
- All data is stored in your cloud Supabase instance
- The `.env` file must be present for the application to connect to the database

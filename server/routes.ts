import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import passport from "passport";
import { google } from "googleapis";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";

const MemorySessionStore = MemoryStore(session);

// Google OAuth2 configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.REPLIT_IDENTITY ? `https://${process.env.REPLIT_SLUG}.${process.env.REPLIT_OWNER}.replit.dev/api/google/auth/callback` : 'http://localhost:5000/api/google/auth/callback'}`
);

// Store our OAuth client in a global object for access across server restarts
declare global {
  var googleAuth: typeof oauth2Client;
}

// Initialize or reuse the existing client
if (!global.googleAuth) {
  global.googleAuth = oauth2Client;
} else {
  // If we already have a client (from a server restart), use its credentials
  if (global.googleAuth.credentials) {
    oauth2Client.setCredentials(global.googleAuth.credentials);
  }
}

// Create Google Drive API client
const drive = google.drive({
  version: 'v3',
  auth: oauth2Client,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'windows-vm-secret',
      resave: false,
      saveUninitialized: false,
      cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      },
      store: new MemorySessionStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      }),
    })
  );

  // Configure passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport configuration
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        if (user.password !== password) {
          return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // User authentication routes
  app.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body;

    try {
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const user = await storage.createUser({ username, password });
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error during login after registration' });
        }
        return res.status(201).json({ id: user.id, username: user.username });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error registering user' });
    }
  });

  app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
    const user = req.user as any;
    res.json({ id: user.id, username: user.username });
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout(() => {
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/user', (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user as any;
      return res.json({ id: user.id, username: user.username });
    } else {
      return res.status(401).json({ message: 'Not authenticated' });
    }
  });
  
  // Window state API routes
  app.get('/api/window-states', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const user = req.user as any;
    try {
      const states = await storage.getWindowStates(user.id);
      res.json(states);
    } catch (error) {
      console.error('Error fetching window states', error);
      res.status(500).json({ message: 'Error fetching window states' });
    }
  });
  
  app.post('/api/window-states', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const user = req.user as any;
    try {
      const windowState = {
        ...req.body,
        userId: user.id
      };
      const savedState = await storage.saveWindowState(windowState);
      res.status(201).json(savedState);
    } catch (error) {
      console.error('Error saving window state', error);
      res.status(500).json({ message: 'Error saving window state' });
    }
  });
  
  app.put('/api/window-states/:id', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const id = parseInt(req.params.id);
      const updatedState = await storage.updateWindowState(id, req.body);
      if (!updatedState) {
        return res.status(404).json({ message: 'Window state not found' });
      }
      res.json(updatedState);
    } catch (error) {
      console.error('Error updating window state', error);
      res.status(500).json({ message: 'Error updating window state' });
    }
  });
  
  app.delete('/api/window-states/:id', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const id = parseInt(req.params.id);
      await storage.deleteWindowState(id);
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting window state', error);
      res.status(500).json({ message: 'Error deleting window state' });
    }
  });
  
  // Browser bookmarks API routes
  app.get('/api/bookmarks', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const user = req.user as any;
    try {
      const bookmarks = await storage.getBookmarks(user.id);
      res.json(bookmarks);
    } catch (error) {
      console.error('Error fetching bookmarks', error);
      res.status(500).json({ message: 'Error fetching bookmarks' });
    }
  });
  
  app.post('/api/bookmarks', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const user = req.user as any;
    try {
      const bookmark = {
        ...req.body,
        userId: user.id,
        createdAt: new Date().toISOString()
      };
      const savedBookmark = await storage.createBookmark(bookmark);
      res.status(201).json(savedBookmark);
    } catch (error) {
      console.error('Error creating bookmark', error);
      res.status(500).json({ message: 'Error creating bookmark' });
    }
  });
  
  app.delete('/api/bookmarks/:id', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBookmark(id);
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting bookmark', error);
      res.status(500).json({ message: 'Error deleting bookmark' });
    }
  });

  // Google Drive authentication routes
  app.get('/api/google/auth/url', (req, res) => {
    const scopes = [
      'https://www.googleapis.com/auth/drive.metadata.readonly',
      'https://www.googleapis.com/auth/drive.file',
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      include_granted_scopes: true,
      // For development only - allows testing without verification
      // Remove in production:
      ux_mode: 'redirect'
    });

    res.json({ url: authUrl });
  });

  app.get('/api/google/auth/callback', async (req, res) => {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ message: 'Authorization code missing' });
    }

    try {
      const { tokens } = await oauth2Client.getToken(code as string);
      
      // Store tokens in session
      if (req.session) {
        req.session.googleTokens = tokens;
      }

      // Set credentials on both the local and global client
      oauth2Client.setCredentials(tokens);
      if (global.googleAuth) {
        global.googleAuth.setCredentials(tokens);
      }
      
      res.redirect('/');
    } catch (error) {
      console.error('Error retrieving access token', error);
      res.status(500).json({ message: 'Failed to retrieve access token' });
    }
  });

  app.get('/api/google/auth/status', (req, res) => {
    const authenticated = !!(req.session && req.session.googleTokens);
    res.json({ authenticated });
  });

  // Google Drive API routes
  app.get('/api/google/files', async (req, res) => {
    if (!req.session || !req.session.googleTokens) {
      return res.status(401).json({ message: 'Not authenticated with Google' });
    }

    oauth2Client.setCredentials(req.session.googleTokens);

    try {
      const parentId = req.query.parentId || 'root';
      const query = `'${parentId}' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed = false`;
      
      const response = await drive.files.list({
        q: query,
        fields: 'files(id, name, mimeType, iconLink, webViewLink, thumbnailLink, parents, createdTime, modifiedTime, size)',
        spaces: 'drive',
      });

      res.json(response.data.files || []);
    } catch (error) {
      console.error('Error fetching files from Google Drive', error);
      res.status(500).json({ message: 'Error fetching files' });
    }
  });

  app.get('/api/google/folders', async (req, res) => {
    if (!req.session || !req.session.googleTokens) {
      return res.status(401).json({ message: 'Not authenticated with Google' });
    }

    oauth2Client.setCredentials(req.session.googleTokens);

    try {
      const parentId = req.query.parentId || 'root';
      const query = `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
      
      const response = await drive.files.list({
        q: query,
        fields: 'files(id, name, mimeType, parents, createdTime, modifiedTime)',
        spaces: 'drive',
      });

      res.json(response.data.files || []);
    } catch (error) {
      console.error('Error fetching folders from Google Drive', error);
      res.status(500).json({ message: 'Error fetching folders' });
    }
  });

  app.post('/api/google/folders', async (req, res) => {
    if (!req.session || !req.session.googleTokens) {
      return res.status(401).json({ message: 'Not authenticated with Google' });
    }

    oauth2Client.setCredentials(req.session.googleTokens);

    try {
      const { name, parentId } = req.body;
      
      const folderMetadata = {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : ['root'],
      };

      const response = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id, name, mimeType, parents, createdTime, modifiedTime',
      });

      res.status(201).json(response.data);
    } catch (error) {
      console.error('Error creating folder in Google Drive', error);
      res.status(500).json({ message: 'Error creating folder' });
    }
  });

  app.post('/api/google/upload', async (req, res) => {
    if (!req.session || !req.session.googleTokens) {
      return res.status(401).json({ message: 'Not authenticated with Google' });
    }

    oauth2Client.setCredentials(req.session.googleTokens);

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: 'No files were uploaded' });
    }

    try {
      const file = req.files.file;
      const parentId = req.body.parentId || 'root';
      
      const fileMetadata = {
        name: file.name,
        parents: [parentId],
      };

      const media = {
        mimeType: file.mimetype,
        body: file.data,
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id, name, mimeType, webViewLink',
      });

      res.status(201).json(response.data);
    } catch (error) {
      console.error('Error uploading file to Google Drive', error);
      res.status(500).json({ message: 'Error uploading file' });
    }
  });

  app.delete('/api/google/files/:fileId', async (req, res) => {
    if (!req.session || !req.session.googleTokens) {
      return res.status(401).json({ message: 'Not authenticated with Google' });
    }

    oauth2Client.setCredentials(req.session.googleTokens);

    try {
      const fileId = req.params.fileId;
      
      await drive.files.delete({
        fileId,
      });

      res.status(204).end();
    } catch (error) {
      console.error('Error deleting file from Google Drive', error);
      res.status(500).json({ message: 'Error deleting file' });
    }
  });

  // App Store API routes
  app.get('/api/store/apps', async (req, res) => {
    try {
      const apps = await storage.getAllApps();
      res.json(apps);
    } catch (error) {
      console.error('Error fetching apps from store', error);
      res.status(500).json({ message: 'Error fetching apps' });
    }
  });

  app.get('/api/store/apps/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const app = await storage.getAppById(id);
      if (!app) {
        return res.status(404).json({ message: 'App not found' });
      }
      res.json(app);
    } catch (error) {
      console.error('Error fetching app details', error);
      res.status(500).json({ message: 'Error fetching app details' });
    }
  });

  app.post('/api/store/apps', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
      // In a real app, you'd have admin checks here
      const app = await storage.createApp(req.body);
      res.status(201).json(app);
    } catch (error) {
      console.error('Error creating app in store', error);
      res.status(500).json({ message: 'Error creating app' });
    }
  });

  app.put('/api/store/apps/:id', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
      // In a real app, you'd have admin checks here
      const id = parseInt(req.params.id);
      const app = await storage.updateApp(id, req.body);
      if (!app) {
        return res.status(404).json({ message: 'App not found' });
      }
      res.json(app);
    } catch (error) {
      console.error('Error updating app in store', error);
      res.status(500).json({ message: 'Error updating app' });
    }
  });

  app.delete('/api/store/apps/:id', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
      // In a real app, you'd have admin checks here
      const id = parseInt(req.params.id);
      await storage.deleteApp(id);
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting app from store', error);
      res.status(500).json({ message: 'Error deleting app' });
    }
  });

  // User Installed Apps API routes
  app.get('/api/user/apps', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = req.user as any;
    try {
      const apps = await storage.getUserInstalledApps(user.id);
      res.json(apps);
    } catch (error) {
      console.error('Error fetching user installed apps', error);
      res.status(500).json({ message: 'Error fetching installed apps' });
    }
  });

  app.post('/api/user/apps', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = req.user as any;
    try {
      const { appId } = req.body;
      const userApp = await storage.installApp({
        userId: user.id,
        appId,
        isActive: true
      });
      res.status(201).json(userApp);
    } catch (error) {
      console.error('Error installing app', error);
      res.status(500).json({ message: 'Error installing app' });
    }
  });

  app.delete('/api/user/apps/:id', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
      const id = parseInt(req.params.id);
      await storage.uninstallApp(id);
      res.status(204).end();
    } catch (error) {
      console.error('Error uninstalling app', error);
      res.status(500).json({ message: 'Error uninstalling app' });
    }
  });

  // App Reviews API routes
  app.get('/api/apps/:appId/reviews', async (req, res) => {
    try {
      const appId = parseInt(req.params.appId);
      const reviews = await storage.getAppReviews(appId);
      res.json(reviews);
    } catch (error) {
      console.error('Error fetching app reviews', error);
      res.status(500).json({ message: 'Error fetching reviews' });
    }
  });

  app.post('/api/apps/:appId/reviews', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = req.user as any;
    try {
      const appId = parseInt(req.params.appId);
      const { rating, review } = req.body;
      
      const appReview = await storage.createAppReview({
        userId: user.id,
        appId,
        rating,
        review
      });
      
      res.status(201).json(appReview);
    } catch (error) {
      console.error('Error creating app review', error);
      res.status(500).json({ message: 'Error creating review' });
    }
  });

  app.delete('/api/apps/reviews/:id', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
      const id = parseInt(req.params.id);
      await storage.deleteAppReview(id);
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting app review', error);
      res.status(500).json({ message: 'Error deleting review' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

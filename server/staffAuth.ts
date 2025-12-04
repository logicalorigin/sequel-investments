import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

// Test accounts that can use username instead of email
const TEST_ACCOUNTS = ["admin", "broker", "borrower"];

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validate that input is either a test account or valid email
function validateLoginInput(username: string): { isValid: boolean; isTestAccount: boolean } {
  if (TEST_ACCOUNTS.includes(username.toLowerCase())) {
    return { isValid: true, isTestAccount: true };
  }
  return { isValid: EMAIL_REGEX.test(username), isTestAccount: false };
}

export async function setupStaffAuth(app: Express) {
  // Admin/Staff strategy - only allows staff and admin roles
  passport.use(
    "admin-local",
    new LocalStrategy(async (username, password, done) => {
      try {
        const validation = validateLoginInput(username);
        if (!validation.isValid) {
          return done(null, false, { message: "Please enter a valid email address" });
        }

        // For test accounts, allow username lookup; otherwise search by email
        const user = validation.isTestAccount 
          ? await storage.getUserByUsername(username)
          : await storage.getUserByEmail(username);
        
        if (!user) {
          return done(null, false, { message: "Invalid email or password" });
        }
        
        if (!user.password) {
          return done(null, false, { message: "Invalid email or password" });
        }
        
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Invalid email or password" });
        }
        
        // Only allow staff and admin roles for admin portal
        if (user.role !== "staff" && user.role !== "admin") {
          return done(null, false, { message: "Staff or admin access required" });
        }
        
        return done(null, {
          claims: {
            sub: user.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
          },
          expires_at: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
          portal: "admin",
        });
      } catch (error) {
        return done(error);
      }
    })
  );

  // Broker strategy - only allows broker role
  passport.use(
    "broker-local",
    new LocalStrategy(async (username, password, done) => {
      try {
        const validation = validateLoginInput(username);
        if (!validation.isValid) {
          return done(null, false, { message: "Please enter a valid email address" });
        }

        const user = validation.isTestAccount 
          ? await storage.getUserByUsername(username)
          : await storage.getUserByEmail(username);
        
        if (!user) {
          return done(null, false, { message: "Invalid email or password" });
        }
        
        if (!user.password) {
          return done(null, false, { message: "Invalid email or password" });
        }
        
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Invalid email or password" });
        }
        
        // Only allow broker role for broker portal
        if (user.role !== "broker") {
          return done(null, false, { message: "Broker access required. Please use the appropriate portal." });
        }
        
        return done(null, {
          claims: {
            sub: user.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
          },
          expires_at: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
          portal: "broker",
        });
      } catch (error) {
        return done(error);
      }
    })
  );

  // Borrower strategy - only allows borrower role
  passport.use(
    "borrower-local",
    new LocalStrategy(async (username, password, done) => {
      try {
        const validation = validateLoginInput(username);
        if (!validation.isValid) {
          return done(null, false, { message: "Please enter a valid email address" });
        }

        const user = validation.isTestAccount 
          ? await storage.getUserByUsername(username)
          : await storage.getUserByEmail(username);
        
        if (!user) {
          return done(null, false, { message: "Invalid email or password" });
        }
        
        if (!user.password) {
          return done(null, false, { message: "Invalid email or password" });
        }
        
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Invalid email or password" });
        }
        
        // Only allow borrower role for client portal
        if (user.role !== "borrower") {
          return done(null, false, { message: "This portal is for borrowers. Please use the appropriate portal." });
        }
        
        return done(null, {
          claims: {
            sub: user.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
          },
          expires_at: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
          portal: "borrower",
        });
      } catch (error) {
        return done(error);
      }
    })
  );

  // Admin login endpoint
  app.post("/api/admin/login", (req, res, next) => {
    passport.authenticate("admin-local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ error: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ error: info?.message || "Invalid credentials" });
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          return res.status(500).json({ error: "Login error" });
        }
        return res.json({ 
          success: true, 
          message: "Logged in successfully",
          user: {
            id: user.claims.sub,
            email: user.claims.email,
            firstName: user.claims.first_name,
            lastName: user.claims.last_name,
          }
        });
      });
    })(req, res, next);
  });

  // Admin logout endpoint
  app.post("/api/admin/logout", (req, res) => {
    req.logout(() => {
      req.session?.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
        }
        res.clearCookie("connect.sid");
        res.json({ success: true, message: "Logged out successfully" });
      });
    });
  });

  // Broker login endpoint
  app.post("/api/broker/login", (req, res, next) => {
    passport.authenticate("broker-local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ error: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ error: info?.message || "Invalid credentials" });
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          return res.status(500).json({ error: "Login error" });
        }
        return res.json({ 
          success: true, 
          message: "Logged in successfully",
          user: {
            id: user.claims.sub,
            email: user.claims.email,
            firstName: user.claims.first_name,
            lastName: user.claims.last_name,
          }
        });
      });
    })(req, res, next);
  });

  // Broker logout endpoint
  app.post("/api/broker/logout", (req, res) => {
    req.logout(() => {
      req.session?.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
        }
        res.clearCookie("connect.sid");
        res.json({ success: true, message: "Logged out successfully" });
      });
    });
  });

  // Borrower login endpoint (for test accounts only - regular users use OAuth)
  app.post("/api/borrower/login", (req, res, next) => {
    passport.authenticate("borrower-local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ error: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ error: info?.message || "Invalid credentials" });
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          return res.status(500).json({ error: "Login error" });
        }
        return res.json({ 
          success: true, 
          message: "Logged in successfully",
          user: {
            id: user.claims.sub,
            email: user.claims.email,
            firstName: user.claims.first_name,
            lastName: user.claims.last_name,
          }
        });
      });
    })(req, res, next);
  });

  // Borrower logout endpoint
  app.post("/api/borrower/logout", (req, res) => {
    req.logout(() => {
      req.session?.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
        }
        res.clearCookie("connect.sid");
        res.json({ success: true, message: "Logged out successfully" });
      });
    });
  });
}

// Role-based middleware
export const requireRole = (...allowedRoles: string[]): RequestHandler => {
  return async (req: any, res, next) => {
    if (!req.isAuthenticated() || !req.user?.claims?.sub) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || !allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: "Access denied. Insufficient permissions." });
      }
      next();
    } catch (error) {
      return res.status(500).json({ message: "Error checking permissions" });
    }
  };
};

export async function createAdminUser(username: string, password: string) {
  const existingUser = await storage.getUserByUsername(username);
  const hashedPassword = await bcrypt.hash(password, 10);
  
  if (existingUser) {
    await storage.updateUserPassword(existingUser.id, hashedPassword);
    console.log("Admin user password reset");
    return existingUser;
  }
  
  const adminUser = await storage.createLocalUser({
    username,
    password: hashedPassword,
    email: `${username}@securedassetfunding.com`,
    firstName: "Admin",
    lastName: "User",
    role: "admin",
  });
  
  console.log("Admin user created successfully");
  return adminUser;
}

export async function createTestBrokerUser(username: string, password: string) {
  const existingUser = await storage.getUserByUsername(username);
  const hashedPassword = await bcrypt.hash(password, 10);
  
  if (existingUser) {
    await storage.updateUserPassword(existingUser.id, hashedPassword);
    console.log("Broker test user password reset");
    return existingUser;
  }
  
  const brokerUser = await storage.createLocalUser({
    username,
    password: hashedPassword,
    email: `${username}@testbroker.com`,
    firstName: "Test",
    lastName: "Broker",
    role: "broker",
  });
  
  // Create a broker profile for this user
  await storage.createBrokerProfile({
    userId: brokerUser.id,
    companyName: "Test Broker Company",
    companySlug: "test-broker",
    companyPhone: "555-123-4567",
    nmlsNumber: "BRK-TEST-001",
    companyWebsite: "https://testbroker.com",
    isActive: true,
  });
  
  console.log("Broker test user created successfully");
  return brokerUser;
}

export async function createTestBorrowerUser(username: string, password: string) {
  const existingUser = await storage.getUserByUsername(username);
  const hashedPassword = await bcrypt.hash(password, 10);
  
  if (existingUser) {
    await storage.updateUserPassword(existingUser.id, hashedPassword);
    console.log("Borrower test user password reset");
    return existingUser;
  }
  
  const borrowerUser = await storage.createLocalUser({
    username,
    password: hashedPassword,
    email: `${username}@testborrower.com`,
    firstName: "Test",
    lastName: "Borrower",
    role: "borrower",
  });
  
  console.log("Borrower test user created successfully");
  return borrowerUser;
}

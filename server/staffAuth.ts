import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import type { Express } from "express";
import { storage } from "./storage";

export async function setupStaffAuth(app: Express) {
  passport.use(
    "local",
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        if (!user.password) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        if (user.role !== "staff" && user.role !== "admin") {
          return done(null, false, { message: "Staff access required" });
        }
        
        return done(null, {
          claims: {
            sub: user.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
          },
          expires_at: Math.floor(Date.now() / 1000) + 86400,
        });
      } catch (error) {
        return done(error);
      }
    })
  );

  app.post("/api/admin/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
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

  app.post("/api/admin/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true, message: "Logged out successfully" });
    });
  });
}

export async function createAdminUser(username: string, password: string) {
  const existingUser = await storage.getUserByUsername(username);
  const hashedPassword = await bcrypt.hash(password, 10);
  
  if (existingUser) {
    // Update the password for existing admin user to ensure credentials are correct
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

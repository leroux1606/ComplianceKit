"use server";

import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { sanitizeEmail } from "@/lib/sanitize";
import bcrypt from "bcryptjs";
import crypto from "crypto";

/**
 * Request a password reset email
 */
export async function requestPasswordReset(email: string) {
  try {
    const sanitizedEmail = sanitizeEmail(email);

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email: sanitizedEmail },
    });

    // Always return success to prevent email enumeration attacks
    // Don't reveal whether the email exists or not
    if (!user) {
      // Wait a bit to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { 
        success: true, 
        message: "If an account exists with this email, you will receive a password reset link shortly." 
      };
    }

    // Don't send reset emails for OAuth-only accounts (no password set)
    if (!user.password) {
      return { 
        success: true, 
        message: "If an account exists with this email, you will receive a password reset link shortly." 
      };
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Token expires in 1 hour
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    // Store the hashed token in the database
    await db.verificationToken.create({
      data: {
        identifier: sanitizedEmail,
        token: hashedToken,
        expires,
      },
    });

    // Send the reset email with the unhashed token
    await sendPasswordResetEmail(sanitizedEmail, resetToken);

    return { 
      success: true, 
      message: "If an account exists with this email, you will receive a password reset link shortly." 
    };
  } catch (error) {
    console.error("Password reset request error:", error);
    return { 
      success: false, 
      error: "An error occurred. Please try again later." 
    };
  }
}

/**
 * Verify a password reset token
 */
export async function verifyResetToken(token: string) {
  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const verificationToken = await db.verificationToken.findUnique({
      where: { token: hashedToken },
    });

    if (!verificationToken) {
      return { valid: false, error: "Invalid or expired reset link." };
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await db.verificationToken.delete({
        where: { token: hashedToken },
      });
      return { valid: false, error: "This reset link has expired. Please request a new one." };
    }

    return { valid: true, email: verificationToken.identifier };
  } catch (error) {
    console.error("Token verification error:", error);
    return { valid: false, error: "An error occurred. Please try again." };
  }
}

/**
 * Reset password with a valid token
 */
export async function resetPassword(token: string, newPassword: string) {
  try {
    // Verify the token first
    const verification = await verifyResetToken(token);
    
    if (!verification.valid || !verification.email) {
      return { 
        success: false, 
        error: verification.error || "Invalid reset link." 
      };
    }

    // Validate password strength (minimum 8 characters)
    if (newPassword.length < 8) {
      return { 
        success: false, 
        error: "Password must be at least 8 characters long." 
      };
    }

    // Find the user
    const user = await db.user.findUnique({
      where: { email: verification.email },
    });

    if (!user) {
      return { 
        success: false, 
        error: "User not found." 
      };
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Delete the used token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    await db.verificationToken.delete({
      where: { token: hashedToken },
    });

    return { 
      success: true, 
      message: "Password successfully reset. You can now sign in with your new password." 
    };
  } catch (error) {
    console.error("Password reset error:", error);
    return { 
      success: false, 
      error: "An error occurred while resetting your password. Please try again." 
    };
  }
}

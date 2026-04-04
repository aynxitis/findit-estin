"use client";

import { useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { GoogleButton } from "./google-button";
import { useAuth } from "@/hooks/use-auth";

interface SignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignInModal({ open, onOpenChange }: SignInModalProps) {
  const { signIn, signingIn, error, clearError, user } = useAuth();

  // Close modal on successful sign-in
  useEffect(() => {
    if (user && open) {
      onOpenChange(false);
    }
  }, [user, open, onOpenChange]);

  // Clear error when modal closes
  useEffect(() => {
    if (!open) {
      clearError();
    }
  }, [open, clearError]);

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch {
      // Error is handled by AuthProvider
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader className="items-center text-center">
          <div className="mb-2">
            <Image
              src="/findit.svg"
              alt="FINDit"
              width={80}
              height={24}
              className="h-6 w-auto"
              priority
            />
          </div>
          <DialogTitle className="font-display text-2xl font-bold">
            Welcome
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Sign in with your <strong className="text-teal">@estin.dz</strong>{" "}
            Google account to verify you&apos;re an ESTIN student.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          <GoogleButton
            onClick={handleSignIn}
            loading={signingIn}
            disabled={signingIn}
          />

          {error && (
            <p className="text-sm text-red text-center animate-fade-up">
              {error.message}
            </p>
          )}

          <p className="text-xs text-center text-muted-foreground">
            Only <strong>@estin.dz</strong> accounts will be accepted.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CATEGORY_LABELS, CATEGORY_ICONS, LOCATION_LABELS } from "@/lib/constants/labels";
import type { Item } from "@/lib/types/item";
import { useAuth } from "@/hooks/use-auth";
import {
  doc,
  collection,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";
import { cn } from "@/lib/utils";

interface ClaimModalProps {
  item: Item | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClaimSuccess?: () => void;
}

export function ClaimModal({ item, open, onOpenChange, onClaimSuccess }: ClaimModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!item) return null;

  const isFound = item.type === "found";
  const categoryLabel = CATEGORY_LABELS[item.category] || item.category;
  const categoryIcon = CATEGORY_ICONS[item.category] || "📦";
  const locationLabel = LOCATION_LABELS[item.location] || item.location;
  const dateStr = item.date
    ? new Date(item.date + "T00:00:00").toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  const handleConfirm = async () => {
    if (!user || !item) return;

    setLoading(true);
    setError(null);

    try {
      const db = getClientDb();
      const itemRef = doc(db, "items", item.id);
      const newClaimRef = doc(collection(db, "claims"));
      const newNotifRef = doc(collection(db, "notifications"));

      await runTransaction(db, async (tx) => {
        const itemSnap = await tx.get(itemRef);
        const itemData = itemSnap.data();
        if (itemData?.status === "claimed") {
          throw new Error("This item has already been claimed.");
        }
        // Reject claims on expired listings (30-day window)
        const createdAt = itemData?.createdAt?.toDate?.();
        if (createdAt && Date.now() - createdAt.getTime() > 30 * 24 * 60 * 60 * 1000) {
          throw new Error("This listing has expired and can no longer be claimed.");
        }

        // Create claim record
        tx.set(newClaimRef, {
          itemId: item.id,
          itemType: item.type,
          itemCategory: item.category,
          claimedBy: user.uid,
          claimedEmail: user.email,
          claimedName: user.displayName || "An ESTIN student",
          posterUID: item.userUID || null,
          posterEmail: item.userEmail,
          createdAt: serverTimestamp(),
        });

        // Send notification to poster
        if (item.userUID && item.userUID !== user.uid) {
          const notifMessage = isFound
            ? `${categoryIcon} Someone thinks your ${categoryLabel} is theirs and wants to claim it.`
            : `${categoryIcon} Someone found your ${categoryLabel} and reached out!`;

          tx.set(newNotifRef, {
            toUID: item.userUID,
            itemId: item.id,
            itemType: item.type,
            category: item.category,
            message: notifMessage,
            claimerName: user.displayName || "An ESTIN student",
            claimerEmail: user.email,
            read: false,
            createdAt: serverTimestamp(),
          });
        }

        // Update item status
        tx.update(itemRef, { status: "claimed" });
      });

      setSuccess(true);
      onClaimSuccess?.();

      // Close after showing success
      setTimeout(() => {
        setSuccess(false);
        onOpenChange(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to claim item");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sign-in-modal max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="font-display text-xl font-bold">
            {success
              ? "Success!"
              : isFound
              ? "Is this yours?"
              : "Did you find this?"}
          </DialogTitle>
          <DialogDescription className="text-muted text-sm">
            {success
              ? "Contact info has been revealed. Reach out to coordinate!"
              : isFound
              ? "Confirm below to reveal the finder's contact info and mark this as claimed."
              : "Confirm below to reveal the owner's contact info and mark this as claimed."}
          </DialogDescription>
        </DialogHeader>

        {/* Item Summary */}
        <div className="claim-modal-summary mt-4 p-4 rounded-lg bg-surface border border-border">
          <div className="font-medium">
            {categoryIcon} {categoryLabel} · {locationLabel} · {dateStr}
          </div>
          {item.description && (
            <div className="text-sm text-muted mt-1">{item.description}</div>
          )}
        </div>

        {/* Poster Info */}
        <div className="claim-modal-poster flex items-center gap-3 mt-4 p-4 rounded-lg bg-surface border border-border">
          <div className="claim-modal-avatar w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            {success ? "✓" : "🔒"}
          </div>
          <div>
            <div className="font-medium">{item.userName || "ESTIN Student"}</div>
            {success && item.userEmail && (
              <a
                href={`mailto:${item.userEmail}`}
                className="text-sm text-teal hover:underline"
              >
                {item.userEmail}
              </a>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red/10 border border-red/30 text-red text-sm">
            {error}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleConfirm}
          disabled={loading || success}
          className={cn(
            "w-full mt-6 py-3 rounded-full font-display font-bold text-sm transition-all cursor-pointer hover:-translate-y-0.5",
            isFound
              ? "bg-teal text-[#0d0d0d] hover:shadow-lg hover:shadow-teal/30"
              : "bg-red text-white hover:shadow-lg hover:shadow-red/30",
            (loading || success) && "opacity-50 cursor-not-allowed"
          )}
        >
          {success
            ? "Done! ✓"
            : loading
            ? "Saving..."
            : isFound
            ? "Yes, this is mine →"
            : "Yes, I found this →"}
        </button>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getClientDb, getClientStorage } from "@/lib/firebase/client";
import { useAuth } from "@/hooks/use-auth";
import { checkPostRateLimit } from "@/lib/utils";
import {
  CATEGORIES,
  ZONES,
  WHERE_LEFT_OPTIONS,
  SPOT_OPTIONS,
  CATEGORY_LABELS,
  LOCATION_LABELS,
  WHERE_LEFT_LABELS,
  VALID_CATEGORIES,
  VALID_LOCATIONS,
  VALID_WHERE_LEFT,
} from "@/lib/constants/labels";

interface ReportFormProps {
  type: "found" | "lost";
}

interface FormData {
  category: string | null;
  zone: string | null;
  spot: string | null;
  customSpot: string;
  whereLeft: string | null;
  date: string;
  description: string;
  photoFile: File | null;
  photoPreview: string | null;
}

interface FormErrors {
  category: boolean;
  location: boolean;
  whereLeft: boolean;
  date: boolean;
  submit: string | null;
}

export function ReportForm({ type }: ReportFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState<FormData>({
    category: null,
    zone: null,
    spot: null,
    customSpot: "",
    whereLeft: null,
    date: today,
    description: "",
    photoFile: null,
    photoPreview: null,
  });

  const [errors, setErrors] = useState<FormErrors>({
    category: false,
    location: false,
    whereLeft: false,
    date: false,
    submit: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    category: string;
    location: string;
    whereLeft: string;
    date: string;
    description: string;
    hasPhoto: boolean;
  } | null>(null);

  const isTeal = type === "found";
  const accentClass = isTeal ? "selected-found" : "selected-lost";

  // Chip selection handler
  const selectChip = (
    field: "category" | "zone" | "whereLeft",
    value: string
  ) => {
    setFormData((prev) => {
      const updates: Partial<FormData> = { [field]: value };

      // Reset spot when zone changes
      if (field === "zone") {
        updates.spot = null;
        updates.customSpot = "";
      }

      return { ...prev, ...updates };
    });

    // Clear related error
    if (field === "category") setErrors((prev) => ({ ...prev, category: false }));
    if (field === "zone") setErrors((prev) => ({ ...prev, location: false }));
    if (field === "whereLeft") setErrors((prev) => ({ ...prev, whereLeft: false }));
  };

  const selectSpot = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      spot: value,
      customSpot: value === "other" ? prev.customSpot : "",
    }));
    setErrors((prev) => ({ ...prev, location: false }));
  };

  // Photo handling
  const handlePhotoSelect = useCallback((file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, submit: "Only image files are accepted." }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, submit: "Photo must be under 5 MB." }));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setFormData((prev) => {
      if (prev.photoPreview) URL.revokeObjectURL(prev.photoPreview);
      return { ...prev, photoFile: file, photoPreview: objectUrl };
    });
    setErrors((prev) => ({ ...prev, submit: null }));
  }, []);

  const removePhoto = () => {
    setFormData((prev) => {
      if (prev.photoPreview) URL.revokeObjectURL(prev.photoPreview);
      return { ...prev, photoFile: null, photoPreview: null };
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Get location value for submission
  const getLocationValue = (): string | null => {
    if (formData.zone === "unknown") return "unknown";
    if (!formData.spot) return null;
    if (formData.spot === "other") return formData.customSpot.trim() || null;
    return formData.spot;
  };

  const getLocationLabel = (): string => {
    if (formData.zone === "unknown") return "Not sure";
    if (!formData.spot) return "";
    if (formData.spot === "other") return formData.customSpot.trim() || "";
    return LOCATION_LABELS[formData.spot] || formData.spot;
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: FormErrors = {
      category: !formData.category,
      location: !getLocationValue(),
      whereLeft: type === "found" && !formData.whereLeft,
      date: !formData.date,
      submit: null,
    };

    // Additional validation
    if (formData.category && !VALID_CATEGORIES.includes(formData.category)) {
      newErrors.category = true;
    }

    const loc = getLocationValue();
    if (loc && !VALID_LOCATIONS.includes(loc) && formData.spot !== "other") {
      newErrors.location = true;
    }
    if (formData.spot === "other" && loc && loc.length > 80) {
      newErrors.location = true;
    }

    if (type === "found" && formData.whereLeft && !VALID_WHERE_LEFT.includes(formData.whereLeft)) {
      newErrors.whereLeft = true;
    }

    if (formData.description.length > 400) {
      newErrors.submit = "Description must be 400 characters or fewer.";
    }

    if (formData.date && formData.date > today) {
      newErrors.date = true;
    }

    setErrors(newErrors);
    return !newErrors.category && !newErrors.location && !newErrors.whereLeft && !newErrors.date && !newErrors.submit;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, submit: null }));

    try {
      // Check rate limit (3 posts per hour, 10 per day)
      const rateLimit = await checkPostRateLimit(user.uid);
      if (!rateLimit.allowed) {
        const limitType = rateLimit.dailyRemaining === 0 ? "daily" : "hourly";
        const limit = limitType === "daily" ? 10 : 3;
        setErrors((prev) => ({
          ...prev,
          submit: `You've reached the ${limitType} limit of ${limit} posts. Try again in ${rateLimit.resetIn}.`,
        }));
        setIsSubmitting(false);
        return;
      }

      let photoURL: string | null = null;
      const storage = getClientStorage();
      const db = getClientDb();

      if (formData.photoFile) {
        const mimeToExt: Record<string, string> = {
          "image/jpeg": "jpg",
          "image/png": "png",
          "image/gif": "gif",
          "image/webp": "webp",
          "image/heic": "heic",
        };
        const ext = mimeToExt[formData.photoFile.type] || formData.photoFile.name.split(".").pop() || "jpg";
        const path = `${type}-items/${user.uid}/${Date.now()}.${ext}`;
        const photoRef = ref(storage, path);
        await uploadBytes(photoRef, formData.photoFile);
        photoURL = await getDownloadURL(photoRef);
      }

      const locationValue = getLocationValue();
      const data = {
        type,
        category: VALID_CATEGORIES.includes(formData.category!) ? formData.category : null,
        zone: formData.zone?.slice(0, 40) || null,
        location: locationValue?.slice(0, 80) || null,
        whereLeft: type === "found" && formData.whereLeft && VALID_WHERE_LEFT.includes(formData.whereLeft)
          ? formData.whereLeft
          : null,
        date: formData.date,
        description: formData.description.trim().slice(0, 400) || null,
        photoURL,
        userEmail: user.email,
        userName: user.displayName,
        userUID: user.uid,
        createdAt: serverTimestamp(),
        status: "open",
      };

      if (!data.category || !data.location || (type === "found" && !data.whereLeft)) {
        setErrors((prev) => ({ ...prev, submit: "Invalid form data. Please refresh and try again." }));
        setIsSubmitting(false);
        return;
      }

      await addDoc(collection(db, "items"), data);

      setSubmittedData({
        category: CATEGORY_LABELS[data.category] || data.category,
        location: getLocationLabel(),
        whereLeft: data.whereLeft ? WHERE_LEFT_LABELS[data.whereLeft] : "",
        date: new Date(data.date + "T00:00:00").toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        description: data.description || "",
        hasPhoto: !!photoURL,
      });
      setShowSuccess(true);
    } catch {
      setErrors((prev) => ({ ...prev, submit: "Something went wrong. Please try again." }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Spot options based on zone
  const spotOptions = formData.zone && formData.zone !== "unknown"
    ? SPOT_OPTIONS[formData.zone as keyof typeof SPOT_OPTIONS]
    : [];

  if (showSuccess && submittedData) {
    return (
      <div className="success-screen">
        <div className={`success-icon ${isTeal ? "success-icon--teal" : "success-icon--red"}`}>
          ✓
        </div>
        <h2>{type === "found" ? "Thank you!" : "Posted!"}</h2>
        <p>
          {type === "found"
            ? "Your found item report is live. If the owner sees it, they'll reach out to claim it."
            : "Your lost item report is live. We hope someone finds it and reaches out!"}
        </p>
        <div className="success-card">
          <div className="success-card-row">
            <span>Category</span>
            <span>{submittedData.category}</span>
          </div>
          <div className="success-card-row">
            <span>{type === "found" ? "Found at" : "Lost at"}</span>
            <span>{submittedData.location}</span>
          </div>
          {type === "found" && submittedData.whereLeft && (
            <div className="success-card-row">
              <span>Item is</span>
              <span>{submittedData.whereLeft}</span>
            </div>
          )}
          <div className="success-card-row">
            <span>Date</span>
            <span>{submittedData.date}</span>
          </div>
          {submittedData.description && (
            <div className="success-card-row">
              <span>Details</span>
              <span>{submittedData.description}</span>
            </div>
          )}
          {submittedData.hasPhoto && (
            <div className="success-card-row">
              <span>Photo</span>
              <span>✓ Attached</span>
            </div>
          )}
        </div>
        <div className="success-actions">
          <Link href="/" className="btn-ghost">
            Back to home
          </Link>
          <button
            onClick={() => router.refresh()}
            className={`btn-submit ${isTeal ? "btn-submit--teal" : "btn-submit--red"}`}
          >
            Report another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="report-form" onSubmit={handleSubmit} noValidate>
      {/* Category */}
      <div className="form-section" style={{ animationDelay: "0.05s" }}>
        <div className="form-label">
          {type === "found" ? "What did you find?" : "What did you lose?"}
        </div>
        <div className="chip-grid">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              className={`chip-form ${formData.category === cat.value ? accentClass : ""}`}
              onClick={() => selectChip("category", cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>
        {errors.category && (
          <div className="field-error visible">Please select a category.</div>
        )}
      </div>

      {/* Location - Zone */}
      <div className="form-section" style={{ animationDelay: "0.1s" }}>
        <div className="form-label">
          {type === "found" ? "Where did you find it?" : "Where did you lose it?"}
        </div>
        <div className="chip-grid">
          {ZONES.map((zone) => (
            <button
              key={zone.value}
              type="button"
              className={`chip-form ${formData.zone === zone.value ? accentClass : ""}`}
              onClick={() => selectChip("zone", zone.value)}
            >
              {zone.label}
            </button>
          ))}
        </div>

        {/* Spot selection */}
        {formData.zone && formData.zone !== "unknown" && (
          <div className="mt-3">
            <div className="form-sublabel">More specifically…</div>
            <div className="chip-grid">
              {spotOptions.map((spot) => (
                <button
                  key={spot.value}
                  type="button"
                  className={`chip-form ${formData.spot === spot.value ? accentClass : ""}`}
                  onClick={() => selectSpot(spot.value)}
                >
                  {spot.label}
                </button>
              ))}
            </div>
            {formData.spot === "other" && (
              <input
                type="text"
                className={`text-input mt-3 ${isTeal ? "text-input--teal" : "text-input--red"}`}
                placeholder="Where exactly?"
                maxLength={80}
                value={formData.customSpot}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, customSpot: e.target.value }))
                }
                style={{ minHeight: "unset", padding: "0.6rem 0.9rem" }}
              />
            )}
          </div>
        )}
        {errors.location && (
          <div className="field-error visible">Please select a location.</div>
        )}
      </div>

      {/* Where Left (found only) */}
      {type === "found" && (
        <div className="form-section" style={{ animationDelay: "0.15s" }}>
          <div className="form-label">Where is it now?</div>
          <div className="chip-grid">
            {WHERE_LEFT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`chip-form ${formData.whereLeft === opt.value ? accentClass : ""}`}
                onClick={() => selectChip("whereLeft", opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {errors.whereLeft && (
            <div className="field-error visible">Please select where the item is now.</div>
          )}
        </div>
      )}

      {/* Date */}
      <div className="form-section" style={{ animationDelay: "0.2s" }}>
        <div className="form-label">
          {type === "found" ? "When did you find it?" : "When did you lose it?"}
        </div>
        <input
          type="date"
          className={`date-input ${isTeal ? "date-input--teal" : "date-input--red"}`}
          max={today}
          value={formData.date}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, date: e.target.value }));
            setErrors((prev) => ({ ...prev, date: false }));
          }}
        />
        {errors.date && (
          <div className="field-error visible">
            Please select the date you {type === "found" ? "found" : "lost"} it.
          </div>
        )}
      </div>

      {/* Description */}
      <div className="form-section" style={{ animationDelay: "0.25s" }}>
        <div className="form-label">
          Description <span className="optional">optional</span>
        </div>
        <textarea
          className={`text-input ${isTeal ? "text-input--teal" : "text-input--red"}`}
          placeholder="Colour, brand, any details that could help identify it…"
          maxLength={400}
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
        />
      </div>

      {/* Photo */}
      <div className="form-section" style={{ animationDelay: "0.3s" }}>
        <div className="form-label">
          Photo <span className="optional">optional — but really helpful</span>
        </div>
        <div className="photo-upload">
          {!formData.photoPreview ? (
            <div
              className={`photo-drop ${isTeal ? "photo-drop--teal" : "photo-drop--red"}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add("dragover");
              }}
              onDragLeave={(e) => e.currentTarget.classList.remove("dragover")}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("dragover");
                handlePhotoSelect(e.dataTransfer.files[0] || null);
              }}
            >
              <div className="photo-drop-icon">📷</div>
              <p>
                <strong className={isTeal ? "accent--teal" : "accent--red"}>
                  Click to attach
                </strong>{" "}
                or drag a photo here
              </p>
              <span>JPG, PNG, WEBP — max 5MB</span>
            </div>
          ) : (
            <div className="photo-preview" style={{ display: "block" }}>
              <Image
                src={formData.photoPreview}
                alt="Preview"
                width={400}
                height={200}
                className="object-cover w-full"
                style={{ height: 200 }}
              />
              <button
                type="button"
                className={`photo-preview-remove ${isTeal ? "photo-preview-remove--teal" : "photo-preview-remove--red"}`}
                onClick={removePhoto}
              >
                ✕
              </button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handlePhotoSelect(e.target.files?.[0] || null)}
          />
        </div>
      </div>

      <div className="form-divider" />

      {/* Notice */}
      <div className={`form-notice ${isTeal ? "form-notice--teal" : "form-notice--red"}`}>
        <span className="form-notice-icon">✦</span>
        <p>
          Your post will be <strong>visible to all ESTIN students</strong> on the browse
          page. Your <strong>{user?.email}</strong>{" "}
          <strong>email address will be shared</strong> with{" "}
          {type === "found" ? "the owner" : "the finder"} so they can contact you directly.
        </p>
      </div>

      {/* Submit */}
      <div className="form-submit-row">
        <span className="form-submit-hint">
          {type === "found" ? "You're doing a good thing." : "We hope you find it!"}
        </span>
        <button
          type="submit"
          className={`btn-submit ${isTeal ? "btn-submit--teal" : "btn-submit--red"}`}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Posting…"
            : type === "found"
            ? "Post found item →"
            : "Post lost item →"}
        </button>
      </div>

      {errors.submit && (
        <div className="field-error visible mt-2">{errors.submit}</div>
      )}
    </form>
  );
}

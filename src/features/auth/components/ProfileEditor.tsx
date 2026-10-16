"use client";
import { useState } from "react";
import { updateProfile } from "@/features/auth/profileActions";
import { profileCopy } from "@/i18n/messages/profile";
import type { CurrentUser } from "@/dto";
export function ProfileEditor({
  user,
  locale,
  onClose,
}: {
  user: CurrentUser;
  locale: string;
  onClose: () => void;
}) {
  const t = profileCopy(locale);
  const [username, setUsername] = useState(user.username);
  const [avatar, setAvatar] = useState(user.avatar ?? "");
  const [description, setDescription] = useState(user.description ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <form
      className="profile-editor"
      aria-label={t.edit}
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setError("");
        try {
          await updateProfile({ username, avatar, description });
          onClose();
        } catch (error) {
          const message = error instanceof Error ? error.message : "";
          setError(
            message.includes("USERNAME_TAKEN")
              ? t.taken
              : message.includes("INVALID_PROFILE")
                ? t.invalid
                : t.error,
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2>{t.edit}</h2>
      <label>
        {t.username}
        <input
          required
          minLength={3}
          maxLength={32}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="nickname"
          disabled={busy}
        />
      </label>
      <label>
        {t.avatar}
        <input
          type="url"
          maxLength={2048}
          value={avatar}
          onChange={(event) => setAvatar(event.target.value)}
          placeholder="https://…"
          disabled={busy}
        />
        <small>{t.avatarHint}</small>
      </label>
      <label className="profile-bio-field">
        {t.description}
        <textarea
          maxLength={1000}
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={busy}
        />
      </label>
      {error && (
        <p className="profile-editor-error" role="alert">
          {error}
        </p>
      )}
      <div className="profile-editor-actions">
        <button className="library-action" type="submit" disabled={busy}>
          {t.save}
        </button>
        <button
          className="library-action"
          type="button"
          disabled={busy}
          onClick={onClose}
        >
          {t.cancel}
        </button>
      </div>
    </form>
  );
}

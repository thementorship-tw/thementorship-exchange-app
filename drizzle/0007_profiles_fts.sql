-- Custom SQL migration file, put your code below! --

-- FTS5 external content table over profiles.offers_text / description / wants_text.
-- Uses the built-in `trigram` tokenizer (fixed 3-gram), so queries shorter than 3
-- characters (e.g. 2-character CJK terms) cannot match and fall back to LIKE.
--
-- `content='profiles'` with no `content_rowid` relies on `profiles` keeping its
-- implicit integer rowid (the table must never be declared WITHOUT ROWID, or this
-- mapping breaks).
CREATE VIRTUAL TABLE profiles_fts USING fts5(
  offers_text, description, wants_text,
  content='profiles',
  tokenize='trigram'
);--> statement-breakpoint

-- Backfill existing rows (no-op on a fresh database).
INSERT INTO profiles_fts(rowid, offers_text, description, wants_text)
SELECT rowid, offers_text, description, wants_text FROM profiles;--> statement-breakpoint

CREATE TRIGGER profiles_fts_ai AFTER INSERT ON profiles BEGIN
  INSERT INTO profiles_fts(rowid, offers_text, description, wants_text)
  VALUES (new.rowid, new.offers_text, new.description, new.wants_text);
END;--> statement-breakpoint

CREATE TRIGGER profiles_fts_au AFTER UPDATE ON profiles BEGIN
  INSERT INTO profiles_fts(profiles_fts, rowid, offers_text, description, wants_text)
  VALUES('delete', old.rowid, old.offers_text, old.description, old.wants_text);
  INSERT INTO profiles_fts(rowid, offers_text, description, wants_text)
  VALUES (new.rowid, new.offers_text, new.description, new.wants_text);
END;--> statement-breakpoint

CREATE TRIGGER profiles_fts_ad AFTER DELETE ON profiles BEGIN
  INSERT INTO profiles_fts(profiles_fts, rowid, offers_text, description, wants_text)
  VALUES('delete', old.rowid, old.offers_text, old.description, old.wants_text);
END;

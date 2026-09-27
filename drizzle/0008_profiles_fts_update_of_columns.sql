-- Custom SQL migration file, put your code below! --

-- Narrow the FTS sync UPDATE trigger to the three indexed text columns, so updates
-- to other profile fields (status, updated_at, ...) no longer rewrite profiles_fts.
DROP TRIGGER IF EXISTS profiles_fts_au;--> statement-breakpoint

CREATE TRIGGER profiles_fts_au AFTER UPDATE OF offers_text, description, wants_text ON profiles BEGIN
  INSERT INTO profiles_fts(profiles_fts, rowid, offers_text, description, wants_text)
  VALUES('delete', old.rowid, old.offers_text, old.description, old.wants_text);
  INSERT INTO profiles_fts(rowid, offers_text, description, wants_text)
  VALUES (new.rowid, new.offers_text, new.description, new.wants_text);
END;

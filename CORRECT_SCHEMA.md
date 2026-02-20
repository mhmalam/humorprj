# ✅ CORRECT Database Schema & Setup

## 📊 Your Database Structure

```
┌─────────────────┐
│ images          │
├─────────────────┤
│ id (uuid, PK)   │
│ url (text)      │
└────────┬────────┘
         │
         │ 1:N
         │ Referenced by image_id
         ▼
┌─────────────────┐
│ captions        │  ← Note: singular "captions"
├─────────────────┤
│ id (uuid, PK)   │
│ content (text)  │  ← Column is "content", not "caption_text"
│ image_id (uuid) │  ← References images.id
└────────┬────────┘
         │
         │ 1:N
         │ Referenced by caption_id
         ▼
┌─────────────────┐
│ caption_votes   │
├─────────────────┤
│ id (uuid, PK)   │
│ caption_id (FK) │  ← References captions.id
│ user_id (FK)    │  ← References auth.users.id
│ vote_type (text)│  ← 'upvote' or 'downvote'
│ created_at      │
│ UNIQUE(caption_id, user_id)
└─────────────────┘
```

## 🎯 Current Implementation

Your app now correctly:

### 1. Fetches from `captions` table
```typescript
const { data: captions, error } = await supabase
  .from('captions')
  .select(`
    *,
    images (*)
  `)
```

### 2. Uses correct column name: `content`
```typescript
interface Caption {
  id: string
  content: string        // ✅ Correct column name
  image_id: string
  images?: Image
}

// Display in component:
<p>{caption.content}</p>
```

### 3. Joins with `images` table via `image_id`
```typescript
// Returns:
{
  id: "uuid-123",
  content: "Funny caption text here",  // ✅ Using "content"
  image_id: "uuid-456",
  images: {
    id: "uuid-456",
    url: "https://example.com/image.jpg"
  }
}
```

## 📝 SQL to Create Tables

### Create `images` table:
```sql
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL
);
```

### Create `captions` table:
```sql
CREATE TABLE captions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE
);

CREATE INDEX idx_captions_image_id ON captions(image_id);
```

### Create `caption_votes` table:
```sql
CREATE TABLE caption_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caption_id UUID NOT NULL REFERENCES captions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(caption_id, user_id)
);

CREATE INDEX idx_caption_votes_caption_id ON caption_votes(caption_id);
CREATE INDEX idx_caption_votes_user_id ON caption_votes(user_id);
```

## 🧪 Test Data

```sql
-- 1. Insert a test image
INSERT INTO images (url) 
VALUES ('https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba');
-- Returns: uuid-123

-- 2. Insert a test caption
INSERT INTO captions (content, image_id) 
VALUES ('When you realize it''s Friday!', 'uuid-123');
-- Returns: uuid-456

-- 3. Test voting (requires logged in user)
-- This happens automatically when you click vote buttons in the app
```

## ✅ Files Using Correct Schema

### `app/page.tsx`
```typescript
interface Caption {
  id: string
  content: string      // ✅ Correct
  image_id: string
  images?: Image
}

// Query captions table
await supabase.from('captions').select('*, images (*)')
```

### `app/components/CaptionCard.tsx`
```typescript
interface Caption {
  id: string
  content: string      // ✅ Correct
  image_id: string
  images?: Image
}

// Display content
<p>{caption.content}</p>  // ✅ Correct
```

### `app/actions/voteActions.ts`
```typescript
// Inserts into caption_votes table
await supabase
  .from('caption_votes')
  .insert({
    caption_id: captionId,
    user_id: user.id,
    vote_type: voteType
  })
```

## 🎯 Quick Checklist

- ✅ Table name: `captions` (plural)
- ✅ Content column: `content` (not `caption_text`)
- ✅ Foreign key: `image_id` references `images.id`
- ✅ Query: `from('captions').select('*, images (*)')`
- ✅ Display: `{caption.content}`
- ✅ Voting: Saves to `caption_votes` table

## 🚀 Ready to Use!

Your app is now correctly configured for your database schema:
1. Run `npm run dev`
2. Log in
3. View captions with images
4. Vote on captions
5. Check `caption_votes` table for vote records

---

**Everything is now using the correct column names and table structure!** 🎉

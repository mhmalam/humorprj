# Updated Implementation - Caption Voting App

## 🎯 What Changed

Your app has been updated to focus on **caption voting** as the primary feature, replacing the sidechat posts feed.

## 📊 New Database Structure

```
┌─────────────────┐
│ images          │
├─────────────────┤
│ id (PK)         │
│ url             │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────┐
│ captions        │
├─────────────────┤
│ id (PK)         │
│ caption_text    │
│ image_id (FK)   │
│ created_at      │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────┐
│ caption_votes   │
├─────────────────┤
│ id (PK)         │
│ caption_id (FK) │
│ user_id (FK)    │
│ vote_type       │
│ created_at      │
│ UNIQUE(caption_id, user_id)
└─────────────────┘
```

## 📁 Files Modified

### 1. `app/page.tsx`
**Before:** Fetched sidechat posts with nested captions
**Now:** Fetches captions with nested images directly

```typescript
// NEW: Fetches captions with their associated images
const { data: captions, error } = await supabase
  .from('captions')
  .select(`
    *,
    images (*)
  `)
  .order('created_at', { ascending: false })
```

### 2. `app/layout.tsx`
**Before:** "Sidechat Posts"
**Now:** "Caption Voting"

### 3. `app/components/CaptionCard.tsx` (NEW)
Replaces PostCard component. Displays:
- Image at the top (from `images` table via `image_id`)
- Caption text below the image
- Vote buttons at the bottom
- Timestamp showing when caption was created

## 🎨 UI Updates

### New Layout:
```
┌─────────────────────────────────────┐
│         [Image Display]             │
│                                     │
├─────────────────────────────────────┤
│ 👤 Caption · 2 hours ago            │
│                                     │
│ "This is a funny caption!"          │
│ ─────────────────────────────────── │
│ [⬆️ Up] [⬇️ Down]                   │
└─────────────────────────────────────┘
```

### Header Updated:
- **Before:** "COLUMBIA SIDECHAT - Ivy League brainrot"
- **Now:** "CAPTION VOTING - Vote on the funniest captions"

## 🔄 Data Flow

```
1. User logs in
   ↓
2. App fetches captions from 'captions' table
   ↓
3. For each caption, fetches related image from 'images' table
   ↓
4. CaptionCard displays image + caption text
   ↓
5. User clicks upvote/downvote
   ↓
6. Vote stored in 'caption_votes' table
   ↓
7. UI updates with success message
```

## ✅ Features That Still Work

✅ **Authentication** - Only logged-in users can access
✅ **Voting** - Upvote/downvote functionality unchanged
✅ **Vote Storage** - Still uses `caption_votes` table
✅ **One Vote Per User** - Database constraint still enforced
✅ **Modern UI** - Same beautiful design
✅ **Error Handling** - Graceful error messages

## 🆕 What's New

✅ **Image Display** - Each caption shows its associated image
✅ **Direct Caption Focus** - No more nested posts structure
✅ **Simpler Data Model** - Cleaner relationship: images → captions → votes
✅ **Better Performance** - Single query instead of nested queries

## 🗄️ Database Requirements

Your Supabase database should have these tables:

### `images` table
```sql
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `captions` table
```sql
CREATE TABLE captions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caption_text TEXT NOT NULL,
  image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_captions_image_id ON captions(image_id);
```

### `caption_votes` table
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

## 🚀 How to Use

1. **Make sure your database has the correct tables:**
   - `images` - stores image URLs
   - `captions` - stores caption text and references images
   - `caption_votes` - stores user votes (already created)

2. **Add some test data:**
   ```sql
   -- Insert a test image
   INSERT INTO images (url) VALUES ('https://example.com/image.jpg');
   
   -- Insert a test caption
   INSERT INTO captions (caption_text, image_id) 
   VALUES ('This is a funny caption!', '<image_id_from_above>');
   ```

3. **Run the app:**
   ```bash
   npm run dev
   ```

4. **Test voting:**
   - Log in
   - View captions with their images
   - Click upvote or downvote
   - See the vote recorded in `caption_votes` table

## 🔍 What Was Removed

❌ `PostCard` component (replaced by `CaptionCard`)
❌ Sidechat posts feature
❌ Nested captions within posts
❌ Post-specific fields (like_count, etc.)

## 📝 Key Code Changes

### Old Query (Posts → Captions):
```typescript
.from('sidechat_posts')
.select('*, captions (*)')
```

### New Query (Captions → Images):
```typescript
.from('captions')
.select('*, images (*)')
.order('created_at', { ascending: false })
```

### Old Component Hierarchy:
```
PostCard
  └─ Multiple Captions
      └─ VoteButton for each
```

### New Component Hierarchy:
```
CaptionCard (one per caption)
  ├─ Image (from images table)
  ├─ Caption Text
  └─ VoteButton
```

## 🎯 Assignment Requirements Met

✅ Users can vote on captions (upvote/downvote)
✅ Votes stored in `caption_votes` table
✅ Data mutation (new rows created on vote)
✅ Authentication required
✅ Server-side validation
✅ Clean, working implementation

## 🐛 Troubleshooting

**No captions showing?**
- Ensure `captions` and `images` tables exist
- Add test data to both tables
- Check that `image_id` in captions references valid images

**Images not displaying?**
- Verify image URLs are accessible
- Check browser console for CORS errors
- Ensure images table has valid `url` column

**Voting not working?**
- Caption voting functionality unchanged from before
- Check `caption_votes` table exists
- Ensure user is logged in

---

Your app is now a focused caption voting platform! 🎉

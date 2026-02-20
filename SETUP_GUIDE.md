# Quick Setup Guide for Caption Voting

## Step 1: Create the `caption_votes` Table in Supabase

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the following SQL to create the table:

```sql
CREATE TABLE caption_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caption_id UUID NOT NULL REFERENCES captions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(caption_id, user_id)
);

-- Add indexes for better performance
CREATE INDEX idx_caption_votes_caption_id ON caption_votes(caption_id);
CREATE INDEX idx_caption_votes_user_id ON caption_votes(user_id);
```

## Step 2: Verify Your Existing Tables

Make sure you have these tables already set up:
- `sidechat_posts` - with at least an `id` column
- `captions` - with `id`, `post_id`, and `caption_text` columns

## Step 3: Test the Feature

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000

3. Log in with your account

4. Find a post with captions (if you don't have any captions yet, you'll need to add some to your database)

5. Try clicking the upvote or downvote buttons

6. Check your Supabase `caption_votes` table to see the vote recorded

## What Each File Does

- **`app/page.tsx`** - Main page that fetches posts and captions
- **`app/components/PostCard.tsx`** - Displays each post with its captions
- **`app/components/VoteButton.tsx`** - The upvote/downvote UI buttons
- **`app/actions/voteActions.ts`** - Server-side logic that saves votes to database

## Key Features

✅ Only logged-in users can vote  
✅ Each user can vote once per caption (enforced by database constraint)  
✅ Votes are stored in the `caption_votes` table  
✅ Clean, modern UI that matches your existing design  
✅ Real-time feedback when voting  

## Troubleshooting

**No captions showing up?**
- Check if your `captions` table has data
- Verify the `post_id` in captions matches posts in `sidechat_posts`

**Voting not working?**
- Make sure you're logged in
- Check browser console for errors
- Verify the `caption_votes` table was created correctly

**Getting database errors?**
- Ensure your Supabase environment variables are set in `.env.local`
- Check that RLS policies allow authenticated users to insert into `caption_votes`

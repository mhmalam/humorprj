# Caption Voting Feature Implementation

## Overview
This implementation adds caption voting functionality to your Humor Project app, allowing authenticated users to upvote or downvote captions associated with posts.

## Database Schema Requirements

Your Supabase database should have the following tables:

### `captions` table
- `id` (uuid, primary key)
- `post_id` (uuid, foreign key to sidechat_posts)
- `caption_text` (text)
- Additional fields as needed

### `caption_votes` table (NEW)
You need to create this table in Supabase with the following structure:

```sql
CREATE TABLE caption_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caption_id UUID NOT NULL REFERENCES captions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(caption_id, user_id)
);

-- Add index for faster queries
CREATE INDEX idx_caption_votes_caption_id ON caption_votes(caption_id);
CREATE INDEX idx_caption_votes_user_id ON caption_votes(user_id);
```

**Note:** The `UNIQUE(caption_id, user_id)` constraint ensures a user can only vote once per caption.

## Files Modified

### 1. `app/page.tsx`
- Updated to fetch captions along with posts using Supabase's nested query syntax
- Added Caption interface
- Passes user ID to PostCard component for authentication

### 2. `app/components/PostCard.tsx`
- Enhanced to display captions with voting UI
- Added userId prop to handle authentication
- Integrated VoteButton component for each caption
- Styled captions section with modern UI

## Files Created

### 3. `app/actions/voteActions.ts` (NEW)
Server action that handles vote submissions:
- Checks if user is authenticated before allowing votes
- Inserts vote records into `caption_votes` table
- Returns success/error status
- Revalidates page cache after vote submission

### 4. `app/components/VoteButton.tsx` (NEW)
Client component for voting UI:
- Displays upvote and downvote buttons
- Handles loading states with useTransition
- Shows visual feedback when vote is submitted
- Disables buttons after voting to prevent duplicate votes
- Displays error messages if voting fails

## Key Features

✅ **Authentication Required**: Only logged-in users can vote (enforced server-side)
✅ **Data Mutation**: Creates new rows in `caption_votes` table
✅ **Visual Feedback**: Buttons change color and show status after voting
✅ **Error Handling**: Gracefully handles authentication and database errors
✅ **Modern UI**: Styled with Tailwind CSS to match your existing design
✅ **Optimistic Updates**: Uses Next.js transitions for smooth UX

## How It Works

1. **User views post** → Page fetches posts with nested captions data
2. **User sees captions** → Each caption displays with upvote/downvote buttons
3. **User clicks vote** → Client component calls server action
4. **Server validates** → Checks authentication and submits vote to database
5. **Database stores** → New row created in `caption_votes` table
6. **UI updates** → Button state changes to show vote was recorded

## Testing the Feature

1. Ensure you're logged in (authentication is required)
2. Navigate to a post that has captions
3. Click the upvote or downvote button on a caption
4. Observe the button change color and show confirmation
5. Check your Supabase database to see the vote recorded in `caption_votes`

## Important Notes

- **RLS Policies**: As requested, no RLS policies were updated or enabled
- **One vote per user**: The database constraint prevents duplicate votes
- **Authenticated only**: Server action validates user session before allowing votes
- **Type safety**: Full TypeScript typing for all components and actions

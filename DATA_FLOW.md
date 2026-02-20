# Caption Voting Data Flow

## Database Schema

```
┌─────────────────┐
│ sidechat_posts  │
├─────────────────┤
│ id (PK)         │
│ content         │
│ post_time       │
│ like_count      │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────┐
│ captions        │
├─────────────────┤
│ id (PK)         │
│ post_id (FK)    │
│ caption_text    │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────┐
│ caption_votes   │  ◄── NEW TABLE
├─────────────────┤
│ id (PK)         │
│ caption_id (FK) │
│ user_id (FK)    │
│ vote_type       │  ('upvote' or 'downvote')
│ created_at      │
│ UNIQUE(caption_id, user_id)  ◄── Prevents duplicate votes
└─────────────────┘
```

## Component Flow

```
app/page.tsx (Server Component)
│
├─ Checks authentication
├─ Fetches posts with captions from Supabase
│  Query: SELECT *, captions (*) FROM sidechat_posts
│
└─ Renders PostCard for each post
   │
   └─ app/components/PostCard.tsx (Client Component)
      │
      ├─ Displays post content
      ├─ Displays like count
      │
      └─ For each caption:
         │
         └─ app/components/VoteButton.tsx (Client Component)
            │
            ├─ Upvote button
            ├─ Downvote button
            │
            └─ On click:
               │
               └─ Calls submitVote() from app/actions/voteActions.ts
                  │
                  ├─ Validates user is authenticated
                  ├─ Inserts vote into caption_votes table
                  ├─ Revalidates page cache
                  └─ Returns success/error to UI
```

## User Interaction Flow

```
1. User logs in
   └─ Authentication state stored in cookies

2. User views posts
   └─ Server fetches posts + captions from database

3. User sees captions with vote buttons
   └─ Each caption shows: [Upvote] [Downvote]

4. User clicks upvote/downvote
   └─ VoteButton component triggers

5. Client calls server action
   └─ submitVote(captionId, voteType)

6. Server validates authentication
   └─ Checks if user session exists

7. Server inserts vote record
   └─ INSERT INTO caption_votes (caption_id, user_id, vote_type)

8. Database constraint enforced
   └─ UNIQUE(caption_id, user_id) prevents duplicates

9. Page cache revalidated
   └─ revalidatePath('/') called

10. UI updates
    └─ Button changes color, shows success message
```

## Authentication Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ User clicks vote
       │
       ▼
┌─────────────────┐
│  VoteButton     │ (Client Component)
│  component      │
└──────┬──────────┘
       │
       │ Calls server action
       │
       ▼
┌─────────────────┐
│  submitVote()   │ (Server Action)
│  action         │
├─────────────────┤
│ 1. Get user     │ ◄── createClient() + auth.getUser()
│    from session │
│                 │
│ 2. If no user:  │
│    Return error │ ──► "You must be logged in to vote"
│                 │
│ 3. If user:     │
│    Insert vote  │ ──► INSERT INTO caption_votes
│                 │
│ 4. Revalidate   │ ──► revalidatePath('/')
└─────────────────┘
```

## Error Handling

```
Scenario 1: User not logged in
├─ submitVote() checks authentication
└─ Returns: { success: false, error: "You must be logged in to vote" }

Scenario 2: Duplicate vote attempt
├─ Database UNIQUE constraint violated
└─ Returns: { success: false, error: "duplicate key value..." }

Scenario 3: Invalid caption ID
├─ Foreign key constraint violation
└─ Returns: { success: false, error: "violates foreign key constraint" }

Scenario 4: Success
└─ Returns: { success: true, data: [vote record] }
```

## Security Layers

```
Layer 1: UI
└─ VoteButton only rendered if userId exists

Layer 2: Client-side check
└─ VoteButton checks userId before calling server action

Layer 3: Server-side validation
└─ submitVote() validates user session with Supabase auth

Layer 4: Database constraints
├─ Foreign key ensures caption exists
├─ Foreign key ensures user exists
└─ UNIQUE constraint prevents duplicate votes
```

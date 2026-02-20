# Caption Voting App - Visual Guide

## 🖼️ Screen Layout

```
┌──────────────────────────────────────────────────────────┐
│  😂 THE HUMOR PROJECT                    👤 Profile      │
│                                                          │
│         ╔═══════════════════════════════╗               │
│         ║   CAPTION VOTING              ║               │
│         ║   Vote on the funniest        ║               │
│         ║   captions                    ║               │
│         ╚═══════════════════════════════╝               │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   │     │
│  │ ┃                                          ┃   │     │
│  │ ┃         [Image Display Area]            ┃   │     │
│  │ ┃                                          ┃   │     │
│  │ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │     │
│  │ ────────────────────────────────────────────  │     │
│  │ 👤 Caption · 2 hours ago                      │     │
│  │                                                │     │
│  │ "This is a hilarious caption for this image!" │     │
│  │                                                │     │
│  │ ────────────────────────────────────────────  │     │
│  │ [⬆️ Up] [⬇️ Down]                             │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   │     │
│  │ ┃                                          ┃   │     │
│  │ ┃         [Another Image]                 ┃   │     │
│  │ ┃                                          ┃   │     │
│  │ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │     │
│  │ ────────────────────────────────────────────  │     │
│  │ 👤 Caption · 5 hours ago                      │     │
│  │                                                │     │
│  │ "Another funny caption here!"                  │     │
│  │                                                │     │
│  │ ────────────────────────────────────────────  │     │
│  │ [⬆️ Up] [⬇️ Down]                             │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## 📊 Data Relationships

```
┌─────────────────────────┐
│       images            │
│  ┌──────────────────┐   │
│  │ id: uuid-123     │   │
│  │ url: "https://..." │  │
│  └──────────────────┘   │
└───────────┬─────────────┘
            │
            │ Referenced by
            │ image_id
            ▼
┌─────────────────────────┐
│       captions          │
│  ┌──────────────────┐   │
│  │ id: uuid-456     │   │
│  │ image_id: 123    │───┘ (points to image above)
│  │ caption_text: "…"│
│  └──────────────────┘   │
└───────────┬─────────────┘
            │
            │ Referenced by
            │ caption_id
            ▼
┌─────────────────────────┐
│    caption_votes        │
│  ┌──────────────────┐   │
│  │ id: uuid-789     │   │
│  │ caption_id: 456  │───┘ (points to caption above)
│  │ user_id: abc     │
│  │ vote_type: "up"  │
│  └──────────────────┘   │
└─────────────────────────┘
```

## 🔄 User Flow

```
Step 1: Login
┌─────────────┐
│   User      │
│   Login     │
└──────┬──────┘
       │
       ▼
Step 2: View Captions
┌─────────────────────────┐
│  Fetch from database:   │
│  SELECT *               │
│  FROM captions          │
│  JOIN images            │
│  ORDER BY created_at    │
└──────┬──────────────────┘
       │
       ▼
Step 3: Display
┌─────────────────────────┐
│  For each caption:      │
│  - Show image           │
│  - Show caption text    │
│  - Show vote buttons    │
└──────┬──────────────────┘
       │
       ▼
Step 4: User Votes
┌─────────────────────────┐
│  User clicks            │
│  [⬆️ Up] or [⬇️ Down]  │
└──────┬──────────────────┘
       │
       ▼
Step 5: Save Vote
┌─────────────────────────┐
│  INSERT INTO            │
│  caption_votes          │
│  (caption_id,           │
│   user_id,              │
│   vote_type)            │
└──────┬──────────────────┘
       │
       ▼
Step 6: Show Success
┌─────────────────────────┐
│  Button turns green/red │
│  Shows "Upvoted!" or    │
│  "Downvoted!"           │
└─────────────────────────┘
```

## 🎨 Component Breakdown

```
page.tsx (Server Component)
│
├── Checks authentication
│   └── If not logged in → Show LoginGate
│
├── Fetches captions + images from database
│   Query: captions + images (joined)
│
└── Renders for each caption:
    │
    └── CaptionCard (Client Component)
        │
        ├── Image Display
        │   └── Shows image from images.url
        │
        ├── Caption Header
        │   ├── Avatar icon
        │   └── Timestamp
        │
        ├── Caption Text
        │   └── Shows caption_text
        │
        └── VoteButton (Client Component)
            │
            ├── [⬆️ Up] Button
            │   └── onClick → submitVote('upvote')
            │
            └── [⬇️ Down] Button
                └── onClick → submitVote('downvote')
```

## 🔒 Security Flow

```
┌──────────────────────────────────────────────┐
│  User clicks vote button                     │
└──────────────┬───────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│  VoteButton checks if userId exists          │
│  (Client-side check)                         │
└──────────────┬───────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│  Calls submitVote() server action            │
│  Passes: captionId, voteType                 │
└──────────────┬───────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│  Server validates authentication             │
│  const { user } = await supabase.auth.       │
│                   getUser()                  │
└──────────────┬───────────────────────────────┘
               │
               ├── No user? → Return error
               │
               ▼ User exists
┌──────────────────────────────────────────────┐
│  Insert vote into database                   │
│  INSERT INTO caption_votes                   │
│  (caption_id, user_id, vote_type)            │
└──────────────┬───────────────────────────────┘
               │
               ├── DB Error? → Return error
               │
               ▼ Success
┌──────────────────────────────────────────────┐
│  Return success to client                    │
│  UI updates to show vote recorded            │
└──────────────────────────────────────────────┘
```

## 📱 Responsive Design

```
Desktop (Wide Screen):
┌────────────────────────────────┐
│  Background Image Gallery      │
│  ┌──────────────────────┐      │
│  │   Caption Card       │      │
│  │   (Max-width: 2xl)   │      │
│  └──────────────────────┘      │
└────────────────────────────────┘

Mobile (Narrow Screen):
┌─────────────────┐
│  Sidebar hidden │
│  ┌───────────┐  │
│  │  Caption  │  │
│  │   Card    │  │
│  │ (Full w)  │  │
│  └───────────┘  │
└─────────────────┘
```

## 🎯 Key Features Visualized

### Before Voting:
```
┌────────────────────────────┐
│ [⬆️ Up] [⬇️ Down]          │
│  Gray      Gray            │
└────────────────────────────┘
```

### After Upvoting:
```
┌────────────────────────────┐
│ [✅ Up] [Down]  Upvoted!   │
│  Green    Disabled         │
└────────────────────────────┘
```

### After Downvoting:
```
┌────────────────────────────┐
│ [Up] [❌ Down]  Downvoted! │
│  Disabled  Red             │
└────────────────────────────┘
```

### Loading State:
```
┌────────────────────────────┐
│ [...] [...]                │
│  Loading...                │
└────────────────────────────┘
```

---

This visual guide helps you understand the structure and flow of your caption voting app!

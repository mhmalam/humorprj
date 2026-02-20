# 🔥 Tinder-Style Caption Voting - Feature Guide

## 🎯 What's New

Your caption voting app now has a **Tinder-style swipeable interface** for quick, fun voting!

## ✨ Features

### 1. **Single Card View**
- Shows one caption at a time
- Full focus on current content
- No distractions

### 2. **Multiple Ways to Vote**

#### 🖱️ Mouse Drag
- Click and drag the card left to downvote
- Click and drag the card right to upvote
- Visual feedback shows thumbs up/down while dragging

#### 🖲️ Button Click
- Click the ❌ button to downvote
- Click the ❤️ button to upvote
- Buttons scale and change color on hover

#### ⌨️ Keyboard Shortcuts
- Press `←` (left arrow) or `A` to downvote
- Press `→` (right arrow) or `D` to upvote
- Super fast voting!

### 3. **Smooth Animations**
- Card flies off screen when voting
- Next card slides in from below
- Smooth rotation and fade effects
- Spring-based physics animation

### 4. **Progress Tracking**
- Progress bar shows completion
- Counter shows "X / Total"
- "X remaining" indicator
- Completion screen when done

### 5. **Visual Feedback**
- 👍 appears when dragging right (upvote)
- 👎 appears when dragging left (downvote)
- Card rotates based on drag direction
- Opacity changes during drag

## 🎨 UI Layout

```
┌──────────────────────────────────────┐
│  Progress: 5 / 20     15 remaining   │
│  ████████░░░░░░░░░░░░░░░░░░░░░░     │
├──────────────────────────────────────┤
│                                      │
│    ┌──────────────────────┐         │
│    │                      │         │
│    │   [Image Display]    │         │
│    │                      │         │
│    ├──────────────────────┤         │
│    │                      │         │
│    │  "Caption text..."   │         │
│    │                      │         │
│    └──────────────────────┘         │
│                                      │
│         ❌          ❤️               │
│      [Nope]      [Love]              │
│                                      │
│  Use ← or A to downvote              │
│  Use → or D to upvote                │
│  Or drag the card left/right         │
└──────────────────────────────────────┘
```

## 🎮 How to Use

### For Quick Voting:
1. Use keyboard shortcuts: `←` or `→`
2. Vote through dozens of captions in seconds!

### For Thoughtful Voting:
1. Click the buttons at the bottom
2. Take your time to read each caption

### For Fun Interaction:
1. Drag cards left or right
2. Feel like you're swiping on Tinder!
3. Watch the smooth animations

## 🔄 What Happens When You Vote

1. **Card Animates** - Flies off screen with rotation
2. **Vote Saved** - Stored in `caption_votes` table
3. **Next Card** - Slides in from the stack
4. **Progress Updates** - Counter and bar increment

## 🎯 Completion Screen

When you've voted on all captions:

```
┌──────────────────────────────────────┐
│                                      │
│              🎉                      │
│                                      │
│          All done!                   │
│                                      │
│  You've voted on all captions        │
│                                      │
│      [Start Over Button]             │
│                                      │
└──────────────────────────────────────┘
```

## 🎨 Animations & Effects

### Card Swipe Animation
```typescript
// When dragging:
- Card follows mouse/touch
- Rotates based on drag direction
- Opacity fades as you drag further

// When voting:
- Card flies off screen (1000px)
- Rotates 20° (upvote) or -20° (downvote)
- Fades to opacity 0
- Duration: 400ms with spring easing
```

### Button Hover Effects
```css
- Scale up 10% on hover
- Color changes (red/green)
- Border color changes
- Scale down 95% on click
```

### Stack Effect
```css
- Next card visible behind current
- Scaled down 95%
- Opacity 50%
- Creates depth perception
```

## 📊 Technical Details

### Component: `SwipeableCards.tsx`

#### State Management
- `currentIndex` - Which caption is showing
- `swipeDirection` - 'left' | 'right' | null
- `isAnimating` - Prevents double-voting
- `dragOffset` - Mouse/touch position
- `isDragging` - Is user dragging?

#### Vote Threshold
- Must drag >100px to trigger vote
- Less than 100px snaps back to center

#### Animation Timing
- Swipe animation: 400ms
- Uses cubic-bezier(0.34, 1.56, 0.64, 1) for spring effect

## 🔧 Customization Options

Want to tweak the behavior? Edit `SwipeableCards.tsx`:

```typescript
// Drag threshold (line 97)
if (Math.abs(dragOffset.x) > 100) { // Change 100 to adjust sensitivity

// Animation speed (line 55)
setTimeout(() => {
  // ...
}, 400) // Change 400ms to adjust speed

// Rotation amount (line 126)
const rotation = dragOffset.x / 20 // Change 20 to adjust rotation sensitivity

// Vote distance (line 127)
swipeDirection === 'right' ? 1000 : -1000 // Change 1000 to adjust fly-off distance
```

## 🎯 Keyboard Shortcuts Reference

| Key | Action |
|-----|--------|
| `←` | Downvote (swipe left) |
| `→` | Upvote (swipe right) |
| `A` | Downvote (alternative) |
| `D` | Upvote (alternative) |

## 🐛 Troubleshooting

**Cards not dragging?**
- Make sure JavaScript is enabled
- Check browser console for errors

**Keyboard shortcuts not working?**
- Click on the page first to focus
- Make sure no input field is focused

**Animation feels slow/fast?**
- Adjust timing in `SwipeableCards.tsx` (see customization above)

**Can't go back?**
- Currently forward-only (like Tinder!)
- Use "Start Over" button to restart

## 📱 Mobile Support

The component is ready for touch events! To enable:
1. Add touch event handlers
2. Replace `onMouseDown/Move/Up` with touch equivalents
3. Use React's touch events or a library like `react-use-gesture`

## 🎉 Summary

Your caption voting app now features:
- ✅ Tinder-style swipe interface
- ✅ Smooth animations
- ✅ Multiple voting methods (drag, click, keyboard)
- ✅ Progress tracking
- ✅ Visual feedback
- ✅ Stack preview effect
- ✅ Completion screen

**It's now fun, fast, and addictive to use!** 🚀

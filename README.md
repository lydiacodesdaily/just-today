# Just Today

A gentle, real-time routine execution engine for iOS. Not a planner or habit tracker—Just Today helps you execute your routines with minimal cognitive load.

## Product Philosophy

- **Execution, not planning**: Focus on doing, not scheduling
- **Energy-aware**: Adapt routines based on how you feel today (Care/Steady/Flow)
- **Non-judgmental**: No streaks, no guilt, no gamification
- **Real-time guidance**: One task at a time, with gentle audio cues

## Core Concepts

### Routine Template vs Routine Run

- **Template**: Your saved routines (e.g., "Morning", "Night")
- **Run**: A live, mutable instance when you press Start
- Changes during a run don't affect the template unless you explicitly save

### Energy Model

Each task can be tagged:
- `careSafe`: Shows in Care mode (gentle essentials)
- `flowExtra`: Shows only in Flow mode (bonus tasks)
- Untagged tasks: Shows in Steady and Flow modes

When you select an energy mode for today, the app automatically filters which tasks appear in your run.

### Running a Routine

- Only one task is active at a time
- Tasks have planned duration but can go into overtime
- Gentle TTS reminders every 5 minutes of overtime
- Optional minute announcements and ticking sounds
- Full control: pause, skip, extend, reorder queue

## Features

### During a Run

- **Reorder tasks**: Move up/down, to next, or to end
- **Skip tasks**: Skip once for this run
- **Extend time**: +1m, +5m, +10m buttons
- **Add quick task**: Insert a task on the fly
- **Subtasks**: Step-mode checklist guidance (optional)

### Audio

- TTS announcements (task names, overtime reminders)
- Ticking sound during active tasks
- Audio ducking (ticking quiets during speech)
- All configurable in Settings

## Tech Stack

- **Expo** + React Native (file-based routing)
- **TypeScript** (strict mode)
- **Local storage** (AsyncStorage, no backend)
- **Audio**: expo-speech (TTS) + expo-av (sounds)

## Project Structure

```
just-today/
├── app/                    # Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx      # Home/Today screen
│   │   └── settings.tsx   # Settings screen
│   ├── routine/
│   │   ├── [id].tsx       # Template editor
│   │   └── run.tsx        # Running screen
│   └── _layout.tsx        # Root layout with providers
├── src/
│   ├── models/            # TypeScript interfaces
│   ├── engine/            # Core run logic
│   ├── audio/             # TTS and sound management
│   ├── persistence/       # AsyncStorage wrappers
│   ├── context/           # React contexts
│   ├── hooks/             # Custom hooks
│   ├── components/        # UI components
│   └── constants/         # Theme and constants
└── assets/
    └── sounds/            # Audio files
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- iOS Simulator or physical iOS device
- Xcode (for iOS development)

### Installation

```bash
# Install dependencies
npm install

# Start Expo development server
npm start

# Run on iOS simulator
npm run ios
```

### Initial Setup

1. Add audio files to `assets/sounds/`:
   - `tick.mp3` - Ticking sound loop
   - `chime.mp3` - Notification chime

2. Create your first routine:
   - Launch the app
   - Navigate to the home screen
   - Create a new routine template
   - Add tasks with names and durations
   - Tag tasks as "Care Safe" or "Flow Extra" as needed

3. Start a routine:
   - Select your energy mode (Care/Steady/Flow)
   - Tap "Start" on a routine
   - Follow the real-time guidance

## Development Notes

### Timer Implementation

The timer uses **timestamp-based calculation** to avoid drift:
- Store `startedAt` and `plannedEndAt` timestamps
- Compute remaining time from `Date.now()` on each tick
- Never rely on `setInterval` accumulation

### Audio Background Behavior

See [IOS_BACKGROUND_AUDIO.md](./IOS_BACKGROUND_AUDIO.md) for details on:
- Background audio modes
- Testing in dev builds vs Expo Go
- iOS permissions and capabilities

### State Management

- **RunContext**: Active routine run state (single source of truth)
- **SettingsContext**: User preferences
- Pure functions in `engine/` for state transitions
- Immutable state updates throughout

## Architecture Decisions

### Why Pure Functions for Run Engine?

All run state transitions (`startRun`, `pauseRun`, `skipTask`, etc.) are pure functions that take current state and return new state. This makes the logic:
- Easy to test
- Easy to reason about
- Replayable and debuggable

### Why Timestamps Over Intervals?

Using `setInterval` to decrement a counter introduces drift over time. By storing absolute timestamps and calculating remaining time on each render, we ensure accuracy even if:
- App is backgrounded
- Timer updates are delayed
- Device performance varies

### Why No Database?

For V1, AsyncStorage is sufficient:
- Simple JSON serialization
- No sync complexity
- Fast enough for dozens of routines
- Can migrate to SQLite later if needed

## Future Enhancements (Post-V1)

- Template sharing (export/import JSON)
- Routine history and stats (non-judgmental, just data)
- Custom subtask timers
- More audio customization (voice selection, custom sounds)
- Apple Watch companion
- Shortcuts integration

## License

MIT

## Credits

Built with care as a real-time routine execution engine.
No analytics. No accounts. No judgment. Just today.

# Devception — Architecture & Technical Specifications

This document outlines the system architecture, real-time collaboration engine, and state machines powering **Devception**.

---

## 1. High-Level Architecture Overview

Devception employs a decoupled client-server architecture with distributed synchronization:

```
┌────────────────────────────────────────────────────────┐
│                   Next.js 14 Client                    │
│  (Monaco Editor + Y-Monaco + Socket.io + Tailwind CSS) │
└───────────▲────────────────────────────────┬───────────┘
            │                                │
      HTTP / REST API                  WebSocket / Yjs
  (Auth, Profiles, History)          (Real-time Game Loop)
            │                                │
┌───────────▼────────────────────────────────▼───────────┐
│                   Express 5 Server                     │
│    (Socket.io Engine + Code Judge + Auth Middleware)    │
└───────────┬────────────────────────────────┬───────────┘
            │                                │
     Mongoose Models                  Redis Pub/Sub
            ▼                                ▼
┌───────────────────────┐        ┌───────────────────────┐
│     MongoDB 7.0       │        │       Redis 7.0       │
│  (Persistent Storage) │        │ (Horizontal Scaling)  │
└───────────────────────┘        └───────────────────────┘
```

---

## 2. Real-Time Collaborative Editor & CRDT Sync

Devception utilizes **Yjs** (Conflict-free Replicated Data Type) paired with Monaco Editor to guarantee eventual consistency across all players without race conditions:

```mermaid
sequenceDiagram
    autonumber
    actor PlayerA as Developer A
    participant ClientA as Monaco / Yjs (Client A)
    participant Server as Socket.IO Server
    participant Redis as Redis Pub/Sub
    participant ClientB as Monaco / Yjs (Client B)
    actor PlayerB as Impostor B

    PlayerA->>ClientA: Edits task code
    ClientA->>ClientA: Updates local Y.Doc
    ClientA->>Server: socket.emit('editor:update', Uint8Array)
    Server->>Server: Validates op & applies to room Y.Doc
    Server->>Redis: Publish update to cluster channel
    Redis->>Server: Broadcast sync delta
    Server->>ClientB: socket.emit('editor:update', Uint8Array)
    ClientB->>ClientB: Merges CRDT state deterministically
    ClientB->>PlayerB: Multi-cursor reflects remote changes
```

---

## 3. Game State Machine

Each room runs a deterministic state machine managed on the server:

```mermaid
stateDiagram-v2
    [*] --> LOBBY: Host creates room
    LOBBY --> STARTING: Min players joined & countdown starts
    STARTING --> PLAYING: Roles assigned (Developer / Impostor)
    
    state PLAYING {
        [*] --> ActiveTasks
        ActiveTasks --> SabotageActive: Impostor triggers ability
        SabotageActive --> ActiveTasks: Cooldown expires / fixed
    }

    PLAYING --> EMERGENCY_MEETING: Button pressed or dead body found
    
    state EMERGENCY_MEETING {
        [*] --> DiscussionPhase: Discussion timer running
        DiscussionPhase --> VotingPhase: Discussion ends
        VotingPhase --> VoteResolution: Votes tallied
    }

    EMERGENCY_MEETING --> PLAYING: Suspect skipped / ejected & game continues
    EMERGENCY_MEETING --> GAME_OVER: Win conditions met during vote
    PLAYING --> GAME_OVER: All tasks completed (Devs Win) OR Impostors outnumber Devs (Impostor Win)
    GAME_OVER --> LOBBY: Rematch requested
    GAME_OVER --> [*]: Room closed
```

---

## 4. Socket.IO Event Reference

### Lobby & Room Management
| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `room:create` | Client → Server | `{ settings }` | Creates a new game room with custom rules |
| `room:join` | Client → Server | `{ roomCode }` | Joins an existing game room |
| `room:state` | Server → Client | `{ roomCode, players, phase, settings }` | Full room state synchronization |
| `room:leave` | Client → Server | `{ roomCode }` | Gracefully leaves room |

### Collaborative Editor & Tasks
| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `editor:sync-step-1` | Client → Server | `{ roomCode, stateVector }` | Requests initial state delta |
| `editor:update` | Bidirectional | `{ roomCode, update: Uint8Array }` | Binary CRDT document patch |
| `task:submit` | Client → Server | `{ roomCode, taskId, code }` | Submits task code for server validation |
| `task:progress` | Server → Client | `{ completed, total, percentage }` | Broadcasts team completion rate |

### Emergency Meetings & Voting
| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `meeting:call` | Client → Server | `{ roomCode }` | Triggers emergency discussion phase |
| `meeting:vote` | Client → Server | `{ roomCode, targetUserId }` | Submits anonymous vote |
| `meeting:ejection` | Server → Client | `{ ejectedUserId, wasImposter }` | Broadcasts ejection results |

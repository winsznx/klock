# Migration

If you previously imported protocol constants or hooks from the app source directly, move to the package entry points.

## App-internal to SDK

Before:

```ts
import { QUEST_IDS } from '@/config/contracts'
```

After:

```ts
import { QUEST_IDS } from '@winsznx/sdk'
```

## App hooks to React package

Before:

```ts
import { useUnifiedContract } from '@/hooks/useUnifiedContract'
```

After:

```ts
import { useUnifiedContract } from '@winsznx/react'
```

The app keeps compatibility wrappers, so migrations can be incremental.

New consumers should import from `@winsznx/sdk` and `@winsznx/react` directly instead of starting from the app wrapper files.
When migrating consumer apps, upgrade both packages together so the React package stays aligned with the SDK version it expects.

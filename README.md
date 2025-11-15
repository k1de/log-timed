# log-timed

**Lightweight logging with timestamps, colors and file support.**

> Uses [chalk](https://github.com/chalk/chalk) for colors.  
> File writing is asynchronous and doesn't block process.

## Install

```bash
npm install log-timed
```

## Usage

```typescript
import { casual as log } from 'log-timed'

log('Simple message')
log.file('Log to console and file')
log.error('Error occurred')
log.multiline({ user: 'John', data: [1, 2, 3] })
log.compact('Line 1\nLine 2\nLine 3')
```

### Custom logger

```typescript
import createLogger from 'log-timed'

const log = createLogger({
    useDate: true, // show date
    useMs: true, // show milliseconds
    colorLeft: 'blue', // timestamp color
    file: 'app_', // file prefix
})

log('Custom logging')
```

## Methods

**Basic:**

-   `log()` - standard logging
-   `.log(...args)` - multiple arguments like console.log
-   `.logFile(...args)` - multiple arguments with file write
-   `.file()` - log to console and file
-   `.fileOnly()` - log to file only
-   `.multiline()` - multiline object output
-   `.compact()` - compress newlines to single line
-   `.rewrite()` - rewrite last console line
-   `.clear()` - clear terminal

**Event logging:**

-   `.success()` - success operations (green)
-   `.info()` - informational messages (cyan)
-   `.warn()` - warnings (yellow)
-   `.error()` - errors (red)
-   `.debug()` - debug info (dimmed)

Each event method has a `*File()` version for writing to file with corresponding prefix (e.g., `success_`, `info_`). To write to file without prefix, use `method(data, { file: true })`.

## Presets

```typescript
import { free, simple, casual, full, iso } from 'log-timed'

free('No timestamps') // No timestamps
simple('With time') // [03:00:00] With time
casual('With milliseconds') // [13:37:42.999] With milliseconds
full('Full date and time') // [2025.12.31 23:59:59.999] Full date and time
iso('ISO format') // [2025-10-21T01:21:00.000Z] ISO format
```

## File logging

Logs are saved to `./logs/` directory with `YYYY.MM.DD.log` naming by default.

```typescript
// Default file: ./logs/2025.11.07.log
log.file('message')
log('message', { file: true })

// With prefix: ./logs/error_2025.11.07.log
log('message', { file: 'error_' })
log.errorFile('message')

// Custom filename: ./logs/app.log
log('message', { file: 'app.log' })

// Custom path: ./custom/path/app.log
log('message', { file: './custom/path/app.log' })

// File only (no console output)
log('message', { fileOnly: true })
```

## Multiline formatting

```typescript
// Objects
log({ data: 'test' }) // {"data":"test"}
log({ data: 'test' }, { multiline: true }) // pretty JSON (4 spaces)
log({ data: 'test' }, { multiline: 2 }) // pretty JSON (2 spaces)

// Compact with separators
log('line1\nline2', { multiline: ' ' }) // "line1 line2"
log('line1\nline2', { multiline: '' }) // "line1line2"
log('line1\nline2', { multiline: ', ' }) // "line1, line2"
```

## Config

-   `useDate` - show date
-   `useMs` - show milliseconds
-   `colorLeft` - timestamp color
-   `colorRight` - message color
-   `colorMs` - milliseconds color (default: 'gray')
-   `color` - set both colorLeft and colorRight
-   `file` - file prefix or boolean
-   `leftFn` - custom function for left part

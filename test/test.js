import { casual as log, free, simple, full, iso, chalk } from '../dist/logger.js'

log.clear()

const section = (title) => console.log(chalk.yellow(`\n→ ${title}`))
const header = () => {
    console.log(chalk.cyan.bold('\n╔══════════════════════════════════════╗'))
    console.log(chalk.cyan.bold('║       Logger Test Suite              ║'))
    console.log(chalk.cyan.bold('╚══════════════════════════════════════╝'))
}

header()

// Free preset
section('Free preset (no timestamp)')
free(chalk.inverse('Free preset: Hello World'))
free.log('Multiple args:', 'test1', 'test2')

// Basic methods
section('Basic usage')
log('Basic log')
log.file('With file')
log.fileOnly('File only (no console)')
log.log('Multiple args:', { id: 1 }, 'logged in')

// Colored output
section('Colored methods')
const methods = ['success', 'info', 'warn', 'error', 'debug']
methods.forEach(method => log[method](`${method} example`))

// With file
section('Colored methods + file')
methods.forEach(method => log[`${method}File`](`${method} with file`))

// Formatting
section('Formatting')
const obj = { user: 'John', age: 30, data: { nested: true } }
const arr = ['a', 'b', 'c']
log.multiline(obj)
log.multiline(arr)
log.compact(obj)
log.compact(arr)

// Presets
section('Different presets')
simple('Simple preset (HH:MM:SS)')
full('Full preset (YYYY.MM.DD HH:MM:SS.ms)')
iso('ISO preset')

// Custom params
section('Custom params')
log('1-line\n2-line\n3-line', { multiline: ' | ' })
log(obj, { multiline: 2 })

// Complex data
section('Complex data')
log.log('Mixed:', [1, 2, 3], { x: 10 }, 'string')
log.multiline([{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }])

// Rewrite demo
section('Rewrite (updates last line)')
log.rewrite('Loading...')
setTimeout(() => {
    log.rewrite('Loading... 50%')
    setTimeout(() => {
        log.rewrite('Done!')
        console.log(chalk.green.bold('\n✓ Test completed\n'))
    }, 1000)
}, 1000)
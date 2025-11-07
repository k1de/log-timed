import fs from 'fs'
import path from 'path'
import util from 'util'
import chalk, { ModifierName, ForegroundColorName, BackgroundColorName, ColorName } from 'chalk'

// Helps pm2 with colors
chalk.level = 3

type ChalkOption = ModifierName | ForegroundColorName | BackgroundColorName | ColorName

type LoggerConfig = {
    useDate?: boolean
    useMs?: boolean
    colorMs?: ChalkOption
    colorLeft?: ChalkOption
    colorRight?: ChalkOption
    color?: ChalkOption
    file?: string | boolean
    leftFn?: string | (() => string)
}

type LoggerParams = {
    /** Rewrite last line in console */
    rewrite?: boolean
    /** Path to file or true to write to default file */
    file?: string | boolean
    /** Write only to file (without console output) */
    fileOnly?: string | boolean
    /**
     * Multiline output formatting:
     * - true: multiline with indentation (4 spaces)
     * - number: multiline with specified number of spaces
     * - string: compact to single line using string as separator
     */
    multiline?: boolean | number | string
}

type TimeObject = {
    isotime: Date
    time: string
    date: string
    ms: string
}

type LoggerFunctionMethod = (data: unknown, params?: LoggerParams) => void

type ConsoleLogFunctionMethod = (...args: unknown[]) => void

interface LoggerFunction {
    (data: unknown, params?: LoggerParams): void
    /** Accept multiple arguments like console.log */
    log: ConsoleLogFunctionMethod
    /** Accept multiple arguments like console.log and write to file */
    logFile: ConsoleLogFunctionMethod
    /** Output log and write to file */
    file: LoggerFunctionMethod
    /** Write log only to file */
    fileOnly: LoggerFunctionMethod

    /** Output log in green */
    success: LoggerFunctionMethod
    /** Output log in green and write to file with "success_" prefix */
    successFile: LoggerFunctionMethod
    /** Output log in cyan */
    event: LoggerFunctionMethod
    /** Output log in cyan and write to file with "event_" prefix */
    eventFile: LoggerFunctionMethod
    /** Output log in yellow */
    warn: LoggerFunctionMethod
    /** Output log in yellow and write to file with "warn_" prefix */
    warnFile: LoggerFunctionMethod
    /** Output log in dimmed color */
    debug: LoggerFunctionMethod
    /** Output log in dimmed color and write to file with "debug_" prefix */
    debugFile: LoggerFunctionMethod
    /** Output log in red */
    error: LoggerFunctionMethod
    /** Output log in red and write to file with "error_" prefix */
    errorFile: LoggerFunctionMethod

    /** Output multiline log, e.g. object */
    multiline: LoggerFunctionMethod
    /** Output log compressed to single line */
    compact: LoggerFunctionMethod
    /** Output log rewriting last line */
    rewrite: LoggerFunctionMethod
    /** Clear screen */
    clear: () => void
}

// Constants for reuse
const COLOR_REGEXP = /\x1b.*?m/g
const NEWLINE_REGEXP = /(?:\\[rn]|[\r\n]|\s{2,})+/g
const REWRITE_PREFIX = '\x1B[1A\x1B[K'
const DEFAULT_LOG_DIR = './logs/'

// Function to add leading zeros, extracted for reuse
const padNumber = (num: number, length = 2): string => String(num).padStart(length, '0')

function convertToString(data: unknown, params?: LoggerParams): string {
    if (typeof data === 'string') return data

    // Check for array and object
    if (typeof data === 'object' && data !== null) {
        const space =
            params?.multiline === true
                ? 4
                : typeof params?.multiline === 'number'
                    ? params.multiline
                    : 0
        return JSON.stringify(data, null, space)
    }

    return String(data)
}

function getTimeObject(): TimeObject {
    const isotime = new Date()

    // Calculate all time components in one pass
    const hours = padNumber(isotime.getHours())
    const minutes = padNumber(isotime.getMinutes())
    const seconds = padNumber(isotime.getSeconds())
    const year = padNumber(isotime.getFullYear(), 4)
    const month = padNumber(isotime.getMonth() + 1)
    const day = padNumber(isotime.getDate())
    const ms = padNumber(isotime.getMilliseconds(), 3)

    return {
        isotime,
        time: `${hours}:${minutes}:${seconds}`,
        date: `${year}.${month}.${day}`,
        ms,
    }
}

function getLeft(config: LoggerConfig, timeObject: TimeObject, params?: LoggerParams): string {
    // If custom function is set for left part
    if (config.leftFn !== undefined) {
        const leftContent = typeof config.leftFn === 'function' ? config.leftFn() : convertToString(config.leftFn, params)

        return config.colorLeft ? chalk[config.colorLeft](leftContent) : leftContent
    }

    // Form standard time prefix
    let timePart = timeObject.time
    if (config.useDate) {
        timePart = `${timeObject.date} ${timePart}`
    }

    // Apply color to main time part
    let coloredPart = `[${timePart}`
    if (config.colorLeft) {
        coloredPart = chalk[config.colorLeft](coloredPart)
    }

    // Add milliseconds with separate color if needed
    if (config.useMs) {
        const msColor = config.colorMs || 'gray'
        coloredPart += chalk[msColor](`.${timeObject.ms}`)
    }

    // Close bracket with same color as opening
    const closingBracket = config.colorLeft ? chalk[config.colorLeft](']') : ']'
    return coloredPart + closingBracket
}

function getRight(data: unknown, config: LoggerConfig, params?: LoggerParams): string {
    const string = convertToString(data, params)

    // Apply color only if set and string has no ANSI codes
    return config.colorRight && !COLOR_REGEXP.test(string) ? chalk[config.colorRight](string) : string
}

async function appendLog(string: string, file: string | boolean | undefined, timeObject: TimeObject): Promise<void> {
    try {
        let directory = DEFAULT_LOG_DIR
        let fileName = `${timeObject.date}.log`

        // Handle custom file path
        if (typeof file === 'string') {
            const dir = path.dirname(file)
            if (dir !== '.') {
                directory = dir
            }

            const baseName = path.basename(file)

            // Determine final file name based on suffixes
            if (baseName.endsWith('_')) {
                fileName = `${baseName}${fileName}`
            } else if (baseName.endsWith('.log')) {
                fileName = baseName
            } else {
                fileName = `${baseName}.log`
            }
        }

        // Create directory if it doesn't exist
        try {
            await fs.promises.access(directory)
        } catch {
            await fs.promises.mkdir(directory, { recursive: true })
        }

        // Write log to file
        const fullPath = path.join(directory, fileName)
        await fs.promises.appendFile(fullPath, string + '\n', 'utf8')
    } catch (error) {
        console.error('[Logger]', error)
    }
}

function logger(config: LoggerConfig = {}, data: unknown = '', params: LoggerParams = {}): void {
    try {
        const timeObject = getTimeObject()
        const { rewrite, file, fileOnly, multiline } = params

        const left = getLeft(config, timeObject, params)
        const right = getRight(data, config, params)

        const shouldCompact = typeof multiline === 'string'
        const compactSeparator = shouldCompact ? (multiline as string) : ' '

        // Form final message
        const separator = left && right ? ' ' : ''
        let result = `${left}${separator}${right}`

        // Add rewrite prefix if needed
        if (rewrite) {
            result = REWRITE_PREFIX + result
        }

        // Compact if required
        if (shouldCompact) {
            result = result.replaceAll(NEWLINE_REGEXP, compactSeparator)
        }

        // Output to console if not "file only" mode
        if (!fileOnly) {
            console.log(result)
        }

        // Determine if we need to write to file
        const fileConfig = file ?? fileOnly ?? config.file
        if (fileConfig) {
            // Create "clean" version for file (without ANSI codes)
            let cleanString = result.replaceAll(COLOR_REGEXP, '')
            // Compact if required
            if (shouldCompact) {
                cleanString = cleanString.replaceAll(NEWLINE_REGEXP, compactSeparator)
            }
            appendLog(cleanString, fileConfig, timeObject).catch((error) => {
                console.error('[Logger]', error)
            })
        }
    } catch (error) {
        console.error('[Logger]', error)
    }
}

function createLogger(config: LoggerConfig = {}): LoggerFunction {
    // Apply common color to left and right parts if set
    if (config.color) {
        config.colorLeft = config.color
        config.colorRight = config.color
    }

    // Validate that all colors exist in chalk, otherwise reset
    const validateColor = (colorKey: keyof LoggerConfig) => {
        const color = config[colorKey] as ChalkOption
        if (color && !chalk[color]) {
            config[colorKey] = undefined
        }
    }

    validateColor('colorLeft')
    validateColor('colorRight')
    validateColor('colorMs')

    // Main logger function
    const fn = ((data: unknown, params: LoggerParams = {}) => logger(config, data, params)) as LoggerFunction

    // Factory for creating methods with additional parameters
    const createMethod = (additionalConfig: LoggerConfig = {}, additionalParams: LoggerParams = {}): LoggerFunctionMethod => {
        return (data: unknown, params: LoggerParams = {}) => logger({ ...config, ...additionalConfig }, data, { ...additionalParams, ...params })
    }

    // Multiple arguments method
    fn.log = (...args: unknown[]) => logger(config, util.format(...args))
    fn.logFile = (...args: unknown[]) => logger(config, util.format(...args), { file: true })

    // Basic methods
    fn.file = createMethod({}, { file: true })
    fn.fileOnly = createMethod({}, { fileOnly: true })

    // Colored methods with automatic file writing
    fn.success = createMethod({ colorRight: 'green' })
    fn.successFile = createMethod({ colorRight: 'green' }, { file: 'success_' })

    fn.event = createMethod({ colorRight: 'cyan' })
    fn.eventFile = createMethod({ colorRight: 'cyan' }, { file: 'event_' })

    fn.warn = createMethod({ colorRight: 'yellow' })
    fn.warnFile = createMethod({ colorRight: 'yellow' }, { file: 'warn_' })

    fn.debug = createMethod({ colorRight: 'dim' })
    fn.debugFile = createMethod({ colorRight: 'dim' }, { file: 'debug_' })

    fn.error = createMethod({ colorRight: 'red' })
    fn.errorFile = createMethod({ colorRight: 'red' }, { file: 'error_' })

    // Special formatting methods
    fn.multiline = createMethod({}, { multiline: true })
    fn.compact = createMethod({}, { multiline: ' ' })
    fn.rewrite = createMethod({}, { rewrite: true })
    fn.clear = console.clear

    return fn
}

// Preset logger configurations
export const free = createLogger({ leftFn: '' })
export const freeFile = createLogger({ leftFn: '', file: true })
export const simple = createLogger()
export const simpleFile = createLogger({ file: true })
export const casual = createLogger({ useMs: true, colorLeft: 'magenta' })
export const casualFile = createLogger({ useMs: true, colorLeft: 'magenta', file: true })
export const full = createLogger({ useDate: true, useMs: true, colorLeft: 'blue' })
export const fullFile = createLogger({ useDate: true, useMs: true, colorLeft: 'blue', file: true })
export const iso = createLogger({ leftFn: () => `[${new Date().toISOString()}]`, colorLeft: 'gray' })
export const isoFile = createLogger({ leftFn: () => `[${new Date().toISOString()}]`, colorLeft: 'gray', file: true })

export default createLogger
export { chalk }
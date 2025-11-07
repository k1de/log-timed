import chalk, { ModifierName, ForegroundColorName, BackgroundColorName, ColorName } from 'chalk';
type ChalkOption = ModifierName | ForegroundColorName | BackgroundColorName | ColorName;
type LoggerConfig = {
    useDate?: boolean;
    useMs?: boolean;
    colorMs?: ChalkOption;
    colorLeft?: ChalkOption;
    colorRight?: ChalkOption;
    color?: ChalkOption;
    file?: string | boolean;
    leftFn?: string | (() => string);
};
type LoggerParams = {
    /** Rewrite last line in console */
    rewrite?: boolean;
    /** Path to file or true to write to default file */
    file?: string | boolean;
    /** Write only to file (without console output) */
    fileOnly?: string | boolean;
    /**
     * Multiline output formatting:
     * - true: multiline with indentation (4 spaces)
     * - number: multiline with specified number of spaces
     * - string: compact to single line using string as separator
     */
    multiline?: boolean | number | string;
};
type LoggerFunctionMethod = (data: unknown, params?: LoggerParams) => void;
type ConsoleLogFunctionMethod = (...args: unknown[]) => void;
interface LoggerFunction {
    (data: unknown, params?: LoggerParams): void;
    /** Accept multiple arguments like console.log */
    log: ConsoleLogFunctionMethod;
    /** Accept multiple arguments like console.log and write to file */
    logFile: ConsoleLogFunctionMethod;
    /** Output log and write to file */
    file: LoggerFunctionMethod;
    /** Write log only to file */
    fileOnly: LoggerFunctionMethod;
    /** Output log in green */
    success: LoggerFunctionMethod;
    /** Output log in green and write to file with "success_" prefix */
    successFile: LoggerFunctionMethod;
    /** Output log in cyan */
    event: LoggerFunctionMethod;
    /** Output log in cyan and write to file with "event_" prefix */
    eventFile: LoggerFunctionMethod;
    /** Output log in yellow */
    warn: LoggerFunctionMethod;
    /** Output log in yellow and write to file with "warn_" prefix */
    warnFile: LoggerFunctionMethod;
    /** Output log in dimmed color */
    debug: LoggerFunctionMethod;
    /** Output log in dimmed color and write to file with "debug_" prefix */
    debugFile: LoggerFunctionMethod;
    /** Output log in red */
    error: LoggerFunctionMethod;
    /** Output log in red and write to file with "error_" prefix */
    errorFile: LoggerFunctionMethod;
    /** Output multiline log, e.g. object */
    multiline: LoggerFunctionMethod;
    /** Output log compressed to single line */
    compact: LoggerFunctionMethod;
    /** Output log rewriting last line */
    rewrite: LoggerFunctionMethod;
    /** Clear screen */
    clear: () => void;
}
declare function createLogger(config?: LoggerConfig): LoggerFunction;
export declare const free: LoggerFunction;
export declare const freeFile: LoggerFunction;
export declare const simple: LoggerFunction;
export declare const simpleFile: LoggerFunction;
export declare const casual: LoggerFunction;
export declare const casualFile: LoggerFunction;
export declare const full: LoggerFunction;
export declare const fullFile: LoggerFunction;
export declare const iso: LoggerFunction;
export declare const isoFile: LoggerFunction;
export default createLogger;
export { chalk };

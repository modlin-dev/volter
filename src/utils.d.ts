export declare function createPIN(): string
export declare function createID(): string

export declare function timestamp(date?: Date): string

export declare function log(...message: unknown[]): void
export declare function error(...message: unknown[]): void
export declare function debug(...message: unknown[]): void

export declare function input(prompt?: string): string

export declare function prettifyRequest(request: Request): string

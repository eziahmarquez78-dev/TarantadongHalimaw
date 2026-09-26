'use strict';

const {
    spawn
} = require('child_process');

const fs = require('fs');
const path = require('path');

/*
|--------------------------------------------------------------------------
| MAIN SCRIPT
|--------------------------------------------------------------------------
*/

const SCRIPT_FILE = 'auto.js';

const SCRIPT_PATH = path.join(
    __dirname,
    SCRIPT_FILE
);

/*
|--------------------------------------------------------------------------
| CONFIG
|--------------------------------------------------------------------------
*/

const CONFIG = {

    // Delay bago mag-restart
    restartDelay: 5000,

    // Maximum crash restarts
    maxRestarts: 5,

    // Crash counting window
    crashWindow: 60000,

    // Kapag tumakbo nang ganito katagal,
    // reset ang crash counter
    healthyTime: 120000,

    // Watchdog check interval
    watchdogInterval: 15000,

    // Maximum time na walang activity
    watchdogTimeout: 60000,

    // Graceful shutdown timeout
    shutdownTimeout: 10000

};

/*
|--------------------------------------------------------------------------
| DATA
|--------------------------------------------------------------------------
*/

const DATA_DIR = path.join(
    __dirname,
    'data'
);

const HEARTBEAT_FILE = path.join(
    DATA_DIR,
    'supervisor-heartbeat.json'
);

/*
|--------------------------------------------------------------------------
| CREATE DATA DIRECTORY
|--------------------------------------------------------------------------
*/

if (!fs.existsSync(DATA_DIR)) {

    fs.mkdirSync(
        DATA_DIR,
        {
            recursive: true
        }
    );

}

/*
|--------------------------------------------------------------------------
| STATE
|--------------------------------------------------------------------------
*/

let main = null;

let shuttingDown = false;

let restartTimer = null;

let watchdogTimer = null;

let healthyTimer = null;

let restartCount = 0;

let restartWindowStart = Date.now();

let startedAt = 0;

let watchdogRestarting = false;

/*
|--------------------------------------------------------------------------
| LOGGER
|--------------------------------------------------------------------------
*/

function log(message) {

    console.log(
        `[SUPERVISOR] ${new Date().toISOString()} ${message}`
    );

}

/*
|--------------------------------------------------------------------------
| HEARTBEAT
|--------------------------------------------------------------------------
*/

function writeHeartbeat(status) {

    try {

        const data = {

            status,

            pid: process.pid,

            childPid:
                main
                    ? main.pid
                    : null,

            uptime:
                Math.floor(
                    process.uptime()
                ),

            childUptime:
                main && startedAt
                    ? Math.floor(
                        (
                            Date.now() -
                            startedAt
                        ) / 1000
                    )
                    : 0,

            timestamp:
                Date.now()

        };

        fs.writeFileSync(
            HEARTBEAT_FILE,
            JSON.stringify(
                data,
                null,
                2
            )
        );

    } catch (error) {

        log(
            `Heartbeat error: ${error.message}`
        );

    }

}

/*
|--------------------------------------------------------------------------
| KEEPALIVE
|--------------------------------------------------------------------------
*/

function keepAlive() {

    writeHeartbeat(
        main
            ? 'online'
            : 'waiting'
    );

}

/*
 * Update heartbeat every 10 seconds
 */

const keepaliveTimer =
    setInterval(
        keepAlive,
        10000
    );

/*
|--------------------------------------------------------------------------
| RESET RESTART COUNTER
|--------------------------------------------------------------------------
*/

function resetRestartCounter() {

    restartCount = 0;

    restartWindowStart =
        Date.now();

    log(
        'Process stayed healthy. Restart counter reset.'
    );

}

/*
|--------------------------------------------------------------------------
| CHECK RESTART LIMIT
|--------------------------------------------------------------------------
*/

function canRestart() {

    const now =
        Date.now();

    /*
     * New crash window
     */

    if (
        now -
            restartWindowStart >
        CONFIG.crashWindow
    ) {

        restartCount = 0;

        restartWindowStart =
            now;

    }

    restartCount++;

    if (
        restartCount >
        CONFIG.maxRestarts
    ) {

        log(
            `Restart limit reached (${CONFIG.maxRestarts}).`
        );

        return false;

    }

    return true;

}

/*
|--------------------------------------------------------------------------
| START AUTO.JS
|--------------------------------------------------------------------------
*/

function start() {

    if (shuttingDown) {

        return;

    }

    if (main) {

        log(
            'auto.js is already running.'
        );

        return;

    }

    watchdogRestarting = false;

    startedAt =
        Date.now();

    log(
        `Starting ${SCRIPT_FILE}...`
    );

    /*
     * Use the same Node.js executable
     * that is running this supervisor.
     */

    main = spawn(
        process.execPath,
        [
            SCRIPT_PATH
        ],
        {

            cwd: __dirname,

            stdio: 'inherit',

            shell: false,

            env: {

                ...process.env,

                NODE_ENV:
                    process.env.NODE_ENV ||
                    'production'

            }

        }
    );

    /*
     * Initial heartbeat
     */

    writeHeartbeat(
        'starting'
    );

    /*
     * Healthy timer
     */

    healthyTimer =
        setTimeout(
            () => {

                if (
                    main &&
                    Date.now() -
                        startedAt >=
                    CONFIG.healthyTime
                ) {

                    resetRestartCounter();

                }

            },
            CONFIG.healthyTime
        );

    /*
     * Spawn error
     */

    main.on(
        'error',
        error => {

            log(
                `Failed to start ${SCRIPT_FILE}: ${error.message}`
            );

        }
    );

    /*
     * Process exit
     */

    main.on(
        'exit',
        (
            code,
            signal
        ) => {

            /*
             * Clear healthy timer
             */

            if (healthyTimer) {

                clearTimeout(
                    healthyTimer
                );

                healthyTimer = null;

            }

            /*
             * Remove child reference
             */

            main = null;

            /*
             * Update heartbeat
             */

            writeHeartbeat(
                'stopped'
            );

            /*
             * Shutdown
             */

            if (shuttingDown) {

                log(
                    'auto.js stopped during shutdown.'
                );

                return;

            }

            /*
             * Log exit reason
             */

            if (signal) {

                log(
                    `auto.js stopped by signal ${signal}.`
                );

            } else {

                log(
                    `auto.js exited with code ${code}.`
                );

            }

            /*
             * Check restart limit
             */

            if (
                !canRestart()
            ) {

                log(
                    'Supervisor stopped to prevent a crash loop.'
                );

                return;

            }

            /*
             * Schedule restart
             */

            log(
                `Restart attempt ${restartCount}/${CONFIG.maxRestarts} in ${CONFIG.restartDelay / 1000}s...`
            );

            scheduleRestart();

        }
    );

}

/*
|--------------------------------------------------------------------------
| SCHEDULE RESTART
|--------------------------------------------------------------------------
*/

function scheduleRestart() {

    if (shuttingDown) {

        return;

    }

    if (restartTimer) {

        return;

    }

    restartTimer =
        setTimeout(
            () => {

                restartTimer = null;

                if (
                    !shuttingDown
                ) {

                    start();

                }

            },
            CONFIG.restartDelay
        );

}

/*
|--------------------------------------------------------------------------
| WATCHDOG
|--------------------------------------------------------------------------
*/

function watchdog() {

    if (shuttingDown) {

        return;

    }

    /*
     * Walang child process
     */

    if (!main) {

        return;

    }

    /*
     * Check kung buhay pa ang child
     */

    if (main.exitCode !== null) {

        return;

    }

    const runtime =
        Date.now() -
        startedAt;

    /*
     * Give auto.js time to start.
     */

    if (
        runtime <
        30000
    ) {

        return;

    }

    /*
     * Since this index.js is the supervisor,
     * a running child process is considered
     * healthy unless it becomes unresponsive
     * at the process level.
     */

    /*
     * Check heartbeat file.
     */

    let heartbeat;

    try {

        if (
            !fs.existsSync(
                HEARTBEAT_FILE
            )
        ) {

            return;

        }

        heartbeat =
            JSON.parse(
                fs.readFileSync(
                    HEARTBEAT_FILE,
                    'utf8'
                )
            );

    } catch {

        return;

    }

    if (
        !heartbeat ||
        typeof heartbeat.timestamp !==
            'number'
    ) {

        return;

    }

    const age =
        Date.now() -
        heartbeat.timestamp;

    /*
     * Healthy
     */

    if (
        age <
        CONFIG.watchdogTimeout
    ) {

        watchdogRestarting =
            false;

        return;

    }

    /*
     * Stale heartbeat
     */

    if (
        watchdogRestarting
    ) {

        return;

    }

    watchdogRestarting =
        true;

    log(
        `WATCHDOG: stale heartbeat detected (${Math.floor(age / 1000)}s).`
    );

    log(
        'WATCHDOG: restarting auto.js...'
    );

    /*
     * Graceful stop
     */

    try {

        main.kill(
            'SIGTERM'
        );

    } catch (error) {

        log(
            `Watchdog stop error: ${error.message}`
        );

    }

    /*
     * Force kill if needed
     */

    setTimeout(
        () => {

            if (
                main &&
                !shuttingDown
            ) {

                log(
                    'WATCHDOG: auto.js did not stop gracefully. Force stopping.'
                );

                try {

                    main.kill(
                        'SIGKILL'
                    );

                } catch {}

            }

        },
        CONFIG.shutdownTimeout
    );

}

/*
|--------------------------------------------------------------------------
| WATCHDOG TIMER
|--------------------------------------------------------------------------
*/

watchdogTimer =
    setInterval(
        watchdog,
        CONFIG.watchdogInterval
    );

/*
|--------------------------------------------------------------------------
| GRACEFUL SHUTDOWN
|--------------------------------------------------------------------------
*/

function shutdown(signal) {

    if (shuttingDown) {

        return;

    }

    shuttingDown = true;

    log(
        `${signal} received. Shutting down...`
    );

    /*
     * Stop timers
     */

    if (restartTimer) {

        clearTimeout(
            restartTimer
        );

        restartTimer = null;

    }

    if (healthyTimer) {

        clearTimeout(
            healthyTimer
        );

        healthyTimer = null;

    }

    if (watchdogTimer) {

        clearInterval(
            watchdogTimer
        );

        watchdogTimer = null;

    }

    if (keepaliveTimer) {

        clearInterval(
            keepaliveTimer
        );

    }

    /*
     * Update heartbeat
     */

    writeHeartbeat(
        'stopping'
    );

    /*
     * Stop auto.js
     */

    if (main) {

        log(
            'Stopping auto.js gracefully...'
        );

        try {

            main.kill(
                'SIGTERM'
            );

        } catch {}

        /*
         * Force stop
         */

        setTimeout(
            () => {

                if (main) {

                    log(
                        'Force stopping auto.js...'
                    );

                    try {

                        main.kill(
                            'SIGKILL'
                        );

                    } catch {}

                }

            },
            CONFIG.shutdownTimeout
        );

    } else {

        process.exit(
            0
        );

    }

}

/*
|--------------------------------------------------------------------------
| SIGNAL HANDLERS
|--------------------------------------------------------------------------
*/

process.on(
    'SIGINT',
    () => {

        shutdown(
            'SIGINT'
        );

    }
);

process.on(
    'SIGTERM',
    () => {

        shutdown(
            'SIGTERM'
        );

    }
);

/*
|--------------------------------------------------------------------------
| ERROR HANDLING
|--------------------------------------------------------------------------
*/

process.on(
    'uncaughtException',
    error => {

        log(
            `Supervisor uncaught exception: ${
                error.stack ||
                error.message
            }`
        );

    }
);

process.on(
    'unhandledRejection',
    error => {

        log(
            `Supervisor unhandled rejection: ${
                error?.stack ||
                error
            }`
        );

    }
);

/*
|--------------------------------------------------------------------------
| STARTUP
|--------------------------------------------------------------------------
*/

log(
    `Node.js: ${process.version}`
);

log(
    `Main script: ${SCRIPT_PATH}`
);

log(
    'Keepalive: ENABLED'
);

log(
    `Watchdog: ENABLED (${CONFIG.watchdogTimeout / 1000}s timeout)`
);

log(
    'Crash recovery: ENABLED'
);

log(
    'Supervisor started.'
);

/*
|--------------------------------------------------------------------------
| START
|--------------------------------------------------------------------------
*/

start();

/*
|--------------------------------------------------------------------------
| FIRST HEARTBEAT
|--------------------------------------------------------------------------
*/

writeHeartbeat(
    'online'
);

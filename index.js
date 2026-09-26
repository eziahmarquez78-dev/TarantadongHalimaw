'use strict';

const { spawn } = require('child_process');
const path = require('path');

/*
|--------------------------------------------------------------------------
| CONFIG
|--------------------------------------------------------------------------
*/

const SCRIPT_FILE = 'index.js';

const SCRIPT_PATH = path.join(
  __dirname,
  SCRIPT_FILE
);

const NODE = process.execPath;

const CONFIG = {
  // Delay bago mag-restart
  restartDelay: 5000,

  // Maximum restart attempts sa loob ng crash window
  maxRestarts: 5,

  // Crash window
  crashWindow: 60000,

  // Kapag umabot dito nang walang crash,
  // mare-reset ang restart counter
  healthyTime: 120000,

  // Graceful shutdown timeout
  shutdownTimeout: 10000
};

/*
|--------------------------------------------------------------------------
| STATE
|--------------------------------------------------------------------------
*/

let child = null;

let shuttingDown = false;

let restartCount = 0;

let restartWindowStart = Date.now();

let healthyTimer = null;

let restartTimer = null;

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
| RESET CRASH COUNTER
|--------------------------------------------------------------------------
*/

function resetCrashCounter() {
  restartCount = 0;
  restartWindowStart = Date.now();

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
  const now = Date.now();

  /*
   * New crash window
   */
  if (
    now - restartWindowStart >
    CONFIG.crashWindow
  ) {
    restartCount = 0;
    restartWindowStart = now;
  }

  restartCount++;

  /*
   * Prevent infinite crash loop
   */
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
| START MAIN PROCESS
|--------------------------------------------------------------------------
*/

function start() {
  if (shuttingDown) {
    return;
  }

  if (child) {
    log(
      'Main process is already running.'
    );

    return;
  }

  log(
    `Starting ${SCRIPT_FILE}...`
  );

  child = spawn(
    NODE,
    [SCRIPT_PATH],
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

  const startedAt = Date.now();

  /*
   * Healthy-process timer
   */
  healthyTimer = setTimeout(() => {
    if (
      child &&
      Date.now() - startedAt >=
        CONFIG.healthyTime
    ) {
      resetCrashCounter();
    }
  }, CONFIG.healthyTime);

  /*
   * Spawn error
   */
  child.on(
    'error',
    error => {
      log(
        `Failed to start ${SCRIPT_FILE}: ${
          error.message
        }`
      );
    }
  );

  /*
   * Process exit
   */
  child.on(
    'exit',
    (code, signal) => {
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
      child = null;

      /*
       * Shutdown mode
       */
      if (shuttingDown) {
        log(
          'Main process stopped during shutdown.'
        );

        return;
      }

      /*
       * Signal exit
       */
      if (signal) {
        log(
          `Main process stopped by signal ${signal}.`
        );
      } else {
        log(
          `Main process exited with code ${
            code ?? 'unknown'
          }.`
        );
      }

      /*
       * Normal exit
       */
      if (code === 0) {
        log(
          `Restarting normally in ${
            CONFIG.restartDelay / 1000
          } seconds...`
        );

        scheduleRestart();

        return;
      }

      /*
       * Crash restart limit
       */
      if (!canRestart()) {
        log(
          'Supervisor stopped to prevent a crash loop.'
        );

        return;
      }

      /*
       * Schedule crash restart
       */
      log(
        `Restart attempt ${restartCount}/${
          CONFIG.maxRestarts
        } in ${
          CONFIG.restartDelay / 1000
        } seconds...`
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

  restartTimer = setTimeout(() => {
    restartTimer = null;

    if (!shuttingDown) {
      start();
    }
  }, CONFIG.restartDelay);
}

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
    `${signal} received. Stopping supervisor...`
  );

  /*
   * Cancel pending restart
   */
  if (restartTimer) {
    clearTimeout(
      restartTimer
    );

    restartTimer = null;
  }

  /*
   * Cancel healthy timer
   */
  if (healthyTimer) {
    clearTimeout(
      healthyTimer
    );

    healthyTimer = null;
  }

  /*
   * Stop child process
   */
  if (child) {
    log(
      'Stopping main process...'
    );

    child.kill('SIGTERM');

    /*
     * Force stop if it hangs
     */
    setTimeout(() => {
      if (child) {
        log(
          'Main process did not stop gracefully. Force stopping.'
        );

        child.kill('SIGKILL');
      }
    }, CONFIG.shutdownTimeout);

  } else {
    process.exit(0);
  }
}

/*
|--------------------------------------------------------------------------
| SYSTEM SIGNALS
|--------------------------------------------------------------------------
*/

process.on(
  'SIGINT',
  () => {
    shutdown('SIGINT');
  }
);

process.on(
  'SIGTERM',
  () => {
    shutdown('SIGTERM');
  }
);

/*
|--------------------------------------------------------------------------
| SUPERVISOR ERROR HANDLING
|--------------------------------------------------------------------------
*/

process.on(
  'uncaughtException',
  error => {
    log(
      `Supervisor error: ${
        error?.stack ||
        error?.message ||
        error
      }`
    );
  }
);

process.on(
  'unhandledRejection',
  error => {
    log(
      `Unhandled supervisor rejection: ${
        error?.stack ||
        error
      }`
    );
  }
);

/*
|--------------------------------------------------------------------------
| STARTUP INFORMATION
|--------------------------------------------------------------------------
*/

log(
  `Node runtime: ${process.version}`
);

log(
  `Main file: ${SCRIPT_PATH}`
);

log(
  `Working directory: ${__dirname}`
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

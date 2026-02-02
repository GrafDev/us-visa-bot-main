#!/usr/bin/env node

// import { program } from 'commander';
import { Bot } from '../lib/bot.js';
import { getConfig } from '../lib/config.js';
import { sleep, isSocketHangupError } from '../lib/utils.js';

const COOLDOWN = 3600; // 1 hour in seconds

// Custom log function that outputs to stdout for parent process to capture
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

async function runBot(options) {
  const config = getConfig();
  const bot = new Bot(config, { dryRun: options.dryRun });
  let currentBookedDate = options.current;
  const targetDate = options.target;
  const minDate = options.min;

  log(`Initializing with current date ${currentBookedDate}`);

  if (options.dryRun) {
    log(`[DRY RUN MODE] Bot will only log what would be booked without actually booking`);
  }

  if (targetDate) {
    log(`Target date: ${targetDate}`);
  }

  if (minDate) {
    log(`Minimum date: ${minDate}`);
  }

  try {
    const sessionHeaders = await bot.initialize();

    while (true) {
      const availableDate = await bot.checkAvailableDate(
        sessionHeaders,
        currentBookedDate,
        minDate
      );

      if (availableDate) {
        const booked = await bot.bookAppointment(sessionHeaders, availableDate);

        if (booked) {
          // Update current date to the new available date
          currentBookedDate = availableDate;

          options = {
            ...options,
            current: currentBookedDate
          };

          if (targetDate && availableDate <= targetDate) {
            log(`Target date reached! Successfully booked appointment on ${availableDate}`);
            process.exit(0);
          }
        }
      }

      await sleep(config.refreshDelay);
    }
  } catch (err) {
    if (isSocketHangupError(err)) {
      log(`Socket hangup error: ${err.message}. Trying again after ${COOLDOWN} seconds...`);
      await sleep(COOLDOWN);
    } else {
      log(`Session/authentication error: ${err.message}. Retrying immediately...`);
    }
    return runBot(options);
  }
}

// Parse arguments manually to avoid commander issues in Electron/ASAR
const args = process.argv.slice(2);
const options = {};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--client-id') {
    options.clientId = args[++i];
  } else if (arg === '--current' || arg === '-c') {
    options.current = args[++i];
  } else if (arg === '--target' || arg === '-t') {
    options.target = args[++i];
  } else if (arg === '--min' || arg === '-m') {
    options.min = args[++i];
  } else if (arg === '--dry-run') {
    options.dryRun = true;
  }
}

if (!options.clientId || !options.current) {
  console.error('Missing required arguments: --client-id and --current are required');
  process.exit(1);
}

runBot(options);

/**
 * INPUT-TO-DATE UTILS.
 */

// NOTE: warning visibility is controlled from the selected parser.
const warning = document.getElementById('warning');

const unixParser = (n) => {
  let ms;
  if (n.length === 10) {
    // Treat as seconds.
    ms = 1000 * parseInt(n);
    warning.style.display = "block";
  } else {
    ms = parseInt(n);
    warning.style.display = "none";
  }
  return new Date(ms);
}

const mongoParser = (s) => {
  const ms = parseInt(s.substring(0, 8), 16) * 1000;
  return new Date(ms);
}

const uuidv7Parser = (s) => {
  // Strip dashes; first 12 hex digits encode unix ms timestamp.
  const hex = s.replace(/-/g, "");
  const ms = parseInt(hex.substring(0, 12), 16);
  return new Date(ms);
}

const isoParser = (s) => new Date(s);

var error;

const showErrorIfInvalid = (d) => {
  if (isNaN(d.getTime())) {
    error.style.display = "block";
  } else {
    error.style.display = "none";
  }
}

/**
 * DATE-TO-OUTPUT UTILS.
 */

const toDefaultOutput = (d) => d;

const toCodeOutput = (d) => `new Date(${d.getTime()})`;

// Relative-time output. Two cells side by side:
//   compound — "2 days, 3 hours, 4 minutes, 5 seconds ago"
//   seconds  — "183845 seconds ago"
const compoundUnits = [
  ['day',    24 * 60 * 60 * 1000],
  ['hour',   60 * 60 * 1000],
  ['minute', 60 * 1000],
  ['second', 1000],
];

const pluralize = (n, unit) => `${n} ${unit}${n === 1 ? '' : 's'}`;

const toCompoundString = (deltaMs) => {
  let remaining = Math.abs(deltaMs);
  // Round to the nearest second so we don't carry sub-second noise.
  remaining = Math.round(remaining / 1000) * 1000;
  if (remaining === 0) return 'now';
  const parts = [];
  for (const [unit, ms] of compoundUnits) {
    const n = Math.floor(remaining / ms);
    if (n > 0) {
      parts.push(pluralize(n, unit));
      remaining -= n * ms;
    }
  }
  const joined = parts.join(', ');
  return deltaMs < 0 ? `${joined} ago` : `in ${joined}`;
};

const toSecondsString = (deltaMs) => {
  // Signed seconds with a truncated unit, e.g. "-1000 s" or "+42 s".
  // Negative = in the past, positive = in the future.
  const secs = Math.round(deltaMs / 1000);
  const sign = secs > 0 ? '+' : '';
  return `${sign}${secs} s`;
};

const relativeRow = document.getElementById('relative-row');

const toCompoundOutput = (d) => {
  const deltaMs = d.getTime() - Date.now();
  // Highlight row: gray for past, sunny yellow for future.
  relativeRow.classList.remove('list-group-item-secondary', 'list-group-item-warning');
  if (!isNaN(d.getTime())) {
    relativeRow.classList.add(deltaMs >= 0 ? 'list-group-item-warning' : 'list-group-item-secondary');
  }
  return toCompoundString(deltaMs);
};

const toSecondsOutput = (d) => toSecondsString(d.getTime() - Date.now());

const toISOOutput = (d) => d.toISOString();

const toMongoOutput = (d) => {
  const ms = d.getTime();
  const prefix = Math.floor(ms / 1000).toString(16);
  return prefix + "0000000000000000";
}

const toUUIDv7Output = (d) => {
  // Emit the lexicographically-minimum well-formed UUIDv7 for this ms, so
  // the value works as a sentinel for range queries on a UUIDv7 ID column
  // (e.g. `WHERE id >= <uuid>` selects records at or after this timestamp).
  // 48-bit ms timestamp, version nibble 7, variant bits 10xx, rest zero.
  const tsHex = d.getTime().toString(16).padStart(12, "0");
  return `${tsHex.substring(0, 8)}-${tsHex.substring(8, 12)}-7000-8000-000000000000`;
}

const outputsAndGenerators = new Map([
  [document.getElementById('default-output'), toDefaultOutput],
  [document.getElementById('code-output'), toCodeOutput],
  [document.getElementById('relative-compound-output'), toCompoundOutput],
  [document.getElementById('relative-seconds-output'), toSecondsOutput],
  [document.getElementById('iso-output'), toISOOutput],
  [document.getElementById('mongo-output'), toMongoOutput],
  [document.getElementById('uuidv7-output'), toUUIDv7Output],
]);

/**
 * ADD EVENT LISTENERS.
 */

// Changing the input updates the outputs.
const input = document.getElementById('input');

const setOutputs = () => {
  const date = inputParser(input.value);
  showErrorIfInvalid(date);
  outputsAndGenerators.forEach((generator, output) => {
    output.innerHTML = isNaN(date.getTime()) ? "Invalid Date" : generator(date);
  });
}

input.addEventListener('input', setOutputs);

// Clicking the 'Relative' label refreshes the row against the current
// wall-clock time (the rest of the outputs depend on the input value).
document.getElementById('relative-refresh').addEventListener('click', (e) => {
  e.stopPropagation();
  setOutputs();
});

const reset = () => {
  input.value = dateToValidInput(new Date());
  setOutputs();
}

// Clicking the reset link sets to the input to the current timestamp.
Array.from(document.getElementsByClassName("reset-to-now")).forEach(
  link => link.addEventListener("click", reset)
);

/**
 * SWITCHING UI.
 */

const dropdown = document.getElementById("somedropdown");

const switchToUnixLink = document.getElementById("switch-to-unix");
const unixError = document.getElementById("unix-error");

const switchToISOLink = document.getElementById("switch-to-iso");
const isoError = document.getElementById("iso-error");

const switchToMongoLink = document.getElementById("switch-to-mongo");
const mongoError = document.getElementById("mongo-error");

const switchToUUIDv7Link = document.getElementById("switch-to-uuidv7");
const uuidv7Error = document.getElementById("uuidv7-error");

// (String | Number) => Date
var inputParser;
// (Date) => String | Number
var dateToValidInput;

function switchToUnix() {
  dropdown.innerText = "Unix Time";
  input.type = "number";
  inputParser = unixParser;
  // Needs to be a number rather than a string.
  dateToValidInput = (d) => d.getTime();
  switchToUnixLink.classList.add("active");
  switchToISOLink.classList.remove("active");
  switchToMongoLink.classList.remove("active");
  switchToUUIDv7Link.classList.remove("active");
  error = unixError;
}

switchToUnixLink.addEventListener('click', () => {
  switchToUnix();
  reset();
});

function switchToISO() {
  dropdown.innerText = "ISO 8601";
  input.type = "text"
  inputParser = isoParser;
  dateToValidInput = toISOOutput;
  switchToISOLink.classList.add("active");
  switchToUnixLink.classList.remove("active");
  switchToMongoLink.classList.remove("active");
  switchToUUIDv7Link.classList.remove("active");
  error = isoError;
}

switchToISOLink.addEventListener('click', () => {
  switchToISO();
  reset();
});

function switchToMongo() {
  dropdown.innerText = "Mongo ID";
  input.type = "text"
  inputParser = mongoParser;
  dateToValidInput = toMongoOutput;
  switchToMongoLink.classList.add("active");
  switchToUnixLink.classList.remove("active");
  switchToISOLink.classList.remove("active");
  switchToUUIDv7Link.classList.remove("active");
  error = mongoError;
}

switchToMongoLink.addEventListener('click', () => {
  switchToMongo();
  reset();
});

function switchToUUIDv7() {
  dropdown.innerText = "UUIDv7";
  input.type = "text"
  inputParser = uuidv7Parser;
  dateToValidInput = toUUIDv7Output;
  switchToUUIDv7Link.classList.add("active");
  switchToUnixLink.classList.remove("active");
  switchToISOLink.classList.remove("active");
  switchToMongoLink.classList.remove("active");
  error = uuidv7Error;
}

switchToUUIDv7Link.addEventListener('click', () => {
  switchToUUIDv7();
  reset();
});

/**
 * INITIALIZATION
 */

// If redirected from search.html, start with the searched timestamp rather than
// the current timestamp.
const queried = decodeURIComponent(window.location.search.substring(1));
if (queried && queried.length > 0) {
  console.log("Initializing with query value", queried)
  if (queried.match(/^\d+$/g)) {
    console.log("Switching on query to Unix");
    switchToUnix();
  } else if (!isNaN((new Date(queried)).getTime())) {
    console.log("Switching on query to ISO");
    switchToISO();
  } else if (/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(queried)) {
    console.log("Switching on query to UUIDv7");
    switchToUUIDv7();
  } else {
    console.log("Defaulting on query to Mongo");
    switchToMongo();
  }
  input.value = queried;
  setOutputs();
} else {
  // Without a query, default to Unix.
  switchToUnix();
  reset();
}

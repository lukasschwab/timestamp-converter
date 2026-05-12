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

// Relative-time output. The coarsest unit where |value| >= 1 is chosen
// by default; clicking the unit word cycles to finer (then wraps).
const relativeUnits = [
  ['year',   365.25 * 24 * 60 * 60 * 1000],
  ['month',  30.4375 * 24 * 60 * 60 * 1000],
  ['week',   7 * 24 * 60 * 60 * 1000],
  ['day',    24 * 60 * 60 * 1000],
  ['hour',   60 * 60 * 1000],
  ['minute', 60 * 1000],
  ['second', 1000],
];
const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

// Index into relativeUnits for the currently displayed precision.
// null means "auto-pick the coarsest meaningful unit". Stays null until the
// user explicitly cycles, so changing the input re-picks the coarsest unit.
var relativeUnitIndex = null;

const availableUnitsFor = (deltaMs) => {
  // Units whose rounded value is non-zero. Falls back to 'second' if all round to 0.
  const idxs = relativeUnits
    .map(([, ms], i) => Math.round(deltaMs / ms) !== 0 ? i : -1)
    .filter(i => i !== -1);
  return idxs.length ? idxs : [relativeUnits.length - 1];
};

const toReadableOutput = (d) => {
  const deltaMs = d.getTime() - Date.now();
  const available = availableUnitsFor(deltaMs);
  // Pick coarsest available if the user hasn't chosen, or if their choice
  // isn't meaningful for this delta. Don't mutate relativeUnitIndex itself —
  // we want a later, larger delta to re-pick the coarsest unit.
  const idx = (relativeUnitIndex !== null && available.includes(relativeUnitIndex))
    ? relativeUnitIndex
    : available[0];
  const [unit, unitMs] = relativeUnits[idx];
  const value = Math.round(deltaMs / unitMs);
  const formatted = rtf.format(value, unit);
  // Make the unit word (or 'now') clickable for cycling precision.
  const re = new RegExp('\\b(' + unit + 's?|now)\\b');
  return formatted.replace(re, '<span class="relative-unit" role="button" tabindex="0">$1</span>');
};

const cycleRelativeUnit = () => {
  const date = inputParser(input.value);
  if (isNaN(date.getTime())) return;
  const deltaMs = date.getTime() - Date.now();
  const available = availableUnitsFor(deltaMs);
  // If user hasn't cycled yet, current display is available[0]; advance from there.
  const current = (relativeUnitIndex !== null && available.includes(relativeUnitIndex))
    ? relativeUnitIndex
    : available[0];
  const pos = available.indexOf(current);
  relativeUnitIndex = available[(pos + 1) % available.length];
  setOutputs();
};

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
  [document.getElementById('relative-output'), toReadableOutput],
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

// Clicking the unit word in the relative-time output cycles precision.
document.getElementById('relative-output').addEventListener('click', (e) => {
  if (e.target.classList && e.target.classList.contains('relative-unit')) {
    e.stopPropagation();
    cycleRelativeUnit();
  }
});

const reset = () => {
  // Re-pick coarsest unit on reset (typically a mode switch or error recovery).
  relativeUnitIndex = null;
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

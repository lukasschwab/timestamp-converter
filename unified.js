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

const isoParser = (s) => new Date(s);

const error = document.getElementById('error');

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

const toReadableOutput = (d) => d.toLocaleDateString(
  'en-US',
  {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }
);

const toISOOutput = (d) => d.toISOString();

const toMongoOutput = (d) => {
  const ms = d.getTime();
  const prefix = Math.floor(ms / 1000).toString(16);
  return prefix + "0000000000000000";
}

const outputsAndGenerators = new Map([
  [document.getElementById('default-output'), toDefaultOutput],
  [document.getElementById('code-output'), toCodeOutput],
  [document.getElementById('readable-output'), toReadableOutput],
  [document.getElementById('iso-output'), toISOOutput],
  [document.getElementById('mongo-output'), toMongoOutput],
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

// Clicking the reset link sets to the input to the current timestamp.
const resetLink = document.getElementById('reset-to-now')

const reset = () => {
  input.value = dateToValidInput(new Date());
  setOutputs();
}

resetLink.addEventListener("click", reset);

/**
 * SWITCHING UI.
 */

const dropdown = document.getElementById("somedropdown");
const switchToUnixLink = document.getElementById("switch-to-unix");
const switchToISOLink = document.getElementById("switch-to-iso");
const switchToMongoLink = document.getElementById("switch-to-mongo");

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
}

switchToMongoLink.addEventListener('click', () => {
  switchToMongo();
  reset();
});

/**
 * INITIALIZATION
 */

// Use path to determine which parser/what default input to use.
const filename = location.pathname.split("/").pop();
switch (filename) {
  case "mongo.html":
    switchToMongo();
    break;
  case "iso.html":
    switchToISO();
    break;
  default:
    switchToUnix();
}

// If redirected from search.html, start with the searched timestamp rather than
// the current timestamp.
const queried = window.location.search.substring(1);
if (queried && queried.length > 0) {
  console.log("Initializing with query value", queried)
  input.value = queried
  setOutputs()
} else {
  reset();
}

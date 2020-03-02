/**
 * SELECT DOM ELEMENTS.
 */

/**
 * INPUT-TO-DATE UTILS.
 * (String | Number) => Date
 */

// Warning visibility is controlled from the selected parser.
const warning = document.getElementById('warning');

// (Number) => Date
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

// (String) => Date
const mongoParser = (s) => {
  const ms = parseInt(s.substring(0, 8), 16) * 1000;
  return new Date(ms);
}

// (String) => Date
const isoParser = (s) => new Date(s);

/**
 * DATE-TO-OUTPUT UTILS.
 * (Date) => string
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

/**
 * SELECT LOGIC.
 */

// (String | Number) => Date
var inputParser;
// (Date) => String | Number
var dateToValidInput;

// Use path to determine which parser/what default input to use.
const filename = location.pathname.split("/").pop();
switch (filename) {
  case "mongo.html":
    inputParser = mongoParser;
    dateToValidInput = toMongoOutput;
    break;
  case "iso.html":
    inputParser = isoParser;
    dateToValidInput = toISOOutput;
    break;
  default:
    inputParser = unixParser;
    // Needs to be a number rather than a string.
    dateToValidInput = (d) => d.getTime();
}

/**
 * ADD EVENT LISTENERS.
 */

const outputsAndGenerators = new Map([
  [document.getElementById('default-output'), toDefaultOutput],
  [document.getElementById('code-output'), toCodeOutput],
  [document.getElementById('readable-output'), toReadableOutput],
  [document.getElementById('iso-output'), toISOOutput],
  [document.getElementById('mongo-output'), toMongoOutput],
]);

const error = document.getElementById('error');
const showErrorIfInvalid = (d) => {
  if (isNaN(d.getTime())) {
    error.style.display = "block";
  } else {
    error.style.display = "none";
  }
}

const input = document.getElementById('input');
const setOutputs = () => {
  const date = inputParser(input.value);
  showErrorIfInvalid(date);
  outputsAndGenerators.forEach((generator, output) => {
    output.innerHTML = isNaN(date.getTime()) ? "Invalid Date" : generator(date);
  });
}
input.addEventListener('input', setOutputs);

const resetLink = document.getElementById('reset-to-now')
const reset = () => {
  input.value = dateToValidInput(new Date());
  setOutputs();
}
resetLink.addEventListener("click", reset);

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

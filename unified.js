/**
 * SELECT DOM ELEMENTS.
 */

 const error = document.getElementById('error');
 const input = document.getElementById('input');
 const mainOutput = document.getElementById('output');
 const readableOutput = document.getElementById('readable');
 const isoOutput = document.getElementById('iso');
 const codeOutput = document.getElementById('code-output');
 const resetLink = document.getElementById('reset-to-now')

/**
 * INPUT-TO-DATE UTILS.
 * (String | Number) => Date
 */

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
  const nextDate = new Date(ms);
  if (isNaN(nextDate.getTime())) {
    error.style.display = "block";
  } else {
    error.style.display = "none";
  }
  return nextDate;
}

// (String) => Date
const mongoParser = (s) => {
  let ms;
  ms = parseInt(s.substring(0, 8), 16) * 1000;
  const nextDate = new Date(ms);
  if (isNaN(nextDate.getTime())) {
    error.style.display = "block";
  } else {
    error.style.display = "none";
  }
  return nextDate;
}

// (String) => Date
const isoParser = (s) => {
  const nextDate = new Date(s);
  if (isNaN(nextDate.getTime())) {
    error.style.display = "block";
  } else {
    error.style.display = "none";
  }
  return nextDate;
}

/**
 * DATE-TO-OUTPUT UTILS.
 * (Date) => string
 */

// Construct a standard handled output generator.
const handle = (toOutput) => (d) => {
  try {
    return toOutput(d);
  } catch (err) {
    console.log(err);
    return "Invalid Date";
  }
}

const toDefaultOutput = handle((d) => d);

const toCodeOutput = handle((d) => `new Date(${d.getTime()})`);

const toReadableOutput = handle((d) => d.toLocaleDateString(
  'en-US',
  {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }
));

const toISOOutput = handle((d) => d.toISOString());

const toMongoOutput = handle((d) => {
  const ms = d.getTime();
  const prefix = Math.floor(ms / 1000).toString(16);
  return prefix + "0000000000000000";
});

/**
 * DEFINE & ADD EVENT LISTENERS.
 */

// (String | Number) => Date
var inputParser;
// (Date) => String | Number
var dateToValidInput;

// Use path to determine which parser/what default input to use.
// Alteratively, could switch on query string...
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

// FIXME: define the above!

const setOutputs = () => {
  const date = inputParser(input.value);
  mainOutput.innerHTML = toDefaultOutput(date);
  codeOutput.innerHTML = toCodeOutput(date);
  readableOutput.innerHTML = toReadableOutput(date);
  isoOutput.innerHTML = toISOOutput(date);
}
input.addEventListener('input', setOutputs);

const reset = () => {
  input.value = dateToValidInput(new Date());
  setOutputs();
}
resetLink.addEventListener("click", reset);

// Initialize.
reset();

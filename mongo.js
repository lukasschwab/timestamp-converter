// Timestamp interpretation utilities.
const error = document.getElementById('error');

const getDateFromInput = (s) => {
  let ms;
  console.log("s", s)
  ms = parseInt(s.substring(0, 8), 16) * 1000;
  console.log("ms", ms)
  const nextDate = new Date(ms);
  console.log("nextDate", nextDate)
  if (isNaN(nextDate.getTime())) {
    error.style.display = "block";
  } else {
    error.style.display = "none";
  }
  return nextDate;
}

// Select IO.
const input = document.getElementById('input');
const mainOutput = document.getElementById('output');
const readableOutput = document.getElementById('readable');
const isoOutput = document.getElementById('iso');
const codeOutput = document.getElementById('code-output');

const setOutputs = () => {
  const date = getDateFromInput(input.value);
  console.log(date)
  mainOutput.innerHTML = date;
  codeOutput.innerHTML = `new Date(${date.getTime()})`
  readableOutput.innerHTML = date.toLocaleDateString(
    'en-US',
    {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }
  );
  isoOutput.innerHTML = date.toISOString();
}

const dateToMongoId = (date) => {
  const ms = date.getTime();
  const prefix = Math.floor(ms / 1000).toString(16);
  return prefix + "0000000000000000";
}

const reset = () => {
  input.value = dateToMongoId(new Date());
  setOutputs();
}
reset();

// Add event listeners.
input.addEventListener('input', setOutputs)

document
  .getElementById('reset-to-now')
  .addEventListener("click", reset);

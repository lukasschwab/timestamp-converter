// Timestamp interpretation utilities.
const error = document.getElementById('error');

const getDateFromInput = (s) => {
  const nextDate = new Date(s);
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

const reset = () => {
  input.value = new Date().toISOString();
  setOutputs();
}
reset();

// Add event listeners.
input.addEventListener('input', setOutputs)

document
  .getElementById('reset-to-now')
  .addEventListener("click", reset);

// Timestamp interpretation utilities.
const warning = document.getElementById('warning');
const error = document.getElementById('error');

const getDateFromString = (s) => {
  let ms;
  if (s.length === 10) {
    // Treat as seconds.
    ms = 1000 * parseInt(s);
    warning.style.display = "block";
  } else {
    ms = parseInt(s);
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

// Select and initialize IO.
const input = document.getElementById('input');
input.value = new Date().getTime()
const mainOutput = document.getElementById('output');
const readableOutput = document.getElementById('readable');
const isoOutput = document.getElementById('iso');
const codeOutput = document.getElementById('code-output');

const setOutputs = () => {
  const date = getDateFromString(input.value);
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
  input.value = new Date().getTime()
  setOutputs()
}
reset()

// Add event listeners.
input.addEventListener('input', (event) => setOutputs())

document.getElementById('reset-to-now').addEventListener("click", () => {
  input.value = new Date().getTime();
  setOutputs();
})

// If you click outside the clickable div, you highlight the input field.
document.getElementsByTagName('html')[0].onclick = () => {
  input.select();
};
document.getElementById('clickable').onclick = (event) => {
  event = event ? event : window.event;
  if (event.stopPropagation) {
    event.stopPropagation();
  } else {
    evt.cancelBubble=true;
  }
  return false;
}

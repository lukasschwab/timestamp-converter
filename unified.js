const NATO = {
  "a": "Alfa",
  "b": "Bravo",
  "c": "Charlie",
  "d": "Delta",
  "e": "Echo",
  "f": "Foxtrot",
  "g": "Golf",
  "h": "Hotel",
  "i": "India",
  "j": "Juliett",
  "k": "Kilo",
  "l": "Lima",
  "m": "Mike",
  "n": "November",
  "o": "Oscar",
  "p": "Papa",
  "q": "Quebec",
  "r": "Romeo",
  "s": "Sierra",
  "t": "Tango",
  "u": "Uniform",
  "v": "Victor",
  "w": "Whiskey",
  "x": "Xray",
  "y": "Yankee",
  "z": "Zulu"
}

const toPhonetic = (char) => {
  label = document.createElement("label")
  label.classList.add("list-group-item-label", "quiet")
    label.appendChild(document.createTextNode(char === " " ? "[space]" : `${char} as in`))

  item = document.createElement("li")
  item.classList.add("list-group-item", "list-group-item-action")
  item.appendChild(label)

  if (char === " ") {
    return item
  }

  item.appendChild(document.createTextNode(NATO[char.toLowerCase()] ?? char))

  return item
}

const outputsAndGenerators = new Map([
  [document.getElementById('default-output'), (text) => text.split("").map(toPhonetic).join("<br>")]
]);

/**
 * ADD EVENT LISTENERS.
 */

// Changing the input updates the outputs.
const input = document.getElementById('input');
const results = document.getElementById('results')

const setOutputs = () => {
  // Clear and reconstruct children.
  results.innerHTML = ""
  input.value.split("").forEach(char => {
    results.appendChild(toPhonetic(char))
  })
}

input.addEventListener('input', setOutputs);

const reset = () => {
  input.value = "";
  setOutputs();
}

/**
 * INITIALIZATION
 */

// If redirected from search.html, start with the searched timestamp rather than
// the current timestamp.
const queried = decodeURIComponent(window.location.search.substring(1));
if (queried && queried.length > 0) {
  input.value = queried;
  setOutputs();
} else {
  reset();
}

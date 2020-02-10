// If redirected from search.html, start with the searched timestamp rather than
// the current timestamp.
const queried = window.location.search.substring(1);
if (queried && queried.length > 0) {
  console.log("Initializing with query value", queried)
  input.value = queried
  setOutputs()
}

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

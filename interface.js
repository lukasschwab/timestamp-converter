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

// get the input texts
let minutesInput = document.querySelector('#minutesInput');
let secondsInput = document.querySelector('#secondsInput');
// get the start button
const btnStart = document.querySelector('.start');
// get the circle
const circle = document.querySelector('#circle');
let radiusOfTimerCircle = circle.getAttribute('r');
// Length of the arc 2*π*r 
/* we need this for stroke-dasharray value */
let lengthOfArc = 2 * Math.PI * radiusOfTimerCircle; // 1595.929068023615



// starting with original time limit of 15 minutes
let time_limit = 1 * 60;
// the time that has passed since starting
let time_passed = 0;
// initialy time left is equal to the time limit
let time_left = time_limit;

// the timerInterval to keep track of the setInterval method
let timerInterval = null;

function formatTimeLeft(time) {
  // The largest round integer less than or equal to the result of time divided being by 60.
  const minutes = Math.floor(time / 60);

  // Seconds are the remainder of the time divided by 60 (modulus operator)
  let seconds = time % 60;

  // If the value of seconds is less than 10, then display seconds with a leading zero
  if (seconds < 10) {
    seconds = `0${seconds}`;
  }

  // The output in MM:SS format
  return { minutes, seconds };
}

function startTimer() {
    timerInterval = setInterval(() => {
        // time passed increments by 1 each second
        time_passed += 1;
        time_left = time_limit - time_passed;

        // update the input boxes on the timer
        let {minutes, seconds} = formatTimeLeft(time_left);
        minutesInput.value = minutes;
        secondsInput.value = seconds;

        setCircleDasharray();

    }, 1000);
    
}

// Divides time left by the defined time limit.
function calculateTimeFraction() {
  return time_left / time_limit;
}
    
// Update the dasharray value as time passes, starting with 283
function setCircleDasharray() {
  const circleDasharray = `${(
    calculateTimeFraction() * lengthOfArc
  ).toFixed(0)} ${lengthOfArc}`;
  document
    .querySelector("circle")
    .setAttribute("stroke-dasharray", circleDasharray);
}

btnStart.addEventListener('click', () => {
    startTimer();
})




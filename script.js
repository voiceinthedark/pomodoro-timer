// get the input texts
let minutesInput = document.querySelector('#minutesInput');
let secondsInput = document.querySelector('#secondsInput');
// get the start button
const btnStart = document.querySelector('.start');

// starting with original time limit of 15 minutes
let time_limit = 15 * 60;
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

    }, 1000);
    
}

btnStart.addEventListener('click', () => {
    startTimer();
})

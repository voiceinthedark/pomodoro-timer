// check if localStorage is setup and fetch settings
window.onload = () => {
  if(window.localStorage && window.localStorage.getItem('time')){
    pomodoro.setTimeLimit(window.localStorage.getItem('time'));
    // console.log(pomodoro.getTimeLimit());
    setTimeout(() => {
      minutesInput.value = pomodoro.getMinutes();
      secondsInput.value = pomodoro.getSeconds();  
      modal.style.display = 'block';
      modal.textContent = "User settings loaded successfully.";
    }, 500);

    setTimeout(() => {
      modal.style.display = 'none';
    }, 4000);
  }
}

/*** DOM elements ***/

// get the input texts
let minutesInput = document.querySelector('#minutesInput');
let secondsInput = document.querySelector('#secondsInput');
// get the start button
const btnStart = document.querySelector('.start');
let btnToggleStart = true; // btn flag, change to stop when clicked
// get the reset button
const btnReset = document.querySelector('.reset');
// get the settings button
const btnSettings = document.querySelector('.settings');
// get the circle
const circle = document.querySelector('#circle');
// the ring div
const ringDiv = document.querySelector('.ring');

// Information modal
const modal = document.querySelector('#information-modal');

  /****************** */
  /** Pomodoro module */
  /****************** */

const pomodoro = (function () {
  const timerThreshold = {
    timeEnd: 4,
  }

  let radiusOfTimerCircle = circle.getAttribute('r');
  // Length of the arc 2*π*r
  /* we need this for stroke-dasharray value */
  let lengthOfArc = 2 * Math.PI * radiusOfTimerCircle; // 1595.929068023615

  /*** time variables ***/

  // starting with original time limit of 15 minutes
  let time_limit = +minutesInput.value * 60 + +secondsInput.value;
  // the time that has passed since starting
  let time_passed = 0;
  // initialy time left is equal to the time limit
  let time_left = time_limit;

  // the timerInterval to keep track of the setInterval method
  let timerInterval = null;

  /**
   * Format the time left
   * @param {int} time
   * @returns {{int} minutes, {int} seconds}
   */
  function formatTimeLeft(time) {
    // The largest round integer less than or equal to the result of time divided being by 60.
    let minutes = Math.floor(time / 60);

    // Seconds are the remainder of the time divided by 60 (modulus operator)
    let seconds = time % 60;

    // If the value of seconds is less than 10, then display seconds with a leading zero
    if (seconds < 10) {
      seconds = `0${seconds}`;
    }

    if (minutes < 10) {
      minutes = `0${minutes}`;
    }

    // console.log(minutes, seconds);
    // The output in MM:SS format
    return { minutes, seconds };
  }

  /**
   * Start the Pomodoro timer
   */
  function startTimer() {
    timerInterval = setInterval(() => {
      // remove class ending, turning the color back to green
      ringDiv.classList.remove('ending');
      // time passed increments by 1 each second
      time_passed += 1;
      time_left = time_limit - time_passed;

      // update the input boxes on the timer
      let { minutes, seconds } = formatTimeLeft(time_left);
      minutesInput.value = minutes;
      secondsInput.value = seconds;

      setCircleDasharray();

      // nearing the end of the timer, play audio signal
      if(time_left === timerThreshold.timeEnd){
        audioPlayer.playTimeEnd();
      }

      // time is up
      if (time_left === 0) {
        onTimesUp();
      }
    }, 1000);
  }

  // Divides time left by the defined time limit.
  function calculateTimeFraction() {
    let rawTimeLimit = time_left / time_limit;
    // to completely eliminates ring strokes, function need to work an extra second after the time limit
    return rawTimeLimit - (1 / time_limit) * (1 - rawTimeLimit);
  }

  // Update the dasharray value as time passes, starting with 283
  function setCircleDasharray() {
    const circleDasharray = `${(calculateTimeFraction() * lengthOfArc).toFixed(
      0
    )} ${lengthOfArc}`;
    document
      .querySelector('circle')
      .setAttribute('stroke-dasharray', circleDasharray);
  }

  /**
   * function called when the timer ends
   */
  function onTimesUp() {
    clearInterval(timerInterval);
    btnToggleStart = true;
    btnStart.textContent = 'Start';

    // Reset the time
    time_passed = 0;
    time_left = time_limit;
    timerInterval = null;

    // change ring stroke color to red
    ringDiv.classList.add('ending');
  }

  function saveSettings() {
    if(window.localStorage){
      window.localStorage.setItem('time', time_limit);
      modal.style.display = 'block';
      modal.textContent = 'Settings saved successfully';

      setTimeout(() => {
        modal.style.display = 'none';
      }, 4000);
    }
    else {
      console.log('Your browser does not support local storage');
    }
  }

  function resetTimer() {
    time_passed = 0;
    time_left = time_limit;
    stopTimer();
    timerInterval = null;
    if(!btnToggleStart){
      btnToggleStart = !btnToggleStart;
    }
    btnStart.textContent = 'start';
  }

  function stopTimer() {
    clearInterval(timerInterval);
  }

  function getTimeLimit() {
    return time_limit;
  }
  function setTimeLimit(n) {
    time_limit = n;
  }  

  function getMinutes(){
    return formatTimeLeft(getTimeLimit()).minutes;
  }
  function getSeconds(){
    return formatTimeLeft(getTimeLimit()).seconds;
  }

  return {
    startTimer,
    setCircleDasharray,    
    resetTimer,
    stopTimer,
    setTimeLimit,  
    saveSettings,
    getMinutes,
    getSeconds,
  };

})();

const audioPlayer = (function () {
  // audio element
  const audioEnd = document.querySelector('#timer-audio');
  // Music wrapper element
  const musicWrapper = document.querySelector('.music-wrapper');

  let playPauseBtnToggle = true;
  const loopChk = document.querySelector('#loopChk');
  let wavesurfer = [];
  let idx = 0; // index counter for wave id

  const musicStore = {
    cancion: 'mixkit-cancion-de-crystal-583.mp3',
    how: 'mixkit-how-579.mp3',
    relaxation: 'mixkit-relaxation-03-747.mp3',
    serene: 'mixkit-serene-moments-27.mp3',
    special: 'mixkit-special-days-19.mp3',
    staring: 'mixkit-staring-at-the-night-sky-168.mp3',
  };

  const createMusicDrawer = () => {
    for(const song in musicStore){
      // console.log(musicStore[song]);
      const divMusicPlayer = document.createElement('div');
      divMusicPlayer.classList.add('music-player');
      const divWaveForm = document.createElement('div');
      divWaveForm.classList.add('waveform');
      divWaveForm.setAttribute('id', `wave${idx}`);
      divMusicPlayer.appendChild(divWaveForm);
      const divMusicBody = document.createElement('div');
      divMusicBody.classList.add('body');
      const spanMusicBodyName = document.createElement('span');
      spanMusicBodyName.classList.add('song-name');
      spanMusicBodyName.textContent = song;
      divMusicBody.appendChild(spanMusicBodyName);
      const spanMusicBodyPlay = document.createElement('span');
      spanMusicBodyPlay.textContent = '▶';
      spanMusicBodyPlay.classList.add('play-btn');
      spanMusicBodyPlay.setAttribute('id', `play${idx}`);
      divMusicBody.appendChild(spanMusicBodyPlay);
      divMusicPlayer.appendChild(divMusicBody);
      musicWrapper.appendChild(divMusicPlayer);

      /* Add wavesurfer */
      /* ****** Fixing the wavesurfer object assigned dynamically *******
       * https://stackoverflow.com/questions/50569574/dynamically-create-multiple-wavesurfer-objects-with-unique-names
      * *************************************************************** */

      wavesurfer[idx] = WaveSurfer.create({
        container: `#wave${idx}`,
        // backgroundColor: 'white',
        height: 65,
        barWidth: 2,
        barHeight: 1, // the height of the wave
        barGap: null, // the optional spacing between bars of the wave, if not provided will be calculated in legacy format
        responsive: true,
        minPxPerSec: 1,
        backend: 'MediaElement',
        waveColor: '#09A65A',
        backgroundColor: 'rgb(83, 81, 81)',
      });

      wavesurfer[idx].drawBuffer();
      // load the asset on page load (ruminating on making it on play)
      wavesurfer[idx].load(`./assets/music/${musicStore[song]}`);
      wavesurfer[idx].on('ready', () => {
        console.log(`loaded ${musicStore[song]}`);
      });
      
      // when the song is done playing
      wavesurfer[idx].on('finish', () => {
        let id = spanMusicBodyPlay.getAttribute('id').slice(-1);
        // if loop checkbox is checked seek back to the beginning and play again
        if(loopChk.checked){          
          wavesurfer[id].seekTo(0);
          wavesurfer[id].playPause();
        } else {
          // change button to start
          playPauseBtnToggle = !playPauseBtnToggle;
          spanMusicBodyPlay.textContent = '▶';
        }
      });

      /* Add the play button*/
      spanMusicBodyPlay.addEventListener('click', (evt) => {
        if (playPauseBtnToggle) {
          spanMusicBodyPlay.innerHTML = '⏸︎';
        } else {
          spanMusicBodyPlay.textContent = '⏵︎';
        }
        playPauseBtnToggle = !playPauseBtnToggle;
        // Had to use this small hack because i coudn't get the idx to work
        wavesurfer[evt.target.id.slice(-1)].playPause();
      });

      idx = idx + 1;
    }
  }
  
  function playTimeEnd() {
    audioEnd.play();
  }

  return { 
    playTimeEnd,
    createMusicDrawer,
  }
})();

/*******************
 * Event Listeners *
 *******************/

/**
 * EventListener click for the start button
 */
btnStart.addEventListener('click', () => {
  if (btnToggleStart) {
    pomodoro.startTimer();
  } else {
    pomodoro.stopTimer();
  }
  btnToggleStart = !btnToggleStart;
  btnStart.textContent = btnToggleStart ? 'Start' : 'Stop';
});

btnReset.addEventListener('click', () => {
  // Reset the time
  pomodoro.resetTimer();
  minutesInput.value = pomodoro.getMinutes();
  secondsInput.value = pomodoro.getSeconds();
  pomodoro.setCircleDasharray();
});

btnSettings.addEventListener('click', () => {
  minutesInput.disabled = false;
  secondsInput.disabled = false;
  minutesInput.focus();
});

/**
 * When the minutes input loses focus save settings
 */
minutesInput.addEventListener('blur', () => {
  pomodoro.setTimeLimit(+minutesInput.value * 60 + +secondsInput.value);
  
  minutesInput.disabled = true;
});

secondsInput.addEventListener('blur', () => {
  pomodoro.setTimeLimit(+minutesInput.value * 60 + +secondsInput.value);
  pomodoro.saveSettings();
  
  minutesInput.disabled = true;
  secondsInput.disabled = true;
});

// Create and add the audio drawer to the page
audioPlayer.createMusicDrawer();

function timer(starting){
    const startBtn = document.getElementById('start-btn');
    console.log(starting);
    startBtn.dataset.timerId
    
    if (!starting) {
        const existingId = startBtn.dataset.timerId;
        
        if (existingId) {
            clearInterval(Number(existingId));
            delete startBtn.dataset.timerId;
        }
        return;
    }

    
    if (startBtn.dataset.timerId) {
        clearInterval(Number(startBtn.dataset.timerId));
    }

    let timeString = document.getElementById('timer').innerText;
    let stringSplit = timeString.split(':');
    let sec = parseInt(stringSplit[1], 10);
    sec += (parseInt(stringSplit[0], 10) * 60);

    const timerCount = setInterval(() => {
        sec--;
        document.getElementById('timer').innerText =
            String(Math.floor(sec / 60)).padStart(2, '0') + ':' +
            String(sec % 60).padStart(2, '0');

        if (sec < 0) {
            clearInterval(timerCount);
            delete startBtn.dataset.timerId;
        }
    }, 1000);

    startBtn.dataset.timerId = String(timerCount);
}

function switchBtnState(){
    const startBtn = document.getElementById('start-btn');
    const timerStarting = (startBtn.className === 'start-btn');

    if (timerStarting) {
        startBtn.setAttribute('class', 'end-btn');
        startBtn.innerText = 'End';
    } else {
        startBtn.setAttribute('class', 'start-btn');
        startBtn.innerText = 'Start';
    }

    return timerStarting;
}

document.getElementById('start-btn').addEventListener('click', () => {
    const shouldStart = switchBtnState();
    timer(shouldStart);
});

document.getElementById('clear-btn').addEventListener('click', () => {
    startBtn = document.getElementById('start-btn');
    document.getElementById('timer').innerText = '30:00';
    timer(false);
    
    if (startBtn.className == 'end-btn'){
        switchBtnState();
    }
})

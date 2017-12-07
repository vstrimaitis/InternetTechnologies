$(document).ready(() => {
    var interval = null;
    var constants = {
        startBtn: "#startBtn",
        lapBtn: "#lapBtn",
        resetBtn: "#resetBtn",
        timer: "#timer",
        laps: "#laps",
        btnStoppedLabel: "Start",
        btnStartedLabel: "Stop"
    };

    $(constants.startBtn).click(e => {
        var text = e.target.innerHTML;
        if(text === constants.btnStoppedLabel) {
            startTimer();
        } else {
            stopTimer();
        }
    });

    $(constants.lapBtn).click(() => {
        var currentTime = $(constants.timer).html();
        $(constants.laps).append($("<li>"+currentTime+"</li>"));
    });

    $(constants.resetBtn).click(() => {
        stopTimer();
        $(constants.timer).html("00:00:00");
    });

    function startTimer() {
        interval = setInterval(updateTimer, 1000);
        $(constants.startBtn).html(constants.btnStartedLabel);
    }

    function stopTimer() {
        clearInterval(interval);
        $(constants.startBtn).html(constants.btnStoppedLabel);
    }

    function updateTimer() {
        var timer = $(constants.timer);
        timer.html(increment(timer.html()));
    }

    function increment(s) {
        var parts = s.split(":").map(x => parseInt(x));
        parts[2]++;
        if(parts[2] >= 60) {
            parts[2] = 0;
            parts[1]++;
        }
        if(parts[1] >= 60) {
            parts[1] = 0;
            parts[0]++;
        }
        var hrs = ("0"+parts[0]).slice(-2);
        var mins = ("0"+parts[1]).slice(-2);
        var secs = ("0"+parts[2]).slice(-2);
        return hrs+":"+mins+":"+secs;
    }
});
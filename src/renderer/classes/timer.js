class Timer {

    $dom;
    interval;
    isActive = false;
    seconds = 0;
    maxSeconds = 0;

    constructor(maxSeconds) {
        if (maxSeconds) {
            this.maxSeconds = maxSeconds;
        }

        this.generateDOM();
    }

    generateDOM() {
        this.$dom = $('<button class="btn btn-primary"></button>').prop('disabled', true).attr('title', 'Время выполнения');
    }

    getDOM() {
        return this.$dom;
    }

    updateDOM() {
        if (!this.$dom) { return; }
        this.$dom.html(this.getTimeString());
    }

    getTimeString() {
        const m = Math.floor(this.seconds / 60);
        const s = this.seconds - (m * 60);
        const text = (m > 9 ? m : `0${m}`) + ':' + (s > 9 ? s : `0${s}`);
        return text;
    }

    start() {
        this.seconds = 0;
        this.continue();
    }

    continue() {
        this.isActive = true;
        this.updateDOM();
        this.interval = setInterval(() => {
            if (!this.isActive) {
                this.clearInterval();
                return;
            }
            this.seconds += 1;
            this.updateDOM();
            if (this.maxSeconds > 0 && this.seconds == this.maxSeconds) {
                this.stop();
            }
        }, 1000);
    }

    stop() {
        this.isActive = false;
        this.clearInterval();
    }

    toggle() {
        if (this.isActive) {
            this.stop();
        } else {
            this.continue();
        }
    }

    clearInterval() {
        if (!this.interval) { return; }
        clearInterval(this.interval);
        this.interval = null;
    }

}

module.exports = Timer;

"use strict";

exports.getCompleteBars = getCompleteBars;

const coeffs = [
    { key: "S5", value: 1000 * 5 },
    { key: "S10", value: 1000 * 10 },
    { key: "S15", value: 1000 * 15 },
    { key: "S30", value: 1000 * 30 },
    { key: "M1", value: 1000 * 60 },
    { key: "M2", value: 1000 * 60 * 2 },
    { key: "M3", value: 1000 * 60 * 3 },
    { key: "M4", value: 1000 * 60 * 4 },
    { key: "M5", value: 1000 * 60 * 5 },
    { key: "M10", value: 1000 * 60 * 10 },
    { key: "M15", value: 1000 * 60 * 15 },
    { key: "M30", value: 1000 * 60 * 30 },
    { key: "H1", value: 1000 * 60 * 60 },
    { key: "H2", value: 1000 * 60 * 60 * 2 },
    { key: "H3", value: 1000 * 60 * 60 * 3 },
    { key: "H4", value: 1000 * 60 * 60 * 4 },
    { key: "H6", value: 1000 * 60 * 60 * 6 },
    { key: "H8", value: 1000 * 60 * 60 * 8 },
    { key: "H12", value: 1000 * 60 * 60 * 12 },
    { key: "D", value: 1000 * 60 * 60 * 24 },
    { key: "W", value: 1000 * 60 * 60 * 24 * 7 },
    { key: "M", value: 1000 * 60 * 60 * 24 * 30 }
];

const currentBars = {};

function getCompleteBars(tick) {
    const instrument = tick.instrument,
        time = tick && tick.time,
        tickTime = time ? new Date(time) : new Date(),
        midPrice = tick && (parseFloat(tick.bid) + parseFloat(tick.ask)) / 2;

    initBars(instrument);

    const completeBars = filterBars(instrument, tickTime);

    updateBars(instrument, tickTime, midPrice);

    return completeBars;
}

function initBars(instrument) {
    if (!currentBars[instrument]) {
        currentBars[instrument] = {};
        coeffs.forEach(coeff => {
            currentBars[instrument][coeff.key] = {};
        });
    }
}

function filterBars(instrument, tickTime) {
    const completeBars = [];

    coeffs.forEach(coeff => {
        const bar = currentBars[instrument][coeff.key],
            nowTime = Math.floor(tickTime / coeff.value) * coeff.value,
            isNewTime = bar.time && bar.time !== nowTime;

        if (isNewTime) {
            completeBars.push({
                instrument,
                granularity: coeff.key,
                time: (new Date(bar.time)).toISOString(),
                openMid: bar.open,
                highMid: bar.high,
                lowMid: bar.low,
                closeMid: bar.close,
                volume: bar.volume
            });
        }
    });

    return completeBars;
}

function updateBars(instrument, tickTime, midPrice) {
    coeffs.forEach(coeff => {
        const bar = currentBars[instrument][coeff.key],
            timeBar = Math.floor(tickTime / coeff.value) * coeff.value,
            isNewBar = !bar.open,
            isNewTime = bar.time !== timeBar;

        if (isNewBar || isNewTime) {
            bar.open = midPrice;
            bar.close = midPrice;
            bar.high = midPrice;
            bar.low = midPrice;
            bar.volume = 0;
            bar.time = timeBar;
        } else if (midPrice > bar.high) {
            bar.high = midPrice;
        } else if (midPrice < bar.low) {
            bar.low = midPrice;
        }

        bar.close = midPrice;
        bar.volume += 1;
    });
}

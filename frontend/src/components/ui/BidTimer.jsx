import React, { useState, useEffect } from 'react';

const BidTimer = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = +new Date(endTime) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        totalMs: difference
      };
    } else {
      timeLeft = { hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
    }

    return timeLeft;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const { hours, minutes, seconds, totalMs } = timeLeft;

  if (totalMs <= 0) {
    return (
      <span className="font-bebas tracking-wide text-red-600 text-sm border border-red-800 bg-red-950/30 px-2 py-0.5">
        BID ENDED
      </span>
    );
  }

  // Format with leading zeros
  const pad = (num) => String(num).padStart(2, '0');
  const timerString = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  // Determine colors based on thresholds
  // Under 10 minutes (600,000 ms)
  const isUnder10Min = totalMs < 10 * 60 * 1000;
  // Under 1 hour (3,600,000 ms)
  const isUnder1Hour = totalMs < 60 * 60 * 1000;

  let colorClass = "text-zinc-400 border-zinc-700 bg-zinc-900/40";
  if (isUnder10Min) {
    colorClass = "text-red-500 border-red-500 bg-red-950/50 animate-pulse font-bold";
  } else if (isUnder1Hour) {
    colorClass = "text-orange-500 border-orange-500 bg-orange-950/40 font-semibold";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 font-mono text-xs border tracking-wider shadow-[1px_1px_0px_rgba(0,0,0,1)] uppercase ${colorClass}`}>
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${isUnder10Min ? 'bg-red-500' : isUnder1Hour ? 'bg-orange-500' : 'bg-zinc-400'}`}></span>
      {timerString}
    </span>
  );
};

export default BidTimer;

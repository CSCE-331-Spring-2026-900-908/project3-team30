
function formatTime(localTime) {
  if (!localTime) return '';
  let h, m;
  if (Array.isArray(localTime)) {
    [h, m] = localTime;
  } else {
    [h, m] = localTime.split(':').map(Number);
  }
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  const minute = m > 0 ? `:${String(m).padStart(2, '0')}` : '';
  return `${hour}${minute} ${period}`;
}

function getTimeRemaining(endTime) {
  const now = new Date();
  let endH, endM;
  if (Array.isArray(endTime)) {
    [endH, endM] = endTime;
  } else {
    [endH, endM] = endTime.split(':').map(Number);
  }
  const endDate = new Date();
  endDate.setHours(endH, endM, 0, 0);
  const diffMins = Math.max(0, Math.floor((endDate - now) / 60000));
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return hours > 0
    ? `${hours}h ${String(mins).padStart(2, '0')}m`
    : `${mins}m`;
}

export default function HappyHourBanner({ activeHappyHour }) {
  if (!activeHappyHour) return null;

  const discountPct = Math.round(activeHappyHour.percentOff * 100);
  const timeRange = `${formatTime(activeHappyHour.startTime)} – ${formatTime(activeHappyHour.endTime)}`;
  const remaining = getTimeRemaining(activeHappyHour.endTime);

  return (
    <>
      <style>{`
        .hhb {
          position: relative;
          overflow: hidden;
          border-radius: 20px;
          margin-bottom: 1.25rem;
          border: 1.5px solid #f0a8b8;
          box-shadow: 0 4px 24px rgba(210, 100, 130, 0.15);
          background: linear-gradient(135deg, #f9c5d1 0%, #fde8ec 50%, #f9c5d1 100%);
        }

        /* decorative blobs */
        .hhb__blob {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          background: rgba(255, 255, 255, 0.22);
        }

        /* the three-column row */
        .hhb__inner {
          position: relative;
          display: flex;
          align-items: center;
          padding: 20px 28px;
        }

        /* LEFT — Happy Hour + time */
        .hhb__left {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }

        /* CENTER — big discount */
        .hhb__center {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        /* RIGHT — countdown */
        .hhb__right {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
        }

        .hhb__title {
          font-size: 22px;
          font-weight: 800;
          color: #b5365a;
          letter-spacing: -0.02em;
          line-height: 1;
          margin: 0;
        }

        .hhb__time {
          font-size: 13px;
          font-weight: 500;
          color: #c26080;
          margin: 0;
        }

        .hhb__discount {
          font-size: 42px;
          font-weight: 900;
          color: #b5365a;
          line-height: 1;
          letter-spacing: -0.03em;
          margin: 0;
        }

        .hhb__label {
          font-size: 12px;
          font-weight: 600;
          color: #c26080;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin: 0;
        }

        .hhb__remaining {
          font-size: 28px;
          font-weight: 900;
          color: #b5365a;
          letter-spacing: -0.03em;
          line-height: 1;
          margin: 0;
        }
      `}</style>

      <div className="hhb">
        {/* decorative blobs */}
        <div className="hhb__blob" style={{ top: -28, right: -28, width: 120, height: 120 }} />
        <div className="hhb__blob" style={{ bottom: -40, right: 80, width: 90, height: 90 }} />
        <div className="hhb__blob" style={{ top: -20, left: 200, width: 60, height: 60 }} />

        <div className="hhb__inner">
          {/* LEFT */}
          <div className="hhb__left">
            <p className="hhb__title">Happy Hour</p>
            <p className="hhb__time">{timeRange}</p>
          </div>

          {/* CENTER */}
          <div className="hhb__center">
            <p className="hhb__discount">{discountPct}% off</p>
            <p className="hhb__label">all drinks</p>
          </div>

          {/* RIGHT */}
          <div className="hhb__right">
            <p className="hhb__remaining">{remaining}</p>
            <p className="hhb__label">remaining</p>
          </div>
        </div>
      </div>
    </>
  );
}
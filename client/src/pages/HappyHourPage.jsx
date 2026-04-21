import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../components/DataTable';
import FormField from '../components/FormField';
import PageShell from '../components/PageShell';
import { api } from '../services/api';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const emptyForm = { startTime: '', endTime: '', percentOff: '' };
const HAPPY_HOUR_CACHE_KEY = 'manageHappyHour_data';

const formatTime = (t) => {
  if (!t) return '—';
  const [hours, minutes] = t.split(':');
  const h = Number(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const formatPercent = (p) =>
  p !== null && p !== undefined ? `${Math.round(p * 100)}%` : '—';

export default function ManageHappyHourPage() {
  const [happyHours, setHappyHours] = useState(() => {
    try {
      const cached = sessionStorage.getItem(HAPPY_HOUR_CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Failed to read cached happy hours:', error);
      return [];
    }
  });

  const [selectedDays, setSelectedDays] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(happyHours.length === 0);

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.getHappyHours();
      setHappyHours(data);
      sessionStorage.setItem(HAPPY_HOUR_CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error(error);
      setStatus('Failed to load happy hour data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
    setStatus('');
  };

  const toggleAllDays = () => {
    setSelectedDays((prev) => (prev.length === DAYS.length ? [] : [...DAYS]));
    setStatus('');
  };

  const handleRowClick = (row) => {
    const day = row.day;
    setSelectedDays([day]);
    setForm({
      startTime: row.startTime ? row.startTime.slice(0, 5) : '',
      endTime: row.endTime ? row.endTime.slice(0, 5) : '',
      percentOff: row.percentOff !== null && row.percentOff !== undefined
        ? String(Math.round(row.percentOff * 100))
        : '',
    });
    setStatus('');
  };

  const save = async () => {
    if (selectedDays.length === 0) {
      setStatus('Select at least one day before saving.');
      return;
    }

    if ((form.startTime && !form.endTime) || (!form.startTime && form.endTime)) {
      setStatus('Both start time and end time are required together.');
      return;
    }
    if (form.startTime && form.endTime && form.startTime >= form.endTime) {
        setStatus('End time must be after start time.');
        return;
    }

    if (
      form.percentOff !== '' &&
      (isNaN(Number(form.percentOff)) || Number(form.percentOff) < 0 || Number(form.percentOff) > 100)
    ) {
      setStatus('Discount must be between 0 and 100.');
      return;
    }

    try {
      const payload = {
        startTime: form.startTime || null,
        endTime: form.endTime || null,
        percentOff: form.percentOff !== '' ? Number(form.percentOff) / 100 : null,
      };

      await Promise.all(
        selectedDays.map((day) => api.updateHappyHour(day, payload))
      );

      const label =
        selectedDays.length === 1
          ? DAY_LABELS[selectedDays[0]]
          : `${selectedDays.length} days`;
      setStatus(`Updated happy hour for ${label}.`);
      setSelectedDays([]);
      setForm(emptyForm);
      await load();
    } catch (error) {
      console.error(error);
      setStatus(error.message || 'Failed to update happy hour.');
    }
  };

  const clear = async () => {
    if (selectedDays.length === 0) {
      setStatus('Select at least one day to clear.');
      return;
    }

    try {
      await Promise.all(selectedDays.map((day) => api.clearHappyHour(day)));

      const label =
        selectedDays.length === 1
          ? DAY_LABELS[selectedDays[0]]
          : `${selectedDays.length} days`;
      setStatus(`Cleared happy hour for ${label}.`);
      setSelectedDays([]);
      setForm(emptyForm);
      await load();
    } catch (error) {
      console.error(error);
      setStatus(error.message || 'Failed to clear happy hour.');
    }
  };

  const rows = DAYS.map((day) => {
    const match = happyHours.find((h) => h.day === day);
    return {
      day,
      displayDay: DAY_LABELS[day],
      startTime: match?.startTime ?? null,
      endTime: match?.endTime ?? null,
      percentOff: match?.percentOff ?? null,
      displayStart: formatTime(match?.startTime),
      displayEnd: formatTime(match?.endTime),
      displayPercent: formatPercent(match?.percentOff),
      active: !!(match?.startTime && match?.endTime),
    };
  });

  return (
    <PageShell
      title="Manage Happy Hour"
    >
      <div className="split-layout">
        <div>
          <DataTable
            columns={[
              { key: 'displayDay', label: 'Day' },
              { key: 'displayStart', label: 'Start Time' },
              { key: 'displayEnd', label: 'End Time' },
              { key: 'displayPercent', label: 'Discount' },
            ]}
            rows={rows}
            onRowClick={handleRowClick}
          />
        </div>

        <div className="card form-card">
          <h2>Happy Hour Form</h2>

          {loading ? <p>Loading happy hours...</p> : null}

          {/* Day selector */}
          <FormField label="Days">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {DAYS.map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    style={{
                      padding: '0.3rem 0.75rem',
                      borderRadius: '999px',
                      border: selectedDays.includes(day)
                        ? '2px solid var(--primary, #4f46e5)'
                        : '2px solid #d1d5db',
                      background: selectedDays.includes(day)
                        ? 'var(--primary, #4f46e5)'
                        : 'transparent',
                      color: selectedDays.includes(day) ? '#fff' : 'inherit',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {DAY_LABELS[day].slice(0, 3)}
                  </button>
                ))}
              </div>
          </FormField>

          <FormField label="Start Time">
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
          </FormField>

          <FormField label="End Time">
            <input
              type="time"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
          </FormField>

          <FormField label="Discount (%)">
            <input
              type="number"
              min="0"
              max="100"
              placeholder="e.g. 25"
              value={form.percentOff}
              onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || (Number(val) >= 0 && Number(val) <= 100)) {
                    setForm({ ...form, percentOff: val });
                    }
              }}
            />
          </FormField>

          

          <div className="inline-actions">
            <button className="primary-button inline" onClick={save}>
              Apply
            </button>
            <button className="secondary-button inline" onClick={clear}>
              Clear
            </button>
          </div>

          {status ? <p className="success-text">{status}</p> : null}
        </div>
      </div>
    </PageShell>
  );
}
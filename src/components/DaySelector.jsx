/**
 * DaySelector – 7-column calendar grid day picker.
 *
 * Props:
 *   daysInMonth  – number of days in the month (28‑31)
 *   selectedDay  – currently highlighted day (1‑based)
 *   lockedDays   – { [day]: true } when a day has saved data
 *   onSelect     – callback(day: number)
 *   loading      – show a "loading…" label while fetching day data
 */
export default function DaySelector({ daysInMonth, selectedDay, lockedDays = {}, onSelect, loading = false }) {
  // Always render 35 cells (5 rows × 7); cells beyond daysInMonth are inactive
  const cells = Array.from({ length: 35 }, (_, i) => i + 1)

  return (
    <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <p style={{ fontWeight: 'bold', fontSize: '14px', color: '#333', margin: '0 0 8px 0' }}>
        Select Day
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 36px)',
        gap: '4px',
        width: 'fit-content',
      }}>
        {cells.map(d => {
          const inactive = d > daysInMonth
          const isSelected = !inactive && selectedDay === d
          const isSaved = !inactive && lockedDays[d] === true
          return (
            <button
              key={d}
              type="button"
              onClick={() => !inactive && onSelect(d)}
              title={inactive ? undefined : isSaved ? `Day ${d} – already recorded` : `Day ${d}`}
              disabled={inactive}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: isSelected
                  ? '2px solid #0066cc'
                  : isSaved
                    ? '2px solid #28a745'
                    : '1px solid #ccc',
                backgroundColor: isSelected ? '#0066cc' : isSaved ? '#f0fff4' : inactive ? 'transparent' : 'white',
                color: isSelected ? 'white' : inactive ? '#ddd' : '#333',
                fontWeight: '600',
                fontSize: '13px',
                cursor: inactive ? 'default' : loading ? 'wait' : 'pointer',
                padding: 0,
                lineHeight: '34px',
                textAlign: 'center',
              }}
            >
              {inactive ? '' : d}
            </button>
          )
        })}
      </div>

      {loading && (
        <p style={{ fontSize: '13px', color: '#888', margin: '4px 0 0 0' }}>Loading day data…</p>
      )}
    </div>
  )
}

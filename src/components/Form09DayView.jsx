import DaySelector from './DaySelector'

const inputLocked = { backgroundColor: '#f0f0f0', color: '#888', cursor: 'not-allowed' }
const selectLocked = { backgroundColor: '#f0f0f0', color: '#888', cursor: 'not-allowed' }

function DayViewForm({ day, data, onDayChange, locked = false }) {
    return (
        <div style={{ marginBottom: '30px', opacity: locked ? 0.8 : 1 }}>
            <h3 style={{ fontSize: '18px', marginBottom: '20px', borderBottom: '2px solid #666', paddingBottom: '10px' }}>
                Daily Tracking – Day {day}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Feed Daily Target</label>
                    <input type="number" step="0.1" value={data.feedDaily}
                        onChange={(e) => onDayChange(day, 'feedDaily', e.target.value)}
                        disabled={locked}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', boxSizing: 'border-box', ...(locked && inputLocked) }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Feed Actual</label>
                    <input type="number" step="0.1" value={data.feedActual}
                        onChange={(e) => onDayChange(day, 'feedActual', e.target.value)}
                        disabled={locked}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', boxSizing: 'border-box', ...(locked && inputLocked) }} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Water Daily Target</label>
                    <input type="number" step="0.1" value={data.waterDaily}
                        onChange={(e) => onDayChange(day, 'waterDaily', e.target.value)}
                        disabled={locked}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', boxSizing: 'border-box', ...(locked && inputLocked) }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Water Actual</label>
                    <input type="number" step="0.1" value={data.waterActual}
                        onChange={(e) => onDayChange(day, 'waterActual', e.target.value)}
                        disabled={locked}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', boxSizing: 'border-box', ...(locked && inputLocked) }} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '30px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Auger Run Time (minutes)</label>
                    <input type="number" value={data.augerRunTimeMinutes}
                        onChange={(e) => onDayChange(day, 'augerRunTimeMinutes', e.target.value)}
                        disabled={locked}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', boxSizing: 'border-box', ...(locked && inputLocked) }} />
                </div>
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>Water Treatments</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Flush</label>
                    <select value={data.flush ? 'true' : 'false'}
                        onChange={(e) => onDayChange(day, 'flush', e.target.value === 'true')}
                        disabled={locked}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && selectLocked) }}>
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Meds/Vit</label>
                    <select value={data.medsVit ? 'true' : 'false'}
                        onChange={(e) => onDayChange(day, 'medsVit', e.target.value === 'true')}
                        disabled={locked}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && selectLocked) }}>
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Treatment</label>
                    <select value={data.treatment ? 'true' : 'false'}
                        onChange={(e) => onDayChange(day, 'treatment', e.target.value === 'true')}
                        disabled={locked}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && selectLocked) }}>
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                    </select>
                </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Daily Notes</label>
                <textarea value={data.notes}
                    onChange={(e) => onDayChange(day, 'notes', e.target.value)}
                    disabled={locked}
                    rows="2"
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', boxSizing: 'border-box', fontFamily: 'inherit', ...(locked && inputLocked) }} />
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>Mortality Records</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Daily Mortality Count</label>
                    <input type="number" min="0" value={data.mortalityDaily}
                        onChange={(e) => onDayChange(day, 'mortalityDaily', e.target.value)}
                        disabled={locked}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', boxSizing: 'border-box', ...(locked && inputLocked) }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Reason</label>
                    <select value={data.mortalityReason}
                        onChange={(e) => onDayChange(day, 'mortalityReason', e.target.value)}
                        disabled={locked}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && selectLocked) }}>
                        <option value="">Select...</option>
                        <option value="natural">Natural</option>
                        <option value="euthanized">Euthanized</option>
                    </select>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Hospital Pen Monitoring</label>
                    <select value={data.hospitalPenMonitoring}
                        onChange={(e) => onDayChange(day, 'hospitalPenMonitoring', e.target.value)}
                        disabled={locked}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && selectLocked) }}>
                        <option value="">Select...</option>
                        <option value="improved">Improved</option>
                        <option value="euthanized">Euthanized</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Inventory</label>
                    <input type="number" value={data.inventory}
                        onChange={(e) => onDayChange(day, 'inventory', e.target.value)}
                        disabled={locked}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', boxSizing: 'border-box', ...(locked && inputLocked) }} />
                </div>
            </div>
        </div>
    )
}

export default function Form09DayView({
    day,
    data,
    isLocked,
    saving,
    onDayChange,
    onUnlock,
    monthYear,
    lockedDays,
    loadingDay,
    onSelectDay,
}) {
    return (
        <div>
            <DaySelector
                monthYear={monthYear}
                selectedDay={day}
                lockedDays={lockedDays}
                onSelect={onSelectDay}
                loading={loadingDay}
            />

            {isLocked && (
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    backgroundColor: '#d4edda', borderRadius: '8px', padding: '12px 16px',
                    marginBottom: '16px', border: '1px solid #28a745'
                }}>
                    <span style={{ color: '#155724', fontWeight: '600', fontSize: '14px' }}>
                        ✓ Already recorded for Day {day}
                    </span>
                    <button
                        type="button"
                        onClick={onUnlock}
                        style={{
                            backgroundColor: '#0066cc', color: 'white', border: 'none',
                            borderRadius: '6px', padding: '7px 14px',
                            fontWeight: '700', fontSize: '13px', cursor: 'pointer'
                        }}
                    >
                        Re-enter data
                    </button>
                </div>
            )}

            <DayViewForm
                day={day}
                data={data}
                onDayChange={onDayChange}
                locked={isLocked}
            />

            {!isLocked && (
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                    <button
                        type="submit"
                        disabled={saving}
                        style={{
                            padding: '12px 40px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            backgroundColor: saving ? '#aaa' : '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: saving ? 'not-allowed' : 'pointer'
                        }}>
                        {saving ? 'Saving…' : `💾 Save Day ${day} Record`}
                    </button>
                </div>
            )}
        </div>
    )
}

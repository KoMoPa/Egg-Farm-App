import DaySelector from './DaySelector'

const inputLocked = { backgroundColor: '#f5f5f5', color: '#666' }

function DayViewForm({ day, data, onDayChange, locked = false }) {
    return (
        <div style={{ marginBottom: '30px', opacity: locked ? 0.8 : 1 }}>
            <h3 style={{ fontSize: '18px', marginBottom: '20px', borderBottom: '2px solid #666', paddingBottom: '10px' }}>
                Daily Tracking - Day {day}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Mice Caught</label>
                    <input type="number" value={data.micesCaught}
                        onChange={(e) => onDayChange(day, 'micesCaught', e.target.value)}
                        disabled={locked}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && inputLocked) }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Traps Checked</label>
                    <input type="number" value={data.trapsChecked}
                        onChange={(e) => onDayChange(day, 'trapsChecked', e.target.value)}
                        disabled={locked}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && inputLocked) }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', paddingTop: '24px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: locked ? 'default' : 'pointer' }}>
                        <input type="checkbox" checked={data.baitReplenished}
                            onChange={(e) => onDayChange(day, 'baitReplenished', e.target.checked)}
                            disabled={locked} />
                        Bait Replenished
                    </label>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Live Traps - Findings</label>
                    <input type="text" value={data.liveTrapsFindings}
                        onChange={(e) => onDayChange(day, 'liveTrapsFindings', e.target.value)}
                        disabled={locked}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && inputLocked) }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Live Traps - Location</label>
                    <input type="text" value={data.liveTrapsLocation}
                        onChange={(e) => onDayChange(day, 'liveTrapsLocation', e.target.value)}
                        disabled={locked}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && inputLocked) }} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Bait - Product</label>
                    <input type="text" value={data.baitProduct}
                        onChange={(e) => onDayChange(day, 'baitProduct', e.target.value)}
                        disabled={locked}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && inputLocked) }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Bait - Location</label>
                    <input type="text" value={data.baitLocation}
                        onChange={(e) => onDayChange(day, 'baitLocation', e.target.value)}
                        disabled={locked}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && inputLocked) }} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Birds on Range?</label>
                    <select value={data.birdsOnRange}
                        onChange={(e) => onDayChange(day, 'birdsOnRange', e.target.value)}
                        disabled={locked}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && inputLocked) }}>
                        <option value="">Select...</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                        <option value="na">N/A</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Corrective Actions</label>
                    <input type="text" value={data.correctiveActions}
                        onChange={(e) => onDayChange(day, 'correctiveActions', e.target.value)}
                        disabled={locked}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && inputLocked) }} />
                </div>
            </div>
        </div>
    )
}

export default function Form10DayView({
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
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
                    <button type="submit" disabled={saving} style={{
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

import DaySelector from './DaySelector'

const inputLocked = { backgroundColor: '#f5f5f5', color: '#666' }

const INSPECTION_CRITERIA_FIELDS = [
    'overallAppearance', 'generalSound', 'abnormalBehavior', 'signsOfDisease',
    'injuredBirds', 'respiratoryProblems', 'pantingHuddling', 'lameness',
    'featherPecking', 'trappedBirds', 'deadBirds', 'feedWaterAvailable',
    'equipmentOperating', 'amenitiesCondition', 'layFacilityEnvironment',
]

function DayViewForm({ day, data, onDayChange, onDayCheckbox, onSelectAllCriteria, locked, hasBedding = true, hasChemicals = true }) {
    return (
        <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '20px', borderBottom: '2px solid #666', paddingBottom: '10px' }}>
                Daily Tracking - Day {day}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Barn Temp HI (°C)
                        <span style={{ color: 'red', fontSize: '30px' }}>*</span>
                    </label>
                    <input type="number" step="0.1" value={data.barnTempHi}
                        onChange={(e) => onDayChange(day, 'barnTempHi', e.target.value)}
                        disabled={locked}
                        required
                        placeholder=""
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && inputLocked) }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Barn Temp LO (°C)
                        <span style={{ color: 'red', fontSize: '30px' }}>*</span>
                    </label>
                    <input type="number" step="0.1" value={data.barnTempLo}
                        onChange={(e) => onDayChange(day, 'barnTempLo', e.target.value)}
                        disabled={locked}
                        required
                        placeholder=""
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && inputLocked) }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Exterior Temp (°C)
                        <span style={{ color: 'red', fontSize: '30px' }}>*</span>
                    </label>
                    <input type="number" step="0.1" value={data.exteriorTemp}
                        onChange={(e) => onDayChange(day, 'exteriorTemp', e.target.value)}
                        disabled={locked}
                        required
                        placeholder=""
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && inputLocked) }} />
                </div>
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>Sanitation Checks</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: locked ? 'default' : 'pointer', opacity: locked ? 0.6 : 1 }}>
                    <input type="checkbox" checked={data.floorsChecked}
                        onChange={(e) => onDayChange(day, 'floorsChecked', e.target.checked)}
                        disabled={locked} />
                    Floors Checked
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: locked ? 'default' : 'pointer', opacity: locked ? 0.6 : 1 }}>
                    <input type="checkbox" checked={data.wallsFansCeilingChecked}
                        onChange={(e) => onDayChange(day, 'wallsFansCeilingChecked', e.target.checked)}
                        disabled={locked} />
                    Walls/Fans/Ceiling Checked
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: locked ? 'default' : 'pointer', opacity: locked ? 0.6 : 1 }}>
                    <input type="checkbox" checked={data.manureChecked}
                        onChange={(e) => onDayChange(day, 'manureChecked', e.target.checked)}
                        disabled={locked} />
                    Manure Checked
                </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: (hasBedding && hasChemicals) ? '1fr 1fr' : '1fr', gap: '20px', marginBottom: '30px' }}>
                {hasBedding && <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Bedding Used
                        <span style={{ color: 'red', fontSize: '30px' }}>*</span>
                    </label>
                    <select value={data.beddingUsed ? 'true' : 'false'}
                        onChange={(e) => {
                            const beddingUsed = e.target.value === 'true'
                            onDayChange(day, 'beddingUsed', beddingUsed)
                            if (!beddingUsed) onDayChange(day, 'beddingType', '')
                        }}
                        disabled={locked}
                        required
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && inputLocked) }}>
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                    </select>
                    <label style={{ display: 'block', marginTop: '10px', marginBottom: '5px', fontWeight: 'bold' }}>Bedding Type
                        {data.beddingUsed && <span style={{ color: 'red', fontSize: '30px' }}>*</span>}
                    </label>
                    <input type="text" maxLength={20} value={data.beddingType}
                        onChange={(e) => onDayChange(day, 'beddingType', e.target.value)}
                        disabled={locked || !data.beddingUsed}
                        required={data.beddingUsed}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && inputLocked) }} />
                </div>}
                {hasChemicals && <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Chemicals Used
                        <span style={{ color: 'red', fontSize: '30px' }}>*</span>
                    </label>
                    <select value={data.chemicalsUsed ? 'true' : 'false'}
                        onChange={(e) => {
                            const chemicalsUsed = e.target.value === 'true'
                            onDayChange(day, 'chemicalsUsed', chemicalsUsed)
                            if (!chemicalsUsed) onDayChange(day, 'chemicalsType', '')
                        }}
                        disabled={locked}
                        required
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && inputLocked) }}>
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                    </select>
                    <label style={{ display: 'block', marginTop: '10px', marginBottom: '5px', fontWeight: 'bold' }}>Chemicals Type
                        {data.chemicalsUsed && <span style={{ color: 'red', fontSize: '30px' }}>*</span>}
                    </label>
                    <input type="text" maxLength={20} value={data.chemicalsType}
                        onChange={(e) => onDayChange(day, 'chemicalsType', e.target.value)}
                        disabled={locked || !data.chemicalsUsed}
                        required={data.chemicalsUsed}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && inputLocked) }} />
                </div>}
            </div>

            {/* Page Break */}
            <div style={{ borderTop: '4px dashed #999', margin: '40px 0', padding: '20px 0', textAlign: 'center', color: '#666', fontSize: '18px', fontWeight: 'bold' }}>
                ═══ PAGE 2: WEEKLY INSPECTIONS ═══
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>Hen Inspection
                <span style={{ color: 'red', fontSize: '30px' }}>*</span>
            </h4>
            <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', marginBottom: '50px' }}>
                <div style={{ textAlign: 'center' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>AM Initial</label>
                    <input type="text" maxLength={6} value={data.routineHenEquipAmInitial}
                        onChange={(e) => onDayChange(day, 'routineHenEquipAmInitial', e.target.value.replace(/[^a-zA-Z]/g, ''))}
                        disabled={locked}
                        required
                        style={{ width: '70px', padding: '8px', border: '1px solid #ccc', textAlign: 'center', ...(locked && inputLocked) }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>PM Initial</label>
                    <input type="text" maxLength={6} value={data.routineHenEquipPmInitial}
                        onChange={(e) => onDayChange(day, 'routineHenEquipPmInitial', e.target.value.replace(/[^a-zA-Z]/g, ''))}
                        disabled={locked}
                        required
                        style={{ width: '70px', padding: '8px', border: '1px solid #ccc', textAlign: 'center', ...(locked && inputLocked) }} />
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>Weekly Welfare Inspection (Check as applicable)</h4>
                <button type="button" onClick={() => onSelectAllCriteria(day)}
                    disabled={locked}
                    style={{ fontSize: '12px', padding: '4px 10px', background: locked ? '#ccc' : '#2D855B', color: locked ? '#666' : 'white', border: 'none', borderRadius: '4px', cursor: locked ? 'default' : 'pointer' }}>
                    Select All
                </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '15px', opacity: locked ? 0.6 : 1 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" checked={data.overallAppearance}
                        onChange={() => onDayCheckbox(day, 'overallAppearance')} disabled={locked} />
                    Overall appearance of birds
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" checked={data.generalSound}
                        onChange={() => onDayCheckbox(day, 'generalSound')} disabled={locked} />
                    General sound of flock
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" checked={data.abnormalBehavior}
                        onChange={() => onDayCheckbox(day, 'abnormalBehavior')} disabled={locked} />
                    Abnormal Behavior
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" checked={data.signsOfDisease}
                        onChange={() => onDayCheckbox(day, 'signsOfDisease')} disabled={locked} />
                    Signs of Disease/Illness
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" checked={data.injuredBirds}
                        onChange={() => onDayCheckbox(day, 'injuredBirds')} disabled={locked} />
                    Injured Birds
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" checked={data.respiratoryProblems}
                        onChange={() => onDayCheckbox(day, 'respiratoryProblems')} disabled={locked} />
                    Respiratory Problems
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" checked={data.pantingHuddling}
                        onChange={() => onDayCheckbox(day, 'pantingHuddling')} disabled={locked} />
                    Panting/Huddling
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" checked={data.lameness}
                        onChange={() => onDayCheckbox(day, 'lameness')} disabled={locked} />
                    Lameness
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" checked={data.featherPecking}
                        onChange={() => onDayCheckbox(day, 'featherPecking')} disabled={locked} />
                    Signs of Feather Pecking/Cannibalism
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" checked={data.trappedBirds}
                        onChange={() => onDayCheckbox(day, 'trappedBirds')} disabled={locked} />
                    Trapped Birds
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" checked={data.deadBirds}
                        onChange={() => onDayCheckbox(day, 'deadBirds')} disabled={locked} />
                    Dead Birds
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" checked={data.feedWaterAvailable}
                        onChange={() => onDayCheckbox(day, 'feedWaterAvailable')} disabled={locked} />
                    Feed &amp; Water Available
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" checked={data.equipmentOperating}
                        onChange={() => onDayCheckbox(day, 'equipmentOperating')} disabled={locked} />
                    Equipment Operating
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" checked={data.amenitiesCondition}
                        onChange={() => onDayCheckbox(day, 'amenitiesCondition')} disabled={locked} />
                    Condition of Amenities/Housing
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" checked={data.layFacilityEnvironment}
                        onChange={() => onDayCheckbox(day, 'layFacilityEnvironment')} disabled={locked} />
                    Lay Facility Environment
                </label>
            </div>

            <div style={{ marginTop: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Weekly Comments</label>
                <textarea value={data.weeklyComments}
                    onChange={(e) => onDayChange(day, 'weeklyComments', e.target.value)}
                    disabled={locked}
                    rows="2"
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', fontFamily: 'inherit', ...(locked && inputLocked) }} />
            </div>
        </div>
    )
}

export default function Form08DayView({
    day,
    data,
    isLocked,
    saving,
    onDayChange,
    onDayCheckbox,
    onSelectAllCriteria,
    onUnlock,
    monthYear,
    lockedDays,
    loadingDay,
    onSelectDay,
    hasBedding = true,
    hasChemicals = true,
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
                            backgroundColor: '#2D855B', color: 'white', border: 'none',
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
                onDayCheckbox={onDayCheckbox}
                onSelectAllCriteria={onSelectAllCriteria}
                locked={isLocked}
                hasBedding={hasBedding}
                hasChemicals={hasChemicals}
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

import DaySelector from './DaySelector'

const inputLocked = { backgroundColor: '#f5f5f5', color: '#666' }

export default function Form07DayView({
    day,
    data,
    setField,
    isLocked,
    saving,
    floorEggsTotal,
    eggProductionDaily,
    onUnlock,
    monthYear,
    lockedDays,
    loadingDay,
    onSelectDay,
}) {
    return (
        <>
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

            {/* Age */}
            <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                    Age (weeks)
                </label>
                <input
                    type="number"
                    value={data.age}
                    onChange={(e) => setField('age', e.target.value)}
                    disabled={isLocked}
                    style={{ width: '200px', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px', ...(isLocked && inputLocked) }}
                    placeholder="25"
                />
            </div>

            {/* Floor Eggs */}
            <div style={{ background: '#fff3cd', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '20px', marginBottom: '15px', borderBottom: '2px solid #ffc107', paddingBottom: '8px' }}>
                    Floor Eggs
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>#1</label>
                        <input
                            type="number"
                            value={data.floorEggs1}
                            onChange={(e) => setField('floorEggs1', e.target.value)}
                            disabled={isLocked}
                            style={{ width: '100%', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px', ...(isLocked && inputLocked) }}
                            placeholder="150"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>#2</label>
                        <input
                            type="number"
                            value={data.floorEggs2}
                            onChange={(e) => setField('floorEggs2', e.target.value)}
                            disabled={isLocked}
                            style={{ width: '100%', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px', ...(isLocked && inputLocked) }}
                            placeholder="120"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>Total</label>
                        <div style={{ padding: '12px', fontSize: '20px', fontWeight: 'bold', background: '#ffc107', borderRadius: '8px', textAlign: 'center' }}>
                            {floorEggsTotal}
                        </div>
                    </div>
                </div>
            </div>

            {/* Egg Production */}
            <div style={{ background: '#d4edda', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '20px', marginBottom: '15px', borderBottom: '2px solid #28a745', paddingBottom: '8px' }}>
                    Egg Production
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>#1</label>
                        <input
                            type="number"
                            value={data.eggProduction1}
                            onChange={(e) => setField('eggProduction1', e.target.value)}
                            disabled={isLocked}
                            style={{ width: '100%', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px', ...(isLocked && inputLocked) }}
                            placeholder="6000"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>#2</label>
                        <input
                            type="number"
                            value={data.eggProduction2}
                            onChange={(e) => setField('eggProduction2', e.target.value)}
                            disabled={isLocked}
                            style={{ width: '100%', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px', ...(isLocked && inputLocked) }}
                            placeholder="6500"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>Daily</label>
                        <div style={{ padding: '12px', fontSize: '20px', fontWeight: 'bold', background: '#28a745', color: 'white', borderRadius: '8px', textAlign: 'center' }}>
                            {eggProductionDaily}
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>% Daily</label>
                        <input
                            type="number"
                            step="0.1"
                            value={data.eggProductionPercent}
                            onChange={(e) => setField('eggProductionPercent', e.target.value)}
                            disabled={isLocked}
                            style={{ width: '100%', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px', ...(isLocked && inputLocked) }}
                            placeholder="92.5"
                        />
                    </div>
                </div>
            </div>

            {/* Production Notes */}
            <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                    Production Notes
                </label>
                <textarea
                    value={data.notes}
                    onChange={(e) => setField('notes', e.target.value)}
                    disabled={isLocked}
                    rows="3"
                    style={{ width: '100%', padding: '12px', fontSize: '16px', border: '2px solid #ddd', borderRadius: '8px', fontFamily: 'inherit', ...(isLocked && inputLocked) }}
                    placeholder="Any notes about today's egg production..."
                />
            </div>

            {/* Cooler Temperature & Humidity */}
            <div style={{ background: '#d1ecf1', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '20px', marginBottom: '15px', borderBottom: '2px solid #0c5460', paddingBottom: '8px' }}>
                    Cooler Temperature &amp; RH%
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>Temp HI (°C)</label>
                        <input
                            type="number" step="0.1"
                            value={data.coolerTempHi}
                            onChange={(e) => setField('coolerTempHi', e.target.value)}
                            disabled={isLocked}
                            style={{ width: '100%', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px', ...(isLocked && inputLocked) }}
                            placeholder="4.5"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>Temp LO (°C)</label>
                        <input
                            type="number" step="0.1"
                            value={data.coolerTempLo}
                            onChange={(e) => setField('coolerTempLo', e.target.value)}
                            disabled={isLocked}
                            style={{ width: '100%', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px', ...(isLocked && inputLocked) }}
                            placeholder="3.8"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>RH% HI</label>
                        <input
                            type="number" step="0.1"
                            value={data.coolerRhHi}
                            onChange={(e) => setField('coolerRhHi', e.target.value)}
                            disabled={isLocked}
                            style={{ width: '100%', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px', ...(isLocked && inputLocked) }}
                            placeholder="75.0"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>RH% LO</label>
                        <input
                            type="number" step="0.1"
                            value={data.coolerRhLo}
                            onChange={(e) => setField('coolerRhLo', e.target.value)}
                            disabled={isLocked}
                            style={{ width: '100%', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px', ...(isLocked && inputLocked) }}
                            placeholder="70.0"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>Time</label>
                        <input
                            type="time"
                            value={data.coolerCheckTime}
                            onChange={(e) => setField('coolerCheckTime', e.target.value)}
                            disabled={isLocked}
                            style={{ width: '100%', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px', ...(isLocked && inputLocked) }}
                        />
                    </div>
                </div>
            </div>

            {/* Page Break */}
            <div style={{ borderTop: '4px dashed #999', margin: '40px 0', padding: '20px 0', textAlign: 'center', color: '#666', fontSize: '18px', fontWeight: 'bold' }}>
                ═══ PAGE 2: SANITATION ═══
            </div>

            {/* Dirty Trays */}
            <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                    Dirty Trays (Daily count)
                </label>
                <input
                    type="number"
                    value={data.dirtyTrays}
                    onChange={(e) => setField('dirtyTrays', e.target.value)}
                    disabled={isLocked}
                    style={{ width: '200px', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px', ...(isLocked && inputLocked) }}
                    placeholder="5"
                />
            </div>

            {/* Sanitation */}
            <div style={{ background: '#e7f3ff', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '20px', marginBottom: '15px', borderBottom: '2px solid #0066cc', paddingBottom: '8px' }}>
                    Sanitation - As Completed
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', padding: '15px', background: 'white', borderRadius: '8px', border: '2px solid #ddd', cursor: isLocked ? 'default' : 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={data.eggCoolerCleaned}
                            onChange={(e) => setField('eggCoolerCleaned', e.target.checked)}
                            disabled={isLocked}
                            style={{ width: '24px', height: '24px', marginRight: '12px' }}
                        />
                        <span style={{ fontSize: '18px' }}>Egg Cooler</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', padding: '15px', background: 'white', borderRadius: '8px', border: '2px solid #ddd', cursor: isLocked ? 'default' : 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={data.packRoomCleaned}
                            onChange={(e) => setField('packRoomCleaned', e.target.checked)}
                            disabled={isLocked}
                            style={{ width: '24px', height: '24px', marginRight: '12px' }}
                        />
                        <span style={{ fontSize: '18px' }}>Pack Room</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', padding: '15px', background: 'white', borderRadius: '8px', border: '2px solid #ddd', cursor: isLocked ? 'default' : 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={data.tablesPackingEquipCleaned}
                            onChange={(e) => setField('tablesPackingEquipCleaned', e.target.checked)}
                            disabled={isLocked}
                            style={{ width: '24px', height: '24px', marginRight: '12px' }}
                        />
                        <span style={{ fontSize: '18px' }}>Tables/Packing Equip</span>
                    </label>
                </div>
            </div>

            {/* Corrective Actions */}
            <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                    Corrective Actions
                </label>
                <textarea
                    value={data.correctiveActions}
                    onChange={(e) => setField('correctiveActions', e.target.value)}
                    disabled={isLocked}
                    style={{ width: '100%', padding: '12px', fontSize: '16px', border: '2px solid #ddd', borderRadius: '8px', fontFamily: 'inherit', ...(isLocked && inputLocked) }}
                    rows="4"
                    placeholder="Describe any issues found and corrective actions taken..."
                />
            </div>

            {/* Submit Button */}
            {!isLocked && (
                <button
                    type="submit"
                    disabled={saving}
                    style={{
                        width: '100%',
                        padding: '20px',
                        fontSize: '22px',
                        fontWeight: 'bold',
                        background: saving ? '#aaa' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: saving ? 'not-allowed' : 'pointer'
                    }}
                >
                    {saving ? 'Saving…' : `💾 Save Day ${day} Record`}
                </button>
            )}
        </>
    )
}

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// ── Helpers ──────────────────────────────────────────────────────────────────

const getDayNumber = (dateStr) => {
    if (!dateStr) return null
    return parseInt(dateStr.split('-')[2], 10)
}

const buildDayMap = (records, dateField) => {
    const map = {}
    if (!records) return map
    records.forEach(r => {
        const day = getDayNumber(r[dateField])
        if (day) map[day] = r
    })
    return map
}

const formatMonth = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
}

const getDaysInMonth = (monthYear) => {
    if (!monthYear) return 31
    const [year, month] = monthYear.split('-').map(Number)
    return new Date(year, month, 0).getDate()
}

const chk = (val) => (val ? '\u2713' : '')

// ── Styles ────────────────────────────────────────────────────────────────────
// Page 1 (Portrait 595pt): content width = 595 - 50 = 545pt
//   Date(28) + Temp×3(57) + San×3(54) + Notes×2(92) = 545 ✓
// Page 2 (Landscape 842pt): content width = 842 - 50 = 792pt
//   Date(28) + Init×4(32) + Check×15(42) = 786pt (≤792 ✓)

const styles = StyleSheet.create({
    page1: { paddingHorizontal: 25, paddingVertical: 20, fontFamily: 'Helvetica' },
    page2: { paddingHorizontal: 25, paddingVertical: 20, fontFamily: 'Helvetica' },

    headerBox: { border: '1.5px solid #000', padding: 8, marginBottom: 8 },
    title: { fontSize: 12, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 5 },
    headerRow: { flexDirection: 'row' },
    headerField: { flex: 1, flexDirection: 'row' },
    headerLabel: { fontFamily: 'Helvetica-Bold', fontSize: 9, marginRight: 3 },
    headerValue: { fontSize: 9 },

    // Table shell: top + left border; cells supply right + bottom
    table: { borderTop: '1px solid #000', borderLeft: '1px solid #000', marginBottom: 6 },

    // ── Page 1 rows ──
    p1HeaderRow: { flexDirection: 'row', backgroundColor: '#cccccc' },
    p1DataRow: { flexDirection: 'row', backgroundColor: '#ffffff' },
    p1DataRowAlt: { flexDirection: 'row', backgroundColor: '#f0f0f0' },

    // Page 1 data cells
    p1Date: { width: 28, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 2, fontSize: 7, textAlign: 'center', fontFamily: 'Helvetica-Bold' },
    p1Temp: { width: 57, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 2, fontSize: 7, textAlign: 'center' },
    p1San: { width: 54, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 2, fontSize: 7, textAlign: 'center' },
    p1Notes: { width: 92, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 3, fontSize: 7 },
    p1NotesFlex: { flex: 1, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 3, fontSize: 7 },

    // Page 1 header cells (bold, heavier bottom border)
    p1DateH: { width: 28, borderRight: '1px solid #000', borderBottom: '1px solid #000', paddingVertical: 3, paddingHorizontal: 2, fontSize: 7, textAlign: 'center', fontFamily: 'Helvetica-Bold' },
    p1TempH: { width: 57, borderRight: '1px solid #000', borderBottom: '1px solid #000', paddingVertical: 3, paddingHorizontal: 2, fontSize: 7, textAlign: 'center', fontFamily: 'Helvetica-Bold' },
    p1SanH: { width: 54, borderRight: '1px solid #000', borderBottom: '1px solid #000', paddingVertical: 3, paddingHorizontal: 2, fontSize: 7, textAlign: 'center', fontFamily: 'Helvetica-Bold' },
    p1NotesH: { width: 92, borderRight: '1px solid #000', borderBottom: '1px solid #000', paddingVertical: 3, paddingHorizontal: 3, fontSize: 7, fontFamily: 'Helvetica-Bold' },
    p1NotesFlexH: { flex: 1, borderRight: '1px solid #000', borderBottom: '1px solid #000', paddingVertical: 3, paddingHorizontal: 3, fontSize: 7, fontFamily: 'Helvetica-Bold' },

    // ── Page 2 rows ──
    p2HeaderRow: { flexDirection: 'row', backgroundColor: '#cccccc' },
    p2DataRow: { flexDirection: 'row', backgroundColor: '#ffffff' },
    p2DataRowAlt: { flexDirection: 'row', backgroundColor: '#f0f0f0' },

    // Page 2 data cells
    p2Date: { width: 28, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 2, fontSize: 7, textAlign: 'center', fontFamily: 'Helvetica-Bold' },
    p2Init: { width: 32, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 2, fontSize: 7, textAlign: 'center' },
    p2Check: { width: 42, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 7, textAlign: 'center' },

    // Page 2 header cells
    p2DateH: { width: 28, borderRight: '1px solid #000', borderBottom: '1px solid #000', paddingVertical: 3, paddingHorizontal: 2, fontSize: 6, textAlign: 'center', fontFamily: 'Helvetica-Bold' },
    p2InitH: { width: 32, borderRight: '1px solid #000', borderBottom: '1px solid #000', paddingVertical: 3, paddingHorizontal: 2, fontSize: 6, textAlign: 'center', fontFamily: 'Helvetica-Bold' },
    p2CheckH: { width: 42, borderRight: '1px solid #000', borderBottom: '1px solid #000', paddingVertical: 3, paddingHorizontal: 1, fontSize: 6, textAlign: 'center', fontFamily: 'Helvetica-Bold' },

    // ── Bottom sections ──
    bottomRow: { flexDirection: 'row', marginTop: 6 },
    bottomBox: { flex: 1, border: '1px solid #000', padding: 5, marginRight: 6 },
    bottomBoxLast: { flex: 1, border: '1px solid #000', padding: 5 },
    bottomLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', marginBottom: 3 },
    bottomValue: { fontSize: 7.5, marginBottom: 3 },

    commentsBox: { marginTop: 6, border: '1px solid #000', padding: 5, minHeight: 45 },
    commentsLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', marginBottom: 3 },
    commentsText: { fontSize: 8 },

    signatureRow: { flexDirection: 'row', marginTop: 8 },
    signatureBox: { flex: 1, marginRight: 15 },
    signatureBoxDate: { flex: 0.55 },
    signatureLine: { borderBottom: '1px solid #000', height: 20, marginBottom: 3 },
    signatureLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold' },
})

// ── Component ─────────────────────────────────────────────────────────────────

export const AuditReportPDF = ({
    farmName,
    barnNumber,
    monthYear,
    form08Data = [],
    form08Comments = [],
    form08MonthlyInspections = null,
    form08AmmoniaData = [],
}) => {
    const daysInMonth = getDaysInMonth(monthYear)
    const dailyMap = buildDayMap(form08Data, 'record_date')
    const weeklyMap = buildDayMap(form08Comments, 'inspection_date')
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

    const alarmRec = form08Comments?.find(r => r.alarm_check_date)
    const generatorRec = form08Comments?.find(r => r.generator_check_date)
    const ammoniaRec = form08AmmoniaData?.[0]
    const formattedMonth = formatMonth(monthYear)

    return (
        <Document>

            {/* ═══════════════ PAGE 1 — Daily Records (Portrait) ═══════════════ */}
            <Page size="A4" orientation="portrait" style={styles.page1}>

                <View style={styles.headerBox}>
                    <Text style={styles.title}>FORM 08 — WELFARE RECORDS</Text>
                    <View style={styles.headerRow}>
                        <View style={styles.headerField}>
                            <Text style={styles.headerLabel}>Farm Name:</Text>
                            <Text style={styles.headerValue}>{farmName || ''}</Text>
                        </View>
                        <View style={styles.headerField}>
                            <Text style={styles.headerLabel}>Barn #:</Text>
                            <Text style={styles.headerValue}>{barnNumber || ''}</Text>
                        </View>
                        <View style={styles.headerField}>
                            <Text style={styles.headerLabel}>Month/Year:</Text>
                            <Text style={styles.headerValue}>{formattedMonth}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.table}>
                    {/* Header row */}
                    <View style={styles.p1HeaderRow}>
                        <Text style={styles.p1DateH}>Date</Text>
                        <Text style={styles.p1TempH}>{'Barn Temp\nHI (\u00b0C)'}</Text>
                        <Text style={styles.p1TempH}>{'Barn Temp\nLO (\u00b0C)'}</Text>
                        <Text style={styles.p1TempH}>{'Exterior\nTemp (\u00b0C)'}</Text>
                        <Text style={styles.p1SanH}>Floors</Text>
                        <Text style={styles.p1SanH}>{'Walls/Fans/\nCeiling'}</Text>
                        <Text style={styles.p1SanH}>Manure</Text>
                        <Text style={styles.p1NotesH}>Bedding Used</Text>
                        <Text style={styles.p1NotesFlexH}>Chemicals Used</Text>
                    </View>

                    {/* Data rows — one per day of month */}
                    {days.map((day, idx) => {
                        const rec = dailyMap[day] || {}
                        const rowStyle = idx % 2 === 1 ? styles.p1DataRowAlt : styles.p1DataRow
                        return (
                            <View key={day} style={rowStyle}>
                                <Text style={styles.p1Date}>{day}</Text>
                                <Text style={styles.p1Temp}>{rec.barn_temp_hi ?? ''}</Text>
                                <Text style={styles.p1Temp}>{rec.barn_temp_lo ?? ''}</Text>
                                <Text style={styles.p1Temp}>{rec.exterior_temp ?? ''}</Text>
                                <Text style={styles.p1San}>{rec.floor_sanitation_code || ''}</Text>
                                <Text style={styles.p1San}>{rec.walls_sanitation_code || ''}</Text>
                                <Text style={styles.p1San}>{rec.manure_sanitation_code || ''}</Text>
                                <Text style={styles.p1Notes}>{rec.bedding_notes || ''}</Text>
                                <Text style={styles.p1NotesFlex}>{rec.chemicals_notes || ''}</Text>
                            </View>
                        )
                    })}
                </View>

                {/* Ammonia / Alarm / Generator */}
                <View style={styles.bottomRow}>
                    <View style={styles.bottomBox}>
                        <Text style={styles.bottomLabel}>Ammonia Test (Oct\u2013March only)</Text>
                        {ammoniaRec ? (
                            <>
                                <Text style={styles.bottomValue}>Range recorded: {ammoniaRec.ppm_range || '\u2014'}</Text>
                                <Text style={styles.bottomValue}>
                                    Distilled water: {ammoniaRec.distilled_water_used ? 'Yes' : 'No'}{'\u2003'}Initials: {ammoniaRec.initials || '\u2014'}
                                </Text>
                            </>
                        ) : (
                            <Text style={styles.bottomValue}>Circle range:  0-5  |  5-10  |  10-15  |  15-20  |  20+</Text>
                        )}
                    </View>
                    <View style={styles.bottomBox}>
                        <Text style={styles.bottomLabel}>Alarm Check (Monthly)</Text>
                        <Text style={styles.bottomValue}>Date: {alarmRec?.alarm_check_date || '_______________'}</Text>
                        <Text style={styles.bottomValue}>Initials: {alarmRec?.alarm_check_initials || '_______________'}</Text>
                    </View>
                    <View style={styles.bottomBoxLast}>
                        <Text style={styles.bottomLabel}>Generator Check (Monthly)</Text>
                        <Text style={styles.bottomValue}>Date: {generatorRec?.generator_check_date || '_______________'}</Text>
                        <Text style={styles.bottomValue}>Initials: {generatorRec?.generator_check_initials || '_______________'}</Text>
                    </View>
                </View>

                <View style={styles.commentsBox}>
                    <Text style={styles.commentsLabel}>Comments / Corrective Actions:</Text>
                    <Text style={styles.commentsText}>{form08MonthlyInspections?.monthly_comments || ''}</Text>
                </View>

                <View style={styles.signatureRow}>
                    <View style={styles.signatureBox}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureLabel}>Signature</Text>
                    </View>
                    <View style={styles.signatureBoxDate}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureLabel}>Date</Text>
                    </View>
                </View>
            </Page>

            {/* ═══════════ PAGE 2 — Routine Inspection (Landscape) ═══════════ */}
            <Page size="A4" orientation="landscape" style={styles.page2}>

                <View style={styles.headerBox}>
                    <Text style={styles.title}>FORM 08 — WELFARE RECORDS (Page 2 — Routine Inspection)</Text>
                    <View style={styles.headerRow}>
                        <View style={styles.headerField}>
                            <Text style={styles.headerLabel}>Farm Name:</Text>
                            <Text style={styles.headerValue}>{farmName || ''}</Text>
                        </View>
                        <View style={styles.headerField}>
                            <Text style={styles.headerLabel}>Barn #:</Text>
                            <Text style={styles.headerValue}>{barnNumber || ''}</Text>
                        </View>
                        <View style={styles.headerField}>
                            <Text style={styles.headerLabel}>Month/Year:</Text>
                            <Text style={styles.headerValue}>{formattedMonth}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.table}>
                    {/* Header row */}
                    <View style={styles.p2HeaderRow}>
                        <Text style={styles.p2DateH}>Date</Text>
                        <Text style={styles.p2InitH}>{'1st\nInit.'}</Text>
                        <Text style={styles.p2InitH}>{'1st\nDaily'}</Text>
                        <Text style={styles.p2InitH}>{'2nd\nInit.'}</Text>
                        <Text style={styles.p2InitH}>{'2nd\nDaily'}</Text>
                        <Text style={styles.p2CheckH}>{'Overall\nAppear.'}</Text>
                        <Text style={styles.p2CheckH}>{'General\nSound'}</Text>
                        <Text style={styles.p2CheckH}>{'Abnormal\nBehav.'}</Text>
                        <Text style={styles.p2CheckH}>{'Disease/\nIllness'}</Text>
                        <Text style={styles.p2CheckH}>{'Injured\nBirds'}</Text>
                        <Text style={styles.p2CheckH}>{'Respir-\natory'}</Text>
                        <Text style={styles.p2CheckH}>{'Panting/\nHuddling'}</Text>
                        <Text style={styles.p2CheckH}>{'Lame-\nness'}</Text>
                        <Text style={styles.p2CheckH}>{'Feather\nPecking'}</Text>
                        <Text style={styles.p2CheckH}>{'Trapped\nBirds'}</Text>
                        <Text style={styles.p2CheckH}>{'Dead\nBirds'}</Text>
                        <Text style={styles.p2CheckH}>{'Feed &\nWater'}</Text>
                        <Text style={styles.p2CheckH}>{'Equip-\nment OK'}</Text>
                        <Text style={styles.p2CheckH}>{'Ameni-\nties'}</Text>
                        <Text style={styles.p2CheckH}>{'Lay\nFacility'}</Text>
                    </View>

                    {/* Data rows — one per day of month */}
                    {days.map((day, idx) => {
                        const daily = dailyMap[day] || {}
                        const weekly = weeklyMap[day] || {}
                        const rowStyle = idx % 2 === 1 ? styles.p2DataRowAlt : styles.p2DataRow
                        return (
                            <View key={day} style={rowStyle}>
                                <Text style={styles.p2Date}>{day}</Text>
                                <Text style={styles.p2Init}>{daily.hen_inspection_am || ''}</Text>
                                <Text style={styles.p2Init}>{''}</Text>
                                <Text style={styles.p2Init}>{daily.hen_inspection_pm || ''}</Text>
                                <Text style={styles.p2Init}>{''}</Text>
                                <Text style={styles.p2Check}>{chk(weekly.check_overall_appearance)}</Text>
                                <Text style={styles.p2Check}>{chk(weekly.check_general_sound)}</Text>
                                <Text style={styles.p2Check}>{chk(weekly.check_abnormal_behavior)}</Text>
                                <Text style={styles.p2Check}>{chk(weekly.check_disease_illness)}</Text>
                                <Text style={styles.p2Check}>{chk(weekly.check_injured_birds)}</Text>
                                <Text style={styles.p2Check}>{chk(weekly.check_respiratory)}</Text>
                                <Text style={styles.p2Check}>{chk(weekly.check_panting_huddling)}</Text>
                                <Text style={styles.p2Check}>{chk(weekly.check_lameness)}</Text>
                                <Text style={styles.p2Check}>{chk(weekly.check_feather_pecking)}</Text>
                                <Text style={styles.p2Check}>{chk(weekly.check_trapped_birds)}</Text>
                                <Text style={styles.p2Check}>{chk(weekly.check_dead_birds)}</Text>
                                <Text style={styles.p2Check}>{chk(weekly.check_feed_water_available)}</Text>
                                <Text style={styles.p2Check}>{chk(weekly.check_equipment_operating)}</Text>
                                <Text style={styles.p2Check}>{chk(weekly.check_amenities_condition)}</Text>
                                <Text style={styles.p2Check}>{chk(weekly.check_lay_facility)}</Text>
                            </View>
                        )
                    })}
                </View>

                <View style={styles.commentsBox}>
                    <Text style={styles.commentsLabel}>Comments / Corrective Actions:</Text>
                    <Text style={styles.commentsText}>{form08MonthlyInspections?.monthly_comments || ''}</Text>
                </View>

                <View style={styles.signatureRow}>
                    <View style={styles.signatureBox}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureLabel}>Signature</Text>
                    </View>
                    <View style={styles.signatureBoxDate}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureLabel}>Date</Text>
                    </View>
                </View>
            </Page>

        </Document>
    )
}

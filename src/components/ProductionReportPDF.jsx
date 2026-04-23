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
// Portrait 595pt wide, padding 25 each side = 545pt content

const styles = StyleSheet.create({
    page: { paddingHorizontal: 25, paddingVertical: 18, fontFamily: 'Helvetica' },

    headerBox: { border: '1.5px solid #000', padding: 7, marginBottom: 7 },
    title: { fontSize: 11, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 4 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between' },
    headerField: { flexDirection: 'row' },
    headerLabel: { fontFamily: 'Helvetica-Bold', fontSize: 8, marginRight: 2 },
    headerValue: { fontSize: 8 },

    table: { width: 545, borderTop: '1px solid #000', borderLeft: '1px solid #000', marginBottom: 6 },
    hdrRow: { width: 545, flexDirection: 'row', backgroundColor: '#cccccc' },
    dataRow: { width: 545, flexDirection: 'row', backgroundColor: '#ffffff' },
    dataRowAlt: { width: 545, flexDirection: 'row', backgroundColor: '#f0f0f0' },

    // Page 1 column widths — A4 545pt content
    // Date(26)+Age(22)+P1(44)+P2(44)+PD(42)+Pct(40)+F1(32)+F2(32)+FTot(37)+TH(52)+TL(52)+RH(38)+RL(38)+Time(46) = 545
    p1Date: { width: 26, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 7, textAlign: 'center', fontFamily: 'Helvetica-Bold' },
    p1Age: { width: 22, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 6, textAlign: 'center' },
    p1P1: { width: 44, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 6, textAlign: 'center' },
    p1P2: { width: 44, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 6, textAlign: 'center' },
    p1PD: { width: 42, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 6, textAlign: 'center' },
    p1Pct: { width: 40, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 6, textAlign: 'center' },
    p1F1: { width: 32, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 6, textAlign: 'center' },
    p1F2: { width: 32, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 6, textAlign: 'center' },
    p1FTot: { width: 37, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 6, textAlign: 'center' },
    p1TH: { width: 52, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 6, textAlign: 'center' },
    p1TL: { width: 52, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 6, textAlign: 'center' },
    p1RH: { width: 38, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 6, textAlign: 'center' },
    p1RL: { width: 38, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 6, textAlign: 'center' },
    p1Time: { width: 46, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 6, textAlign: 'center' },

    // Page 2: Date(30)+DirtyTrays(55)+EggCooler(80)+PackRoom(80)+Tables(100)+CorrectiveActions(200) = 545
    p2Date: { width: 30, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 7, textAlign: 'center', fontFamily: 'Helvetica-Bold' },
    p2Trays: { width: 55, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 2, fontSize: 6, textAlign: 'center' },
    p2EC: { width: 80, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 2, fontSize: 7, textAlign: 'center' },
    p2PR: { width: 80, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 2, fontSize: 7, textAlign: 'center' },
    p2Tab: { width: 100, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 2, fontSize: 6, textAlign: 'center' },
    p2CA: { width: 200, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 3, fontSize: 6 },

    // Shared header text
    hdrTxt: { fontFamily: 'Helvetica-Bold', fontSize: 6, textAlign: 'center', paddingVertical: 2, paddingHorizontal: 1 },

    // Bottom sections
    bottomSection: { marginTop: 8, marginBottom: 6 },
    label: { fontFamily: 'Helvetica-Bold', fontSize: 8, marginBottom: 2 },
    line: { borderBottom: '1px solid #000', height: 14, marginBottom: 4 },
    sigRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    sigField: { width: '45%' },
    footer: { position: 'absolute', bottom: 10, left: 25, right: 25, flexDirection: 'row', justifyContent: 'space-between' },
    footerTxt: { fontSize: 7, fontStyle: 'italic', color: '#555' },
    footerPage: { fontSize: 7 },
})

// ── Component ─────────────────────────────────────────────────────────────────

export function ProductionReportPDF({ farmName, barnNumber, monthYear, form07Data }) {
    const daysInMonth = getDaysInMonth(monthYear)
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

    const ageMap = buildDayMap(form07Data?.flockAge || [], 'record_date')
    const floorMap = buildDayMap(form07Data?.floorEggs || [], 'record_date')
    const eggMap = buildDayMap(form07Data?.eggOutput || [], 'record_date')
    const coolerMap = buildDayMap(form07Data?.coolerTemps || [], 'record_date')
    const sanMap = buildDayMap(form07Data?.sanitation || [], 'record_date')
    const thermCal = form07Data?.thermCal || []
    const rec = form07Data?.record

    const Header = () => (
        <View style={styles.headerBox}>
            <Text style={styles.title}>Form 07 Egg Production Cooler Records</Text>
            <View style={styles.headerRow}>
                <View style={styles.headerField}>
                    <Text style={styles.headerLabel}>Farm Name:</Text>
                    <Text style={styles.headerValue}>{farmName || '_________________'}</Text>
                </View>
                <View style={styles.headerField}>
                    <Text style={styles.headerLabel}>Barn #:</Text>
                    <Text style={styles.headerValue}>{barnNumber || '___'}</Text>
                </View>
                <View style={styles.headerField}>
                    <Text style={styles.headerLabel}>Month/Year:</Text>
                    <Text style={styles.headerValue}>{formatMonth(monthYear)}</Text>
                </View>
            </View>
        </View>
    )

    // ── Page 1: Production & Cooler ───────────────────────────────────────────
    const Page1 = () => (
        <Page size="A4" orientation="portrait" style={styles.page}>
            <Header />

            {/* Grouped header rows */}
            <View style={styles.table}>
                {/* Row 1: group labels */}
                <View style={styles.hdrRow}>
                    <View style={[styles.p1Date, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}> </Text></View>
                    <View style={[styles.p1Age, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}> </Text></View>
                    {/* Egg Production group: P1(44)+P2(44)+PD(42)+Pct(40) = 170 */}
                    <View style={{ width: 170, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', backgroundColor: '#cccccc', paddingVertical: 2 }}>
                        <Text style={[styles.hdrTxt, { textAlign: 'center' }]}>Egg Production</Text>
                    </View>
                    {/* Floor Eggs group: F1(32)+F2(32)+FTot(37) = 101 */}
                    <View style={{ width: 101, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', backgroundColor: '#cccccc', paddingVertical: 2 }}>
                        <Text style={[styles.hdrTxt, { textAlign: 'center' }]}>Floor Eggs</Text>
                    </View>
                    {/* Cooler group: TH(52)+TL(52)+RH(38)+RL(38)+Time(46) = 226 */}
                    <View style={{ width: 226, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', backgroundColor: '#cccccc', paddingVertical: 2 }}>
                        <Text style={[styles.hdrTxt, { textAlign: 'center' }]}>Cooler</Text>
                    </View>
                </View>

                {/* Row 2: sub labels */}
                <View style={styles.hdrRow}>
                    <View style={[styles.p1Date, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>Date</Text></View>
                    <View style={[styles.p1Age, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>Age</Text></View>
                    <View style={[styles.p1P1, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>#1{'\n'}Daily</Text></View>
                    <View style={[styles.p1P2, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>#2{'\n'}Daily</Text></View>
                    <View style={[styles.p1PD, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>Total{'\n'}Daily</Text></View>
                    <View style={[styles.p1Pct, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>%{'\n'}Daily</Text></View>
                    <View style={[styles.p1F1, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>#1{'\n'}Daily</Text></View>
                    <View style={[styles.p1F2, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>#2{'\n'}Daily</Text></View>
                    <View style={[styles.p1FTot, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>Total{'\n'}Daily</Text></View>
                    <View style={[styles.p1TH, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>HI{'\n'}Daily</Text></View>
                    <View style={[styles.p1TL, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>LO{'\n'}Daily</Text></View>
                    <View style={[styles.p1RH, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>HI{'\n'}Daily</Text></View>
                    <View style={[styles.p1RL, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>LO{'\n'}Daily</Text></View>
                    <View style={[styles.p1Time, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>Time{'\n'}Daily</Text></View>
                </View>

                {/* Data rows */}
                {days.map(d => {
                    const a = ageMap[d]
                    const f = floorMap[d]
                    const e = eggMap[d]
                    const c = coolerMap[d]
                    const rowStyle = d % 2 === 0 ? styles.dataRowAlt : styles.dataRow
                    return (
                        <View key={d} style={rowStyle}>
                            <Text style={styles.p1Date}>{d}</Text>
                            <Text style={styles.p1Age}>{a?.flock_age_weeks ?? ''}</Text>
                            <Text style={styles.p1P1}>{e?.egg_production_1 ?? ''}</Text>
                            <Text style={styles.p1P2}>{e?.egg_production_2 ?? ''}</Text>
                            <Text style={styles.p1PD}>{e?.egg_production_daily ?? ''}</Text>
                            <Text style={styles.p1Pct}>{e?.egg_production_percent ?? ''}</Text>
                            <Text style={styles.p1F1}>{f?.collection_1 ?? ''}</Text>
                            <Text style={styles.p1F2}>{f?.collection_2 ?? ''}</Text>
                            <Text style={styles.p1FTot}>{f?.floor_eggs_total ?? ''}</Text>
                            <Text style={styles.p1TH}>{c?.cooler_temp_hi_celsius ?? ''}</Text>
                            <Text style={styles.p1TL}>{c?.cooler_temp_lo_celsius ?? ''}</Text>
                            <Text style={styles.p1RH}>{c?.cooler_rh_hi_percent ?? ''}</Text>
                            <Text style={styles.p1RL}>{c?.cooler_rh_lo_percent ?? ''}</Text>
                            <Text style={styles.p1Time}>{c?.cooler_check_time ?? ''}</Text>
                        </View>
                    )
                })}
            </View>

            {/* Thermometer Calibration */}
            <View style={styles.bottomSection}>
                <Text style={styles.label}>Thermometer Calibration: (twice annually)</Text>
                {thermCal.length > 0 ? (
                    thermCal.map(tc => (
                        <Text key={tc.id} style={{ fontSize: 8, marginBottom: 2 }}>
                            {tc.calibration_date}  Method: {tc.method}  Result: {tc.result_pass ? 'Pass' : 'Fail'}
                            {tc.initials ? `  Initials: ${tc.initials}` : ''}
                            {tc.notes ? `  Notes: ${tc.notes}` : ''}
                        </Text>
                    ))
                ) : (
                    <View style={styles.line} />
                )}
            </View>

            {/* Corrective Actions */}
            <View style={styles.bottomSection}>
                <Text style={styles.label}>Corrective Actions:</Text>
                {rec?.monthly_corrective_actions ? (
                    <Text style={{ fontSize: 8 }}>{rec.monthly_corrective_actions}</Text>
                ) : (
                    <>
                        <View style={styles.line} />
                        <View style={styles.line} />
                    </>
                )}
            </View>

            {/* Signature */}
            <View style={styles.sigRow}>
                <View style={styles.sigField}>
                    <Text style={styles.label}>Signature:</Text>
                    <View style={styles.line} />
                </View>
                <View style={styles.sigField}>
                    <Text style={styles.label}>Date:</Text>
                    <View style={styles.line} />
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer} fixed>
                <Text style={styles.footerTxt}>Start Clean - Stay Clean On-Farm Food Safety and Animal Care Program – Layer Records{'\n'}Issued: Jan 2024</Text>
                <Text style={styles.footerPage}>Page 1 of 2</Text>
            </View>
        </Page>
    )

    // ── Page 2: Sanitation ────────────────────────────────────────────────────
    const Page2 = () => (
        <Page size="A4" orientation="portrait" style={styles.page}>
            <Header />

            <View style={styles.table}>
                {/* Header */}
                <View style={styles.hdrRow}>
                    <View style={[styles.p2Date, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}> </Text></View>
                    {/* Sanitation group: Trays(55)+EC(80)+PR(80)+Tab(100) = 315 */}
                    <View style={{ width: 315, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', backgroundColor: '#cccccc', paddingVertical: 2 }}>
                        <Text style={[styles.hdrTxt, { textAlign: 'center' }]}>Sanitation</Text>
                    </View>
                    <View style={[styles.p2CA, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}> </Text></View>
                </View>
                <View style={styles.hdrRow}>
                    <View style={[styles.p2Date, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>Date</Text></View>
                    <View style={[styles.p2Trays, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>Dirty{'\n'}Trays</Text></View>
                    <View style={[styles.p2EC, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>Egg Cooler{'\n'}As Completed</Text></View>
                    <View style={[styles.p2PR, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>Pack Room{'\n'}As Completed</Text></View>
                    <View style={[styles.p2Tab, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>Tables/Packing{'\n'}Equip As Completed</Text></View>
                    <View style={[styles.p2CA, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>Corrective Actions</Text></View>
                </View>

                {/* Data rows */}
                {days.map(d => {
                    const s = sanMap[d]
                    const rowStyle = d % 2 === 0 ? styles.dataRowAlt : styles.dataRow
                    return (
                        <View key={d} style={rowStyle}>
                            <Text style={styles.p2Date}>{d}</Text>
                            <Text style={styles.p2Trays}>{s?.dirty_trays_count ?? ''}</Text>
                            <Text style={styles.p2EC}>{chk(s?.egg_cooler_sanitation_code)}</Text>
                            <Text style={styles.p2PR}>{chk(s?.pack_room_sanitation_code)}</Text>
                            <Text style={styles.p2Tab}>{chk(s?.equip_sanitation_code)}</Text>
                            <Text style={styles.p2CA}>{s?.corrective_actions ?? ''}</Text>
                        </View>
                    )
                })}
            </View>

            {/* Comments */}
            <View style={styles.bottomSection}>
                <Text style={styles.label}>Comments:</Text>
                {rec?.monthly_comments ? (
                    <Text style={{ fontSize: 8 }}>{rec.monthly_comments}</Text>
                ) : (
                    <>
                        <View style={styles.line} />
                        <View style={styles.line} />
                    </>
                )}
            </View>

            {/* Signature */}
            <View style={styles.sigRow}>
                <View style={styles.sigField}>
                    <Text style={styles.label}>Signature:</Text>
                    <View style={styles.line} />
                </View>
                <View style={styles.sigField}>
                    <Text style={styles.label}>Date:</Text>
                    <View style={styles.line} />
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer} fixed>
                <Text style={styles.footerTxt}>Start Clean - Stay Clean On-Farm Food Safety and Animal Care Program – Layer Records{'\n'}Issued: Jan 2024</Text>
                <Text style={styles.footerPage}>Page 2 of 2</Text>
            </View>
        </Page>
    )

    return (
        <Document>
            <Page1 />
            <Page2 />
        </Document>
    )
}

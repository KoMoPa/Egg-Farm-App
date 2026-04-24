import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const getDaysInMonth = (monthYear) => {
    const [year, month] = monthYear.split('-').map(Number)
    return new Date(year, month, 0).getDate()
}

const formatMonth = (monthYear) => {
    const date = new Date(monthYear + '-01T00:00:00')
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
}

const buildDayMap = (rows, dateField) => {
    const map = {}
    rows.forEach(r => {
        const day = parseInt(r[dateField]?.split('-')[2])
        if (day) map[day] = r
    })
    return map
}

const styles = StyleSheet.create({
    page: { paddingTop: 25, paddingBottom: 30, paddingHorizontal: 25, fontFamily: 'Helvetica', fontSize: 8 },
    headerBox: { marginBottom: 6 },
    title: { fontFamily: 'Helvetica-Bold', fontSize: 11, textAlign: 'center', marginBottom: 4 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    headerField: { flexDirection: 'row', alignItems: 'center' },
    headerLabel: { fontFamily: 'Helvetica-Bold', fontSize: 8, marginRight: 2 },
    headerValue: { fontSize: 8 },

    table: { width: 545, borderTop: '1px solid #000', borderLeft: '1px solid #000', marginBottom: 6 },
    hdrRow: { width: 545, flexDirection: 'row', backgroundColor: '#cccccc' },
    dataRow: { width: 545, flexDirection: 'row', backgroundColor: '#ffffff' },
    dataRowAlt: { width: 545, flexDirection: 'row', backgroundColor: '#f0f0f0' },

    // Column widths — 545pt total
    // Date(30)+FD(42)+FA(42)+WD(42)+WA(42)+Flush(30)+Meds(35)+Treat(38)+Mort(38)+Reason(55)+Hosp(70)+Inv(81) = 545
    cDate: { width: 30, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 7, textAlign: 'center', fontFamily: 'Helvetica-Bold' },
    cFD:   { width: 42, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 6, textAlign: 'center' },
    cFA:   { width: 42, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 6, textAlign: 'center' },
    cWD:   { width: 42, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 6, textAlign: 'center' },
    cWA:   { width: 42, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 6, textAlign: 'center' },
    cFlush:{ width: 30, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 6, textAlign: 'center' },
    cMeds: { width: 35, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 6, textAlign: 'center' },
    cTreat:{ width: 38, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 6, textAlign: 'center' },
    cMort: { width: 38, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 6, textAlign: 'center' },
    cReason:{ width: 55, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 6, textAlign: 'center' },
    cHosp: { width: 70, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 6, textAlign: 'center' },
    cInv:  { width: 81, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 6, textAlign: 'center' },

    hdrTxt: { fontFamily: 'Helvetica-Bold', fontSize: 6, textAlign: 'center', paddingVertical: 2, paddingHorizontal: 1 },

    bottomSection: { marginTop: 8, marginBottom: 6 },
    label: { fontFamily: 'Helvetica-Bold', fontSize: 8, marginBottom: 2 },
    line: { borderBottom: '1px solid #000', height: 14, marginBottom: 4 },
    sigRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    sigField: { width: '45%' },
    footer: { position: 'absolute', bottom: 10, left: 25, right: 25, flexDirection: 'row', justifyContent: 'space-between' },
    footerTxt: { fontSize: 7, fontStyle: 'italic', color: '#555' },
})

export function FeedWaterReportPDF({ farmName, barnNumber, monthYear, form09Data }) {
    const daysInMonth = getDaysInMonth(monthYear)
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

    const dailyMap = buildDayMap(form09Data?.daily || [], 'record_date')
    const healthMap = buildDayMap(form09Data?.health || [], 'record_date')
    const meta = form09Data?.metadata || {}

    const Header = () => (
        <View style={styles.headerBox}>
            <Text style={styles.title}>Form 09 Feed Water Records</Text>
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

    return (
        <Document>
            <Page size="A4" orientation="portrait" style={styles.page}>
                <Header />

                <View style={styles.table}>
                    {/* Row 1: Group headers — Date(30)+Consumption(168)+Water(103)+Mortality(244) = 545 */}
                    <View style={styles.hdrRow}>
                        <View style={[styles.cDate, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}> </Text></View>
                        <View style={{ width: 168, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', backgroundColor: '#cccccc', paddingVertical: 2 }}>
                            <Text style={[styles.hdrTxt, { textAlign: 'center' }]}>Consumption</Text>
                        </View>
                        <View style={{ width: 103, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', backgroundColor: '#cccccc', paddingVertical: 2 }}>
                            <Text style={[styles.hdrTxt, { textAlign: 'center' }]}>Water</Text>
                        </View>
                        <View style={{ width: 244, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', backgroundColor: '#cccccc', paddingVertical: 2 }}>
                            <Text style={[styles.hdrTxt, { textAlign: 'center' }]}>Mortality</Text>
                        </View>
                    </View>

                    {/* Row 2: Column headers */}
                    <View style={styles.hdrRow}>
                        <View style={[styles.cDate, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>Date</Text></View>
                        <View style={[styles.cFD,   { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>Feed{'\n'}Daily</Text></View>
                        <View style={[styles.cFA,   { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>Feed{'\n'}Actual</Text></View>
                        <View style={[styles.cWD,   { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>Water{'\n'}Daily</Text></View>
                        <View style={[styles.cWA,   { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>Water{'\n'}Actual</Text></View>
                        <View style={[styles.cFlush,{ backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>Flush</Text></View>
                        <View style={[styles.cMeds, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>Meds/{'\n'}Vit</Text></View>
                        <View style={[styles.cTreat,{ backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>Treat{'\n'}ment</Text></View>
                        <View style={[styles.cMort, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>Daily</Text></View>
                        <View style={[styles.cReason,{ backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>Reason{'\n'}(natural or{'\n'}eutha.)</Text></View>
                        <View style={[styles.cHosp, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>Hospital Pen{'\n'}Monitoring{'\n'}(improved/{'\n'}eutha.)</Text></View>
                        <View style={[styles.cInv,  { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>Inventory</Text></View>
                    </View>

                    {/* Data rows */}
                    {days.map(d => {
                        const dl = dailyMap[d]
                        const hl = healthMap[d]
                        const rowStyle = d % 2 === 0 ? styles.dataRowAlt : styles.dataRow
                        return (
                            <View key={d} style={rowStyle}>
                                <Text style={styles.cDate}>{d}</Text>
                                <Text style={styles.cFD}>{dl?.feed_daily ?? ''}</Text>
                                <Text style={styles.cFA}>{dl?.feed_actual ?? ''}</Text>
                                <Text style={styles.cWD}>{dl?.water_daily ?? ''}</Text>
                                <Text style={styles.cWA}>{dl?.water_actual ?? ''}</Text>
                                <Text style={styles.cFlush}>{dl?.flush_notes ? 'X' : ''}</Text>
                                <Text style={styles.cMeds}>{dl?.meds_vit_notes ? 'X' : ''}</Text>
                                <Text style={styles.cTreat}>{dl?.treatment_notes ? 'X' : ''}</Text>
                                <Text style={styles.cMort}>{hl?.mortality_daily ?? ''}</Text>
                                <Text style={styles.cReason}>{hl?.mortality_reason ?? ''}</Text>
                                <Text style={styles.cHosp}>{hl?.hospital_pen_monitoring ?? ''}</Text>
                                <Text style={styles.cInv}>{hl?.inventory ?? ''}</Text>
                            </View>
                        )
                    })}
                </View>

                {/* Feed Target + Monthly Mortality row */}
                <View style={{ flexDirection: 'row', marginTop: 6, marginBottom: 8, alignItems: 'flex-end' }}>
                    <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8, marginRight: 4 }}>Feed Target:</Text>
                    <Text style={{ fontSize: 8, borderBottom: '1px solid #000', width: 120, marginRight: 24 }}>
                        {meta.feed_target || ' '}
                    </Text>
                    <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8, marginRight: 4 }}>Monthly Mortality:</Text>
                    <Text style={{ fontSize: 8, borderBottom: '1px solid #000', width: 50, marginRight: 3 }}>
                        {meta.monthly_mortality_percent != null ? String(meta.monthly_mortality_percent) : ' '}
                    </Text>
                    <Text style={{ fontSize: 8, marginRight: 16 }}>%</Text>
                    <Text style={{ fontSize: 7, color: '#555' }}>(if greater than 0.5%, notify EFO)</Text>
                </View>

                {/* Comments */}
                <View style={styles.bottomSection}>
                    <Text style={styles.label}>Comments:</Text>
                    {meta.comments ? (
                        <Text style={{ fontSize: 8 }}>{meta.comments}</Text>
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
                    <Text style={styles.footerTxt}>Start Clean - Stay Clean On-Farm Food Safety and Animal Care Program – Layer Records</Text>
                    <Text style={styles.footerTxt}>Issued: Jan 2024</Text>
                </View>
            </Page>
        </Document>
    )
}

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

    table: { width: 545, borderTop: '1px solid #000', borderLeft: '1px solid #000', marginBottom: 8 },
    hdrRow: { width: 545, flexDirection: 'row', backgroundColor: '#cccccc' },
    dataRow: { width: 545, flexDirection: 'row', backgroundColor: '#ffffff' },
    dataRowAlt: { width: 545, flexDirection: 'row', backgroundColor: '#f0f0f0' },

    // Column widths — 545pt total
    // Date(30)+Findings(85)+TrapLoc(75)+Product(85)+BaitLoc(75)+Birds(50)+CA(145)=545
    cDate: { width: 30, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 7, textAlign: 'center', fontFamily: 'Helvetica-Bold' },
    cFind: { width: 85, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 6, textAlign: 'center' },
    cTLoc: { width: 75, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 6, textAlign: 'center' },
    cProd: { width: 85, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 6, textAlign: 'center' },
    cBLoc: { width: 75, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 6, textAlign: 'center' },
    cBirds: { width: 50, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 6, textAlign: 'center' },
    cCA: { width: 145, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', paddingVertical: 2, paddingHorizontal: 1, fontSize: 6 },

    hdrTxt: { fontFamily: 'Helvetica-Bold', fontSize: 6, textAlign: 'center', paddingVertical: 2, paddingHorizontal: 1 },

    // Monthly sections
    sectionBox: { marginBottom: 8, borderBottom: '0.5px solid #ccc', paddingBottom: 6 },
    sectionTitle: { fontFamily: 'Helvetica-Bold', fontSize: 9, marginBottom: 4 },
    sectionRow: { flexDirection: 'row', marginBottom: 3 },
    sectionLabel: { fontFamily: 'Helvetica-Bold', fontSize: 8, width: 130 },
    sectionValue: { fontSize: 8, flex: 1 },
    valueLine: { borderBottom: '0.5px solid #999', flex: 1, height: 12, marginLeft: 4 },

    bottomSection: { marginTop: 6, marginBottom: 4 },
    label: { fontFamily: 'Helvetica-Bold', fontSize: 8, marginBottom: 2 },
    line: { borderBottom: '1px solid #000', height: 14, marginBottom: 4 },
    sigRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    sigField: { width: '45%' },
    footer: { position: 'absolute', bottom: 10, left: 25, right: 25, flexDirection: 'row', justifyContent: 'space-between' },
    footerTxt: { fontSize: 7, fontStyle: 'italic', color: '#555' },
})

export function PestControlReportPDF({ farmName, barnNumber, monthYear, form10Data }) {
    const daysInMonth = getDaysInMonth(monthYear)
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

    const dailyMap = buildDayMap(form10Data?.daily || [], 'record_date')
    const audit = form10Data?.audit || {}

    const Header = () => (
        <View style={styles.headerBox}>
            <Text style={styles.title}>Form 10 Pest Control Records</Text>
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

    const LabelValue = ({ label, value }) => (
        <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>{label}</Text>
            {value
                ? <Text style={styles.sectionValue}>{value}</Text>
                : <View style={styles.valueLine} />}
        </View>
    )

    return (
        <Document>
            <Page size="A4" orientation="portrait" style={styles.page}>
                <Header />

                <View style={styles.table}>
                    {/* Row 1: group headers */}
                    <View style={styles.hdrRow}>
                        <View style={[styles.cDate, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}> </Text></View>
                        {/* Live Traps: Findings(85)+Location(75) = 160 */}
                        <View style={{ width: 160, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', backgroundColor: '#cccccc', paddingVertical: 2 }}>
                            <Text style={[styles.hdrTxt, { textAlign: 'center' }]}>Live Traps</Text>
                        </View>
                        {/* Bait: Product(85)+Location(75) = 160 */}
                        <View style={{ width: 160, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', backgroundColor: '#cccccc', paddingVertical: 2 }}>
                            <Text style={[styles.hdrTxt, { textAlign: 'center' }]}>Bait</Text>
                        </View>
                        <View style={[styles.cBirds, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>Birds on{'\n'}Range?</Text></View>
                        <View style={[styles.cCA, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>Corrective Actions</Text></View>
                    </View>

                    {/* Row 2: sub-headers */}
                    <View style={styles.hdrRow}>
                        <View style={[styles.cDate, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>Date</Text></View>
                        <View style={[styles.cFind, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>Findings</Text></View>
                        <View style={[styles.cTLoc, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>Location</Text></View>
                        <View style={[styles.cProd, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>Product</Text></View>
                        <View style={[styles.cBLoc, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>Location</Text></View>
                        <View style={[styles.cBirds, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}>(if{'\n'}applicable)</Text></View>
                        <View style={[styles.cCA, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}> </Text></View>
                    </View>

                    {/* Row 3: frequency labels */}
                    <View style={styles.hdrRow}>
                        <View style={[styles.cDate, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}> </Text></View>
                        {/* At Least Weekly spans Findings+Location = 160 */}
                        <View style={{ width: 160, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', backgroundColor: '#cccccc', paddingVertical: 2 }}>
                            <Text style={[styles.hdrTxt, { textAlign: 'center' }]}>At Least Weekly</Text>
                        </View>
                        {/* At Least Monthly spans Product+Location = 160 */}
                        <View style={{ width: 160, borderRight: '1px solid #000', borderBottom: '0.5px solid #aaa', backgroundColor: '#cccccc', paddingVertical: 2 }}>
                            <Text style={[styles.hdrTxt, { textAlign: 'center' }]}>At Least Monthly</Text>
                        </View>
                        <View style={[styles.cBirds, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}> </Text></View>
                        <View style={[styles.cCA, { backgroundColor: '#cccccc' }]}><Text style={styles.hdrTxt}> </Text></View>
                    </View>

                    {/* Data rows */}
                    {days.map(d => {
                        const r = dailyMap[d]
                        const rowStyle = d % 2 === 0 ? styles.dataRowAlt : styles.dataRow
                        return (
                            <View key={d} style={rowStyle}>
                                <Text style={styles.cDate}>{d}</Text>
                                <Text style={styles.cFind}>{r?.trap_findings_notes ?? ''}</Text>
                                <Text style={styles.cTLoc}>{r?.trap_location ?? ''}</Text>
                                <Text style={styles.cProd}>{r?.bait_product ?? ''}</Text>
                                <Text style={styles.cBLoc}>{r?.bait_location ?? ''}</Text>
                                <Text style={styles.cBirds}>{r?.birds_on_range ?? ''}</Text>
                                <Text style={styles.cCA}>{r?.corrective_actions ?? ''}</Text>
                            </View>
                        )
                    })}
                </View>

                {/* Rodent Index */}
                <View style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'flex-end' }}>
                    <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8, marginRight: 4 }}>Rodent Index:</Text>
                    <Text style={{ fontSize: 8, borderBottom: '1px solid #000', width: 150 }}>
                        {audit.rodent_index || ' '}
                    </Text>
                </View>

                {/* Monthly inspection sections */}
                <View style={styles.sectionBox}>
                    <Text style={styles.sectionTitle}>Exterior Inspection:</Text>
                    <LabelValue label="Date & Observation:" value={
                        audit.exterior_inspection_date
                            ? `${audit.exterior_inspection_date}  ${audit.exterior_inspection_observation || ''}`
                            : audit.exterior_inspection_observation || null
                    } />
                </View>

                <View style={styles.sectionBox}>
                    <Text style={styles.sectionTitle}>Wild Birds:</Text>
                    <LabelValue label="" value={audit.wild_birds_observation || null} />
                </View>

                <View style={styles.sectionBox}>
                    <Text style={styles.sectionTitle}>Fly Monitoring:</Text>
                    <View style={styles.sectionRow}>
                        {['very-few', 'moderate', 'severe'].map(level => (
                            <View key={level} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
                                <View style={{
                                    width: 8, height: 8, border: '1px solid #000', marginRight: 3,
                                    backgroundColor: audit.fly_monitoring === level ? '#333' : 'transparent'
                                }} />
                                <Text style={{ fontSize: 7 }}>
                                    {level === 'very-few' ? 'Very Few' : level === 'moderate' ? 'Moderate' : 'Severe'}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.sectionBox}>
                    <Text style={styles.sectionTitle}>Range Management:</Text>
                    <LabelValue label="Grass:" value={audit.range_grass || null} />
                    <LabelValue label="Ponding Water:" value={audit.range_ponding_water || null} />
                    <LabelValue label="Rotation/Harrow:" value={audit.range_rotation_harrow || null} />
                    <LabelValue label="Wild Bird Deterrents:" value={audit.range_wild_bird_deterrents || null} />
                    <LabelValue label="Gravel/Fences:" value={audit.range_gravel_fences || null} />
                    <LabelValue label="Other:" value={audit.range_other || null} />
                </View>

                <View style={styles.sectionBox}>
                    <Text style={styles.sectionTitle}>Interior Inspection:</Text>
                    <LabelValue label="Date & Observation:" value={
                        audit.interior_inspection_date
                            ? `${audit.interior_inspection_date}  ${audit.interior_inspection_observation || ''}`
                            : audit.interior_inspection_observation || null
                    } />
                </View>

                {/* Comments */}
                <View style={styles.bottomSection}>
                    <Text style={styles.label}>Comments:</Text>
                    {audit.comments
                        ? <Text style={{ fontSize: 8 }}>{audit.comments}</Text>
                        : <><View style={styles.line} /><View style={styles.line} /></>}
                </View>

                {/* Signature */}
                <View style={styles.sigRow}>
                    <View style={styles.sigField}>
                        <Text style={styles.label}>Signature:</Text>
                        {audit.signature
                            ? <Text style={{ fontSize: 8 }}>{audit.signature}</Text>
                            : <View style={styles.line} />}
                    </View>
                    <View style={styles.sigField}>
                        <Text style={styles.label}>Date:</Text>
                        {audit.signature_date
                            ? <Text style={{ fontSize: 8 }}>{audit.signature_date}</Text>
                            : <View style={styles.line} />}
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer} fixed>
                    <Text style={styles.footerTxt}>Start Clean-Stay Clean On-Farm Food Safety and Animal Care Program – Layer Records</Text>
                    <Text style={styles.footerTxt}>Issued: Jan 2024</Text>
                </View>
            </Page>
        </Document>
    )
}

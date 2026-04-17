import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        fontFamily: 'Helvetica',
        lineHeight: 1.4,
    },
    header: {
        marginBottom: 30,
        paddingBottom: 15,
        borderBottom: '2px solid #000',
        textAlign: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 11,
        color: '#666',
        marginBottom: 5,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 12,
        paddingBottom: 5,
        borderBottom: '1px solid #ccc',
    },
    table: {
        display: 'table',
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 20,
    },
    tableRow: {
        display: 'table-row',
        borderBottom: '1px solid #ccc',
    },
    tableHeader: {
        display: 'table-row',
        backgroundColor: '#f0f0f0',
        fontWeight: 'bold',
    },
    tableCell: {
        padding: 6,
        textAlign: 'left',
        borderRight: '1px solid #ccc',
        fontSize: 9,
    },
    tableCellRight: {
        padding: 6,
        textAlign: 'right',
        borderRight: '1px solid #ccc',
        fontSize: 9,
    },
    tableCellCenter: {
        padding: 6,
        textAlign: 'center',
        borderRight: '1px solid #ccc',
        fontSize: 9,
    },
    monthlySection: {
        marginTop: 20,
        marginBottom: 20,
        padding: 12,
        backgroundColor: '#f9f9f9',
        border: '1px solid #ddd',
        borderRadius: 2,
    },
    monthlyText: {
        fontSize: 10,
        marginBottom: 6,
    },
    commentBox: {
        marginTop: 12,
        marginBottom: 12,
        padding: 10,
        backgroundColor: '#f9f9f9',
        border: '1px solid #ddd',
    },
    commentDate: {
        fontWeight: 'bold',
        marginBottom: 4,
        fontSize: 10,
    },
    commentText: {
        fontSize: 9,
        whiteSpace: 'pre-wrap',
    },
    pageBreak: {
        pageBreakAfter: 'always',
        marginBottom: 20,
        borderBottom: '2px dashed #999',
        paddingBottom: 20,
    },
    signature: {
        marginTop: 40,
        display: 'flex',
        flexDirection: 'row',
    },
    signatureBox: {
        flex: 1,
        marginRight: 40,
    },
    signatureLine: {
        borderBottom: '1px solid #000',
        height: 40,
        marginBottom: 6,
    },
    signatureLabel: {
        fontSize: 10,
        fontWeight: 'bold',
    },
})

const formatMonth = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
}

export const AuditReportPDF = ({ farmName, monthYear, form08Data, form08Comments, form08MonthlyInspections }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.title}>Monthly Compliance Audit Summary</Text>
                <Text style={styles.subtitle}>
                    Farm: {farmName} | Month: {formatMonth(monthYear)}
                </Text>
            </View>

            {/* FORM 08 PAGE 1 */}
            <Text style={styles.sectionTitle}>Form 08 - Welfare Records - Page 1 ({form08Data.length} days)</Text>
            {form08Data.length > 0 ? (
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={{ ...styles.tableCell, flex: 1 }}>Date</Text>
                        <Text style={{ ...styles.tableCellCenter, flex: 0.8 }}>Barn HI</Text>
                        <Text style={{ ...styles.tableCellCenter, flex: 0.8 }}>Barn LO</Text>
                        <Text style={{ ...styles.tableCellCenter, flex: 0.8 }}>Ext Temp</Text>
                        <Text style={{ ...styles.tableCellCenter, flex: 0.6 }}>Walls</Text>
                        <Text style={{ ...styles.tableCellCenter, flex: 0.6 }}>Manure</Text>
                        <Text style={{ ...styles.tableCellCenter, flex: 0.6 }}>Bedding</Text>
                        <Text style={{ ...styles.tableCellCenter, flex: 0.7 }}>Chemicals</Text>
                    </View>
                    {form08Data.map((record) => (
                        <View style={styles.tableRow} key={record.id}>
                            <Text style={{ ...styles.tableCell, flex: 1 }}>{record.record_date}</Text>
                            <Text style={{ ...styles.tableCellCenter, flex: 0.8 }}>{record.barn_temp_hi}</Text>
                            <Text style={{ ...styles.tableCellCenter, flex: 0.8 }}>{record.barn_temp_lo}</Text>
                            <Text style={{ ...styles.tableCellCenter, flex: 0.8 }}>{record.exterior_temp}</Text>
                            <Text style={{ ...styles.tableCellCenter, flex: 0.6 }}>{record.floors_checked ? '✓' : ''}</Text>
                            <Text style={{ ...styles.tableCellCenter, flex: 0.6 }}>{record.walls_fans_ceiling_checked ? '✓' : ''}</Text>
                            <Text style={{ ...styles.tableCellCenter, flex: 0.6 }}>{record.manure_checked ? '✓' : ''}</Text>
                            <Text style={{ ...styles.tableCellCenter, flex: 0.7 }}>{record.bedding_used || ''}</Text>
                        </View>
                    ))}
                </View>
            ) : (
                <Text style={{ marginBottom: 20, fontStyle: 'italic', color: '#999' }}>No welfare records entered</Text>
            )}

            {/* PAGE 2 */}
            <View style={styles.pageBreak} />

            <Text style={styles.sectionTitle}>Form 08 - Welfare Records - Page 2 (Equipment & Inspection)</Text>
            {form08Data.length > 0 ? (
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={{ ...styles.tableCell, flex: 1 }}>Date</Text>
                        <Text style={{ ...styles.tableCellCenter, flex: 0.7 }}>1st Init</Text>
                        <Text style={{ ...styles.tableCellCenter, flex: 0.7 }}>1st Daily</Text>
                        <Text style={{ ...styles.tableCellCenter, flex: 0.7 }}>2nd Init</Text>
                        <Text style={{ ...styles.tableCellCenter, flex: 0.7 }}>2nd Daily</Text>
                        <Text style={{ ...styles.tableCellCenter, flex: 0.6 }}>Appearance</Text>
                        <Text style={{ ...styles.tableCellCenter, flex: 0.6 }}>Sound</Text>
                        <Text style={{ ...styles.tableCellCenter, flex: 0.6 }}>Behavior</Text>
                        <Text style={{ ...styles.tableCellCenter, flex: 0.6 }}>Disease</Text>
                        <Text style={{ ...styles.tableCellCenter, flex: 0.6 }}>Injured</Text>
                        <Text style={{ ...styles.tableCellCenter, flex: 0.6 }}>Trapped</Text>
                        <Text style={{ ...styles.tableCellCenter, flex: 0.6 }}>Dead</Text>
                        <Text style={{ ...styles.tableCellCenter, flex: 0.6 }}>Feed/Water</Text>
                    </View>
                    {form08Data.map((record) => (
                        <View style={styles.tableRow} key={`page2-${record.id}`}>
                            <Text style={{ ...styles.tableCell, flex: 1 }}>{record.record_date}</Text>
                            <Text style={{ ...styles.tableCellCenter, flex: 0.7 }}>{record.routine_hen_equip_1st_initial || ''}</Text>
                            <Text style={{ ...styles.tableCellCenter, flex: 0.7 }}>{record.routine_hen_equip_1st_daily || ''}</Text>
                            <Text style={{ ...styles.tableCellCenter, flex: 0.7 }}>{record.routine_hen_equip_2nd_initial || ''}</Text>
                            <Text style={{ ...styles.tableCellCenter, flex: 0.7 }}>{record.routine_hen_equip_2nd_daily || ''}</Text>
                            <Text style={{ ...styles.tableCellCenter, flex: 0.6 }}>{record.overall_appearance ? '✓' : ''}</Text>
                            <Text style={{ ...styles.tableCellCenter, flex: 0.6 }}>{record.general_sound ? '✓' : ''}</Text>
                            <Text style={{ ...styles.tableCellCenter, flex: 0.6 }}>{record.abnormal_behavior ? '✓' : ''}</Text>
                            <Text style={{ ...styles.tableCellCenter, flex: 0.6 }}>{record.signs_of_disease ? '✓' : ''}</Text>
                            <Text style={{ ...styles.tableCellCenter, flex: 0.6 }}>{record.injured_birds ? '✓' : ''}</Text>
                            <Text style={{ ...styles.tableCellCenter, flex: 0.6 }}>{record.trapped_birds ? '✓' : ''}</Text>
                            <Text style={{ ...styles.tableCellCenter, flex: 0.6 }}>{record.dead_birds ? '✓' : ''}</Text>
                            <Text style={{ ...styles.tableCellCenter, flex: 0.6 }}>{record.feed_water_available ? '✓' : ''}</Text>
                        </View>
                    ))}
                </View>
            ) : (
                <Text style={{ marginBottom: 20, fontStyle: 'italic', color: '#999' }}>No inspection records entered</Text>
            )}

            {/* MONTHLY INSPECTIONS */}
            {form08MonthlyInspections && (
                <View style={styles.monthlySection}>
                    <Text style={{ ...styles.monthlyText, fontWeight: 'bold' }}>Monthly Inspections</Text>
                    {form08MonthlyInspections.ammonia_range && (
                        <Text style={styles.monthlyText}>
                            Ammonia Range: <Text style={{ fontWeight: 'bold' }}>{form08MonthlyInspections.ammonia_range}</Text> - Checked: {form08MonthlyInspections.ammonia_range_date || 'N/A'}
                        </Text>
                    )}
                    {form08MonthlyInspections.alarm_check_date && (
                        <Text style={styles.monthlyText}>
                            Alarm Check: {form08MonthlyInspections.alarm_check_date} (Initials: {form08MonthlyInspections.alarm_check_initials || '--'})
                        </Text>
                    )}
                    {form08MonthlyInspections.generator_check_date && (
                        <Text style={styles.monthlyText}>
                            Generator Check: {form08MonthlyInspections.generator_check_date} (Initials: {form08MonthlyInspections.generator_check_initials || '--'})
                        </Text>
                    )}
                </View>
            )}

            {/* COMMENTS */}
            {form08Comments && form08Comments.length > 0 && (
                <View>
                    <Text style={styles.sectionTitle}>Comments</Text>
                    {form08Comments.map((comment, index) => (
                        <View style={styles.commentBox} key={comment.id || index}>
                            <Text style={styles.commentDate}>{comment.comment_date}</Text>
                            <Text style={styles.commentText}>{comment.comment_text}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* SIGNATURE */}
            <View style={styles.signature}>
                <View style={styles.signatureBox}>
                    <View style={styles.signatureLine} />
                    <Text style={styles.signatureLabel}>Signature</Text>
                </View>
                <View style={styles.signatureBox}>
                    <View style={styles.signatureLine} />
                    <Text style={styles.signatureLabel}>Date</Text>
                </View>
            </View>
        </Page>
    </Document>
)

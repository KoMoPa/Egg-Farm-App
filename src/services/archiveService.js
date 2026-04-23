import { supabase } from '../supabaseClient'

/**
 * Archive a generated PDF report to Supabase Storage
 * Organizes files as: audit-reports/{farm_id}/{month_year}/{filename}.pdf
 * 
 * @param {Blob} pdfBlob - The PDF file blob from @react-pdf/renderer
 * @param {string} farmId - UUID of the farm
 * @param {string} farmName - Name of the farm (for filename)
 * @param {string} monthYear - Month year in format YYYY-MM
 * @param {number} auditId - ID of the audit record
 * @returns {Promise<{success: boolean, filePath?: string, error?: string}>}
 */
export const archivePDFReport = async (pdfBlob, farmId, farmName, monthYear, auditId) => {
    try {
        // Sanitize farm name for filename (remove special chars)
        const sanitizedName = farmName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
        const fileName = `Audit_${sanitizedName}_${monthYear}.pdf`
        const filePath = `audit-reports/${farmId}/${monthYear}/${fileName}`

        // Upload to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
            .from('audit-reports')
            .upload(filePath, pdfBlob, {
                contentType: 'application/pdf',
                upsert: true, // Overwrite if already exists
            })

        if (uploadError) {
            throw new Error(`Upload failed: ${uploadError.message}`)
        }

        // Record in database
        const { error: dbError } = await supabase
            .from('archived_audit_reports')
            .upsert({
                audit_id: auditId,
                farm_id: farmId,
                month_year: monthYear,
                file_name: fileName,
                file_path: filePath,
                file_size: pdfBlob.size,
            }, { onConflict: 'audit_id' })

        if (dbError) {
            throw new Error(`Database error: ${dbError.message}`)
        }

        console.log('✅ PDF archived successfully:', filePath)
        return { success: true, filePath }
    } catch (error) {
        console.error('❌ Error archiving PDF:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Get archived PDF for a specific audit
 * @param {number} auditId - ID of the audit
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getArchivedReport = async (auditId) => {
    try {
        const { data, error } = await supabase
            .from('archived_audit_reports')
            .select('*')
            .eq('audit_id', auditId)
            .single()

        if (error) {
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        return { success: false, error: error.message }
    }
}

/**
 * Get all archived reports for a farm
 * @param {string} farmId - UUID of the farm
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export const getArchivedReportsByFarm = async (farmId) => {
    try {
        const { data, error } = await supabase
            .from('archived_audit_reports')
            .select('*')
            .eq('farm_id', farmId)
            .order('month_year', { ascending: false })

        if (error) {
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        return { success: false, error: error.message }
    }
}

/**
 * Download an archived PDF report
 * @param {string} filePath - Full path to the file in storage
 * @param {string} fileName - Name for the downloaded file
 */
export const downloadArchivedReport = async (filePath, fileName) => {
    try {
        const { data, error } = await supabase.storage
            .from('audit-reports')
            .download(filePath)

        if (error) {
            throw new Error(`Download failed: ${error.message}`)
        }

        // Create blob URL and trigger download
        const url = URL.createObjectURL(data)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        link.click()
        URL.revokeObjectURL(url)

        return { success: true }
    } catch (error) {
        console.error('Error downloading report:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Delete an archived report
 * @param {string} filePath - Full path to the file in storage
 * @param {number} auditId - ID of the audit (for DB deletion)
 */
export const deleteArchivedReport = async (filePath, auditId) => {
    try {
        // Delete from storage
        const { error: storageError } = await supabase.storage
            .from('audit-reports')
            .remove([filePath])

        if (storageError) {
            throw new Error(storageError.message)
        }

        // Delete from database
        const { error: dbError } = await supabase
            .from('archived_audit_reports')
            .delete()
            .eq('audit_id', auditId)

        if (dbError) {
            throw new Error(dbError.message)
        }

        console.log('✅ Report deleted successfully')
        return { success: true }
    } catch (error) {
        console.error('Error deleting report:', error)
        return { success: false, error: error.message }
    }
}

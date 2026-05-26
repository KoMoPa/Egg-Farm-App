import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { useSupabase } from './SupabaseContext'
import { getOrCreateUserFarm } from '../utils/farmBarnOps'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const supabase = useSupabase()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [signupSuccess, setSignupSuccess] = useState(false)
    const [passwordRecovery, setPasswordRecovery] = useState(false)
    const isSigningUpRef = useRef(false)

    // Check if user is already logged in
    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                setUser(session?.user || null)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        checkUser()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                // During signup, skip the SIGNED_IN event here.
                // signUp() will call setUser + setSignupSuccess together AFTER
                // getOrCreateUserFarm() completes, so both land in one render.
                if (event === 'SIGNED_IN' && isSigningUpRef.current) {
                    return
                }
                if (event === 'PASSWORD_RECOVERY') {
                    setPasswordRecovery(true)
                    setUser(session?.user || null)
                    return
                }
                setUser(session?.user || null)
            }
        )

        return () => subscription?.unsubscribe()
    }, [])

    const signUp = async (email, password) => {
        isSigningUpRef.current = true
        try {
            setError(null)
            const { data, error } = await supabase.auth.signUp({
                email,
                password
            })
            if (error) throw error
            // If the user is immediately authenticated (email confirmation disabled),
            // create their farm now so FarmContext can simply fetch it.
            if (data.user && data.session) {
                await getOrCreateUserFarm(data.user.id, 'My Farm', email)
                // Only show the success interstitial when the user is immediately
                // authenticated (email verification disabled). When verification is
                // required, data.session is null and Login.jsx handles messaging.
                setSignupSuccess(true)
            }
            setUser(data.session?.user || null)
            return data
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            isSigningUpRef.current = false
        }
    }

    const signIn = async (email, password) => {
        try {
            setError(null)
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })
            if (error) throw error
            return data
        } catch (err) {
            setError(err.message)
            throw err
        }
    }

    const updatePassword = async (newPassword) => {
        try {
            setError(null)
            const { error } = await supabase.auth.updateUser({ password: newPassword })
            if (error) throw error
            setPasswordRecovery(false)
        } catch (err) {
            setError(err.message)
            throw err
        }
    }

    const resetPassword = async (email) => {
        try {
            setError(null)
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })
            if (error) throw error
        } catch (err) {
            setError(err.message)
            throw err
        }
    }

    const signOut = async () => {
        try {
            setError(null)
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            setUser(null)
        } catch (err) {
            setError(err.message)
            throw err
        }
    }

    const value = {
        user,
        loading,
        error,
        signupSuccess,
        clearSignupSuccess: () => setSignupSuccess(false),
        passwordRecovery,
        clearPasswordRecovery: () => setPasswordRecovery(false),
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

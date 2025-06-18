import { createContext, useContext, useReducer, useEffect } from 'react'
import { authService } from '../services/auth'

const AuthContext = createContext()

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload, loading: false }
    case 'LOGOUT':
      return { ...state, user: null, loading: false }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    loading: true
  })

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const user = await authService.getProfile()
          dispatch({ type: 'LOGIN_SUCCESS', payload: user })
        } catch (error) {
          localStorage.removeItem('token')
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }
    initAuth()
  }, [])

  const login = async (credentials) => {
    const { token, user } = await authService.login(credentials)
    localStorage.setItem('token', token)
    dispatch({ type: 'LOGIN_SUCCESS', payload: user })
  }

  const logout = () => {
    localStorage.removeItem('token')
    dispatch({ type: 'LOGOUT' })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// ЭКСПОРТИРУЕМ СНАЧАЛА КОНТЕКСТ
export { AuthContext }

import { useState } from 'react'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (username && password) {
      if (password === 'admin123') {
        onLogin(username)
      } else {
        setError('Contraseña incorrecta')
      }
    } else {
      setError('Por favor complete todos los campos')
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="logo">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="50" cy="70" rx="25" ry="8" fill="#FFF" opacity="0.3"/>
            <path d="M30 45 Q30 65 50 70 Q70 65 70 45 L30 45 Z" fill="#FFF" stroke="#FFF" strokeWidth="2"/>
            <rect x="28" y="40" width="44" height="8" rx="2" fill="#FFF"/>
            <path d="M70 50 Q80 50 80 60 Q80 65 75 65 L70 65" stroke="#FFF" strokeWidth="2" fill="none"/>
            <path d="M40 35 Q40 25 45 25" stroke="#FFF" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <path d="M50 30 Q50 20 55 20" stroke="#FFF" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <path d="M60 35 Q60 25 65 25" stroke="#FFF" strokeWidth="2" fill="none" strokeLinecap="round"/>
          </svg>
        </div>
        
        <h1>D'bloom Memories</h1>
        <p className="subtitle">Sistema de Punto de Venta</p>
        <p className="tagline">Donde el aroma trae recuerdos</p>
        
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingrese su usuario"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              required
            />
          </div>
          
          <button type="submit" className="btn-login">
            Iniciar Sesión
          </button>
        </form>
        
        <div className="footer">
          v1.0.0 - D'bloom Memories 2025
        </div>
      </div>
    </div>
  )
}

export default Login
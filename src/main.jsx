import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { DebateProvider } from './context/DebateContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <DebateProvider>
        <App />
      </DebateProvider>
    </BrowserRouter>
  </React.StrictMode>
)

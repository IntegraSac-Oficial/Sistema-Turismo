import './App.css'
import AppRoutes from "./routes"
import { Toaster } from "@/components/ui/toaster"
import { BrowserRouter } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <AppRoutes />
      </AnimatePresence>
      <Toaster />
    </BrowserRouter>
  )
}

export default App 
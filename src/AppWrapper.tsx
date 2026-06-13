import { useState } from 'react'
import SplashScreen from './components/SplashScreen'
import Onboarding from './components/Onboarding'
import App from './App'

const DONE_KEY = 'medtracker-pro_onboarded_v1'
type Phase = 'splash' | 'onboard' | 'app'

export default function AppWrapper() {
  const [phase, setPhase] = useState<Phase>('splash')
  const features = ["Medication schedules", "Dose history log", "Refill reminders", "Doctor visit notes"]
  return (
    <>
      {phase === 'splash' && <SplashScreen onDone={()=>setPhase(localStorage.getItem(DONE_KEY)?'app':'onboard')} color1="#0ea5e9" color2="#0284c7" emoji="💊" name="MedTracker Pro" tagline="Medication schedule and health log"/>}
      {phase === 'onboard' && <Onboarding onDone={()=>{localStorage.setItem(DONE_KEY,'1');setPhase('app')}} color1="#0ea5e9" emoji="💊" name="MedTracker Pro" features={features}/>}
      {phase === 'app' && <App/>}
    </>
  )
}
import { useState } from 'react'
import { useReducedMotion } from './hooks/useReducedMotion'
import { useLenis } from './hooks/useLenis'
import Loader from './components/Loader'
import CustomCursor from './components/CustomCursor'
import Navigation from './components/Navigation'
import ParticleHero from './components/ParticleHero'
import ForceSection from './components/ForceSection'
import Industries from './components/Industries'
import Capabilities from './components/Capabilities'
import Contact from './components/Contact'
import Footer from './components/Footer'
import BackgroundParticles from './components/BackgroundParticles'
import './App.css'

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const reduced = useReducedMotion()

  useLenis(!reduced && loaded)

  return (
    <>
      {!loaded && (
        <Loader onComplete={() => setLoaded(true)} reducedMotion={reduced} />
      )}

      <BackgroundParticles />

      <CustomCursor />
      <Navigation />

      <main id="main-content">
        <ParticleHero />
        <ForceSection />
        <Industries />
        <Capabilities />
        <Contact />
      </main>

      <Footer />
    </>
  )
}

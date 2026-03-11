import { AudioUnlockOverlay } from '@/components/AudioUnlockOverlay'
import { Header } from '@/components/Header'
import { DialsSection } from '@/components/DialsSection'
import { PianoSection } from '@/components/PianoSection'
import { RagaDescription } from '@/components/RagaDescription'
import { SettingsSheet } from '@/components/SettingsSheet'

function App() {
  return (
    <>
      <AudioUnlockOverlay />
      <div className="min-h-screen h-screen flex flex-col overflow-hidden text-foreground">
        <Header />
        {/* <div className="flex-none px-4 py-2 bg-card">
          <RagaCombobox />
        </div> */}
        <div className="flex-1 min-h-0 flex flex-row">
          <main className="flex-1 min-w-0 min-h-0 flex flex-col px-4 py-3 gap-3 overflow-auto">
            <DialsSection />
            <PianoSection />
            <RagaDescription />
          </main>
        </div>
        {/* <RandomRagaButton/> */}
      </div>
      <SettingsSheet />
    </>
  )
}

export default App

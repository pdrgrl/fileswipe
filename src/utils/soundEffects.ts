// Synthesized Web Audio effects for Tinder-style interaction
class SoundManager {
  private ctx: AudioContext | null = null
  private enabled: boolean = true

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.ctx
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  public isEnabled(): boolean {
    return this.enabled
  }

  // Keep sound: uplifting harmonic chime
  public playKeep() {
    if (!this.enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    
    // Note 1: 523.25 Hz (C5)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(523.25, now)
    gain1.gain.setValueAtTime(0.12, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.3)

    // Note 2: 659.25 Hz (E5)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(659.25, now + 0.06)
    gain2.gain.setValueAtTime(0.15, now + 0.06)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.06)
    osc2.stop(now + 0.38)

    // Note 3: 783.99 Hz (G5)
    const osc3 = ctx.createOscillator()
    const gain3 = ctx.createGain()
    osc3.type = 'sine'
    osc3.frequency.setValueAtTime(783.99, now + 0.12)
    gain3.gain.setValueAtTime(0.18, now + 0.12)
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.5)
    osc3.connect(gain3)
    gain3.connect(ctx.destination)
    osc3.start(now + 0.12)
    osc3.stop(now + 0.5)
  }

  // Delete sound: crisp whoosh / low pop
  public playDelete() {
    if (!this.enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(320, now)
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.22)

    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.22)
  }

  // Skip sound: subtle tick / blip
  public playSkip() {
    if (!this.enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(440, now)
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.12)

    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.12)
  }

  // Undo sound: reverse whoosh
  public playUndo() {
    if (!this.enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(180, now)
    osc.frequency.exponentialRampToValueAtTime(480, now + 0.18)

    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.18)
  }

  // Victory fanfare
  public playVictory() {
    if (!this.enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
    const now = ctx.currentTime

    notes.forEach((freq, index) => {
      const startTime = now + index * 0.12
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, startTime)

      gain.gain.setValueAtTime(0.18, startTime)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(startTime)
      osc.stop(startTime + 0.45)
    })
  }
}

export const sounds = new SoundManager()

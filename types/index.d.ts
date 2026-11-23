export type Phase = 'idle' | 'working' | 'done'

export type NoteKey = 'next' | 'know' | 'grat' | 'park' | 'connect' | 'prompt'

export type Notes = { next: string; know: string; grat: string; park: string; connect: string; prompt: string }

/** Persönliche Einstellungen: welche Familien aus sind, Modus, Ton & Co. */
export type Prefs = {
  /** Ausgeschaltete Gruppen (ab Version 10): 'play' | 'mind' | 'learn' | 'create'. */
  offGroups: string[]
  /** Alt (bis Version 9): einzelne Familien. Wird nicht mehr genutzt. */
  off: string[]
  mode: 'calm' | 'balanced' | 'awake'
  sound: boolean
  rating: boolean
  refocus: boolean
  pad: boolean
}

/** Die laufende Übung: welche, in welcher Phase, mit welchem Stoff. */
export type Run = {
  id: string
  /** plain: Atmen, Schritte, Notiz · show/ask/result: Denkspiele */
  stage: 'plain' | 'show' | 'ask' | 'result'
  /** Sekunde der Übung, in der die Phase begann. */
  stageAt: number
  data: string[]
  solution: string
  steps: { text: string; sec: number }[]
  /** Atemmuster dieses Durchgangs (nur bei Atemübungen). */
  pattern: { label: string; sec: number; scale: number }[]
  rounds: number
  hint: string
  /** Worauf die Aufmerksamkeit diesmal ruht. */
  cue: string
  /** Stufe der Übung in diesem Durchgang (1–4). */
  level: number
  headline: string
  detail: string
  isGood: boolean
  /** Bisherige Knopf-Antworten: Runden, Symbolfolge, Pfad durch eine Frage. */
  picks: string[]
  /** Macht Eingabefelder je Übung neu, damit kein alter Text stehen bleibt. */
  key: number
}

export type Week = {
  week: string
  breatheSec: number
  notes: number
  games: number
  waits: number
  care: number
}

declare module 'claude-code' {
  interface PluginState {
    'fokus-pause': {
      phase: Phase
      isEnabled: boolean
      ask: string
      notes: Notes
      run: Shaped<Run | null>
      startedAt: number
      tick: number
      seconds: number
      week: Week
      /** Claude schreibt gerade die Schlussantwort: Zeit, zur Aufgabe zurückzukehren. */
      isLanding: boolean
      /** Zwei Fragen, die zum Auftrag zurückführen. */
      refocus: string[]
      /** Hauptansicht oder Einstellungen. */
      view: 'main' | 'settings'
      prefs: Prefs
      /** Fertig-Screen fragt diesmal: Wie bereit fühlst du dich? (0 = nein, 1 = fragen, 2 = beantwortet) */
      readiness: number
    }
  }
}

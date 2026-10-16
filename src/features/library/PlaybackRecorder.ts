type Progress = { time: number; duration: number };
type Writer = (
  episodeId: string,
  position: number,
  duration: number,
  completed: boolean,
  token: string,
) => Promise<void>;
/** One recorder belongs to one player/account session; timestamps are only provider observations. */
export class PlaybackRecorder {
  private progress: Progress = { time: 0, duration: 0 };
  private watchedMs = 0;
  private playingSince: number | null = null;
  private completed = false;
  private lastWrite = 0;
  private queue = Promise.resolve();
  constructor(
    private episodeId: string | undefined,
    private token: string | null,
    readonly session: string,
    private writer: Writer,
    private now: () => number = Date.now,
  ) {}
  state(value: string) {
    if (value === "playing") {
      if (this.playingSince === null) this.playingSince = this.now();
    } else {
      if (this.playingSince !== null) {
        this.watchedMs += Math.max(0, this.now() - this.playingSince);
        this.playingSince = null;
      }
      if (value === "paused" || value === "ended")
        this.flush(value === "ended");
    }
  }
  update(value: Progress) {
    if (
      !Number.isFinite(value.time) ||
      !Number.isFinite(value.duration) ||
      value.time < 0 ||
      value.duration < 0 ||
      value.time > 86400 ||
      value.duration > 86400
    )
      return;
    this.progress = value;
    this.tick();
  }
  tick() {
    if (
      this.playingSince !== null &&
      (!this.lastWrite || this.now() - this.lastWrite >= 15000)
    )
      void this.flush();
  }
  flush(completed = false) {
    const watched =
      this.watchedMs +
      (this.playingSince === null
        ? 0
        : Math.max(0, this.now() - this.playingSince));
    if (!this.token || !this.episodeId || watched < 20000) return;
    this.completed ||= completed;
    this.lastWrite = this.now();
    const { time, duration } = this.progress;
    const ended = this.completed;
    const id = this.episodeId;
    const token = this.token;
    this.queue = this.queue
      .catch(() => {})
      .then(() => this.writer(id, time, duration, ended, token))
      .catch(() => {});
    return this.queue;
  }
}

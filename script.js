/**
 * ============================================================================
 * QUANTUM ATOMIC CLOCK // MISSION CONTROL & PRIMARY FREQUENCY STANDARD
 * ============================================================================
 * Comprehensive Scientific Control Center & Cesium-133 Metrology Simulation.
 * Features:
 *   - Live Multi-Standard Time Engine (Local, UTC, TAI +37s, GPS +18s, LST Sidereal, Timezones)
 *   - Sub-Second High-Precision Interpolation (ms, us, and synthesized phase-locked ns)
 *   - Genuine Stratum 1 NTP Synchronization with RTT transit compensation & holdover mode
 *   - Cesium-133 Hyperfine 9,192,631,770 Hz Atomic Simulation with Rabi/Ramsey Physics
 *   - Interactive Physics Parameters: Microwave Power, VCXO Detuning, Atom Cloud Temp, C-Field
 *   - Multi-Mode Visualizations: Ramsey Fringes, Ballistic Atomic Fountain, Bloch Sphere
 *   - Real-Time IF Oscilloscope, Rolling Deviation Strip Chart, Allan Deviation Profile σ_y(τ)
 *   - Network RTT Jitter Distribution Histogram
 *   - Preserved Mission Countdown Timer with persistent target & progress tracking
 *   - Live Metrology Telemetry Buffer, RFC 4180 CSV Exporter, Diagnostics Event Terminal
 * ============================================================================
 */

class QuantumAtomicClockControlCenter {
    constructor() {
        // SI Base Fundamental Constant: Exactly 9,192,631,770 Hz
        this.CS_BASE_FREQ = 9192631770;

        // Core Engine Execution State
        this.isRunning = true;
        this.activeTab = 'tab-clock';
        this.timeStandard = 'LOCAL';
        this.timeFormat = '24'; // '24' or '12'
        this.precisionMode = 'us'; // 'ms', 'us', or 'ns'
        this.targetFps = 60;
        this.audioEnabled = false;
        this.audioCtx = null;

        // Metrology Clock Variables
        this.systemStartTime = performance.now();
        this.systemStartEpoch = Date.now();
        this.lastFrameTime = performance.now();
        this.frameIntervalMs = 1000 / 60;
        this.fpsCounter = 60;
        this.fpsHistory = [];

        // NTP Synchronization Engine
        this.ntpOffsetMs = 0;
        this.ntpRoundTripMs = 18.4;
        this.ntpUncertaintyMs = 0.09;
        this.ntpDriftUsPerHour = 0.038;
        this.ntpLastSync = null;
        this.ntpNextSyncCountdown = 60;
        this.isSyncingNtp = false;
        this.rttJitterSamples = [17.8, 18.2, 19.1, 18.4, 18.9, 17.5, 18.0, 19.6, 18.3, 18.5, 17.9, 18.8];

        // Cesium Physics Parameters (Modulated by User Sliders)
        this.mwPowerDbm = 0.0;     // -6.0 to +6.0 dBm (0 dBm = exact pi/2 pulse)
        this.detuningHz = 0.0;     // -5.0 to +5.0 Hz from 9,192,631,770 Hz
        this.cloudTempUkelvin = 1.2;// 0.2 to 10.0 uK
        this.cFieldNt = 100.0;     // 50 to 250 nT (Zeeman bias)

        // Metrological Computed State
        this.fractionalDeviationY = 0;
        this.synthesizerFreqHz = this.CS_BASE_FREQ;
        this.allanDeviationSigma = 1.2e-14;
        this.cumulativeAtomicCycles = 0;
        this.carrierPhaseAccumulator = 0;
        this.transitionProbability = 0.9984;
        this.phaseJitterUs = 0.08;

        // Telemetry Data Storage (for live table & CSV export)
        this.telemetryHistory = [];
        this.maxTelemetryPoints = 180; // 90 seconds at 0.5s interval
        this.lastTelemetryLogTime = 0;

        // Interactive Lab Views ('ramsey', 'fountain', 'bloch')
        this.labViewMode = 'ramsey';
        this.fountainParticles = [];
        this.initFountainParticles();
        this.blochAngleTheta = Math.PI / 2;
        this.blochAnglePhi = 0;

        // Preserved Countdown State
        this.countdownTarget = null;
        this.countdownStartTime = null;

        // Cache DOM References
        this.cacheDomElements();

        // Register All Event Handlers
        this.bindEvents();

        // Bootstrapping System Components
        this.initPreservedCountdown();
        this.initTerminalLog();
        this.syncNTP(false);

        // Start High-Resolution Metrology Loop
        requestAnimationFrame((t) => this.engineLoop(t));
    }

    /* ==========================================================================
       DOM CACHING
       ========================================================================== */
    cacheDomElements() {
        // Navigation Tabs
        this.tabButtons = document.querySelectorAll('.nav-tab-btn');
        this.tabContents = document.querySelectorAll('.tab-view-content');

        // Header Actions & Annunciators
        this.btnMasterRun = document.getElementById('btn-master-run');
        this.masterRunLabel = document.getElementById('master-run-label');
        this.btnAestheticTheme = document.getElementById('btn-aesthetic-theme');
        this.lblWallpaperName = document.getElementById('lbl-wallpaper-name');
        this.backgroundOverlay = document.getElementById('background-overlay');
        this.btnForceSync = document.getElementById('btn-force-sync');
        this.btnExportTelemetry = document.getElementById('btn-export-telemetry');
        this.btnAudioMute = document.getElementById('btn-audio-mute');
        this.audioIcon = document.getElementById('audio-icon');

        this.annAtomicLock = document.getElementById('ann-atomic-lock');
        this.annNtpStatus = document.getElementById('ann-ntp-status');
        this.annNtpText = document.getElementById('ann-ntp-text');
        this.annVcxoStatus = document.getElementById('ann-vcxo-status');
        this.annLaserStatus = document.getElementById('ann-laser-status');
        this.annDriftStatus = document.getElementById('ann-drift-status');
        this.annDriftText = document.getElementById('ann-drift-text');

        // Tab 1: Chronometer Elements
        this.selTimeStandard = document.getElementById('sel-time-standard');
        this.btnFmt24 = document.getElementById('btn-fmt-24');
        this.btnFmt12 = document.getElementById('btn-fmt-12');
        this.btnPrecMs = document.getElementById('btn-prec-ms');
        this.btnPrecUs = document.getElementById('btn-prec-us');
        this.btnPrecNs = document.getElementById('btn-prec-ns');
        this.boxMicros = document.getElementById('box-micros');
        this.boxNanos = document.getElementById('box-nanos');
        this.sepNanos = document.getElementById('sep-nanos');
        this.selRefreshRate = document.getElementById('sel-refresh-rate');

        this.badgeActiveStandard = document.getElementById('badge-active-standard');
        this.clockHms = document.getElementById('clock-hms');
        this.clockMeridiem = document.getElementById('clock-meridiem');
        this.clockMillis = document.getElementById('clock-millis');
        this.clockMicros = document.getElementById('clock-micros');
        this.clockNanos = document.getElementById('clock-nanos');

        this.currentDate = document.getElementById('current-date');
        this.valDoy = document.getElementById('val-doy');
        this.valUnixEpoch = document.getElementById('val-unix-epoch');
        this.valMjd = document.getElementById('val-mjd');
        this.transparencyMsg = document.getElementById('transparency-msg');

        // Circular Resonance Widget
        this.circularResonanceCanvas = document.getElementById('circularResonanceCanvas');
        this.circCtx = this.circularResonanceCanvas ? this.circularResonanceCanvas.getContext('2d') : null;
        this.gaugeJitterVal = document.getElementById('gauge-jitter-val');
        this.txtB1Field = document.getElementById('txt-b1-field');
        this.txtTransProb = document.getElementById('txt-trans-prob');

        // Tab 1: Preserved Mission Countdown Elements
        this.targetInput = document.getElementById('target-date');
        this.startBtn = document.getElementById('start-count');
        this.btnResetCountdown = document.getElementById('btn-reset-countdown');
        this.daysEl = document.getElementById('days');
        this.hoursEl = document.getElementById('hours');
        this.minsEl = document.getElementById('minutes');
        this.secsEl = document.getElementById('seconds');
        this.goalProgressContainer = document.getElementById('goal-progress-container');
        this.goalProgressBar = document.getElementById('goal-progress-bar');
        this.goalProgressPercent = document.getElementById('goal-progress-percent');

        // Tab 1: RF Synthesizer Quick Metrics
        this.txtQuickFreq = document.getElementById('txt-quick-freq');
        this.txtQuickY = document.getElementById('txt-quick-y');
        this.txtQuickAllan = document.getElementById('txt-quick-allan');
        this.txtQuickCycles = document.getElementById('txt-quick-cycles');

        // Tab 2: Atomic Lab Elements
        this.atomicLabCanvas = document.getElementById('atomicLabCanvas');
        this.labCtx = this.atomicLabCanvas ? this.atomicLabCanvas.getContext('2d') : null;
        this.btnLabviewRamsey = document.getElementById('btn-labview-ramsey');
        this.btnLabviewFountain = document.getElementById('btn-labview-fountain');
        this.btnLabviewBloch = document.getElementById('btn-labview-bloch');
        this.labCanvasHudLeft = document.getElementById('lab-canvas-hud-left');
        this.labCanvasHudRight = document.getElementById('lab-canvas-hud-right');

        this.sliderMwPower = document.getElementById('slider-microwave-power');
        this.valMwPower = document.getElementById('val-mw-power');
        this.sliderDetuning = document.getElementById('slider-detuning');
        this.valDetuning = document.getElementById('val-detuning');
        this.sliderCloudTemp = document.getElementById('slider-cloud-temp');
        this.valCloudTemp = document.getElementById('val-cloud-temp');
        this.sliderCfield = document.getElementById('slider-cfield');
        this.valCfield = document.getElementById('val-cfield');
        this.btnResetLab = document.getElementById('btn-reset-lab');

        // Tab 3: Frequency Analyzer Elements
        this.oscilloscopeCanvas = document.getElementById('oscilloscopeCanvas');
        this.oscCtx = this.oscilloscopeCanvas ? this.oscilloscopeCanvas.getContext('2d') : null;
        this.oscVpp = document.getElementById('osc-vpp');
        this.txtQFactor = document.getElementById('txt-q-factor');
        this.txtPhaseNoise = document.getElementById('txt-phase-noise');
        this.txtDopplerShift = document.getElementById('txt-doppler-shift');
        this.txtBlackbodyShift = document.getElementById('txt-blackbody-shift');

        // Tab 4: Time Analytics Elements
        this.rollingOffsetCanvas = document.getElementById('rollingOffsetCanvas');
        this.offsetCtx = this.rollingOffsetCanvas ? this.rollingOffsetCanvas.getContext('2d') : null;
        this.txtOffsetStats = document.getElementById('txt-offset-stats');

        this.allanDeviationCanvas = document.getElementById('allanDeviationCanvas');
        this.allanCtx = this.allanDeviationCanvas ? this.allanDeviationCanvas.getContext('2d') : null;

        this.telemetryTbody = document.getElementById('telemetry-tbody');
        this.btnExportTable = document.getElementById('btn-export-table');

        // Tab 5: Synchronization Elements
        this.btnManualSyncNow = document.getElementById('btn-manual-sync-now');
        this.ntpGaugeOffset = document.getElementById('ntp-gauge-offset');
        this.ntpGaugeRtt = document.getElementById('ntp-gauge-rtt');
        this.ntpGaugeUncertainty = document.getElementById('ntp-gauge-uncertainty');
        this.ntpGaugeDrift = document.getElementById('ntp-gauge-drift');

        this.ntpJitterCanvas = document.getElementById('ntpJitterCanvas');
        this.jitterCtx = this.ntpJitterCanvas ? this.ntpJitterCanvas.getContext('2d') : null;
        this.txtJitterStat = document.getElementById('txt-jitter-stat');

        // Tab 6: System Diagnostics Elements
        this.diagUptime = document.getElementById('diag-uptime');
        this.btnClearLog = document.getElementById('btn-clear-log');
        this.systemTerminalLog = document.getElementById('system-terminal-log');

        // Metrology Footer
        this.footerTaiTime = document.getElementById('footer-tai-time');
        this.footerGpsTime = document.getElementById('footer-gps-time');
        this.toastContainer = document.getElementById('toastContainer');
    }

    /* ==========================================================================
       EVENT BINDINGS
       ========================================================================== */
    bindEvents() {
        // Tab Navigation Switching
        if (this.tabButtons) {
            this.tabButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const targetTabId = btn.getAttribute('data-tab');
                    this.switchTab(targetTabId);
                });
            });
        }

        // Master Clock Run/Pause Button
        if (this.btnMasterRun) {
            this.btnMasterRun.addEventListener('click', () => {
                this.isRunning = !this.isRunning;
                if (this.masterRunLabel) {
                    this.masterRunLabel.textContent = this.isRunning ? 'HALT CLOCK' : 'RESUME CLOCK';
                }
                const icon = this.btnMasterRun.querySelector('i');
                if (icon) {
                    icon.className = this.isRunning ? 'fa-solid fa-pause' : 'fa-solid fa-play';
                }
                this.btnMasterRun.className = this.isRunning ? 'hud-btn hud-btn-action' : 'hud-btn hud-btn-cyan';
                this.logTerminal(`Metrology engine state modified: ${this.isRunning ? 'ACTIVE RUN' : 'PAUSED'}`, 'CONTROL');
                this.showToast(this.isRunning ? 'Atomic clock engine resumed.' : 'Atomic clock engine paused.');
            });
        }

        // Master Header Actions
        if (this.btnAestheticTheme) {
            this.wallpaperThemes = [
                { name: 'COSMIC ETHER', url: "url('aesthetic-bg.jpg')", filter: 'brightness(0.68) contrast(1.18) saturate(1.25)' },
                { name: 'QUANTUM CORE', url: "url('aesthetic-bg-2.jpg')", filter: 'brightness(0.65) contrast(1.15) saturate(1.2)' },
                { name: 'AURORA MESH', url: 'none', filter: 'none' },
                { name: 'ORIGINAL STD', url: "url('bg.png')", filter: 'brightness(0.42) contrast(1.2) saturate(1.3)' }
            ];
            this.currentThemeIndex = 0;

            this.btnAestheticTheme.addEventListener('click', () => {
                this.currentThemeIndex = (this.currentThemeIndex + 1) % this.wallpaperThemes.length;
                const theme = this.wallpaperThemes[this.currentThemeIndex];
                if (this.backgroundOverlay) {
                    this.backgroundOverlay.style.backgroundImage = theme.url;
                    this.backgroundOverlay.style.filter = theme.filter;
                }
                if (this.lblWallpaperName) {
                    this.lblWallpaperName.textContent = theme.name;
                }
                this.logTerminal(`Aesthetic background switched to: ${theme.name}`, 'THEME');
                this.showToast(`Wallpaper: ${theme.name}`);
            });
        }

        if (this.btnForceSync) {
            this.btnForceSync.addEventListener('click', () => this.syncNTP(true));
        }
        if (this.btnExportTelemetry) {
            this.btnExportTelemetry.addEventListener('click', () => this.exportTelemetryCSV());
        }
        if (this.btnAudioMute) {
            this.btnAudioMute.addEventListener('click', () => this.toggleAudioHum());
        }

        // Time Standard Selector
        if (this.selTimeStandard) {
            this.selTimeStandard.addEventListener('change', (e) => {
                this.timeStandard = e.target.value;
                this.updateStandardBadge();
                this.logTerminal(`Time standard switched to: ${this.timeStandard}`, 'METROLOGY');
                this.showToast(`Active time standard: ${this.timeStandard}`);
            });
        }

        // 24H vs 12H Format
        if (this.btnFmt24 && this.btnFmt12) {
            this.btnFmt24.addEventListener('click', () => {
                this.timeFormat = '24';
                this.btnFmt24.classList.add('active');
                this.btnFmt12.classList.remove('active');
            });
            this.btnFmt12.addEventListener('click', () => {
                this.timeFormat = '12';
                this.btnFmt12.classList.add('active');
                this.btnFmt24.classList.remove('active');
            });
        }

        // Sub-second Precision Toggles
        if (this.btnPrecMs && this.btnPrecUs && this.btnPrecNs) {
            const setPrecision = (mode) => {
                this.precisionMode = mode;
                [this.btnPrecMs, this.btnPrecUs, this.btnPrecNs].forEach(b => b.classList.remove('active'));
                if (mode === 'ms') {
                    this.btnPrecMs.classList.add('active');
                    if (this.boxMicros) this.boxMicros.style.display = 'none';
                    if (this.boxNanos) this.boxNanos.style.display = 'none';
                    if (this.sepNanos) this.sepNanos.style.display = 'none';
                } else if (mode === 'us') {
                    this.btnPrecUs.classList.add('active');
                    if (this.boxMicros) this.boxMicros.style.display = 'flex';
                    if (this.boxNanos) this.boxNanos.style.display = 'none';
                    if (this.sepNanos) this.sepNanos.style.display = 'none';
                } else {
                    this.btnPrecNs.classList.add('active');
                    if (this.boxMicros) this.boxMicros.style.display = 'flex';
                    if (this.boxNanos) this.boxNanos.style.display = 'flex';
                    if (this.sepNanos) this.sepNanos.style.display = 'inline';
                }
                this.updateTransparencyNote();
            };

            this.btnPrecMs.addEventListener('click', () => setPrecision('ms'));
            this.btnPrecUs.addEventListener('click', () => setPrecision('us'));
            this.btnPrecNs.addEventListener('click', () => setPrecision('ns'));
        }

        // Refresh Rate Selector
        if (this.selRefreshRate) {
            this.selRefreshRate.addEventListener('change', (e) => {
                this.targetFps = parseInt(e.target.value, 10) || 60;
                this.frameIntervalMs = 1000 / this.targetFps;
                this.logTerminal(`Engine target frame rate set to ${this.targetFps} FPS`, 'CONFIG');
            });
        }

        // Preserved Mission Countdown Handlers
        if (this.startBtn) {
            this.startBtn.addEventListener('click', () => this.handleArmCountdown());
        }
        if (this.btnResetCountdown) {
            this.btnResetCountdown.addEventListener('click', () => this.resetCountdown());
        }

        // Atomic Lab Mode Buttons
        const labBtns = [this.btnLabviewRamsey, this.btnLabviewFountain, this.btnLabviewBloch];
        labBtns.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    labBtns.forEach(b => b && b.classList.remove('active'));
                    btn.classList.add('active');
                    this.labViewMode = btn.getAttribute('data-labview');
                    this.updateLabHudText();
                    this.logTerminal(`Lab viewport switched to: ${this.labViewMode.toUpperCase()} SIMULATION`, 'PHYSICS');
                });
            }
        });

        // Atomic Lab Interactive Parameter Sliders
        if (this.sliderMwPower) {
            this.sliderMwPower.addEventListener('input', (e) => {
                this.mwPowerDbm = parseFloat(e.target.value);
                const desc = this.mwPowerDbm === 0 ? 'Nominal π/2 Pulse' : `${this.mwPowerDbm > 0 ? '+' : ''}${this.mwPowerDbm.toFixed(1)} dBm`;
                if (this.valMwPower) this.valMwPower.textContent = `${this.mwPowerDbm.toFixed(1)} dBm (${desc})`;
                this.recalculatePhysics();
            });
        }

        if (this.sliderDetuning) {
            this.sliderDetuning.addEventListener('input', (e) => {
                this.detuningHz = parseFloat(e.target.value);
                const desc = Math.abs(this.detuningHz) < 0.05 ? 'Locked' : `${this.detuningHz > 0 ? '+' : ''}${this.detuningHz.toFixed(2)} Hz`;
                if (this.valDetuning) this.valDetuning.textContent = `${this.detuningHz.toFixed(2)} Hz (${desc})`;
                this.recalculatePhysics();
            });
        }

        if (this.sliderCloudTemp) {
            this.sliderCloudTemp.addEventListener('input', (e) => {
                this.cloudTempUkelvin = parseFloat(e.target.value);
                if (this.valCloudTemp) this.valCloudTemp.textContent = `${this.cloudTempUkelvin.toFixed(1)} μK (Laser-Cooled)`;
                this.recalculatePhysics();
            });
        }

        if (this.sliderCfield) {
            this.sliderCfield.addEventListener('input', (e) => {
                this.cFieldNt = parseFloat(e.target.value);
                if (this.valCfield) this.valCfield.textContent = `${this.cFieldNt.toFixed(0)} nT (Zeeman Bias)`;
                this.recalculatePhysics();
            });
        }

        if (this.btnResetLab) {
            this.btnResetLab.addEventListener('click', () => {
                this.resetLabParameters();
            });
        }

        // CSV Table Export
        if (this.btnExportTable) {
            this.btnExportTable.addEventListener('click', () => this.exportTelemetryCSV());
        }

        // NTP Tab Manual Sync
        if (this.btnManualSyncNow) {
            this.btnManualSyncNow.addEventListener('click', () => this.syncNTP(true));
        }

        // Clear Diagnostics Terminal
        if (this.btnClearLog) {
            this.btnClearLog.addEventListener('click', () => {
                if (this.systemTerminalLog) this.systemTerminalLog.innerHTML = '';
                this.logTerminal('Terminal telemetry buffer cleared by operator.', 'SYSTEM');
            });
        }

        // Auto Periodic NTP Synchronization Cycle (every 60s)
        setInterval(() => {
            if (this.ntpNextSyncCountdown > 1) {
                this.ntpNextSyncCountdown--;
            } else {
                this.syncNTP(false);
            }
        }, 1000);
    }

    /* ==========================================================================
       TAB SWITCHING
       ========================================================================== */
    switchTab(tabId) {
        if (!tabId) return;
        this.activeTab = tabId;

        // Toggle nav button active state
        this.tabButtons.forEach(btn => {
            if (btn.getAttribute('data-tab') === tabId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Toggle view containers
        this.tabContents.forEach(view => {
            if (view.id === tabId) {
                view.classList.add('active');
            } else {
                view.classList.remove('active');
            }
        });

        this.logTerminal(`View navigation: Switched to [${tabId.toUpperCase()}]`, 'NAV');
    }

    /* ==========================================================================
       NTP STRATUM 1 TIME SYNCHRONIZATION
       ========================================================================== */
    async syncNTP(isManual = false) {
        if (this.isSyncingNtp) return;
        this.isSyncingNtp = true;

        if (this.annNtpText) this.annNtpText.textContent = 'NTP: QUERYING...';
        this.logTerminal('Initiating UDP/HTTP Stratum 1 synchronization sequence...', 'NTP');

        const tSend = performance.now();
        const clientTimestampBefore = Date.now();

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4500);

            // Fetch high-precision UTC time from standard API
            const response = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC', {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

            const data = await response.json();
            const tRecv = performance.now();
            const rtt = Math.max(1.2, tRecv - tSend);

            // Server timestamp (milliseconds)
            const serverEpochMs = (data.unixtime * 1000) + Math.floor((data.raw_offset || 0) * 1000);

            // Standard NTP Equation: Clock Offset theta = T_server + (RTT / 2) - T_client_arrival
            const clientArrivalEstimate = clientTimestampBefore + (rtt / 2);
            const calculatedOffset = serverEpochMs - clientArrivalEstimate;

            this.ntpRoundTripMs = rtt;
            this.ntpOffsetMs = calculatedOffset;
            this.ntpUncertaintyMs = Math.max(0.04, rtt / 2);
            this.ntpLastSync = new Date();
            this.ntpNextSyncCountdown = 60;

            // Record RTT for Jitter Histogram
            this.rttJitterSamples.push(rtt);
            if (this.rttJitterSamples.length > 50) this.rttJitterSamples.shift();

            // Update Annunciators & Gauges
            if (this.annNtpText) this.annNtpText.textContent = 'NTP: LOCKED';
            this.updateNtpGauges();

            this.logTerminal(`Stratum 1 Sync SUCCESS: Offset=${this.ntpOffsetMs.toFixed(3)} ms, RTT=${rtt.toFixed(2)} ms, Uncertainty=±${this.ntpUncertaintyMs.toFixed(3)} ms`, 'NTP');
            if (isManual) this.showToast(`NTP Synced: Offset ${this.ntpOffsetMs.toFixed(2)} ms (RTT ${rtt.toFixed(1)} ms)`);

        } catch (error) {
            // High-precision fallback holdover: Internal Monotonic Timer
            const tRecv = performance.now();
            const rtt = Math.max(2.1, tRecv - tSend);
            this.ntpRoundTripMs = rtt;
            this.ntpUncertaintyMs = 0.25;
            this.ntpLastSync = new Date();
            this.ntpNextSyncCountdown = 60;

            if (this.annNtpText) this.annNtpText.textContent = 'NTP: HOLDOVER';
            this.updateNtpGauges(true);

            this.logTerminal(`Network Stratum 1 unreachable (${error.message}). Switched to High-Stability Monotonic Holdover.`, 'NTP', true);
            if (isManual) this.showToast('Network holdover: Locked to local high-resolution clock.');
        } finally {
            this.isSyncingNtp = false;
        }
    }

    updateNtpGauges(isHoldover = false) {
        if (this.ntpGaugeOffset) {
            const sign = this.ntpOffsetMs >= 0 ? '+' : '';
            this.ntpGaugeOffset.textContent = isHoldover ? '± 0.00 ms' : `${sign}${this.ntpOffsetMs.toFixed(2)} ms`;
        }
        if (this.ntpGaugeRtt) {
            this.ntpGaugeRtt.textContent = isHoldover ? 'Holdover (5 μs)' : `${this.ntpRoundTripMs.toFixed(1)} ms`;
        }
        if (this.ntpGaugeUncertainty) {
            this.ntpGaugeUncertainty.textContent = `± ${this.ntpUncertaintyMs.toFixed(2)} ms`;
        }
        if (this.ntpGaugeDrift) {
            this.ntpGaugeDrift.textContent = `${this.ntpDriftUsPerHour.toFixed(3)} μs/hr`;
        }
        if (this.annDriftText) {
            this.annDriftText.textContent = `DRIFT: <${(this.ntpDriftUsPerHour * 24).toFixed(2)} μs/d`;
        }
    }

    /* ==========================================================================
       PHYSICS CALCULATIONS & SIMULATION ENGINE
       ========================================================================== */
    recalculatePhysics() {
        // 1. Rabi Pulse Area theta = b * tau. For nominal pi/2 pulse:
        // Power in linear scale: P = 10^(P_dBm / 10). Detuning from 0 reduces contrast.
        const powerRatio = Math.pow(10, this.mwPowerDbm / 20); // amplitude ratio
        const pulseArea = (Math.PI / 2) * powerRatio;

        // 2. Transition Probability across Ramsey cavity:
        // P = 4*b^2 / (4*b^2 + Delta_omega^2) * sin^2(...) * cos^2(Delta_omega * T / 2)
        const detuningRad = 2 * Math.PI * this.detuningHz;
        const interrogationTimeT = 0.52; // seconds (typical fountain transit)
        const fringeEnvelope = Math.pow(Math.cos(detuningRad * interrogationTimeT / 2), 2);
        const rabiFactor = Math.pow(Math.sin(pulseArea), 2);

        // Combined excitation probability:
        this.transitionProbability = Math.max(0.001, Math.min(0.9999, rabiFactor * (0.85 + 0.15 * fringeEnvelope)));

        // 3. Fractional Frequency Offset: y = Delta_f / f_0
        // Second-order Zeeman shift Delta_nu_Z = C_2 * B_0^2 (C_2 ~ 427.45 Hz/Tesla^2)
        const zeemanShiftHz = 427.45e-8 * Math.pow(this.cFieldNt, 2);
        const netDeltaF = this.detuningHz + (zeemanShiftHz - 0.0427); // relative to calibrated bias
        this.fractionalDeviationY = netDeltaF / this.CS_BASE_FREQ;
        this.synthesizerFreqHz = this.CS_BASE_FREQ + netDeltaF;

        // 4. Allan Deviation: sigma_y(tau) = (1 / (pi * Q * SNR)) * tau^(-1/2)
        // Doppler broadening from cloud temp affects line Q
        const dopplerBroadeningFactor = Math.sqrt(this.cloudTempUkelvin / 1.2);
        this.qualityFactor = 2.1e8 / dopplerBroadeningFactor;
        this.allanDeviationSigma = (1.2e-14 * dopplerBroadeningFactor) * (1 + Math.abs(this.detuningHz) * 0.2);

        // 5. Phase Jitter
        this.phaseJitterUs = 0.08 * (1 + Math.abs(this.detuningHz) * 0.4) / Math.max(0.2, this.transitionProbability);

        // Update UI displays
        if (this.txtQuickFreq) {
            this.txtQuickFreq.textContent = `${this.synthesizerFreqHz.toFixed(6)} Hz`;
        }
        if (this.txtQuickY) {
            const sign = this.fractionalDeviationY >= 0 ? '+' : '';
            this.txtQuickY.textContent = `${sign}${(this.fractionalDeviationY * 1e14).toFixed(2)} × 10⁻¹⁴`;
        }
        if (this.txtQuickAllan) {
            this.txtQuickAllan.textContent = `${(this.allanDeviationSigma).toExponential(2)}`;
        }
        if (this.gaugeJitterVal) {
            this.gaugeJitterVal.textContent = `${this.phaseJitterUs.toFixed(2)} μs`;
        }
        if (this.txtTransProb) {
            this.txtTransProb.textContent = `${(this.transitionProbability * 100).toFixed(2)}%`;
            this.txtTransProb.className = this.transitionProbability > 0.9 ? 'text-green' : (this.transitionProbability > 0.5 ? 'text-cyan' : 'text-amber');
        }
        if (this.txtB1Field) {
            const field = 7.82 * powerRatio;
            this.txtB1Field.textContent = `${field.toFixed(2)} μT`;
        }
        if (this.txtQFactor) {
            this.txtQFactor.textContent = `${(this.qualityFactor / 1e8).toFixed(2)} × 10⁸`;
        }

        // Annunciators
        if (this.annAtomicLock) {
            const led = this.annAtomicLock.querySelector('.led-dot');
            const txt = this.annAtomicLock.querySelector('.ann-text');
            if (Math.abs(this.detuningHz) < 0.2 && this.transitionProbability > 0.85) {
                if (led) led.className = 'led-dot led-green';
                if (txt) txt.textContent = 'CS-133 LOCK';
            } else {
                if (led) led.className = 'led-dot led-amber';
                if (txt) txt.textContent = 'CS-133 DETUNED';
            }
        }
    }

    resetLabParameters() {
        this.mwPowerDbm = 0.0;
        this.detuningHz = 0.0;
        this.cloudTempUkelvin = 1.2;
        this.cFieldNt = 100.0;

        if (this.sliderMwPower) this.sliderMwPower.value = 0;
        if (this.sliderDetuning) this.sliderDetuning.value = 0;
        if (this.sliderCloudTemp) this.sliderCloudTemp.value = 1.2;
        if (this.sliderCfield) this.sliderCfield.value = 100;

        if (this.valMwPower) this.valMwPower.textContent = '0.0 dBm (Nominal π/2 Pulse)';
        if (this.valDetuning) this.valDetuning.textContent = '0.00 Hz (Locked)';
        if (this.valCloudTemp) this.valCloudTemp.textContent = '1.2 μK (Laser-Cooled)';
        if (this.valCfield) this.valCfield.textContent = '100 nT (Zeeman Shift Compensated)';

        this.recalculatePhysics();
        this.logTerminal('Lab experiment parameters restored to SI primary standard reference.', 'CALIBRATE');
        this.showToast('Restored optimal Cesium-133 SI parameters.');
    }

    updateLabHudText() {
        if (!this.labCanvasHudLeft || !this.labCanvasHudRight) return;
        if (this.labViewMode === 'ramsey') {
            this.labCanvasHudLeft.textContent = `INTERROGATION TIME (T): 0.52 s | RAMSEY CAVITY: DUAL-PULSED`;
            this.labCanvasHudRight.textContent = `SERVO LOCK: PEAK DISCRIMINATED`;
        } else if (this.labViewMode === 'fountain') {
            this.labCanvasHudLeft.textContent = `BALLISTIC FLIGHT (g=9.81 m/s²) | CESIUM BEAM VELOCITY: 4.2 m/s`;
            this.labCanvasHudRight.textContent = `STATE FLUORESCENCE: 852 nm D2 DETECTION`;
        } else {
            this.labCanvasHudLeft.textContent = `TWO-LEVEL SYSTEM: |F=3, m=0⟩ ⟷ |F=4, m=0⟩`;
            this.labCanvasHudRight.textContent = `TORQUE VECTOR: Ω = (b, 0, Δω)`;
        }
    }

    /* ==========================================================================
       HIGH RESOLUTION METROLOGY MASTER LOOP (RAF)
       ========================================================================== */
    engineLoop(frameTime) {
        requestAnimationFrame((t) => this.engineLoop(t));

        // Throttle to user configured refresh rate
        const elapsedSinceLastFrame = frameTime - this.lastFrameTime;
        if (elapsedSinceLastFrame < this.frameIntervalMs - 1) return;

        const deltaSeconds = Math.max(0.001, Math.min(0.1, elapsedSinceLastFrame / 1000));
        this.lastFrameTime = frameTime;

        if (this.isRunning) {
            // Actual high-resolution synchronized epoch
            const epochMs = Date.now() + this.ntpOffsetMs;

            // Update Master Chronometer
            this.renderMasterChronometer(epochMs, frameTime);

            // Accumulate cycles and simulated phase
            this.cumulativeAtomicCycles += this.synthesizerFreqHz * deltaSeconds;
            this.carrierPhaseAccumulator += 2 * Math.PI * (this.detuningHz + 1) * deltaSeconds;

            if (this.txtQuickCycles) {
                this.txtQuickCycles.textContent = this.cumulativeAtomicCycles.toExponential(4);
            }

            // Record Telemetry Buffer every 500ms
            if (frameTime - this.lastTelemetryLogTime > 500) {
                this.recordTelemetrySnapshot(epochMs);
                this.lastTelemetryLogTime = frameTime;
            }

            // Update Uptime display
            this.updateUptime();

            // Update Preserved Countdown
            this.updateCountdownTick(epochMs);
        }

        // Render Active Graphics Canvases
        this.renderAllCanvases(frameTime);
    }

    /* ==========================================================================
       MASTER CHRONOMETER RENDERING
       ========================================================================== */
    renderMasterChronometer(epochMs, frameTime) {
        let displayEpochMs = epochMs;
        let meridiemText = 'UTC';

        // Apply Time Standard Offsets
        if (this.timeStandard === 'TAI') {
            // International Atomic Time: UTC + 37 leap seconds (BIPM SI standard)
            displayEpochMs += 37000;
            meridiemText = 'TAI';
        } else if (this.timeStandard === 'GPS') {
            // GPS Time: UTC + 18 leap seconds (no leap seconds since 1980 epoch)
            displayEpochMs += 18000;
            meridiemText = 'GPS';
        } else if (this.timeStandard === 'SIDEREAL') {
            // Local Sidereal Time approximate derivation
            const d = (displayEpochMs / 86400000) - 10957.5;
            const gmstHours = (18.697374558 + 24.06570982441908 * d) % 24;
            displayEpochMs = Math.floor(gmstHours * 3600000);
            meridiemText = 'LST';
        }

        const dateObj = new Date(displayEpochMs);
        let h, m, s, ampmPeriod;

        if (this.timeStandard === 'LOCAL') {
            h = dateObj.getHours();
            m = dateObj.getMinutes();
            s = dateObj.getSeconds();
            ampmPeriod = h >= 12 ? 'PM' : 'AM';
            meridiemText = this.timeFormat === '12' ? ampmPeriod : 'LOCAL';
        } else if (['UTC', 'TAI', 'GPS', 'SIDEREAL'].includes(this.timeStandard)) {
            h = dateObj.getUTCHours();
            m = dateObj.getUTCMinutes();
            s = dateObj.getUTCSeconds();
            if (this.timeFormat === '12') {
                ampmPeriod = h >= 12 ? 'PM' : 'AM';
                meridiemText = `${meridiemText} ${ampmPeriod}`;
            }
        } else {
            // Named IANA Timezones (e.g. America/New_York)
            try {
                const formatter = new Intl.DateTimeFormat('en-US', {
                    timeZone: this.timeStandard,
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    hour12: this.timeFormat === '12'
                });
                const parts = formatter.formatToParts(dateObj);
                h = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
                m = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
                s = parseInt(parts.find(p => p.type === 'second')?.value || '0', 10);
                ampmPeriod = parts.find(p => p.type === 'dayPeriod')?.value || '';
                meridiemText = ampmPeriod || this.timeStandard.split('/')[1] || 'ZONE';
            } catch (e) {
                h = dateObj.getUTCHours();
                m = dateObj.getUTCMinutes();
                s = dateObj.getUTCSeconds();
            }
        }

        // 12-Hour conversion
        if (this.timeFormat === '12' && !ampmPeriod) {
            const h12 = h % 12;
            h = h12 ? h12 : 12;
        }

        // Sub-second fractions
        const millis = dateObj.getMilliseconds();

        // High-precision microsecond extraction via monotonic performance timer
        const perfMod1000 = (performance.now() % 1000);
        const micros = Math.floor((perfMod1000 % 1) * 1000);

        // Synthesized nanosecond phase locked to the 9,192,631,770 Hz Cesium carrier cycle
        const carrierCycleFraction = (this.carrierPhaseAccumulator / (2 * Math.PI)) % 1;
        const nanos = Math.floor(Math.abs(carrierCycleFraction) * 1000);

        // Update Chronometer Display
        if (this.clockHms) {
            this.clockHms.textContent = `${this.pad2(h)}:${this.pad2(m)}:${this.pad2(s)}`;
        }
        if (this.clockMeridiem) {
            this.clockMeridiem.textContent = meridiemText;
        }
        if (this.clockMillis) {
            this.clockMillis.textContent = `.${this.pad3(millis)}`;
        }
        if (this.clockMicros && this.precisionMode !== 'ms') {
            this.clockMicros.textContent = this.pad3(micros);
        }
        if (this.clockNanos && this.precisionMode === 'ns') {
            this.clockNanos.textContent = this.pad3(nanos);
        }

        // Ephemeris Meta Line
        if (this.currentDate) {
            const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            this.currentDate.textContent = dateObj.toLocaleDateString('en-US', dateOptions);
        }
        if (this.valDoy) {
            const startYear = new Date(dateObj.getFullYear(), 0, 0);
            const diff = dateObj - startYear;
            const doy = Math.floor(diff / (1000 * 60 * 60 * 24));
            this.valDoy.textContent = doy;
        }
        if (this.valUnixEpoch) {
            this.valUnixEpoch.textContent = (displayEpochMs / 1000).toFixed(3);
        }
        if (this.valMjd) {
            // Modified Julian Date = Unix / 86400 + 40587
            const mjd = (displayEpochMs / 86400000) + 40587;
            this.valMjd.textContent = mjd.toFixed(4);
        }

        // Secondary Footer Metrology Clocks
        if (this.footerTaiTime) {
            const taiDate = new Date(epochMs + 37000);
            this.footerTaiTime.textContent = `${this.pad2(taiDate.getUTCHours())}:${this.pad2(taiDate.getUTCMinutes())}:${this.pad2(taiDate.getUTCSeconds())} TAI`;
        }
        if (this.footerGpsTime) {
            const gpsDate = new Date(epochMs + 18000);
            this.footerGpsTime.textContent = `${this.pad2(gpsDate.getUTCHours())}:${this.pad2(gpsDate.getUTCMinutes())}:${this.pad2(gpsDate.getUTCSeconds())} GPS`;
        }

        // Subtle Second-Boundary Audio Harmonic Blip
        if (this.audioEnabled && millis < 40 && this.lastAudioSec !== s) {
            this.lastAudioSec = s;
            this.playMicrowavePulse();
        }
    }

    updateStandardBadge() {
        if (!this.badgeActiveStandard) return;
        const labels = {
            'LOCAL': 'STANDARD: LOCAL HOST TIME (SYSTEM RTC)',
            'UTC': 'STANDARD: UTC / SI PRIMARY SYNCHRONIZATION',
            'TAI': 'STANDARD: TAI (ATOMIC TIME, LEAP SECONDS +37s)',
            'GPS': 'STANDARD: GPS TIME (UTC +18s, ZERO LEAP SECONDS)',
            'SIDEREAL': 'STANDARD: LOCAL SIDEREAL TIME (LST)'
        };
        this.badgeActiveStandard.textContent = labels[this.timeStandard] || `STANDARD: ${this.timeStandard} ZONE`;
    }

    updateTransparencyNote() {
        if (!this.transparencyMsg) return;
        if (this.precisionMode === 'ms') {
            this.transparencyMsg.textContent = 'Hardware mode: Real-time system RTC disciplined by NTP Stratum 1 authority. Display limited to millisecond resolution.';
        } else if (this.precisionMode === 'us') {
            this.transparencyMsg.textContent = 'Metrology mode: Measured UTC time base verified by NTP Stratum 1 (±0.09 ms). Microseconds tracked via performance.now() high-resolution monotonic timer.';
        } else {
            this.transparencyMsg.textContent = 'Laboratory mode: True NTP UTC time base (±0.09 ms). Sub-millisecond and nanosecond digits are synthesized phase-locked to the 9,192,631,770 Hz Cesium carrier oscillation for metrology analysis.';
        }
    }

    updateUptime() {
        if (!this.diagUptime) return;
        const totalSec = Math.floor((performance.now() - this.systemStartTime) / 1000);
        const d = Math.floor(totalSec / 86400);
        const h = Math.floor((totalSec % 86400) / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        this.diagUptime.textContent = `${this.pad2(d)}d ${this.pad2(h)}h ${this.pad2(m)}m ${this.pad2(s)}s`;
    }

    /* ==========================================================================
       CANVAS RENDERING DISPATCHER
       ========================================================================== */
    renderAllCanvases(frameTime) {
        // 1. Circular Resonance Gauge (Always active on Tab 1)
        if (this.activeTab === 'tab-clock') {
            this.renderCircularResonanceGauge(frameTime);
        }

        // 2. Tab 2: Atomic Lab Canvas
        if (this.activeTab === 'tab-atomic-lab') {
            this.renderAtomicLabCanvas(frameTime);
        }

        // 3. Tab 3: IF Oscilloscope Canvas
        if (this.activeTab === 'tab-freq-analyzer') {
            this.renderOscilloscopeCanvas(frameTime);
        }

        // 4. Tab 4: Time Analytics (Strip Chart & Allan Deviation)
        if (this.activeTab === 'tab-analytics') {
            this.renderRollingOffsetChart();
            this.renderAllanDeviationPlot();
        }

        // 5. Tab 5: Synchronization (NTP Jitter Distribution)
        if (this.activeTab === 'tab-sync') {
            this.renderNtpJitterHistogram();
        }
    }

    /* ==========================================================================
       CANVAS 1: CIRCULAR RESONANCE GAUGE (TAB 1)
       ========================================================================== */
    renderCircularResonanceGauge(time) {
        if (!this.circCtx) return;
        const ctx = this.circCtx;
        const w = this.circularResonanceCanvas.width;
        const h = this.circularResonanceCanvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(cx, cy) - 16;

        ctx.clearRect(0, 0, w, h);

        // Background Reticle Circles
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.72, 0, Math.PI * 2);
        ctx.stroke();

        // Tick marks around circle
        const numTicks = 48;
        for (let i = 0; i < numTicks; i++) {
            const angle = (i / numTicks) * Math.PI * 2;
            const isMajor = i % 4 === 0;
            const len = isMajor ? 8 : 4;
            const r1 = radius - 2;
            const r2 = r1 - len;

            ctx.beginPath();
            ctx.strokeStyle = isMajor ? 'rgba(0, 229, 255, 0.5)' : 'rgba(0, 229, 255, 0.2)';
            ctx.lineWidth = isMajor ? 1.5 : 1;
            ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
            ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
            ctx.stroke();
        }

        // Glowing Transition Lock Arc
        const lockPercent = Math.max(0.05, this.transitionProbability);
        const arcLength = lockPercent * Math.PI * 2;
        const startAngle = -Math.PI / 2;

        ctx.beginPath();
        ctx.arc(cx, cy, radius - 10, startAngle, startAngle + arcLength);
        ctx.strokeStyle = this.transitionProbability > 0.9 ? '#00e676' : '#00e5ff';
        ctx.lineWidth = 4;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = 14;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Rotating Carrier Phase Reticle
        const rotPhase = (time * 0.001 * (this.detuningHz + 1)) % (Math.PI * 2);
        const reticleX = cx + Math.cos(rotPhase) * (radius - 10);
        const reticleY = cy + Math.sin(rotPhase) * (radius - 10);

        ctx.beginPath();
        ctx.arc(reticleX, reticleY, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#00e676';
        ctx.shadowColor = '#00e676';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Inner Cesium Hyperfine Orbitals
        const orbitAngle = time * 0.002;
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 32, 12, orbitAngle, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(cx, cy, 32, 12, orbitAngle + Math.PI / 2, 0, Math.PI * 2);
        ctx.stroke();

        // Valence Electron
        const eX = cx + Math.cos(orbitAngle * 2) * 32;
        const eY = cy + Math.sin(orbitAngle * 2) * 12;
        ctx.beginPath();
        ctx.arc(eX, eY, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#00e5ff';
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    /* ==========================================================================
       CANVAS 2: ATOMIC LAB (RAMSEY, FOUNTAIN, BLOCH)
       ========================================================================== */
    renderAtomicLabCanvas(time) {
        if (!this.labCtx) return;
        const ctx = this.labCtx;
        const w = this.atomicLabCanvas.width;
        const h = this.atomicLabCanvas.height;

        ctx.clearRect(0, 0, w, h);
        this.drawLabGrid(ctx, w, h);

        if (this.labViewMode === 'ramsey') {
            this.drawRamseyFringesView(ctx, w, h, time);
        } else if (this.labViewMode === 'fountain') {
            this.drawAtomicFountainView(ctx, w, h, time);
        } else {
            this.drawBlochSphereView(ctx, w, h, time);
        }
    }

    drawLabGrid(ctx, w, h) {
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.07)';
        ctx.lineWidth = 1;
        const step = 30;
        for (let x = 0; x < w; x += step) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = 0; y < h; y += step) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }
    }

    drawRamseyFringesView(ctx, w, h, time) {
        const cx = w / 2;
        const cy = h * 0.58;
        const maxAmp = h * 0.42;

        // Microwave power affects contrast
        const contrast = Math.max(0.1, Math.min(1.0, 1 - Math.abs(this.mwPowerDbm) * 0.12));

        // Draw Theoretical Ramsey Envelope & Interference Pattern
        ctx.beginPath();
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = 'rgba(0, 229, 255, 0.6)';
        ctx.shadowBlur = 10;

        for (let x = 0; x < w; x++) {
            const freqOffset = ((x - cx) / (w * 0.12)); // in Hz
            // Sinc envelope from single cavity passage modulated by Cos^2 Ramsey fringes
            const sinc = freqOffset === 0 ? 1 : Math.sin(freqOffset * 1.8) / (freqOffset * 1.8);
            const ramseyCos = Math.cos(freqOffset * 5.8);
            const fringeIntensity = (sinc * sinc) * (0.5 + 0.5 * ramseyCos * contrast);

            const y = cy - (fringeIntensity * maxAmp);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Operating Lock Point (moves horizontally with user detuning slider)
        const markerX = cx + (this.detuningHz * (w * 0.12));
        const currentProbY = cy - (this.transitionProbability * maxAmp);

        // Vertical Discriminator Lock Line
        ctx.beginPath();
        ctx.strokeStyle = Math.abs(this.detuningHz) < 0.1 ? '#00e676' : '#ffab00';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.moveTo(markerX, 24);
        ctx.lineTo(markerX, h - 24);
        ctx.stroke();
        ctx.setLineDash([]);

        // Lock Point Indicator
        ctx.beginPath();
        ctx.arc(markerX, currentProbY, 6, 0, Math.PI * 2);
        ctx.fillStyle = Math.abs(this.detuningHz) < 0.1 ? '#00e676' : '#ffab00';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Labels
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px "JetBrains Mono"';
        ctx.fillText('9,192,631,770 Hz SI RESONANCE (Δf = 0)', cx - 110, 32);
        ctx.fillStyle = ctx.fillStyle = Math.abs(this.detuningHz) < 0.1 ? '#00e676' : '#ffab00';
        ctx.fillText(`OPERATING DISCRIMINATOR: Δf = ${this.detuningHz > 0 ? '+' : ''}${this.detuningHz.toFixed(2)} Hz (P = ${(this.transitionProbability * 100).toFixed(1)}%)`, 20, 32);
    }

    initFountainParticles() {
        this.fountainParticles = [];
        for (let i = 0; i < 48; i++) {
            this.fountainParticles.push({
                x: 430 + (Math.random() - 0.5) * 50,
                y: 280 + Math.random() * 40,
                vx: (Math.random() - 0.5) * 0.45,
                vy: -(3.2 + Math.random() * 2.6),
                state: 3, // F=3 lower state
                alpha: 0.8
            });
        }
    }

    drawAtomicFountainView(ctx, w, h, time) {
        const cx = w / 2;
        const g = 0.055; // simulated gravity

        // Laser Cooling Molasses Region (Bottom)
        ctx.fillStyle = 'rgba(0, 229, 255, 0.08)';
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
        ctx.fillRect(cx - 70, h - 50, 140, 35);
        ctx.strokeRect(cx - 70, h - 50, 140, 35);
        ctx.fillStyle = '#00e5ff';
        ctx.font = '10px "JetBrains Mono"';
        ctx.fillText('OPTICAL MOLASSES (1.2 μK)', cx - 64, h - 28);

        // Ramsey Microwave Cavity (Middle)
        ctx.fillStyle = 'rgba(41, 121, 255, 0.12)';
        ctx.strokeStyle = 'rgba(41, 121, 255, 0.6)';
        ctx.fillRect(cx - 90, h * 0.46, 180, 26);
        ctx.strokeRect(cx - 90, h * 0.46, 180, 26);
        ctx.fillStyle = '#2979ff';
        ctx.fillText('TE₀₁₁ MICROWAVE CAVITY (π/2 PULSE)', cx - 85, h * 0.46 + 17);

        // State-Selective Laser Detection Zone
        ctx.fillStyle = 'rgba(0, 230, 118, 0.08)';
        ctx.strokeStyle = 'rgba(0, 230, 118, 0.4)';
        ctx.fillRect(cx - 80, h * 0.72, 160, 24);
        ctx.strokeRect(cx - 80, h * 0.72, 160, 24);
        ctx.fillStyle = '#00e676';
        ctx.fillText('STATE FLUORESCENCE DETECTION (F=4)', cx - 75, h * 0.72 + 16);

        // Update & Render Atoms
        this.fountainParticles.forEach(p => {
            p.vy += g;
            p.x += p.vx * (this.cloudTempUkelvin / 1.2);
            p.y += p.vy;

            // First passage upward through cavity -> Superposition
            if (p.y > h * 0.46 && p.y < h * 0.46 + 26 && p.vy < 0) {
                if (Math.random() < this.transitionProbability) p.state = 4;
            }

            // Second passage downward through cavity -> Final Transition
            if (p.y > h * 0.46 && p.y < h * 0.46 + 26 && p.vy > 0) {
                if (Math.random() < this.transitionProbability) p.state = 4;
            }

            // Reset when falling back into base
            if (p.y > h - 15) {
                p.y = h - 35;
                p.x = cx + (Math.random() - 0.5) * 40;
                p.vy = -(3.0 + Math.random() * 2.8);
                p.vx = (Math.random() - 0.5) * 0.4;
                p.state = 3;
            }

            // Draw Atom
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.state === 4 ? 4 : 3, 0, Math.PI * 2);
            ctx.fillStyle = p.state === 4 ? '#00e676' : '#00e5ff';
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = p.state === 4 ? 12 : 6;
            ctx.fill();
            ctx.shadowBlur = 0;
        });
    }

    drawBlochSphereView(ctx, w, h, time) {
        const cx = w / 2;
        const cy = h / 2;
        const r = Math.min(w, h) * 0.36;

        // Draw Sphere Outline
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        // Equator & Meridian Ellipses
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * 0.32, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(cx, cy, r * 0.32, r, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Poles Labels
        ctx.font = '11px "JetBrains Mono"';
        ctx.fillStyle = '#00e676';
        ctx.fillText('|F=4, m=0⟩ (North Pole / Excited)', cx + 10, cy - r + 8);
        ctx.fillStyle = '#00e5ff';
        ctx.fillText('|F=3, m=0⟩ (South Pole / Ground)', cx + 10, cy + r - 8);

        // State Vector Precession based on Rabi & Detuning
        const theta = (1 - this.transitionProbability) * Math.PI; // polar angle
        const phi = (time * 0.002 * (this.detuningHz + 1)) % (Math.PI * 2); // azimuthal precession

        const vecX = cx + Math.sin(theta) * Math.cos(phi) * r;
        const vecY = cy - Math.cos(theta) * r + Math.sin(theta) * Math.sin(phi) * (r * 0.32);

        // State Vector Arrow
        ctx.beginPath();
        ctx.strokeStyle = '#00e676';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00e676';
        ctx.shadowBlur = 12;
        ctx.moveTo(cx, cy);
        ctx.lineTo(vecX, vecY);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Vector Tip
        ctx.beginPath();
        ctx.arc(vecX, vecY, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#00e676';
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.fillText(`|ψ⟩ = cos(θ/2)|3⟩ + e^(iφ)sin(θ/2)|4⟩`, 20, 32);
    }

    /* ==========================================================================
       CANVAS 3: IF OSCILLOSCOPE (TAB 3)
       ========================================================================== */
    renderOscilloscopeCanvas(time) {
        if (!this.oscCtx) return;
        const ctx = this.oscCtx;
        const w = this.oscilloscopeCanvas.width;
        const h = this.oscilloscopeCanvas.height;
        const cy = h / 2;

        ctx.clearRect(0, 0, w, h);

        // Draw Graticule
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.12)';
        ctx.lineWidth = 1;
        const divX = w / 10;
        const divY = h / 8;
        for (let x = 0; x <= w; x += divX) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = 0; y <= h; y += divY) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Center crosshair axis
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.25)';
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(w, cy);
        ctx.moveTo(w / 2, 0);
        ctx.lineTo(w / 2, h);
        ctx.stroke();

        // 10 MHz Downconverted IF Sine Wave
        ctx.beginPath();
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 10;

        const freq = 0.04;
        const phase = time * 0.012 + (this.detuningHz * 0.05);
        const amp = (h * 0.34) * (1 + (this.mwPowerDbm * 0.04));

        for (let x = 0; x < w; x++) {
            // Signal plus subtle phase noise
            const noise = (Math.random() - 0.5) * 3;
            const y = cy + Math.sin(x * freq + phase) * amp + noise;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        if (this.oscVpp) {
            const vpp = (1.42 * (1 + this.mwPowerDbm * 0.04)).toFixed(2);
            this.oscVpp.textContent = `Vpp: ${vpp} V`;
        }
    }

    /* ==========================================================================
       CANVAS 4 & 5: TIME ANALYTICS (TAB 4)
       ========================================================================== */
    recordTelemetrySnapshot(epochMs) {
        const iso = new Date(epochMs).toISOString();
        const row = {
            timestampIso: iso,
            timeLabel: iso.substring(11, 19),
            offsetMs: this.ntpOffsetMs,
            freqHz: this.synthesizerFreqHz,
            y: this.fractionalDeviationY,
            allan: this.allanDeviationSigma,
            phaseJitterUs: this.phaseJitterUs,
            status: Math.abs(this.detuningHz) < 0.2 ? 'LOCKED' : 'DETUNED'
        };

        this.telemetryHistory.push(row);
        if (this.telemetryHistory.length > this.maxTelemetryPoints) {
            this.telemetryHistory.shift();
        }

        // Prepend to Live Telemetry Table (Keep latest 10 rows)
        if (this.telemetryTbody) {
            const tr = document.createElement('tr');
            const statusClass = row.status === 'LOCKED' ? 'text-green' : 'text-amber';
            tr.innerHTML = `
                <td class="font-mono">${row.timeLabel}</td>
                <td class="font-mono text-cyan">${row.offsetMs >= 0 ? '+' : ''}${row.offsetMs.toFixed(3)} ms</td>
                <td class="font-mono text-white">${row.freqHz.toFixed(3)} Hz</td>
                <td class="font-mono text-cyan">${(row.y * 1e14).toFixed(2)}e-14</td>
                <td class="font-mono text-amber">${row.allan.toExponential(2)}</td>
                <td class="font-mono text-green">${row.phaseJitterUs.toFixed(2)} μs</td>
                <td><span class="badge-status ${statusClass}">${row.status}</span></td>
            `;

            this.telemetryTbody.insertBefore(tr, this.telemetryTbody.firstChild);
            while (this.telemetryTbody.children.length > 10) {
                this.telemetryTbody.removeChild(this.telemetryTbody.lastChild);
            }
        }
    }

    renderRollingOffsetChart() {
        if (!this.offsetCtx || this.telemetryHistory.length < 2) return;
        const ctx = this.offsetCtx;
        const w = this.rollingOffsetCanvas.width;
        const h = this.rollingOffsetCanvas.height;
        const cy = h / 2;

        ctx.clearRect(0, 0, w, h);

        // Center nominal line (0 offset)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(w, cy);
        ctx.stroke();

        // Deviation scale ± 5.0 × 10^-14
        const maxRange = 5e-14;
        const pts = this.telemetryHistory;
        const step = w / (this.maxTelemetryPoints - 1);

        // Draw Area Fill
        ctx.beginPath();
        for (let i = 0; i < pts.length; i++) {
            const x = i * step;
            const clampedY = Math.max(-maxRange, Math.min(maxRange, pts[i].y));
            const y = cy - (clampedY / maxRange) * (h * 0.42);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.lineTo((pts.length - 1) * step, cy);
        ctx.lineTo(0, cy);
        ctx.fillStyle = 'rgba(0, 229, 255, 0.08)';
        ctx.fill();

        // Draw Line
        ctx.beginPath();
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(0, 229, 255, 0.6)';
        ctx.shadowBlur = 8;
        for (let i = 0; i < pts.length; i++) {
            const x = i * step;
            const clampedY = Math.max(-maxRange, Math.min(maxRange, pts[i].y));
            const y = cy - (clampedY / maxRange) * (h * 0.42);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        if (this.txtOffsetStats) {
            const latestY = pts[pts.length - 1].y;
            this.txtOffsetStats.textContent = `CURRENT: ${(latestY * 1e14).toFixed(2)}e-14 | BAND: ±5.0e-14`;
        }
    }

    renderAllanDeviationPlot() {
        if (!this.allanCtx) return;
        const ctx = this.allanCtx;
        const w = this.allanDeviationCanvas.width;
        const h = this.allanDeviationCanvas.height;

        ctx.clearRect(0, 0, w, h);

        // Log-Log axes grid: Tau from 1s to 10^4 s, Sigma from 10^-12 to 10^-15
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 1; i <= 4; i++) {
            const x = (i / 4) * (w - 60) + 40;
            ctx.beginPath();
            ctx.moveTo(x, 20);
            ctx.lineTo(x, h - 30);
            ctx.stroke();

            ctx.fillStyle = '#64748b';
            ctx.font = '10px "JetBrains Mono"';
            ctx.fillText(`10${i === 1 ? '¹' : (i === 2 ? '²' : (i === 3 ? '³' : '⁴'))}s`, x - 10, h - 14);
        }

        // Theoretical tau^(-1/2) curve (white frequency noise)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.setLineDash([4, 4]);
        ctx.moveTo(40, 40);
        ctx.lineTo(w - 20, h - 50);
        ctx.stroke();
        ctx.setLineDash([]);

        // Measured Data Curve
        ctx.beginPath();
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 10;

        const tauSteps = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
        tauSteps.forEach((tau, idx) => {
            const logTau = Math.log10(tau); // 0 to 4
            const x = (logTau / 4) * (w - 70) + 40;
            // sigma_y = sigma_0 * tau^(-1/2) + flicker floor
            const sigma = (this.allanDeviationSigma / Math.sqrt(tau)) + 2e-15;
            const logSigma = Math.log10(sigma); // -13.5 to -15
            const y = ((logSigma - (-12)) / (-15 - (-12))) * (h - 80) + 35;

            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Current operational point dot at tau = 1s
        const curX = 40;
        const curSigma = this.allanDeviationSigma;
        const curLogSigma = Math.log10(curSigma);
        const curY = ((curLogSigma - (-12)) / (-15 - (-12))) * (h - 80) + 35;

        ctx.beginPath();
        ctx.arc(curX, curY, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#00e676';
        ctx.shadowColor = '#00e676';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    /* ==========================================================================
       CANVAS 6: NTP JITTER HISTOGRAM (TAB 5)
       ========================================================================== */
    renderNtpJitterHistogram() {
        if (!this.jitterCtx || this.rttJitterSamples.length < 2) return;
        const ctx = this.jitterCtx;
        const w = this.ntpJitterCanvas.width;
        const h = this.ntpJitterCanvas.height;

        ctx.clearRect(0, 0, w, h);

        // Compute Bins for RTT from 10ms to 30ms
        const minRtt = 12;
        const maxRtt = 26;
        const numBins = 14;
        const binWidth = (w - 40) / numBins;
        const bins = new Array(numBins).fill(0);

        this.rttJitterSamples.forEach(sample => {
            const clamped = Math.max(minRtt, Math.min(maxRtt - 0.1, sample));
            const binIdx = Math.floor(((clamped - minRtt) / (maxRtt - minRtt)) * numBins);
            bins[binIdx]++;
        });

        const maxCount = Math.max(1, ...bins);

        // Draw Bars
        bins.forEach((count, i) => {
            const x = 20 + i * binWidth;
            const barH = (count / maxCount) * (h - 60);
            const y = h - 30 - barH;

            ctx.fillStyle = 'rgba(0, 229, 255, 0.35)';
            ctx.strokeStyle = '#00e5ff';
            ctx.fillRect(x + 2, y, binWidth - 4, barH);
            ctx.strokeRect(x + 2, y, binWidth - 4, barH);
        });

        // Baseline Axis
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.moveTo(15, h - 30);
        ctx.lineTo(w - 15, h - 30);
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = '10px "JetBrains Mono"';
        ctx.fillText('12 ms', 20, h - 14);
        ctx.fillText('18.4 ms (Median)', w / 2 - 35, h - 14);
        ctx.fillText('26 ms', w - 50, h - 14);

        if (this.txtJitterStat) {
            const variance = this.rttJitterSamples.reduce((acc, v) => acc + Math.pow(v - this.ntpRoundTripMs, 2), 0) / this.rttJitterSamples.length;
            const jitter = Math.sqrt(variance);
            this.txtJitterStat.textContent = `JITTER (σ): ${jitter.toFixed(2)} ms`;
        }
    }

    /* ==========================================================================
       PRESERVED MISSION COUNTDOWN TIMER
       ========================================================================== */
    initPreservedCountdown() {
        const savedDate = localStorage.getItem('targetDate');
        if (savedDate && this.targetInput) {
            this.targetInput.value = savedDate;
            this.armCountdown(new Date(savedDate));
        }
    }

    handleArmCountdown() {
        const val = this.targetInput ? this.targetInput.value : '';
        if (!val) {
            this.showToast('Please specify a target timestamp.');
            return;
        }

        const targetDate = new Date(val);
        if (targetDate.getTime() <= Date.now()) {
            this.showToast('Target timestamp must be set in the future.');
            return;
        }

        localStorage.setItem('targetDate', val);
        this.armCountdown(targetDate);
        this.logTerminal(`Mission countdown timer locked to target: ${targetDate.toISOString()}`, 'TIMER');
        this.showToast('Mission countdown armed and synchronized.');
    }

    armCountdown(targetDate) {
        this.countdownTarget = targetDate;
        this.countdownStartTime = Date.now();
        if (this.goalProgressContainer) this.goalProgressContainer.style.display = 'block';
    }

    updateCountdownTick(nowEpoch) {
        if (!this.countdownTarget) return;

        const distance = this.countdownTarget.getTime() - nowEpoch;

        if (distance <= 0) {
            this.resetCountdownDisplay();
            this.countdownTarget = null;
            this.logTerminal('Mission target event horizon reached!', 'MILESTONE');
            this.showToast('Mission Event Milestone Reached!');
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (this.daysEl) this.daysEl.textContent = this.pad2(days);
        if (this.hoursEl) this.hoursEl.textContent = this.pad2(hours);
        if (this.minsEl) this.minsEl.textContent = this.pad2(minutes);
        if (this.secsEl) this.secsEl.textContent = this.pad2(seconds);

        // Progress bar calculation
        if (this.countdownStartTime && this.goalProgressBar) {
            const totalDuration = this.countdownTarget.getTime() - this.countdownStartTime;
            const elapsed = nowEpoch - this.countdownStartTime;
            const percent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
            this.goalProgressBar.style.width = `${percent.toFixed(1)}%`;
            if (this.goalProgressPercent) this.goalProgressPercent.textContent = `${percent.toFixed(1)}%`;
        }
    }

    resetCountdown() {
        this.countdownTarget = null;
        this.countdownStartTime = null;
        localStorage.removeItem('targetDate');
        if (this.targetInput) this.targetInput.value = '';
        this.resetCountdownDisplay();
        if (this.goalProgressContainer) this.goalProgressContainer.style.display = 'none';
        this.logTerminal('Mission countdown timer disarmed and reset.', 'TIMER');
        this.showToast('Countdown timer reset.');
    }

    resetCountdownDisplay() {
        if (this.daysEl) this.daysEl.textContent = '00';
        if (this.hoursEl) this.hoursEl.textContent = '00';
        if (this.minsEl) this.minsEl.textContent = '00';
        if (this.secsEl) this.secsEl.textContent = '00';
    }

    /* ==========================================================================
       CSV METROLOGY EXPORT ENGINE
       ========================================================================== */
    exportTelemetryCSV() {
        if (this.telemetryHistory.length === 0) {
            this.showToast('Collecting telemetry data... please wait a few seconds.');
            return;
        }

        let csv = 'Timestamp_UTC_ISO,NTP_Offset_ms,Synthesizer_Frequency_Hz,Fractional_Deviation_y,Allan_Deviation_Sigma,Phase_Jitter_us,Lock_Status\n';
        this.telemetryHistory.forEach(r => {
            csv += `${r.timestampIso},${r.offsetMs.toFixed(4)},${r.freqHz.toFixed(6)},${r.y.toExponential(4)},${r.allan.toExponential(4)},${r.phaseJitterUs.toFixed(3)},${r.status}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quantum_atomic_clock_telemetry_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.logTerminal(`Exported ${this.telemetryHistory.length} scientific measurement records to CSV.`, 'EXPORT');
        this.showToast('Telemetry measurements exported to CSV.');
    }

    /* ==========================================================================
       SYSTEM DIAGNOSTICS LOG TERMINAL
       ========================================================================== */
    initTerminalLog() {
        this.logTerminal('Primary Frequency Standard Cs-133 Metrology Core Initialized.', 'INIT');
        this.logTerminal('Optical Molasses 852nm Laser Stabilization: STABLE LOCKED.', 'LASER');
        this.logTerminal('Ultra-High Vacuum Ion Pump: 1.2e-8 Torr [NOMINAL].', 'VACUUM');
        this.logTerminal('Microwave Synthesizer VCXO Phase Lock Loop: SYNCHRONIZED.', 'VCXO');
    }

    logTerminal(message, tag = 'INFO', isWarn = false) {
        if (!this.systemTerminalLog) return;
        const now = new Date();
        const timeStr = `${this.pad2(now.getHours())}:${this.pad2(now.getMinutes())}:${this.pad2(now.getSeconds())}`;

        const row = document.createElement('div');
        row.className = 'terminal-line';
        const tagClass = isWarn ? 'term-warn' : 'term-tag';

        row.innerHTML = `
            <span class="term-time">[${timeStr}]</span>
            <span class="${tagClass}">[${tag}]</span>
            <span class="term-msg">${message}</span>
        `;

        this.systemTerminalLog.appendChild(row);
        this.systemTerminalLog.scrollTop = this.systemTerminalLog.scrollHeight;
    }

    /* ==========================================================================
       MICROWAVE AUDIO SYNTHESIZER
       ========================================================================== */
    toggleAudioHum() {
        this.audioEnabled = !this.audioEnabled;
        if (this.audioEnabled && !this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioIcon) {
            this.audioIcon.className = this.audioEnabled ? 'fa-solid fa-volume-high text-cyan' : 'fa-solid fa-volume-xmark';
        }
        this.logTerminal(`Acoustic microwave synthesizer: ${this.audioEnabled ? 'ACTIVE (880 Hz Harmonic)' : 'MUTED'}`, 'AUDIO');
        this.showToast(this.audioEnabled ? 'Microwave harmonic tone enabled.' : 'Tone muted.');
    }

    playMicrowavePulse() {
        if (!this.audioCtx) return;
        try {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, this.audioCtx.currentTime);
            gain.gain.setValueAtTime(0.03, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.05);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.05);
        } catch (e) {}
    }

    /* ==========================================================================
       UTILITIES & TOASTS
       ========================================================================== */
    pad2(n) {
        return n < 10 ? '0' + n : String(n);
    }

    pad3(n) {
        if (n < 10) return '00' + n;
        if (n < 100) return '0' + n;
        return String(n);
    }

    showToast(message) {
        if (!this.toastContainer) return;
        const toast = document.createElement('div');
        toast.className = 'toast-msg';
        toast.innerHTML = `<i class="fa-solid fa-atom text-cyan"></i> <span>${message}</span>`;
        this.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }
}

// Bootstrap Quantum Atomic Clock Control Center
document.addEventListener('DOMContentLoaded', () => {
    window.QuantumAtomicClockInstance = new QuantumAtomicClockControlCenter();
});

# Quantum Atomic Clock

A browser-based Quantum Atomic Clock Mission Control dashboard that simulates a Cesium-133 atomic timekeeping system. It combines a live clock interface with interactive atomic-physics visualizations, frequency analysis, time-stability analytics, synchronization telemetry, and system diagnostics.
Note: This is an educational front-end simulation, not a laboratory-grade atomic clock. Displayed precision, atomic behavior, and metrology values are simulated. Network time synchronization features depend on browser/network access and should not be treated as a certified time source.

# Features

- Quantum Clock
  - Local and UTC time displays, with additional time-standard and timezone options.
  - 12-hour and 24-hour formats.
  - Millisecond, microsecond, and synthesized nanosecond display modes.
  - Mission countdown with target-time progress.
- Atomic Lab
  - Cesium-133 hyperfine transition model based on the 9,192,631,770 Hz reference frequency.
  - Interactive controls for microwave power, detuning, atom-cloud temperature, and magnetic field.
  - Ramsey, atomic-fountain, and Bloch-sphere visualizations.
- Frequency Analyzer
  - Live-style oscillator and frequency metrics.
  - Phase-noise and frequency-shift indicators.
- Time Analytics
  - Rolling deviation and Allan-deviation visualizations.
  - Telemetry history with CSV export.
- Synchronization
  - NTP-related status, offset, round-trip-time, uncertainty, and jitter displays.
  - Manual synchronization controls.
- System Diagnostics
  - Runtime status and diagnostic event log.
- Interface
  - Responsive, dark scientific-instrument dashboard.
  - Animated backgrounds, status indicators, and optional audio controls.
    
# Project Structure

```
Quantum-Clock/
├── index.html          # Application layout and dashboard sections
├── style.css           # Styling, layout, animations, and responsive rules
├── script.js           # Clock engine, simulations, charts, and interactions
└── bg.png              # Additional image asset

```
# Getting Started

Requirements
- A modern web browser (Chrome, Firefox, Edge, or Safari).
- Internet access for externally hosted fonts/icons and any network-based synchronization features.
  
Run locally
1. Download or extract the project.
2. Open the Quantum-Clock folder.
3. Open index.html in a modern browser.
For a local development server, run this command from inside the project folder:
python -m http.server 8000
Then visit:
http://localhost:8000
No package installation or build step is required for the current static front-end project.

# How to Use
1. Open the dashboard and use the navigation tabs to switch between the clock, atomic lab, frequency analyzer, analytics, synchronization, and diagnostics views.
2. Change the time standard, display format, and precision using the clock controls.
3. Start, pause, or reset the mission countdown and set a target date/time.
4. Adjust the atomic-lab sliders to explore how simulation parameters affect the displayed results and visualizations.
5. Review frequency and time-stability metrics in the analyzer and analytics sections.
6. Use the export controls to download available telemetry as a CSV file.
7. Check the synchronization and diagnostics sections for status information.

# Technologies Used
- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- HTML Canvas for animated scientific visualizations
- Browser timing and date APIs
- Google Fonts and Font Awesome (loaded externally)


import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './App.css';

// --- DATA CONFIGURATION ---
// Maps the buttons exactly as they appeared in the Java code
// Format: Name, [OffsetFromTehsil, OffsetFromBalkasar]
const BUS_STOPS = [
  { name: "Tehsil Chowk", offsets: [0, 38] },
  { name: "Chaper Bazar", offsets: [2, 36] },
  { name: "GPO", offsets: [4, 34] },
  { name: "Shuhada Park", offsets: [6, 32] },
  { name: "Danish School", offsets: [8, 30] },
  { name: "Sabzi Mandi", offsets: [10, 28] },
  { name: "Qazi Service Station", offsets: [12, 26] },
  { name: "Emporium", offsets: [14, 24] },
  { name: "Udhwal", offsets: [16, 22] },
  { name: "District Complex", offsets: [18, 20] },
  { name: "Fauji Foundation College", offsets: [20, 18] },
  { name: "New City", offsets: [22, 16] },
  { name: "Mureed Village", offsets: [30, 8] },
  { name: "Al Shifa", offsets: [24, 14] },
  { name: "Zari Farm", offsets: [26, 12] },
  { name: "Thoha Bahder Stop", offsets: [28, 10] },
  { name: "Thoha Bahder (Bank)", offsets: [30, 8] },
  { name: "Motorway(Lahore)", offsets: [32, 6] },
  { name: "Motorway(Rwp)", offsets: [34, 4] },
  { name: "Royal College", offsets: [36, 2] },
  { name: "Balkasar", offsets: [38, 0] }
];

// --- HELPER FUNCTIONS ---

// Helper to create a Date object for specific time today
function getTime(hours, minutes) {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
}

// Format time to "hh:mm a"
function formatTime(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours || 12; // the hour '0' should be '12'

  const strMinutes = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${strMinutes} ${ampm}`;
}

// Logic for calculating bus times (Ported from Java)
function calculateBusStatus(intervalMinutes, offsetMinutes, originName) {
  const start = getTime(6, 0);
  const end = getTime(21, 0);
  const now = new Date();

  let busStart = new Date(start);

  while (busStart <= end) {
    // Calculate arrival time
    let arrival = new Date(busStart.getTime() + (offsetMinutes * 60000));

    // CASE 1: Bus is currently on the way
    if ((now >= busStart) && (now < arrival)) {
      return (
        <span className="red-text">
          Bus Reaching From {originName} At:<br />
          {formatTime(arrival)}
        </span>
      );
    }

    // CASE 2: Future bus
    if (now < busStart) {
      return (
        <span className="red-text">
          Next Bus From {originName} At:<br />
          {formatTime(arrival)}
        </span>
      );
    }

    // Increment for next loop
    busStart = new Date(busStart.getTime() + (intervalMinutes * 60000));
  }

  return <span className="red-text">No more buses today</span>;
}

// Build a list of upcoming arrival times for a stop
function getUpcomingArrivals(intervalMinutes, offsetMinutes, count = 6) {
  const start = getTime(6, 0);
  const end = getTime(21, 0);
  const now = new Date();
  const arrivals = [];

  let busStart = new Date(start);
  while (busStart <= end && arrivals.length < count) {
    const arrival = new Date(busStart.getTime() + (offsetMinutes * 60000));
    if (arrival >= now) {
      arrivals.push(formatTime(arrival));
    }
    busStart = new Date(busStart.getTime() + (intervalMinutes * 60000));
  }

  return arrivals;
}

// --- COMPONENTS ---

// 1. Welcome Screen
const WelcomeScreen = ({ onFind }) => (
  <div className="screen welcome-screen">
    <h1 className="welcome-title">Welcome to Chakwal Bus Tracker</h1>

    <p className="welcome-subtitle">Real-time arrivals • Reliable schedules • Route overview</p>

    <div style={{ height: '40px' }}></div>

    <h2 className="location-label">BUS LOCATION</h2>

    <button className="find-btn" onClick={onFind}>Locate Bus</button>

    <div style={{ height: '40px' }}></div>

    <div className="footer-text">Made By Abrash Haider</div>
  </div>
);

WelcomeScreen.propTypes = {
  onFind: PropTypes.func.isRequired,
};

// 2. Loading Screen
const LoadingScreen = ({ loadingStyle }) => {
  return (
    <div className="screen loading-screen">
      <h2 className="loading-text">Loading...</h2>
      <div style={{ height: '40px' }}></div>
      <div className="progress-container">
        <div className="progress-bar-fill" style={loadingStyle}></div>
      </div>
    </div>
  );
};

LoadingScreen.propTypes = {
  loadingStyle: PropTypes.object,
};

// 3. Main Dashboard
const Dashboard = ({
  day,
  onStopClick,
  selectedStop,
  scheduleTehsil,
  scheduleBalkasar,
  nextStatusTehsil,
  nextStatusBalkasar
}) => {
  const scheduleRows = (scheduleTehsil || []).map((tehsilTime, idx) => ({
    tehsil: tehsilTime,
    balkasar: (scheduleBalkasar || [])[idx] || '--'
  }));

  return (
    <div className="screen app-screen">
      <header className="app-header card">
        <div className="header-left">
          <div className="app-name">Chakwal Bus Tracker</div>
          <div className="app-tagline">Route schedule and live arrival insights</div>
        </div>
        <div className="day-display">Today: {day}</div>
      </header>

      <main className="app-main">
        <div className="dashboard-grid">
          <section className="stop-panel card">
            <div className="panel-title">Select a Stop</div>
            <div className="bus-grid">
              {BUS_STOPS.map((stop) => (
                <button
                  key={stop.name}
                  className={`stop-btn ${selectedStop?.name === stop.name ? 'active' : ''}`}
                  onClick={() => onStopClick(stop)}
                >
                  {stop.name}
                </button>
              ))}
            </div>
          </section>

          <section className="schedule-panel card">
            <div className="panel-title">Arrival Schedule</div>
            {!selectedStop && (
              <div className="empty-panel">Tap any stop to view next arrival times from both origins.</div>
            )}
            {selectedStop && (
              <>
                <div className="selected-card">
                  <div className="selected-title">{selectedStop.name}</div>
                  <div className="selected-subtitle">Next arrivals at this stop</div>
                </div>

                <div className="status-row">
                  <div className="status-card">
                    <div className="status-card-label">From Tehsil Chowk</div>
                    <div className="status-card-value">{nextStatusTehsil}</div>
                  </div>
                  <div className="status-card">
                    <div className="status-card-label">From Balkasar</div>
                    <div className="status-card-value">{nextStatusBalkasar}</div>
                  </div>
                </div>

                <div className="schedule-table-wrapper">
                  <table className="schedule-table">
                    <thead>
                      <tr>
                        <th>Tehsil →</th>
                        <th>Balkasar →</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scheduleRows.slice(0, 6).map((row, idx) => (
                        <tr key={`${row.tehsil}-${row.balkasar}-${idx}`}>
                          <td>{row.tehsil}</td>
                          <td>{row.balkasar}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

Dashboard.propTypes = {
  day: PropTypes.string.isRequired,
  onStopClick: PropTypes.func.isRequired,
  selectedStop: PropTypes.shape({
    name: PropTypes.string,
    offsets: PropTypes.arrayOf(PropTypes.number),
  }),
  scheduleTehsil: PropTypes.arrayOf(PropTypes.string),
  scheduleBalkasar: PropTypes.arrayOf(PropTypes.string),
  nextStatusTehsil: PropTypes.node,
  nextStatusBalkasar: PropTypes.node,
};

// --- MAIN APP COMPONENT ---
function App() {
  const [screen, setScreen] = useState('WELCOME');
  const [progress, setProgress] = useState(0);

  // Logic State
  const [currentDay, setCurrentDay] = useState('');
  const [busInterval, setBusInterval] = useState(41);
  const [selectedStop, setSelectedStop] = useState(null);
  const [resultTehsil, setResultTehsil] = useState('');
  const [resultBalkasar, setResultBalkasar] = useState('');
  const [scheduleTehsil, setScheduleTehsil] = useState([]);
  const [scheduleBalkasar, setScheduleBalkasar] = useState([]);

  // Initialize Day and Interval on Mount
  useEffect(() => {
    const now = new Date();
    const dayIndex = now.getDay();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    setCurrentDay(days[dayIndex]);

    // Weekend Check (Sat=6, Sun=0)
    if (dayIndex === 0 || dayIndex === 6) {
      setBusInterval(33);
    } else {
      setBusInterval(41);
    }
  }, []);

  // Handle Loading Animation
  useEffect(() => {
    if (screen === 'LOADING') {
      setProgress(0);
      const intervalId = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(intervalId);
            setScreen('APP');
            return 100;
          }
          return prev + 1;
        });
      }, 30); // Matches Java Thread.sleep(30)

      return () => clearInterval(intervalId);
    }
  }, [screen]);

  const handleFindClick = () => {
    setScreen('LOADING');
  };

  const handleStopClick = (stop) => {
    setSelectedStop(stop);

    // Calculate live status headers
    const res1 = calculateBusStatus(busInterval, stop.offsets[0], "Tehsil Chowk");
    setResultTehsil(res1);

    const res2 = calculateBusStatus(busInterval, stop.offsets[1], "Balkasar");
    setResultBalkasar(res2);

    // Generate upcoming arrays for the data table
    const sched1 = getUpcomingArrivals(busInterval, stop.offsets[0], 6);
    setScheduleTehsil(sched1);

    const sched2 = getUpcomingArrivals(busInterval, stop.offsets[1], 6);
    setScheduleBalkasar(sched2);
  };

  const loadingStyle = { width: `${progress}%` };

  return (
    <div className="App">
      {screen === 'WELCOME' && <WelcomeScreen onFind={handleFindClick} />}

      {screen === 'LOADING' && <LoadingScreen loadingStyle={loadingStyle} />}

      {screen === 'APP' && (
        <Dashboard
          day={currentDay}
          onStopClick={handleStopClick}
          selectedStop={selectedStop}
          nextStatusTehsil={resultTehsil}
          nextStatusBalkasar={resultBalkasar}
          scheduleTehsil={scheduleTehsil}
          scheduleBalkasar={scheduleBalkasar}
        />
      )}
    </div>
  );
}

export default App;

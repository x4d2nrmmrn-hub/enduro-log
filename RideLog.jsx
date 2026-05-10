import React, { useState, useEffect, useRef } from 'react';
import { Plus, MapPin, Clock, Camera, Wrench, BarChart3, X, Calendar, Bike, AlertCircle, CheckCircle2, ChevronRight, Trash2, Cloud, CloudRain, Sun, Snowflake, Edit3 } from 'lucide-react';

const CONDITIONS = [
  { id: 'dry', label: 'Dry / Hardpack', icon: Sun, color: '#d4a017' },
  { id: 'loamy', label: 'Loamy / Tacky', icon: Cloud, color: '#7a9461' },
  { id: 'wet', label: 'Wet / Muddy', icon: CloudRain, color: '#4a7c8a' },
  { id: 'snow', label: 'Snow / Ice', icon: Snowflake, color: '#a8c5d6' },
];

const DEFAULT_BIKES = [
  {
    id: 'beta300',
    name: 'Beta 300RR',
    year: 2023,
    color: '#c8102e',
    maintenance: [
      { id: 'oil', name: 'Transmission Oil', interval: 15, type: 'hours' },
      { id: 'air', name: 'Air Filter Clean', interval: 10, type: 'hours' },
      { id: 'tires', name: 'Tire Inspection', interval: 20, type: 'hours' },
      { id: 'plug', name: 'Spark Plug', interval: 30, type: 'hours' },
    ],
  },
  {
    id: 'klx140',
    name: 'Kawasaki KLX 140',
    year: 2022,
    color: '#4a7c2a',
    maintenance: [
      { id: 'oil', name: 'Engine Oil', interval: 20, type: 'hours' },
      { id: 'air', name: 'Air Filter Clean', interval: 15, type: 'hours' },
      { id: 'chain', name: 'Chain Lube/Adjust', interval: 10, type: 'hours' },
    ],
  },
];

export default function RideLog() {
  const [view, setView] = useState('rides');
  const [rides, setRides] = useState([]);
  const [bikes, setBikes] = useState(DEFAULT_BIKES);
  const [maintenanceLog, setMaintenanceLog] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddRide, setShowAddRide] = useState(false);
  const [showAddBike, setShowAddBike] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);

  // Load data on mount
  useEffect(() => {
    async function load() {
      try {
        const [ridesRes, bikesRes, maintRes] = await Promise.allSettled([
          window.storage.get('rides'),
          window.storage.get('bikes'),
          window.storage.get('maintenance'),
        ]);

        if (ridesRes.status === 'fulfilled' && ridesRes.value) {
          setRides(JSON.parse(ridesRes.value.value));
        }
        if (bikesRes.status === 'fulfilled' && bikesRes.value) {
          setBikes(JSON.parse(bikesRes.value.value));
        }
        if (maintRes.status === 'fulfilled' && maintRes.value) {
          setMaintenanceLog(JSON.parse(maintRes.value.value));
        }
      } catch (e) {
        console.log('First run or no data');
      }
      setLoading(false);
    }
    load();
  }, []);

  const saveRides = async (newRides) => {
    setRides(newRides);
    try {
      await window.storage.set('rides', JSON.stringify(newRides));
    } catch (e) { console.error(e); }
  };

  const saveBikes = async (newBikes) => {
    setBikes(newBikes);
    try {
      await window.storage.set('bikes', JSON.stringify(newBikes));
    } catch (e) { console.error(e); }
  };

  const saveMaintenance = async (newMaint) => {
    setMaintenanceLog(newMaint);
    try {
      await window.storage.set('maintenance', JSON.stringify(newMaint));
    } catch (e) { console.error(e); }
  };

  const addRide = (ride) => {
    const newRide = { ...ride, id: Date.now().toString() };
    saveRides([newRide, ...rides]);
    setShowAddRide(false);
  };

  const deleteRide = (id) => {
    saveRides(rides.filter(r => r.id !== id));
    setSelectedRide(null);
  };

  const addBike = (bike) => {
    const newBike = {
      ...bike,
      id: Date.now().toString(),
      maintenance: [
        { id: 'oil', name: 'Engine Oil', interval: 20, type: 'hours' },
        { id: 'air', name: 'Air Filter Clean', interval: 15, type: 'hours' },
      ],
    };
    saveBikes([...bikes, newBike]);
    setShowAddBike(false);
  };

  const logMaintenance = (bikeId, maintId, atHours) => {
    const newLog = { ...maintenanceLog };
    if (!newLog[bikeId]) newLog[bikeId] = {};
    newLog[bikeId][maintId] = { lastDone: atHours, date: new Date().toISOString() };
    saveMaintenance(newLog);
  };

  const getBikeHours = (bikeId) => {
    return rides
      .filter(r => r.bikeId === bikeId)
      .reduce((sum, r) => sum + parseFloat(r.hours || 0), 0);
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.loadingText}>LOADING RIDE LOG...</div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <style>{globalCSS}</style>

      {/* Topo background */}
      <div style={styles.topoBackground} />

      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>
            <div style={styles.logoMark}>RL</div>
            <div>
              <div style={styles.logoTitle}>RIDE LOG</div>
              <div style={styles.logoSub}>SHUSWAP / BC</div>
            </div>
          </div>
          <div style={styles.headerStats}>
            <div style={styles.headerStat}>
              <span style={styles.headerStatNum}>{rides.length}</span>
              <span style={styles.headerStatLabel}>RIDES</span>
            </div>
            <div style={styles.headerStat}>
              <span style={styles.headerStatNum}>
                {rides.reduce((s, r) => s + parseFloat(r.hours || 0), 0).toFixed(1)}
              </span>
              <span style={styles.headerStatLabel}>HRS</span>
            </div>
          </div>
        </div>
      </header>

      <nav style={styles.nav}>
        {[
          { id: 'rides', label: 'Rides', icon: Calendar },
          { id: 'bikes', label: 'Bikes', icon: Bike },
          { id: 'maint', label: 'Maint.', icon: Wrench },
          { id: 'stats', label: 'Stats', icon: BarChart3 },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              style={{
                ...styles.navBtn,
                ...(view === tab.id ? styles.navBtnActive : {}),
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <main style={styles.main}>
        {view === 'rides' && (
          <RidesView
            rides={rides}
            bikes={bikes}
            onAdd={() => setShowAddRide(true)}
            onSelect={setSelectedRide}
          />
        )}
        {view === 'bikes' && (
          <BikesView
            bikes={bikes}
            rides={rides}
            getBikeHours={getBikeHours}
            onAdd={() => setShowAddBike(true)}
          />
        )}
        {view === 'maint' && (
          <MaintenanceView
            bikes={bikes}
            maintenanceLog={maintenanceLog}
            getBikeHours={getBikeHours}
            onLog={logMaintenance}
          />
        )}
        {view === 'stats' && <StatsView rides={rides} bikes={bikes} />}
      </main>

      {showAddRide && (
        <AddRideModal
          bikes={bikes}
          onClose={() => setShowAddRide(false)}
          onSave={addRide}
        />
      )}
      {showAddBike && (
        <AddBikeModal
          onClose={() => setShowAddBike(false)}
          onSave={addBike}
        />
      )}
      {selectedRide && (
        <RideDetailModal
          ride={selectedRide}
          bikes={bikes}
          onClose={() => setSelectedRide(null)}
          onDelete={deleteRide}
        />
      )}
    </div>
  );
}

// ============ VIEWS ============

function RidesView({ rides, bikes, onAdd, onSelect }) {
  return (
    <div style={styles.viewWrap}>
      <div style={styles.viewHeader}>
        <div>
          <div style={styles.viewTitle}>RIDE HISTORY</div>
          <div style={styles.viewSub}>{rides.length} entries logged</div>
        </div>
        <button onClick={onAdd} style={styles.primaryBtn}>
          <Plus size={18} />
          <span>NEW RIDE</span>
        </button>
      </div>

      {rides.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>
            <Bike size={48} strokeWidth={1.5} />
          </div>
          <div style={styles.emptyTitle}>NO RIDES LOGGED YET</div>
          <div style={styles.emptySub}>Hit "NEW RIDE" after your next session</div>
        </div>
      ) : (
        <div style={styles.rideList}>
          {rides.map(ride => {
            const bike = bikes.find(b => b.id === ride.bikeId) || { name: 'Unknown', color: '#666' };
            const cond = CONDITIONS.find(c => c.id === ride.condition) || CONDITIONS[0];
            const CondIcon = cond.icon;
            return (
              <div
                key={ride.id}
                onClick={() => onSelect(ride)}
                style={styles.rideCard}
                className="ride-card"
              >
                <div style={{...styles.rideAccent, background: bike.color}} />
                <div style={styles.rideContent}>
                  <div style={styles.rideTop}>
                    <div style={styles.rideDate}>
                      {new Date(ride.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                    </div>
                    <div style={{...styles.rideHours, color: bike.color}}>
                      {parseFloat(ride.hours).toFixed(1)} <span style={{fontSize: 10, opacity: 0.7}}>HRS</span>
                    </div>
                  </div>
                  <div style={styles.rideLocation}>
                    <MapPin size={14} />
                    <span>{ride.location}</span>
                  </div>
                  <div style={styles.rideMeta}>
                    <span style={styles.rideMetaItem}>
                      <Bike size={12} /> {bike.name}
                    </span>
                    <span style={{...styles.rideMetaItem, color: cond.color}}>
                      <CondIcon size={12} /> {cond.label}
                    </span>
                    {ride.photos?.length > 0 && (
                      <span style={styles.rideMetaItem}>
                        <Camera size={12} /> {ride.photos.length}
                      </span>
                    )}
                  </div>
                  {ride.notes && (
                    <div style={styles.rideNotesPreview}>
                      "{ride.notes.slice(0, 80)}{ride.notes.length > 80 ? '...' : ''}"
                    </div>
                  )}
                </div>
                <ChevronRight size={20} style={{opacity: 0.3, alignSelf: 'center'}} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BikesView({ bikes, rides, getBikeHours, onAdd }) {
  return (
    <div style={styles.viewWrap}>
      <div style={styles.viewHeader}>
        <div>
          <div style={styles.viewTitle}>THE GARAGE</div>
          <div style={styles.viewSub}>{bikes.length} bikes registered</div>
        </div>
        <button onClick={onAdd} style={styles.primaryBtn}>
          <Plus size={18} />
          <span>ADD BIKE</span>
        </button>
      </div>

      <div style={styles.bikeGrid}>
        {bikes.map(bike => {
          const hours = getBikeHours(bike.id);
          const rideCount = rides.filter(r => r.bikeId === bike.id).length;
          return (
            <div key={bike.id} style={styles.bikeCard}>
              <div style={{...styles.bikeStripe, background: bike.color}} />
              <div style={{...styles.bikeYear, color: bike.color}}>{bike.year}</div>
              <div style={styles.bikeName}>{bike.name}</div>
              <div style={styles.bikeStatRow}>
                <div style={styles.bikeStat}>
                  <div style={styles.bikeStatNum}>{hours.toFixed(1)}</div>
                  <div style={styles.bikeStatLabel}>TOTAL HRS</div>
                </div>
                <div style={styles.bikeStatDivider} />
                <div style={styles.bikeStat}>
                  <div style={styles.bikeStatNum}>{rideCount}</div>
                  <div style={styles.bikeStatLabel}>RIDES</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MaintenanceView({ bikes, maintenanceLog, getBikeHours, onLog }) {
  return (
    <div style={styles.viewWrap}>
      <div style={styles.viewHeader}>
        <div>
          <div style={styles.viewTitle}>MAINTENANCE</div>
          <div style={styles.viewSub}>service intervals & reminders</div>
        </div>
      </div>

      {bikes.map(bike => {
        const totalHours = getBikeHours(bike.id);
        return (
          <div key={bike.id} style={styles.maintBikeSection}>
            <div style={styles.maintBikeHeader}>
              <div style={{...styles.maintBikeStripe, background: bike.color}} />
              <div style={styles.maintBikeName}>{bike.name}</div>
              <div style={{...styles.maintBikeHours, color: bike.color}}>
                {totalHours.toFixed(1)} HRS
              </div>
            </div>
            <div style={styles.maintList}>
              {bike.maintenance.map(item => {
                const log = maintenanceLog[bike.id]?.[item.id];
                const lastHours = log?.lastDone || 0;
                const hoursOnService = totalHours - lastHours;
                const remaining = item.interval - hoursOnService;
                const pct = Math.min(100, (hoursOnService / item.interval) * 100);
                const overdue = remaining < 0;
                const warning = remaining < item.interval * 0.2 && !overdue;

                let statusColor = '#7a9461';
                if (overdue) statusColor = '#c8102e';
                else if (warning) statusColor = '#d4a017';

                return (
                  <div key={item.id} style={styles.maintItem}>
                    <div style={styles.maintItemTop}>
                      <div>
                        <div style={styles.maintItemName}>{item.name}</div>
                        <div style={styles.maintItemSub}>
                          Every {item.interval} hrs
                          {log && ` · Last done at ${lastHours.toFixed(1)} hrs`}
                        </div>
                      </div>
                      <div style={{...styles.maintStatus, color: statusColor}}>
                        {overdue ? (
                          <>
                            <AlertCircle size={14} />
                            <span>{Math.abs(remaining).toFixed(1)} HRS OVERDUE</span>
                          </>
                        ) : warning ? (
                          <>
                            <AlertCircle size={14} />
                            <span>{remaining.toFixed(1)} HRS LEFT</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={14} />
                            <span>{remaining.toFixed(1)} HRS LEFT</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div style={styles.maintBar}>
                      <div style={{
                        ...styles.maintBarFill,
                        width: `${pct}%`,
                        background: statusColor,
                      }} />
                    </div>
                    <button
                      style={styles.maintLogBtn}
                      onClick={() => onLog(bike.id, item.id, totalHours)}
                    >
                      MARK DONE @ {totalHours.toFixed(1)} HRS
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatsView({ rides, bikes }) {
  const totalHours = rides.reduce((s, r) => s + parseFloat(r.hours || 0), 0);
  const totalRides = rides.length;
  const avgHours = totalRides > 0 ? totalHours / totalRides : 0;

  // By condition
  const byCondition = CONDITIONS.map(c => ({
    ...c,
    hours: rides.filter(r => r.condition === c.id).reduce((s, r) => s + parseFloat(r.hours || 0), 0),
    count: rides.filter(r => r.condition === c.id).length,
  }));

  // By bike
  const byBike = bikes.map(b => ({
    ...b,
    hours: rides.filter(r => r.bikeId === b.id).reduce((s, r) => s + parseFloat(r.hours || 0), 0),
    count: rides.filter(r => r.bikeId === b.id).length,
  }));

  // Last 6 months
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = d.toLocaleDateString('en-CA', { month: 'short' }).toUpperCase();
    const hours = rides
      .filter(r => {
        const rd = new Date(r.date);
        return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear();
      })
      .reduce((s, r) => s + parseFloat(r.hours || 0), 0);
    months.push({ label: monthStr, hours });
  }
  const maxMonth = Math.max(...months.map(m => m.hours), 1);

  // Top locations
  const locCounts = {};
  rides.forEach(r => {
    locCounts[r.location] = (locCounts[r.location] || 0) + parseFloat(r.hours || 0);
  });
  const topLocations = Object.entries(locCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div style={styles.viewWrap}>
      <div style={styles.viewHeader}>
        <div>
          <div style={styles.viewTitle}>STATISTICS</div>
          <div style={styles.viewSub}>your riding by the numbers</div>
        </div>
      </div>

      <div style={styles.statBigGrid}>
        <div style={styles.statBigCard}>
          <div style={styles.statBigNum}>{totalHours.toFixed(1)}</div>
          <div style={styles.statBigLabel}>TOTAL HOURS</div>
        </div>
        <div style={styles.statBigCard}>
          <div style={styles.statBigNum}>{totalRides}</div>
          <div style={styles.statBigLabel}>TOTAL RIDES</div>
        </div>
        <div style={styles.statBigCard}>
          <div style={styles.statBigNum}>{avgHours.toFixed(1)}</div>
          <div style={styles.statBigLabel}>AVG HRS/RIDE</div>
        </div>
      </div>

      {totalRides > 0 && (
        <>
          <div style={styles.statSection}>
            <div style={styles.statSectionTitle}>LAST 6 MONTHS</div>
            <div style={styles.barChart}>
              {months.map((m, i) => (
                <div key={i} style={styles.barCol}>
                  <div style={styles.barValue}>{m.hours > 0 ? m.hours.toFixed(1) : ''}</div>
                  <div style={styles.barTrack}>
                    <div style={{
                      ...styles.barFill,
                      height: `${(m.hours / maxMonth) * 100}%`,
                    }} />
                  </div>
                  <div style={styles.barLabel}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.statSection}>
            <div style={styles.statSectionTitle}>BY BIKE</div>
            {byBike.filter(b => b.count > 0).map(b => (
              <div key={b.id} style={styles.statRow}>
                <div style={styles.statRowLabel}>
                  <div style={{...styles.statRowDot, background: b.color}} />
                  {b.name}
                </div>
                <div style={styles.statRowBar}>
                  <div style={{
                    ...styles.statRowBarFill,
                    width: `${(b.hours / totalHours) * 100}%`,
                    background: b.color,
                  }} />
                </div>
                <div style={styles.statRowVal}>{b.hours.toFixed(1)} hrs</div>
              </div>
            ))}
          </div>

          <div style={styles.statSection}>
            <div style={styles.statSectionTitle}>BY CONDITION</div>
            {byCondition.filter(c => c.count > 0).map(c => {
              const Icon = c.icon;
              return (
                <div key={c.id} style={styles.statRow}>
                  <div style={styles.statRowLabel}>
                    <Icon size={14} style={{color: c.color}} />
                    {c.label}
                  </div>
                  <div style={styles.statRowBar}>
                    <div style={{
                      ...styles.statRowBarFill,
                      width: `${(c.hours / totalHours) * 100}%`,
                      background: c.color,
                    }} />
                  </div>
                  <div style={styles.statRowVal}>{c.hours.toFixed(1)} hrs</div>
                </div>
              );
            })}
          </div>

          {topLocations.length > 0 && (
            <div style={styles.statSection}>
              <div style={styles.statSectionTitle}>TOP SPOTS</div>
              {topLocations.map(([loc, hrs], i) => (
                <div key={loc} style={styles.locationRow}>
                  <div style={styles.locationRank}>{String(i + 1).padStart(2, '0')}</div>
                  <div style={styles.locationName}>{loc}</div>
                  <div style={styles.locationHrs}>{hrs.toFixed(1)} hrs</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============ MODALS ============

function AddRideModal({ bikes, onClose, onSave }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hours, setHours] = useState('');
  const [location, setLocation] = useState('');
  const [bikeId, setBikeId] = useState(bikes[0]?.id || '');
  const [condition, setCondition] = useState('dry');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState([]);
  const [gps, setGps] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const fileRef = useRef();

  const handlePhotos = async (e) => {
    const files = Array.from(e.target.files);
    const photoData = await Promise.all(
      files.map(f => new Promise(res => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result);
        reader.readAsDataURL(f);
      }))
    );
    setPhotos([...photos, ...photoData]);
  };

  const captureGPS = () => {
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
      },
      err => {
        alert('Could not get GPS: ' + err.message);
        setGpsLoading(false);
      }
    );
  };

  const handleSave = () => {
    if (!hours || !location) {
      alert('Hours and location are required');
      return;
    }
    onSave({ date, hours, location, bikeId, condition, notes, photos, gps });
  };

  return (
    <div style={styles.modal} onClick={onClose}>
      <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div style={styles.modalTitle}>NEW RIDE</div>
          <button onClick={onClose} style={styles.iconBtn}><X size={20} /></button>
        </div>

        <div style={styles.modalBody}>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>DATE</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>HOURS</label>
              <input type="number" step="0.1" placeholder="2.5" value={hours} onChange={e => setHours(e.target.value)} style={styles.input} />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>LOCATION</label>
            <div style={{display: 'flex', gap: 8}}>
              <input type="text" placeholder="e.g. Crawford Falls, Salmon Arm" value={location} onChange={e => setLocation(e.target.value)} style={{...styles.input, flex: 1}} />
              <button onClick={captureGPS} style={styles.gpsBtn} disabled={gpsLoading}>
                <MapPin size={14} />
                {gps ? '✓' : (gpsLoading ? '...' : 'GPS')}
              </button>
            </div>
            {gps && (
              <div style={styles.gpsCoords}>
                {gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}
              </div>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>BIKE</label>
            <div style={styles.chipRow}>
              {bikes.map(b => (
                <button
                  key={b.id}
                  onClick={() => setBikeId(b.id)}
                  style={{
                    ...styles.chip,
                    ...(bikeId === b.id ? {...styles.chipActive, borderColor: b.color, color: b.color} : {}),
                  }}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>CONDITIONS</label>
            <div style={styles.chipRow}>
              {CONDITIONS.map(c => {
                const Icon = c.icon;
                return (
                  <button
                    key={c.id}
                    onClick={() => setCondition(c.id)}
                    style={{
                      ...styles.chip,
                      ...(condition === c.id ? {...styles.chipActive, borderColor: c.color, color: c.color} : {}),
                    }}
                  >
                    <Icon size={14} />
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>PHOTOS</label>
            <div style={styles.photoGrid}>
              {photos.map((p, i) => (
                <div key={i} style={styles.photoThumb}>
                  <img src={p} alt="" style={styles.photoImg} />
                  <button
                    onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                    style={styles.photoRemove}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <button onClick={() => fileRef.current?.click()} style={styles.photoAdd}>
                <Camera size={18} />
                <span style={{fontSize: 10, marginTop: 4}}>ADD</span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotos}
                style={{display: 'none'}}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>NOTES</label>
            <textarea
              placeholder="How'd it go? Trail notes, bike notes, what you'd do different..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{...styles.input, minHeight: 80, resize: 'vertical', fontFamily: 'inherit'}}
            />
          </div>
        </div>

        <div style={styles.modalFooter}>
          <button onClick={onClose} style={styles.secondaryBtn}>CANCEL</button>
          <button onClick={handleSave} style={styles.primaryBtn}>SAVE RIDE</button>
        </div>
      </div>
    </div>
  );
}

function AddBikeModal({ onClose, onSave }) {
  const [name, setName] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [color, setColor] = useState('#c8102e');

  const handleSave = () => {
    if (!name) { alert('Name required'); return; }
    onSave({ name, year: parseInt(year), color });
  };

  return (
    <div style={styles.modal} onClick={onClose}>
      <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div style={styles.modalTitle}>ADD BIKE</div>
          <button onClick={onClose} style={styles.iconBtn}><X size={20} /></button>
        </div>
        <div style={styles.modalBody}>
          <div style={styles.formGroup}>
            <label style={styles.label}>NAME / MODEL</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Husqvarna FE 350" style={styles.input} />
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>YEAR</label>
              <input type="number" value={year} onChange={e => setYear(e.target.value)} style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>ACCENT COLOR</label>
              <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{...styles.input, height: 44, padding: 4}} />
            </div>
          </div>
        </div>
        <div style={styles.modalFooter}>
          <button onClick={onClose} style={styles.secondaryBtn}>CANCEL</button>
          <button onClick={handleSave} style={styles.primaryBtn}>ADD BIKE</button>
        </div>
      </div>
    </div>
  );
}

function RideDetailModal({ ride, bikes, onClose, onDelete }) {
  const bike = bikes.find(b => b.id === ride.bikeId) || { name: 'Unknown', color: '#666' };
  const cond = CONDITIONS.find(c => c.id === ride.condition) || CONDITIONS[0];
  const CondIcon = cond.icon;

  return (
    <div style={styles.modal} onClick={onClose}>
      <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
        <div style={{...styles.modalHeader, borderColor: bike.color}}>
          <div>
            <div style={styles.detailDate}>
              {new Date(ride.date).toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <div style={{...styles.detailHours, color: bike.color}}>
              {parseFloat(ride.hours).toFixed(1)} HOURS
            </div>
          </div>
          <button onClick={onClose} style={styles.iconBtn}><X size={20} /></button>
        </div>

        <div style={styles.modalBody}>
          <div style={styles.detailMeta}>
            <div style={styles.detailMetaItem}>
              <MapPin size={14} />
              <span>{ride.location}</span>
            </div>
            <div style={styles.detailMetaItem}>
              <Bike size={14} />
              <span>{bike.name}</span>
            </div>
            <div style={{...styles.detailMetaItem, color: cond.color}}>
              <CondIcon size={14} />
              <span>{cond.label}</span>
            </div>
            {ride.gps && (
              <div style={styles.detailMetaItem}>
                <span style={{fontSize: 11, opacity: 0.7}}>
                  GPS: {ride.gps.lat.toFixed(5)}, {ride.gps.lng.toFixed(5)}
                </span>
              </div>
            )}
          </div>

          {ride.photos?.length > 0 && (
            <div style={styles.detailPhotos}>
              {ride.photos.map((p, i) => (
                <img key={i} src={p} alt="" style={styles.detailPhoto} />
              ))}
            </div>
          )}

          {ride.notes && (
            <div style={styles.detailNotes}>
              <div style={styles.label}>NOTES</div>
              <div style={styles.detailNotesText}>{ride.notes}</div>
            </div>
          )}

          {ride.gps && (
            <a
              href={`https://www.google.com/maps?q=${ride.gps.lat},${ride.gps.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.mapLink}
            >
              <MapPin size={14} /> OPEN IN MAPS
            </a>
          )}
        </div>

        <div style={styles.modalFooter}>
          <button
            onClick={() => { if (confirm('Delete this ride?')) onDelete(ride.id); }}
            style={{...styles.secondaryBtn, color: '#c8102e', borderColor: '#c8102e'}}
          >
            <Trash2 size={14} /> DELETE
          </button>
          <button onClick={onClose} style={styles.primaryBtn}>CLOSE</button>
        </div>
      </div>
    </div>
  );
}

// ============ STYLES ============

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;700&family=Archivo:wght@400;500;600;700;900&display=swap');
  
  * { box-sizing: border-box; }
  body { margin: 0; }
  
  .ride-card { transition: all 0.2s ease; }
  .ride-card:hover {
    transform: translateX(4px);
    background: rgba(255,255,255,0.04) !important;
    border-color: rgba(255,255,255,0.15) !important;
  }
  
  button { cursor: pointer; font-family: inherit; }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
  
  input, textarea, select {
    font-family: inherit;
  }
  input:focus, textarea:focus {
    outline: none;
    border-color: #d4a017 !important;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const styles = {
  app: {
    minHeight: '100vh',
    background: '#0d0e0a',
    color: '#e8e6df',
    fontFamily: "'Archivo', -apple-system, sans-serif",
    position: 'relative',
    paddingBottom: 40,
  },
  loading: {
    minHeight: '100vh',
    background: '#0d0e0a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#d4a017',
    fontFamily: "'JetBrains Mono', monospace",
  },
  loadingText: {
    fontSize: 12,
    letterSpacing: 4,
  },
  topoBackground: {
    position: 'fixed',
    inset: 0,
    backgroundImage: `
      radial-gradient(circle at 20% 30%, rgba(212, 160, 23, 0.04) 0%, transparent 40%),
      radial-gradient(circle at 80% 70%, rgba(200, 16, 46, 0.03) 0%, transparent 40%),
      repeating-linear-gradient(
        45deg,
        transparent,
        transparent 80px,
        rgba(255, 255, 255, 0.008) 80px,
        rgba(255, 255, 255, 0.008) 81px
      )
    `,
    pointerEvents: 'none',
    zIndex: 0,
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    background: 'rgba(13, 14, 10, 0.92)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  headerInner: {
    maxWidth: 720,
    margin: '0 auto',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  logoMark: {
    width: 40,
    height: 40,
    background: '#d4a017',
    color: '#0d0e0a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: 1,
    transform: 'rotate(-2deg)',
  },
  logoTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 22,
    letterSpacing: 2,
    lineHeight: 1,
  },
  logoSub: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 9,
    letterSpacing: 2,
    opacity: 0.5,
    marginTop: 2,
  },
  headerStats: {
    display: 'flex',
    gap: 16,
  },
  headerStat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  headerStatNum: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 22,
    color: '#d4a017',
    lineHeight: 1,
  },
  headerStatLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 9,
    letterSpacing: 1.5,
    opacity: 0.5,
    marginTop: 2,
  },
  nav: {
    position: 'sticky',
    top: 73,
    zIndex: 9,
    background: 'rgba(13, 14, 10, 0.92)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    maxWidth: 720,
    margin: '0 auto',
  },
  navBtn: {
    flex: 1,
    background: 'none',
    border: 'none',
    color: 'rgba(232,230,223,0.5)',
    padding: '14px 8px',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    transition: 'all 0.2s',
    borderBottom: '2px solid transparent',
    textTransform: 'uppercase',
  },
  navBtnActive: {
    color: '#d4a017',
    borderBottomColor: '#d4a017',
  },
  main: {
    maxWidth: 720,
    margin: '0 auto',
    padding: '24px 20px',
    position: 'relative',
    zIndex: 1,
  },
  viewWrap: {
    animation: 'fadeIn 0.3s ease',
  },
  viewHeader: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 12,
  },
  viewTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 32,
    letterSpacing: 2,
    lineHeight: 1,
  },
  viewSub: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    letterSpacing: 1.5,
    opacity: 0.5,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  primaryBtn: {
    background: '#d4a017',
    color: '#0d0e0a',
    border: 'none',
    padding: '10px 16px',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.5,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    transition: 'transform 0.15s',
  },
  secondaryBtn: {
    background: 'transparent',
    color: '#e8e6df',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '10px 16px',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 1.5,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    transition: 'all 0.15s',
  },
  iconBtn: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#e8e6df',
    padding: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    border: '1px dashed rgba(255,255,255,0.1)',
  },
  emptyIcon: {
    color: '#d4a017',
    marginBottom: 16,
    opacity: 0.7,
  },
  emptyTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 20,
    letterSpacing: 2,
    marginBottom: 6,
  },
  emptySub: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    opacity: 0.5,
    letterSpacing: 1,
  },
  rideList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  rideCard: {
    display: 'flex',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    cursor: 'pointer',
    overflow: 'hidden',
  },
  rideAccent: {
    width: 4,
    flexShrink: 0,
  },
  rideContent: {
    flex: 1,
    padding: '14px 16px',
  },
  rideTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  rideDate: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    letterSpacing: 1.5,
    opacity: 0.6,
  },
  rideHours: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 22,
    letterSpacing: 1,
    lineHeight: 1,
  },
  rideLocation: {
    fontFamily: "'Archivo', sans-serif",
    fontSize: 16,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  rideMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    opacity: 0.7,
  },
  rideMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  rideNotesPreview: {
    fontFamily: "'Archivo', sans-serif",
    fontSize: 13,
    opacity: 0.6,
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  bikeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 12,
  },
  bikeCard: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  bikeStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  bikeYear: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 14,
    letterSpacing: 2,
    marginBottom: 4,
  },
  bikeName: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 24,
    letterSpacing: 1,
    lineHeight: 1,
    marginBottom: 16,
  },
  bikeStatRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    paddingTop: 12,
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  bikeStat: {
    flex: 1,
  },
  bikeStatNum: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 28,
    lineHeight: 1,
  },
  bikeStatLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 9,
    letterSpacing: 1.5,
    opacity: 0.5,
    marginTop: 4,
  },
  bikeStatDivider: {
    width: 1,
    height: 24,
    background: 'rgba(255,255,255,0.1)',
  },
  maintBikeSection: {
    marginBottom: 28,
  },
  maintBikeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  maintBikeStripe: {
    width: 4,
    height: 18,
  },
  maintBikeName: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 20,
    letterSpacing: 1,
    flex: 1,
  },
  maintBikeHours: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    letterSpacing: 1,
  },
  maintList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  maintItem: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    padding: 14,
  },
  maintItemTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 12,
  },
  maintItemName: {
    fontFamily: "'Archivo', sans-serif",
    fontSize: 15,
    fontWeight: 600,
  },
  maintItemSub: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    opacity: 0.5,
    marginTop: 2,
  },
  maintStatus: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    whiteSpace: 'nowrap',
  },
  maintBar: {
    height: 4,
    background: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginBottom: 10,
  },
  maintBarFill: {
    height: '100%',
    transition: 'width 0.4s ease',
  },
  maintLogBtn: {
    width: '100%',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.15)',
    color: 'rgba(232,230,223,0.7)',
    padding: '8px',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: 600,
    transition: 'all 0.15s',
  },
  statBigGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 10,
    marginBottom: 28,
  },
  statBigCard: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    padding: 16,
    textAlign: 'center',
  },
  statBigNum: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 36,
    color: '#d4a017',
    lineHeight: 1,
  },
  statBigLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 9,
    letterSpacing: 1.5,
    opacity: 0.5,
    marginTop: 6,
  },
  statSection: {
    marginBottom: 28,
  },
  statSectionTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 16,
    letterSpacing: 2,
    marginBottom: 14,
    paddingBottom: 8,
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  barChart: {
    display: 'flex',
    height: 160,
    gap: 8,
    alignItems: 'flex-end',
  },
  barCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
  },
  barValue: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 9,
    color: '#d4a017',
    marginBottom: 4,
    height: 14,
  },
  barTrack: {
    flex: 1,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    background: 'rgba(255,255,255,0.02)',
  },
  barFill: {
    width: '100%',
    background: 'linear-gradient(to top, #d4a017, #e8b938)',
    minHeight: 2,
    transition: 'height 0.5s ease',
  },
  barLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 9,
    letterSpacing: 1,
    opacity: 0.5,
    marginTop: 6,
  },
  statRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  statRowLabel: {
    flex: '0 0 35%',
    fontFamily: "'Archivo', sans-serif",
    fontSize: 13,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  statRowDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
  },
  statRowBar: {
    flex: 1,
    height: 6,
    background: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  statRowBarFill: {
    height: '100%',
    transition: 'width 0.5s ease',
  },
  statRowVal: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    opacity: 0.7,
    minWidth: 60,
    textAlign: 'right',
  },
  locationRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '10px 0',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  locationRank: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 18,
    color: '#d4a017',
    minWidth: 24,
  },
  locationName: {
    flex: 1,
    fontFamily: "'Archivo', sans-serif",
    fontSize: 14,
    fontWeight: 500,
  },
  locationHrs: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    opacity: 0.6,
  },
  modal: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(4px)',
    zIndex: 50,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    animation: 'fadeIn 0.2s ease',
  },
  modalCard: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '92vh',
    background: '#15170f',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    flexDirection: 'column',
    animation: 'slideUp 0.3s ease',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '2px solid rgba(255,255,255,0.08)',
    flexShrink: 0,
  },
  modalTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 24,
    letterSpacing: 2,
  },
  modalBody: {
    padding: 20,
    overflowY: 'auto',
    flex: 1,
  },
  modalFooter: {
    display: 'flex',
    gap: 10,
    padding: '14px 20px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    justifyContent: 'flex-end',
    flexShrink: 0,
  },
  formGroup: {
    marginBottom: 16,
    flex: 1,
  },
  formRow: {
    display: 'flex',
    gap: 12,
    marginBottom: 0,
  },
  label: {
    display: 'block',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    letterSpacing: 1.5,
    opacity: 0.6,
    marginBottom: 6,
    fontWeight: 600,
  },
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#e8e6df',
    padding: '10px 12px',
    fontSize: 14,
    fontFamily: "'Archivo', sans-serif",
    transition: 'border-color 0.15s',
  },
  gpsBtn: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#d4a017',
    padding: '0 12px',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  gpsCoords: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    color: '#d4a017',
    marginTop: 6,
  },
  chipRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(232,230,223,0.7)',
    padding: '8px 14px',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    transition: 'all 0.15s',
  },
  chipActive: {
    background: 'rgba(212, 160, 23, 0.08)',
  },
  photoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: 8,
  },
  photoThumb: {
    aspectRatio: '1',
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  photoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  photoRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    background: 'rgba(0,0,0,0.7)',
    border: 'none',
    color: '#fff',
    width: 22,
    height: 22,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoAdd: {
    aspectRatio: '1',
    background: 'rgba(255,255,255,0.02)',
    border: '1px dashed rgba(255,255,255,0.2)',
    color: '#d4a017',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: 1,
  },
  detailDate: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    letterSpacing: 1.5,
    opacity: 0.6,
    textTransform: 'uppercase',
  },
  detailHours: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 32,
    letterSpacing: 1,
    lineHeight: 1,
    marginTop: 4,
  },
  detailMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  detailMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: "'Archivo', sans-serif",
    fontSize: 14,
  },
  detailPhotos: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: 8,
    marginBottom: 16,
  },
  detailPhoto: {
    width: '100%',
    aspectRatio: '4/3',
    objectFit: 'cover',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  detailNotes: {
    marginBottom: 16,
  },
  detailNotesText: {
    fontFamily: "'Archivo', sans-serif",
    fontSize: 14,
    lineHeight: 1.6,
    opacity: 0.85,
    background: 'rgba(255,255,255,0.02)',
    padding: 12,
    borderLeft: '2px solid #d4a017',
  },
  mapLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    color: '#d4a017',
    textDecoration: 'none',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.5,
    padding: '8px 0',
  },
};

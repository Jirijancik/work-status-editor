import React, { useState, useRef } from 'react';

const statusTypes = {
  work: [
    { id: 'prace', name: 'Práce (Příchod)', color: '#10B981', icon: '👷' },
    { id: 'prechod', name: 'Přechod (Mezi pracovišti)', color: '#3B82F6', icon: '🚶' },
    { id: 'pracCesta', name: 'Pracovní cesta', color: '#6366F1', icon: '🚗' },
    { id: 'priprava', name: 'Příprava na práci', color: '#14B8A6', icon: '⚙️' },
    { id: 'kultivace', name: 'Kultivování pole', color: '#22C55E', icon: '🌾' },
    { id: 'udrzba', name: 'Údržba techniky', color: '#0EA5E9', icon: '🔧' },
    { id: 'jizdaAreal', name: 'Jízda v areálu', color: '#8B5CF6', icon: '🚜' },
    { id: 'prejezd', name: 'Přejezd', color: '#F59E0B', icon: '➡️' },
    { id: 'pripravaPudy', name: 'Příprava půdy', color: '#84CC16', icon: '🌱' },
  ],
  nonWork: [
    { id: 'dovolena', name: 'Dovolená', color: '#EC4899', icon: '🏖️' },
    { id: 'lekar', name: 'Lékař', color: '#EF4444', icon: '🏥' },
    { id: 'nemoc', name: 'Nemoc', color: '#F97316', icon: '🤒' },
    { id: 'ocr', name: 'OČR', color: '#A855F7', icon: '👶' },
    { id: 'prestavka', name: 'Přestávka', color: '#6B7280', icon: '☕' },
  ]
};

const allStatusTypes = [...statusTypes.work, ...statusTypes.nonWork];

const initialStatuses = [
  { id: 1, typeId: 'priprava', start: '05:33', end: '05:50' },
  { id: 2, typeId: 'udrzba', start: '05:50', end: '06:20' },
  { id: 3, typeId: 'jizdaAreal', start: '06:20', end: '06:55' },
  { id: 4, typeId: 'prejezd', start: '06:55', end: '07:15' },
  { id: 5, typeId: 'pripravaPudy', start: '07:15', end: '10:30' },
  { id: 6, typeId: 'prestavka', start: '10:30', end: '11:00' },
  { id: 7, typeId: 'pripravaPudy', start: '11:00', end: '14:00' },
  { id: 8, typeId: 'prejezd', start: '14:00', end: '14:25' },
  { id: 9, typeId: 'jizdaAreal', start: '14:25', end: '14:45' },
  { id: 10, typeId: 'udrzba', start: '14:45', end: '15:30' },
];

const timeToMinutes = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const minutesToTime = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const formatDuration = (start, end) => {
  const diff = timeToMinutes(end) - timeToMinutes(start);
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hod`;
  return `${h}h ${m}m`;
};

export default function App() {
  const [statuses, setStatuses] = useState(initialStatuses);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('edit');
  const [editData, setEditData] = useState({ typeId: '', start: '', end: '' });
  const [splitTime, setSplitTime] = useState('');
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: '' });
  const [selectedDay, setSelectedDay] = useState('2025-05-13');
  const [employee, setEmployee] = useState('Vít Geisselreiter');
  const containerRef = useRef(null);

  const minTime = Math.min(...statuses.map(s => timeToMinutes(s.start)));
  const maxTime = Math.max(...statuses.map(s => timeToMinutes(s.end)));
  const timeRange = maxTime - minTime;

  const getStatusType = (typeId) => allStatusTypes.find(t => t.id === typeId) || { name: 'Neznámý', color: '#9CA3AF', icon: '❓' };

  const getBlockWidth = (start, end) => {
    const duration = timeToMinutes(end) - timeToMinutes(start);
    return (duration / timeRange) * 100;
  };

  const getBlockLeft = (start) => {
    return ((timeToMinutes(start) - minTime) / timeRange) * 100;
  };

  const handleStatusClick = (status, e) => {
    e.stopPropagation();
    setSelectedStatus(status);
    setEditData({ typeId: status.typeId, start: status.start, end: status.end });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleAddStatus = () => {
    const lastStatus = statuses[statuses.length - 1];
    setEditData({
      typeId: 'prace',
      start: lastStatus ? lastStatus.end : '08:00',
      end: lastStatus ? minutesToTime(timeToMinutes(lastStatus.end) + 30) : '08:30'
    });
    setModalMode('create');
    setSelectedStatus(null);
    setShowModal(true);
  };

  const handleSplitStatus = () => {
    if (!selectedStatus || !splitTime) return;
    const startMins = timeToMinutes(selectedStatus.start);
    const endMins = timeToMinutes(selectedStatus.end);
    const splitMins = timeToMinutes(splitTime);
    
    if (splitMins <= startMins || splitMins >= endMins) {
      alert('Čas rozdělení musí být mezi začátkem a koncem statusu');
      return;
    }

    const newStatuses = statuses.flatMap(s => {
      if (s.id === selectedStatus.id) {
        return [
          { ...s, end: splitTime },
          { id: Date.now(), typeId: s.typeId, start: splitTime, end: s.end }
        ];
      }
      return s;
    });
    setStatuses(newStatuses);
    setShowModal(false);
    setSplitTime('');
  };

  const handleSave = () => {
    if (modalMode === 'create') {
      setStatuses([...statuses, { id: Date.now(), ...editData }].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start)));
    } else {
      setStatuses(statuses.map(s => s.id === selectedStatus.id ? { ...s, ...editData } : s));
    }
    setShowModal(false);
  };

  const handleDelete = () => {
    if (window.confirm('Opravdu chcete smazat tento status?')) {
      setStatuses(statuses.filter(s => s.id !== selectedStatus.id));
      setShowModal(false);
    }
  };

  const showTooltip = (e, status) => {
    const type = getStatusType(status.typeId);
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      show: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      content: `${type.icon} ${type.name}\n${status.start} - ${status.end}\nTrvání: ${formatDuration(status.start, status.end)}`
    });
  };

  const totalWorkTime = statuses
    .filter(s => statusTypes.work.some(t => t.id === s.typeId))
    .reduce((sum, s) => sum + (timeToMinutes(s.end) - timeToMinutes(s.start)), 0);

  const timeMarkers = [];
  const startHour = Math.floor(minTime / 60);
  const endHour = Math.ceil(maxTime / 60);
  for (let h = startHour; h <= endHour; h++) {
    const mins = h * 60;
    if (mins >= minTime && mins <= maxTime) {
      timeMarkers.push({ time: `${h.toString().padStart(2, '0')}:00`, pos: ((mins - minTime) / timeRange) * 100 });
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      color: '#e2e8f0',
      padding: '2rem'
    }}>
      <style>{`
        * { box-sizing: border-box; }
        .status-block { transition: all 0.2s ease; cursor: pointer; }
        .status-block:hover { transform: translateY(-2px); filter: brightness(1.1); box-shadow: 0 8px 25px rgba(0,0,0,0.4); }
        .btn { transition: all 0.15s ease; cursor: pointer; }
        .btn:hover { transform: translateY(-1px); }
        .modal-overlay { animation: fadeIn 0.2s ease; }
        .modal-content { animation: slideUp 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        input, select { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        input:focus, select:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2); }
      `}</style>

      {/* Header */}
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: '700', 
              marginBottom: '0.5rem',
              background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Výkaz práce – Editace statusů
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
              Interaktivní mockup pro správu pracovních statusů
            </p>
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            alignItems: 'center',
            background: 'rgba(255,255,255,0.05)',
            padding: '0.75rem 1.25rem',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Zaměstnanec</label>
              <div style={{ fontWeight: '600', color: '#f8fafc' }}>{employee}</div>
            </div>
            <div style={{ width: '1px', height: '36px', background: 'rgba(255,255,255,0.1)' }} />
            <div>
              <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Datum</label>
              <input 
                type="date" 
                value={selectedDay}
                onChange={e => setSelectedDay(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#f8fafc',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: '500',
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {[
            { label: 'Celkový čas', value: formatDuration('00:00', minutesToTime(timeToMinutes(statuses[statuses.length-1]?.end || '00:00') - timeToMinutes(statuses[0]?.start || '00:00'))), color: '#3b82f6' },
            { label: 'Pracovní čas', value: `${Math.floor(totalWorkTime / 60)}h ${totalWorkTime % 60}m`, color: '#10b981' },
            { label: 'Počet statusů', value: statuses.length, color: '#8b5cf6' },
            { label: 'První status', value: statuses[0]?.start || '-', color: '#f59e0b' },
            { label: 'Poslední status', value: statuses[statuses.length-1]?.end || '-', color: '#ef4444' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                background: stat.color
              }} />
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>{stat.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: "'JetBrains Mono', monospace" }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Timeline Container */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#f8fafc' }}>
              📅 Časová osa – {new Date(selectedDay).toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={handleAddStatus}
              className="btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.25rem',
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontWeight: '600',
                fontSize: '0.95rem'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>+</span> Přidat status
            </button>
          </div>

          {/* Time markers */}
          <div style={{ position: 'relative', height: '24px', marginBottom: '0.5rem' }}>
            {timeMarkers.map((marker, i) => (
              <div key={i} style={{
                position: 'absolute',
                left: `${marker.pos}%`,
                transform: 'translateX(-50%)',
                fontSize: '0.75rem',
                color: '#64748b',
                fontFamily: "'JetBrains Mono', monospace"
              }}>
                {marker.time}
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div ref={containerRef} style={{
            position: 'relative',
            height: '80px',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            {/* Grid lines */}
            {timeMarkers.map((marker, i) => (
              <div key={i} style={{
                position: 'absolute',
                left: `${marker.pos}%`,
                top: 0,
                bottom: 0,
                width: '1px',
                background: 'rgba(255,255,255,0.05)'
              }} />
            ))}

            {/* Status blocks */}
            {statuses.map((status) => {
              const type = getStatusType(status.typeId);
              const width = getBlockWidth(status.start, status.end);
              const left = getBlockLeft(status.start);
              const isWorkStatus = statusTypes.work.some(t => t.id === status.typeId);
              
              return (
                <div
                  key={status.id}
                  className="status-block"
                  onClick={(e) => handleStatusClick(status, e)}
                  onMouseEnter={(e) => showTooltip(e, status)}
                  onMouseLeave={() => setTooltip({ ...tooltip, show: false })}
                  style={{
                    position: 'absolute',
                    left: `${left}%`,
                    width: `${width}%`,
                    top: '8px',
                    bottom: '8px',
                    background: `linear-gradient(135deg, ${type.color}, ${type.color}dd)`,
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '0 10px',
                    overflow: 'hidden',
                    border: `2px solid ${type.color}`,
                    boxShadow: `0 4px 15px ${type.color}33`
                  }}
                >
                  <div style={{
                    fontSize: width < 8 ? '0.65rem' : '0.8rem',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    color: '#fff',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}>
                    {width > 5 ? type.icon : ''} {type.name}
                  </div>
                  {width > 12 && (
                    <div style={{
                      fontSize: '0.7rem',
                      color: 'rgba(255,255,255,0.85)',
                      fontFamily: "'JetBrains Mono', monospace",
                      marginTop: '2px'
                    }}>
                      {status.start} – {status.end}
                    </div>
                  )}
                  {width > 6 && width <= 12 && (
                    <div style={{
                      fontSize: '0.65rem',
                      color: 'rgba(255,255,255,0.8)',
                      fontFamily: "'JetBrains Mono', monospace"
                    }}>
                      {formatDuration(status.start, status.end)}
                    </div>
                  )}
                  {/* Work/Non-work indicator */}
                  <div style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: isWorkStatus ? '#22c55e' : '#f59e0b',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }} />
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            marginTop: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }} />
              Pracovní status
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
              Nepracovní status
            </div>
            <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#64748b' }}>
              💡 Klikněte na blok pro editaci
            </div>
          </div>
        </div>

        {/* Status List */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '1.5rem'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#f8fafc' }}>
            📋 Seznam statusů
          </h2>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {statuses.map((status, idx) => {
              const type = getStatusType(status.typeId);
              const isWorkStatus = statusTypes.work.some(t => t.id === status.typeId);
              return (
                <div
                  key={status.id}
                  onClick={(e) => handleStatusClick(status, e)}
                  className="btn"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr 120px 100px 80px',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.875rem 1rem',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: type.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem'
                  }}>
                    {type.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#f8fafc' }}>{type.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {isWorkStatus ? 'Pracovní' : 'Nepracovní'}
                    </div>
                  </div>
                  <div style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.9rem',
                    color: '#94a3b8'
                  }}>
                    {status.start} – {status.end}
                  </div>
                  <div style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.85rem',
                    color: type.color,
                    fontWeight: '600'
                  }}>
                    {formatDuration(status.start, status.end)}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      background: 'rgba(59, 130, 246, 0.2)',
                      color: '#60a5fa'
                    }}>
                      Editovat
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Types Reference */}
        <div style={{
          marginTop: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#22c55e' }}>
              👷 Pracovní statusy
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {statusTypes.work.map(type => (
                <span key={type.id} style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: `${type.color}22`,
                  border: `1px solid ${type.color}44`,
                  color: type.color,
                  fontSize: '0.8rem',
                  fontWeight: '500'
                }}>
                  {type.icon} {type.name}
                </span>
              ))}
            </div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#f59e0b' }}>
              ☕ Nepracovní statusy
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {statusTypes.nonWork.map(type => (
                <span key={type.id} style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: `${type.color}22`,
                  border: `1px solid ${type.color}44`,
                  color: type.color,
                  fontSize: '0.8rem',
                  fontWeight: '500'
                }}>
                  {type.icon} {type.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip.show && (
        <div style={{
          position: 'fixed',
          left: tooltip.x,
          top: tooltip.y,
          transform: 'translate(-50%, -100%)',
          background: '#1e293b',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          fontSize: '0.85rem',
          whiteSpace: 'pre-line',
          zIndex: 1000,
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          pointerEvents: 'none'
        }}>
          {tooltip.content}
          <div style={{
            position: 'absolute',
            bottom: '-6px',
            left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: '12px',
            height: '12px',
            background: '#1e293b',
            borderRight: '1px solid rgba(255,255,255,0.15)',
            borderBottom: '1px solid rgba(255,255,255,0.15)'
          }} />
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #1e293b, #0f172a)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '2rem',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
            }}
          >
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '1.5rem',
              color: '#f8fafc'
            }}>
              {modalMode === 'create' ? '➕ Nový status' : modalMode === 'split' ? '✂️ Rozdělit status' : '✏️ Editovat status'}
            </h2>

            {modalMode === 'split' ? (
              <div>
                <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
                  Rozdělte status "{getStatusType(selectedStatus.typeId).name}" ({selectedStatus.start} – {selectedStatus.end})
                </p>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                  Čas rozdělení
                </label>
                <input
                  type="time"
                  value={splitTime}
                  onChange={e => setSplitTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    color: '#f8fafc',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '1rem'
                  }}
                />
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button
                    onClick={handleSplitStatus}
                    className="btn"
                    style={{
                      flex: 1,
                      padding: '0.875rem',
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      border: 'none',
                      borderRadius: '10px',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '1rem'
                    }}
                  >
                    ✂️ Rozdělit
                  </button>
                  <button
                    onClick={() => { setModalMode('edit'); setSplitTime(''); }}
                    className="btn"
                    style={{
                      flex: 1,
                      padding: '0.875rem',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      color: '#94a3b8',
                      fontWeight: '600'
                    }}
                  >
                    Zpět
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                    Typ statusu
                  </label>
                  <select
                    value={editData.typeId}
                    onChange={e => setEditData({ ...editData, typeId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      color: '#f8fafc',
                      fontSize: '1rem',
                      cursor: 'pointer'
                    }}
                  >
                    <optgroup label="Pracovní statusy">
                      {statusTypes.work.map(t => (
                        <option key={t.id} value={t.id}>{t.icon} {t.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Nepracovní statusy">
                      {statusTypes.nonWork.map(t => (
                        <option key={t.id} value={t.id}>{t.icon} {t.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                      Začátek
                    </label>
                    <input
                      type="time"
                      value={editData.start}
                      onChange={e => setEditData({ ...editData, start: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        color: '#f8fafc',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                      Konec
                    </label>
                    <input
                      type="time"
                      value={editData.end}
                      onChange={e => setEditData({ ...editData, end: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        color: '#f8fafc',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                </div>

                {editData.start && editData.end && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '10px',
                    marginBottom: '1.5rem',
                    color: '#60a5fa',
                    fontSize: '0.9rem'
                  }}>
                    ⏱️ Trvání: <strong>{formatDuration(editData.start, editData.end)}</strong>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={handleSave}
                    className="btn"
                    style={{
                      flex: 1,
                      padding: '0.875rem',
                      background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                      border: 'none',
                      borderRadius: '10px',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '1rem'
                    }}
                  >
                    {modalMode === 'create' ? '➕ Vytvořit' : '💾 Uložit'}
                  </button>
                  {modalMode === 'edit' && (
                    <button
                      onClick={() => { setModalMode('split'); setSplitTime(selectedStatus.start); }}
                      className="btn"
                      style={{
                        padding: '0.875rem 1.25rem',
                        background: 'rgba(245, 158, 11, 0.2)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        borderRadius: '10px',
                        color: '#f59e0b',
                        fontWeight: '600'
                      }}
                    >
                      ✂️
                    </button>
                  )}
                  {modalMode === 'edit' && (
                    <button
                      onClick={handleDelete}
                      className="btn"
                      style={{
                        padding: '0.875rem 1.25rem',
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '10px',
                        color: '#ef4444',
                        fontWeight: '600'
                      }}
                    >
                      🗑️
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="btn"
                  style={{
                    width: '100%',
                    marginTop: '0.75rem',
                    padding: '0.75rem',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    color: '#64748b',
                    fontWeight: '500'
                  }}
                >
                  Zrušit
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

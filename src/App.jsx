import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  Map, 
  AlertTriangle, 
  FileText, 
  LogOut, 
  PlusCircle, 
  Search,
  UploadCloud,
  ChevronRight,
  User,
  Users,
  Fuel,
  TrendingUp,
  DollarSign,
  Save,
  X,
  Camera,
  Calculator,
  MapPin,
  History,
  Edit2,
  Paperclip,
  Activity,
  Zap
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// --- INITIAL MOCK DATA ---

const INITIAL_TRUCKS = [
  { id: 'T-001', plate: 'KEN-592', model: 'Kenworth T680', capacity: 450, avgMpg: 2.8, status: 'Active' },
  { id: 'T-002', plate: 'INT-884', model: 'International LT', capacity: 400, avgMpg: 3.1, status: 'Active' },
  { id: 'T-003', plate: 'VOL-102', model: 'Volvo VNL', capacity: 450, avgMpg: 2.9, status: 'Maintenance' },
  { id: 'T-004', plate: 'FRE-331', model: 'Freightliner Cascadia', capacity: 420, avgMpg: 3.2, status: 'Active' },
];

const INITIAL_OPERATORS = [
  { id: 'OP-1', name: 'Juan Pérez', license: 'TYPE-B-9921', phone: '555-0123', riskLevel: 'Low' },
  { id: 'OP-2', name: 'Carlos Ruiz', license: 'TYPE-B-8821', phone: '555-0199', riskLevel: 'High' },
  { id: 'OP-3', name: 'Miguel Ángel', license: 'TYPE-E-1123', phone: '555-0922', riskLevel: 'Medium' },
];

const INITIAL_TRIPS = [
  { id: 101, date: '2023-10-20', truck: 'KEN-592', operator: 'Carlos Ruiz', origin: 'CDMX', destination: 'Monterrey', distance: 900, fuelReal: 350, fuelExpected: 321, diff: 29, status: 'Warning', evidence: [] },
  { id: 102, date: '2023-10-21', truck: 'INT-884', operator: 'Juan Pérez', origin: 'Guadalajara', destination: 'CDMX', distance: 550, fuelReal: 180, fuelExpected: 177, diff: 3, status: 'Normal', evidence: [] },
  { id: 103, date: '2023-10-22', truck: 'VOL-102', operator: 'Carlos Ruiz', origin: 'Veracruz', destination: 'Puebla', distance: 280, fuelReal: 120, fuelExpected: 96, diff: 24, status: 'Critical', evidence: [] },
  { id: 104, date: '2023-10-23', truck: 'FRE-331', operator: 'Miguel Ángel', origin: 'CDMX', destination: 'Monterrey', distance: 900, fuelReal: 290, fuelExpected: 281, diff: 9, status: 'Normal', evidence: [] },
  { id: 105, date: '2023-10-24', truck: 'KEN-592', operator: 'Juan Pérez', origin: 'Veracruz', destination: 'Puebla', distance: 280, fuelReal: 100, fuelExpected: 96, diff: 4, status: 'Normal', evidence: [] },
];

// --- CUSTOM LOGO COMPONENT (SVG) ---
const DiesTrackLogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
    <path 
      d="M16 2C16 2 6 12 6 19C6 24.5228 10.4772 29 16 29C21.5228 29 26 24.5228 26 19C26 12 16 2 16 2Z" 
      fill="white" 
    />
    <path 
      d="M16 2C16 2 6 12 6 19C6 24.5228 10.4772 29 16 29C21.5228 29 26 24.5228 26 19C26 12 16 2 16 2Z" 
      stroke="#3B82F6" 
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path 
      d="M11 20L14 23L17 15L22 19" 
      stroke="#F59E0B" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <path 
      d="M22 19L22.5 16.5M22 19L19.5 19.5" 
      stroke="#F59E0B" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </svg>
);

// --- HELPER COMPONENTS ---

const Card = ({ title, value, icon: Icon, trend, color = "blue" }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      {trend && (
        <p className={`text-xs mt-2 font-medium ${trend > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
          {trend > 0 ? '+' : ''}{trend}% vs mes anterior
        </p>
      )}
    </div>
    <div className={`p-3 rounded-lg bg-${color}-50 text-${color}-600`}>
      <Icon size={24} />
    </div>
  </div>
);

const Badge = ({ status }) => {
  const styles = {
    Normal: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Warning: 'bg-amber-100 text-amber-700 border-amber-200',
    Critical: 'bg-red-100 text-red-700 border-red-200',
    Active: 'bg-blue-100 text-blue-700 border-blue-200',
    Maintenance: 'bg-slate-100 text-slate-600 border-slate-200',
    Low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Medium: 'bg-amber-100 text-amber-700 border-amber-200',
    High: 'bg-red-100 text-red-700 border-red-200',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.Normal}`}>
      {status === 'Normal' ? 'OK' : status}
    </span>
  );
};

// --- SUB-VIEWS ---

const DashboardView = ({ stats, trips }) => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card title="Viajes Totales (Mes)" value={stats.totalTrips} icon={Truck} color="blue" />
      <Card title="Alertas Críticas" value={stats.criticalTrips} icon={AlertTriangle} color="red" trend={12} />
      <Card title="Litros Consumidos" value={`${stats.totalFuel.toLocaleString()} L`} icon={Fuel} color="emerald" />
      <Card title="Est. Pérdida (Desvíos)" value={`$${stats.moneyLost.toLocaleString()}`} icon={DollarSign} color="amber" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingUp size={18} /> Consumo Real vs Esperado
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trips.slice(0, 7).reverse()}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{fontSize: 12}} />
              <YAxis />
              <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
              <Legend />
              <Bar dataKey="fuelExpected" name="Esperado (L)" fill="#94A3B8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="fuelReal" name="Real (L)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4">Estado de Viajes</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: 'Normal', value: stats.totalTrips - stats.criticalTrips },
                  { name: 'Crítico', value: stats.criticalTrips }
                ]}
                innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
              >
                <Cell fill="#10B981" />
                <Cell fill="#EF4444" />
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </div>
);

const FleetView = ({ trucks, onAddTruck, onViewHistory, currentUser }) => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-bold text-slate-800">Gestión de Flota</h2>
      {currentUser.role === 'admin' && (
        <button 
          onClick={onAddTruck}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <PlusCircle size={16} /> Agregar Camión
        </button>
      )}
    </div>
    
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-500 uppercase">
          <tr>
            <th className="px-6 py-4 font-semibold">Placa</th>
            <th className="px-6 py-4 font-semibold">Modelo</th>
            <th className="px-6 py-4 font-semibold">Capacidad</th>
            <th className="px-6 py-4 font-semibold">Rendimiento (MPG)</th>
            <th className="px-6 py-4 font-semibold">Estado</th>
            <th className="px-6 py-4 font-semibold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {trucks.map((t) => (
            <tr key={t.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 font-bold text-slate-900">{t.plate}</td>
              <td className="px-6 py-4 text-slate-600">{t.model}</td>
              <td className="px-6 py-4 text-slate-600">{t.capacity} L</td>
              <td className="px-6 py-4 text-slate-600">{t.avgMpg} km/L</td>
              <td className="px-6 py-4"><Badge status={t.status} /></td>
              <td className="px-6 py-4 text-right">
                <button 
                  onClick={() => onViewHistory('truck', t.plate)}
                  className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1 justify-end"
                >
                  <History size={14} /> Ver Historial
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const OperatorsView = ({ operators, onAddOperator, onViewHistory, currentUser }) => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-bold text-slate-800">Gestión de Operadores</h2>
      {currentUser.role === 'admin' && (
        <button 
          onClick={onAddOperator}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <PlusCircle size={16} /> Agregar Operador
        </button>
      )}
    </div>
    
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-500 uppercase">
          <tr>
            <th className="px-6 py-4 font-semibold">Nombre</th>
            <th className="px-6 py-4 font-semibold">Licencia</th>
            <th className="px-6 py-4 font-semibold">Teléfono</th>
            <th className="px-6 py-4 font-semibold">Nivel de Riesgo</th>
            <th className="px-6 py-4 font-semibold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {operators.map((o) => (
            <tr key={o.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 font-bold text-slate-900">{o.name}</td>
              <td className="px-6 py-4 text-slate-600 font-mono">{o.license}</td>
              <td className="px-6 py-4 text-slate-600">{o.phone}</td>
              <td className="px-6 py-4"><Badge status={o.riskLevel} /></td>
              <td className="px-6 py-4 text-right">
                <button 
                  onClick={() => onViewHistory('operator', o.name)}
                  className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1 justify-end"
                >
                  <History size={14} /> Ver Historial
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const TripFormView = ({ 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel, 
  trucks, 
  operators, 
  isCalculating, 
  onCalculate 
}) => {
  
  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        evidence: [...(prev.evidence || []), ...newFiles]
      }));
    }
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      evidence: prev.evidence.filter((_, i) => i !== index)
    }));
  };

  const isEditMode = !!formData.id;

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <ChevronRight className="rotate-180" size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {isEditMode ? 'Modificar Viaje' : 'Registrar Nuevo Viaje'}
          </h2>
          <p className="text-slate-500 text-sm">
            {isEditMode ? 'Actualice los detalles del registro existente.' : 'Ingrese los detalles del cierre de viaje y evidencia de consumo.'}
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Truck size={18} className="text-blue-600" /> Información de la Unidad
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Camión / Placa</label>
                <select 
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  value={formData.truckId}
                  onChange={(e) => setFormData({...formData, truckId: e.target.value})}
                >
                  <option value="">Seleccionar Camión...</option>
                  {trucks.map(t => <option key={t.id} value={t.id}>{t.plate} - {t.model}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Operador Responsable</label>
                <select 
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  value={formData.operatorId}
                  onChange={(e) => setFormData({...formData, operatorId: e.target.value})}
                >
                  <option value="">Seleccionar Operador...</option>
                  {operators.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Map size={18} className="text-blue-600" /> Ruta Dinámica y Consumo
            </h3>
            <div className="space-y-4">
              {/* Origen y Destino */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Origen</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      required
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Ciudad Origen"
                      value={formData.origin}
                      onChange={(e) => setFormData({...formData, origin: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Destino</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      required
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Ciudad Destino"
                      value={formData.destination}
                      onChange={(e) => setFormData({...formData, destination: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              {/* Distancia Calculada */}
              <div className="space-y-1">
                 <label className="text-xs font-semibold text-slate-500 uppercase flex justify-between">
                   <span>Distancia Total (km)</span>
                   <button 
                    type="button" 
                    onClick={onCalculate}
                    className="text-blue-600 hover:text-blue-800 text-[10px] uppercase font-bold flex items-center gap-1"
                   >
                     {isCalculating ? 'Calculando...' : <><Calculator size={10}/> Calcular Ruta</>}
                   </button>
                 </label>
                 <input 
                    type="number" 
                    required
                    className="w-full p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-blue-900"
                    placeholder="0 km"
                    value={formData.distance}
                    onChange={(e) => setFormData({...formData, distance: e.target.value})}
                  />
                  <p className="text-xs text-slate-400">Puede calcularse automáticamente o ingresar odómetro manual.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Consumo Real (Litros)</label>
                  <div className="relative">
                    <Fuel size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="number" 
                      required
                      min="1"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                      placeholder="0.00"
                      value={formData.fuelReal}
                      onChange={(e) => setFormData({...formData, fuelReal: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Fecha de Cierre</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Form Area (Evidence) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full flex flex-col">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Camera size={18} className="text-blue-600" /> Evidencia
            </h3>
            
            <label className="flex-none border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center p-6 text-center hover:bg-slate-100 transition-colors cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud className="text-blue-500" size={24} />
              </div>
              <p className="text-sm font-medium text-slate-700">Adjuntar ticket o fotos</p>
              <input type="file" multiple className="hidden" onChange={handleFileChange} />
              <div className="mt-4 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50">
                Seleccionar Archivos
              </div>
            </label>

            {/* Evidence List */}
            <div className="flex-1 mt-4 overflow-y-auto max-h-[200px] space-y-2">
               {formData.evidence && formData.evidence.map((file, idx) => (
                 <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded text-xs">
                   <div className="flex items-center gap-2 overflow-hidden">
                     <Paperclip size={14} className="text-slate-400 flex-shrink-0" />
                     <span className="truncate">{file.name}</span>
                   </div>
                   <button type="button" onClick={() => removeFile(idx)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                 </div>
               ))}
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100">
               <div className="bg-blue-50 p-4 rounded-lg">
                 <h4 className="text-xs font-bold text-blue-800 uppercase mb-2">Resumen Preliminar</h4>
                 <div className="flex justify-between text-sm mb-1">
                   <span className="text-blue-600">Distancia:</span>
                   <span className="font-medium text-blue-900">{formData.distance || 0} km</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-blue-600">Unidad:</span>
                   <span className="font-medium text-blue-900">{formData.truckId ? trucks.find(t=>t.id===formData.truckId)?.plate : '-'}</span>
                 </div>
               </div>
               
               <button 
                type="submit"
                disabled={!formData.truckId || !formData.fuelReal || !formData.distance}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
              >
                <Save size={18} /> {isEditMode ? 'Guardar Cambios' : 'Registrar y Analizar'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

const TripListView = ({ trips, onNewTrip, onEditTrip, tripFilter, setTripFilter }) => {
  // Filter logic
  const displayedTrips = useMemo(() => {
    if (!tripFilter.field) return trips;
    return trips.filter(t => t[tripFilter.field] === tripFilter.value);
  }, [trips, tripFilter]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-500">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
           <h2 className="font-bold text-lg text-slate-800">Bitácora de Viajes</h2>
           {tripFilter.field && (
             <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2">
               Filtrado por: {tripFilter.value}
               <button onClick={() => setTripFilter({field: null, value: null})} className="hover:text-blue-900"><X size={12}/></button>
             </div>
           )}
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            onClick={onNewTrip}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <PlusCircle size={16} /> Registrar
          </button>
        </div>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-500 uppercase">
          <tr>
            <th className="px-6 py-4 font-semibold">Estado</th>
            <th className="px-6 py-4 font-semibold">Fecha</th>
            <th className="px-6 py-4 font-semibold">Unidad</th>
            <th className="px-6 py-4 font-semibold">Operador</th>
            <th className="px-6 py-4 font-semibold">Ruta</th>
            <th className="px-6 py-4 font-semibold text-right">Consumo</th>
            <th className="px-6 py-4 font-semibold text-right">Diferencia</th>
            <th className="px-6 py-4 font-semibold"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {displayedTrips.length === 0 ? (
             <tr><td colSpan="8" className="px-6 py-8 text-center text-slate-400">No se encontraron viajes.</td></tr>
          ) : (
            displayedTrips.map((trip) => (
              <tr key={trip.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <Badge status={trip.status} />
                </td>
                <td className="px-6 py-4 text-slate-600">{trip.date}</td>
                <td className="px-6 py-4 font-medium text-slate-900">{trip.truck}</td>
                <td className="px-6 py-4 text-slate-600">{trip.operator}</td>
                <td className="px-6 py-4 text-slate-600 truncate max-w-[150px]">
                  {trip.origin} <span className="text-slate-400">→</span> {trip.destination}
                </td>
                <td className="px-6 py-4 text-right font-medium text-slate-700">{trip.fuelReal} L</td>
                <td className={`px-6 py-4 text-right font-bold ${trip.diff > 10 ? 'text-red-600' : 'text-slate-400'}`}>
                  {trip.diff > 0 ? '+' : ''}{trip.diff} L
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => onEditTrip(trip)} className="text-slate-400 hover:text-blue-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function DiesTrackApp() {
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, trips, trip-form, fleet, operators
  
  // User Role State
  const [currentUser, setCurrentUser] = useState({ 
    role: 'admin', 
    name: 'Admin User', 
    title: 'Logistics Mgr' 
  });
  
  // Data State
  const [trips, setTrips] = useState(INITIAL_TRIPS);
  const [trucks, setTrucks] = useState(INITIAL_TRUCKS);
  const [operators, setOperators] = useState(INITIAL_OPERATORS);
  
  // Filter State
  const [tripFilter, setTripFilter] = useState({ field: null, value: null });

  // Form State (Reused for Create and Edit)
  const initialFormState = {
    id: null, // If null, it's new. If set, it's edit.
    truckId: '',
    operatorId: '',
    origin: '',
    destination: '',
    distance: '',
    fuelReal: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    evidence: [] // Changed to array
  };

  const [tripFormData, setTripFormData] = useState(initialFormState);

  // Other UI States
  const [newTruck, setNewTruck] = useState({ plate: '', model: '', capacity: '', avgMpg: '' });
  const [newOperator, setNewOperator] = useState({ name: '', license: '', phone: '' });
  const [notification, setNotification] = useState(null);
  const [isTruckModalOpen, setIsTruckModalOpen] = useState(false);
  const [isOpModalOpen, setIsOpModalOpen] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // --- ANALYTICS ---
  const stats = useMemo(() => {
    const totalTrips = trips.length;
    const criticalTrips = trips.filter(t => t.status === 'Critical').length;
    const totalFuel = trips.reduce((acc, curr) => acc + curr.fuelReal, 0);
    const totalDiff = trips.reduce((acc, curr) => acc + (curr.diff > 0 ? curr.diff : 0), 0);
    const moneyLost = totalDiff * 24; 
    return { totalTrips, criticalTrips, totalFuel, moneyLost };
  }, [trips]);

  // --- ACTIONS ---

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const toggleUserRole = () => {
    if (currentUser.role === 'admin') {
      setCurrentUser({ role: 'operator', name: 'Operador 1', title: 'Driver/Staff' });
      setActiveView('dashboard'); // Redirect to safe view
    } else {
      setCurrentUser({ role: 'admin', name: 'Admin User', title: 'Logistics Mgr' });
    }
  };

  const handleCalculateDistance = () => {
    if (!tripFormData.origin || !tripFormData.destination) {
      showNotification('warning', 'Ingrese origen y destino');
      return;
    }
    setIsCalculating(true);
    setTimeout(() => {
      const randomDist = Math.floor(Math.random() * 1100) + 100;
      setTripFormData(prev => ({ ...prev, distance: randomDist }));
      setIsCalculating(false);
    }, 800);
  };

  const startNewTrip = () => {
    setTripFormData(initialFormState);
    setActiveView('trip-form');
    setTripFilter({field: null, value: null});
  };

  const startEditTrip = (trip) => {
    // Find IDs based on names (reverse lookup for mock data)
    const truck = trucks.find(t => t.plate === trip.truck);
    const operator = operators.find(o => o.name === trip.operator);
    
    setTripFormData({
      id: trip.id,
      truckId: truck ? truck.id : '',
      operatorId: operator ? operator.id : '',
      origin: trip.origin,
      destination: trip.destination,
      distance: trip.distance,
      fuelReal: trip.fuelReal,
      date: trip.date,
      notes: '',
      evidence: trip.evidence || []
    });
    setActiveView('trip-form');
  };

  const handleSaveTrip = (e) => {
    e.preventDefault();
    
    const truck = trucks.find(t => t.id === tripFormData.truckId);
    const operator = operators.find(o => o.id === tripFormData.operatorId);

    if (!truck || !operator) return;

    // Analysis Logic
    const difficultyFactor = 1.1; 
    const baseExpected = (parseFloat(tripFormData.distance) / truck.avgMpg); 
    const adjustedExpected = baseExpected * difficultyFactor;
    const expectedInt = Math.round(adjustedExpected);
    const realInt = parseInt(tripFormData.fuelReal);
    const difference = realInt - expectedInt;
    const diffPercent = (difference / expectedInt) * 100;

    let status = 'Normal';
    if (diffPercent > 15) status = 'Critical';
    else if (diffPercent > 5) status = 'Warning';

    const tripData = {
      id: tripFormData.id || Date.now(),
      date: tripFormData.date,
      truck: truck.plate,
      operator: operator.name,
      origin: tripFormData.origin,
      destination: tripFormData.destination,
      distance: parseFloat(tripFormData.distance),
      fuelReal: realInt,
      fuelExpected: expectedInt,
      diff: difference,
      status: status,
      evidence: tripFormData.evidence
    };

    if (tripFormData.id) {
      // Update existing
      setTrips(trips.map(t => t.id === tripFormData.id ? tripData : t));
      showNotification('success', 'Viaje actualizado correctamente.');
    } else {
      // Create new
      setTrips([tripData, ...trips]);
      showNotification(status === 'Normal' ? 'success' : 'warning', `Viaje registrado. Estado: ${status === 'Normal' ? 'OK' : 'Anomalía'}`);
    }

    setActiveView('trips');
  };

  const handleAddTruck = (e) => {
    e.preventDefault();
    const newId = `T-${Date.now()}`;
    setTrucks([...trucks, { id: newId, ...newTruck, status: 'Active', capacity: parseInt(newTruck.capacity), avgMpg: parseFloat(newTruck.avgMpg) }]);
    setIsTruckModalOpen(false);
    setNewTruck({ plate: '', model: '', capacity: '', avgMpg: '' });
    showNotification('success', 'Camión agregado a la flota');
  };

  const handleAddOperator = (e) => {
    e.preventDefault();
    const newId = `OP-${Date.now()}`;
    setOperators([...operators, { id: newId, ...newOperator, riskLevel: 'Low' }]);
    setIsOpModalOpen(false);
    setNewOperator({ name: '', license: '', phone: '' });
    showNotification('success', 'Operador registrado correctamente');
  };

  // --- RENDER ---

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-10 transition-all">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <DiesTrackLogo />
            <span className="text-xl font-bold tracking-tight">DiesTrack</span>
          </div>
        </div>
        
        <div className="p-4 pb-0">
          <button 
            onClick={startNewTrip}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/50 transition-all"
          >
            <PlusCircle size={20} /> Registrar Viaje
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button 
            onClick={() => setActiveView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeView === 'dashboard' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </button>
          
          <button 
            onClick={() => { setActiveView('trips'); setTripFilter({field: null, value: null}); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeView === 'trips' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Map size={20} />
            <span className="font-medium">Bitácora Viajes</span>
          </button>

          {/* ADMIN ONLY MENU */}
          {currentUser.role === 'admin' && (
            <>
              <div className="pt-4 pb-2 text-xs font-semibold text-slate-500 uppercase px-4">Administración</div>
              <button 
                onClick={() => setActiveView('fleet')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeView === 'fleet' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <Truck size={20} />
                <span className="font-medium">Flota / Camiones</span>
              </button>

              <button 
                onClick={() => setActiveView('operators')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeView === 'operators' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <Users size={20} />
                <span className="font-medium">Operadores</span>
              </button>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-slate-800 rounded-lg transition-colors" onClick={toggleUserRole} title="Click to Switch Role">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center relative">
              <User size={16} />
              <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${currentUser.role === 'admin' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
            </div>
            <div>
              <p className="text-sm font-medium">{currentUser.name}</p>
              <p className="text-xs text-slate-500 uppercase">{currentUser.role}</p>
            </div>
          </div>
          <button className="mt-2 w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-white py-2">
            <LogOut size={14} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 ml-64 p-8 relative">
        {notification && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-xl border flex items-center gap-3 animate-in slide-in-from-top-2 ${
            notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            {notification.type === 'success' ? <div className="w-2 h-2 rounded-full bg-emerald-500"></div> : <AlertTriangle size={18} />}
            <span className="font-medium">{notification.message}</span>
          </div>
        )}

        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 capitalize">
              {activeView === 'fleet' ? 'Gestión de Flota' : 
               activeView === 'operators' ? 'Gestión de Personal' : 
               activeView === 'trip-form' ? (tripFormData.id ? 'Modificar Viaje' : 'Registrar Viaje') :
               activeView.replace('-', ' ')}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Sistema de Monitoreo Inteligente de Consumo de Diesel
            </p>
          </div>
        </header>

        {activeView === 'dashboard' && <DashboardView stats={stats} trips={trips} />}
        
        {activeView === 'trips' && (
          <TripListView 
            trips={trips} 
            onNewTrip={startNewTrip} 
            onEditTrip={startEditTrip}
            tripFilter={tripFilter} 
            setTripFilter={setTripFilter} 
          />
        )}
        
        {activeView === 'trip-form' && (
          <TripFormView 
            formData={tripFormData}
            setFormData={setTripFormData}
            onSubmit={handleSaveTrip}
            onCancel={() => setActiveView('trips')}
            trucks={trucks}
            operators={operators}
            isCalculating={isCalculating}
            onCalculate={handleCalculateDistance}
          />
        )}
        
        {activeView === 'fleet' && (
          <FleetView 
            trucks={trucks} 
            onAddTruck={() => setIsTruckModalOpen(true)} 
            onViewHistory={(f,v) => { setTripFilter({field: f, value: v}); setActiveView('trips'); }}
            currentUser={currentUser}
          />
        )}
        
        {activeView === 'operators' && (
          <OperatorsView 
            operators={operators} 
            onAddOperator={() => setIsOpModalOpen(true)} 
            onViewHistory={(f,v) => { setTripFilter({field: f, value: v}); setActiveView('trips'); }}
            currentUser={currentUser}
          />
        )}
      </main>

      {/* MODALS */}
      {isTruckModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Agregar Camión</h3>
              <button onClick={() => setIsTruckModalOpen(false)}><X size={20} className="text-slate-400"/></button>
            </div>
            <form onSubmit={handleAddTruck} className="space-y-4">
              <div>
                <label className="text-xs uppercase font-bold text-slate-500">Placa</label>
                <input required className="w-full border p-2 rounded" value={newTruck.plate} onChange={e => setNewTruck({...newTruck, plate: e.target.value})} placeholder="EJ: KEN-123" />
              </div>
              <div>
                <label className="text-xs uppercase font-bold text-slate-500">Modelo</label>
                <input required className="w-full border p-2 rounded" value={newTruck.model} onChange={e => setNewTruck({...newTruck, model: e.target.value})} placeholder="EJ: Kenworth T680" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-xs uppercase font-bold text-slate-500">Capacidad (L)</label>
                   <input required type="number" className="w-full border p-2 rounded" value={newTruck.capacity} onChange={e => setNewTruck({...newTruck, capacity: e.target.value})} />
                </div>
                <div>
                   <label className="text-xs uppercase font-bold text-slate-500">Rendimiento (km/L)</label>
                   <input required type="number" step="0.1" className="w-full border p-2 rounded" value={newTruck.avgMpg} onChange={e => setNewTruck({...newTruck, avgMpg: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 mt-4">Guardar Unidad</button>
            </form>
          </div>
        </div>
      )}

      {isOpModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Agregar Operador</h3>
              <button onClick={() => setIsOpModalOpen(false)}><X size={20} className="text-slate-400"/></button>
            </div>
            <form onSubmit={handleAddOperator} className="space-y-4">
              <div>
                <label className="text-xs uppercase font-bold text-slate-500">Nombre Completo</label>
                <input required className="w-full border p-2 rounded" value={newOperator.name} onChange={e => setNewOperator({...newOperator, name: e.target.value})} />
              </div>
              <div>
                <label className="text-xs uppercase font-bold text-slate-500">No. Licencia</label>
                <input required className="w-full border p-2 rounded" value={newOperator.license} onChange={e => setNewOperator({...newOperator, license: e.target.value})} />
              </div>
              <div>
                <label className="text-xs uppercase font-bold text-slate-500">Teléfono</label>
                <input required className="w-full border p-2 rounded" value={newOperator.phone} onChange={e => setNewOperator({...newOperator, phone: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 mt-4">Guardar Operador</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
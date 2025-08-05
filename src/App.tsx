import React, { useState } from 'react';
import { CheckCircle, FileText, User, Menu, Home, Plus, ArrowLeft, Trash2, Eye, History, BarChart3, Search, Edit, Filter, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';

interface TableRow {
  id: number;
  lineCode: string;
  numeroParte: string;
  cantidad: string;
  isEditable: boolean;
}

interface HistoryRecord {
  id: number;
  folio: string;
  ubicacion: string;
  productosCapturasdos: number;
  productosEnUbicacion: number;
  usuario: string;
  location: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  productos: Array<{
    id: number;
    lineCode: string;
    numeroParte: string;
    cantidad: string;
    cantidadEsperada: string;
  }>;
}

interface User {
  id: number;
  name: string;
  selected: boolean;
}

interface BarCode {
  id: number;
  noParte: string;
  barCode: string;
  lineCode: string;
  cantidad: number;
}

interface ProductTracker {
  id: number;
  operationNo: string;
  subLocation: string;
  lineCode: string;
  partNumber: string;
  qtyBefore: number;
  qtyAfter: number;
  qtyChange: number;
  movementType: string;
  fecha: string; // Now includes time
  total: number;
}

const locations = [
  'Independencia',
  'Valentín',
  '20 Noviembre',
  'Lopez',
  'Paseo',
  'Tecnológico',
  'Cuauhtémoc',
  'Monterrey',
  'CDMX',
  'Ok Autopartes',
  'CD Juarez',
  'Grob',
  'GROB Flores',
  'OK Garage',
  'GROB Jilotepec',
  'Mayoreo',
  'Aztecas',
  'CD Monterrey',
  'Full',
  'Talamas',
  'Chelsea',
  'Horizon',
  'Gran Vista'
];

function App() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [selectedFolio, setSelectedFolio] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'history' | 'folio-details' | 'barcodes' | 'product-tracker'>('dashboard');
  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState<HistoryRecord | null>(null);
  const [folios, setFolios] = useState(['CCD250001', 'CCD250002', 'CCD250003']);
  const [selectedLocation, setSelectedLocation] = useState('Valentín');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showBarCodeModal, setShowBarCodeModal] = useState(false);
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'Rodolfo Ramirez', selected: false },
    { id: 2, name: 'María González', selected: false },
    { id: 3, name: 'Carlos López', selected: false },
    { id: 4, name: 'Ana Martínez', selected: false },
    { id: 5, name: 'Luis Hernández', selected: false },
    { id: 6, name: 'Pedro Sánchez', selected: false },
    { id: 7, name: 'Sofia Rodríguez', selected: false },
    { id: 8, name: 'Jorge Morales', selected: false },
    { id: 9, name: 'Elena Castro', selected: false },
    { id: 10, name: 'Roberto Jiménez', selected: false }
  ]);
  
  // BarCodes state
  const [barCodes, setBarCodes] = useState<BarCode[]>([
    { id: 1, noParte: '2612754', barCode: '7501234567890', lineCode: 'GOB', cantidad: 25 },
    { id: 2, noParte: '2612756', barCode: '7501234567891', lineCode: 'GOB', cantidad: 18 },
    { id: 3, noParte: '3456789', barCode: '7501234567892', lineCode: 'MOT', cantidad: 32 },
    { id: 4, noParte: '7891234', barCode: '7501234567893', lineCode: 'FRE', cantidad: 15 },
    { id: 5, noParte: '4567890', barCode: '7501234567894', lineCode: 'SUS', cantidad: 8 },
    { id: 6, noParte: '5678901', barCode: '7501234567895', lineCode: 'TRA', cantidad: 42 },
    { id: 7, noParte: '1234567', barCode: '7501234567896', lineCode: 'GOB', cantidad: 28 },
    { id: 8, noParte: '2345678', barCode: '7501234567897', lineCode: 'MOT', cantidad: 19 },
    { id: 9, noParte: '6789012', barCode: '7501234567898', lineCode: 'TRA', cantidad: 35 },
    { id: 10, noParte: '8901234', barCode: '7501234567899', lineCode: 'FRE', cantidad: 22 }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilter, setSearchFilter] = useState<'Codigo' | 'NoParte'>('Codigo');
  const [editingBarCode, setEditingBarCode] = useState<BarCode | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // ProductTracker state
  const [productTrackers, setProductTrackers] = useState<ProductTracker[]>([
    { id: 1, operationNo: 'OP001', subLocation: 'A-1-2-3', lineCode: 'GOB', partNumber: '2612754', qtyBefore: 50, qtyAfter: 42, qtyChange: -8, movementType: 'Salida', fecha: '09/07/2025 13:01', total: 336 },
    { id: 2, operationNo: 'OP002', subLocation: 'B-2-1-4', lineCode: 'MOT', partNumber: '3456789', qtyBefore: 25, qtyAfter: 30, qtyChange: 5, movementType: 'Entrada', fecha: '09/07/2025 10:09', total: 150 },
    { id: 3, operationNo: 'OP003', subLocation: 'C-3-2-1', lineCode: 'FRE', partNumber: '7891234', qtyBefore: 18, qtyAfter: 15, qtyChange: -3, movementType: 'Salida', fecha: '09/07/2025 14:32', total: 45 },
    { id: 4, operationNo: 'OP004', subLocation: 'A-2-3-1', lineCode: 'SUS', partNumber: '4567890', qtyBefore: 35, qtyAfter: 40, qtyChange: 5, movementType: 'Entrada', fecha: '08/07/2025 09:20', total: 200 },
    { id: 5, operationNo: 'OP005', subLocation: 'B-1-4-2', lineCode: 'TRA', partNumber: '5678901', qtyBefore: 60, qtyAfter: 55, qtyChange: -5, movementType: 'Salida', fecha: '08/07/2025 08:50', total: 275 },
    { id: 6, operationNo: 'OP006', subLocation: 'C-4-1-3', lineCode: 'GOB', partNumber: '1234567', qtyBefore: 22, qtyAfter: 28, qtyChange: 6, movementType: 'Entrada', fecha: '08/07/2025 15:21', total: 168 },
    { id: 7, operationNo: 'OP007', subLocation: 'A-3-1-2', lineCode: 'MOT', partNumber: '2345678', qtyBefore: 45, qtyAfter: 45, qtyChange: 0, movementType: 'Ajuste', fecha: '07/07/2025 17:15', total: 0 },
    { id: 8, operationNo: 'OP008', subLocation: 'B-4-3-1', lineCode: 'FRE', partNumber: '6789012', qtyBefore: 12, qtyAfter: 18, qtyChange: 6, movementType: 'Entrada', fecha: '07/07/2025 12:00', total: 108 },
    { id: 9, operationNo: 'OP009', subLocation: 'C-1-2-4', lineCode: 'TRA', partNumber: '8901234', qtyBefore: 38, qtyAfter: 32, qtyChange: -6, movementType: 'Salida', fecha: '07/07/2025 11:11', total: 192 },
    { id: 10, operationNo: 'OP010', subLocation: 'A-4-2-1', lineCode: 'SUS', partNumber: '9012345', qtyBefore: 28, qtyAfter: 35, qtyChange: 7, movementType: 'Entrada', fecha: '06/07/2025 16:43', total: 245 }
  ]);
  
  const [trackerSearchTerm, setTrackerSearchTerm] = useState('');
  const [trackerSearchFilter, setTrackerSearchFilter] = useState<'Operacion' | 'Bin' | 'PartNo'>('Operacion');
  const [isRefreshingTracker, setIsRefreshingTracker] = useState(false);
  
  // New BarCode form state
  const [newBarCode, setNewBarCode] = useState({
    barCode: '',
    lineCode: '',
    noParte: '',
    cantidad: ''
  });
  
  // Form fields
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  
  // Table data
  const [tableRows, setTableRows] = useState<TableRow[]>([
    { id: 1, lineCode: 'GOB', numeroParte: '2612754', cantidad: '', isEditable: false },
    { id: 2, lineCode: 'GOB', numeroParte: '2612756', cantidad: '', isEditable: false },
    { id: 3, lineCode: 'GOB', numeroParte: '2612756', cantidad: '', isEditable: false }
  ]);

  // Datos de ejemplo para el historial
  const [allHistoryRecords] = useState<HistoryRecord[]>([
    // Valentín
    { 
      id: 1, folio: 'CCD250001', ubicacion: 'TEC-A-1-1-3', productosCapturasdos: 20, productosEnUbicacion: 20, usuario: 'Rodolfo', location: 'Valentín',
      fecha: '09/07/2025', horaInicio: '08:30', horaFin: '09:15',
      productos: [
        { id: 1, lineCode: 'GOB', numeroParte: '2612754', cantidad: '8', cantidadEsperada: '8' },
        { id: 2, lineCode: 'GOB', numeroParte: '2612756', cantidad: '7', cantidadEsperada: '7' },
        { id: 3, lineCode: 'GOB', numeroParte: '2612758', cantidad: '5', cantidadEsperada: '5' }
      ]
    },
    { 
      id: 2, folio: 'CCD250002', ubicacion: 'TEC-B-2-3-1', productosCapturasdos: 15, productosEnUbicacion: 18, usuario: 'Rodolfo', location: 'Valentín',
      fecha: '09/07/2025', horaInicio: '09:20', horaFin: '10:05',
      productos: [
        { id: 1, lineCode: 'MOT', numeroParte: '3456789', cantidad: '10', cantidadEsperada: '12' },
        { id: 2, lineCode: 'MOT', numeroParte: '3456790', cantidad: '5', cantidadEsperada: '6' }
      ]
    },
    { 
      id: 3, folio: 'CCD250003', ubicacion: 'TEC-C-1-2-4', productosCapturasdos: 32, productosEnUbicacion: 32, usuario: 'Rodolfo', location: 'Valentín',
      fecha: '09/07/2025', horaInicio: '10:10', horaFin: '11:30',
      productos: [
        { id: 1, lineCode: 'FRE', numeroParte: '7891234', cantidad: '15', cantidadEsperada: '15' },
        { id: 2, lineCode: 'FRE', numeroParte: '7891235', cantidad: '12', cantidadEsperada: '12' },
        { id: 3, lineCode: 'FRE', numeroParte: '7891236', cantidad: '5', cantidadEsperada: '5' }
      ]
    },
    { 
      id: 4, folio: 'CCD249998', ubicacion: 'TEC-A-3-1-2', productosCapturasdos: 8, productosEnUbicacion: 10, usuario: 'Rodolfo', location: 'Valentín',
      fecha: '08/07/2025', horaInicio: '14:00', horaFin: '14:25',
      productos: [
        { id: 1, lineCode: 'SUS', numeroParte: '4567890', cantidad: '8', cantidadEsperada: '10' }
      ]
    },
    { 
      id: 5, folio: 'CCD249999', ubicacion: 'TEC-B-1-4-3', productosCapturasdos: 25, productosEnUbicacion: 25, usuario: 'Rodolfo', location: 'Valentín',
      fecha: '08/07/2025', horaInicio: '15:30', horaFin: '16:45',
      productos: [
        { id: 1, lineCode: 'TRA', numeroParte: '5678901', cantidad: '15', cantidadEsperada: '15' },
        { id: 2, lineCode: 'TRA', numeroParte: '5678902', cantidad: '10', cantidadEsperada: '10' }
      ]
    },
    
    // Independencia
    { 
      id: 6, folio: 'IND250001', ubicacion: 'IND-A-2-1-5', productosCapturasdos: 18, productosEnUbicacion: 18, usuario: 'María', location: 'Independencia',
      fecha: '09/07/2025', horaInicio: '08:00', horaFin: '08:45',
      productos: [
        { id: 1, lineCode: 'GOB', numeroParte: '1234567', cantidad: '18', cantidadEsperada: '18' }
      ]
    },
    { 
      id: 7, folio: 'IND250002', ubicacion: 'IND-B-1-3-2', productosCapturasdos: 22, productosEnUbicacion: 24, usuario: 'Carlos', location: 'Independencia',
      fecha: '09/07/2025', horaInicio: '09:00', horaFin: '10:15',
      productos: [
        { id: 1, lineCode: 'MOT', numeroParte: '2345678', cantidad: '12', cantidadEsperada: '14' },
        { id: 2, lineCode: 'MOT', numeroParte: '2345679', cantidad: '10', cantidadEsperada: '10' }
      ]
    },
    { 
      id: 8, folio: 'IND250003', ubicacion: 'IND-C-3-2-1', productosCapturasdos: 14, productosEnUbicacion: 14, usuario: 'Ana', location: 'Independencia',
      fecha: '09/07/2025', horaInicio: '11:00', horaFin: '11:30',
      productos: [
        { id: 1, lineCode: 'FRE', numeroParte: '3456789', cantidad: '14', cantidadEsperada: '14' }
      ]
    },
    
    // Tecnológico
    { 
      id: 9, folio: 'TEC250001', ubicacion: 'TEC-X-1-1-1', productosCapturasdos: 30, productosEnUbicacion: 28, usuario: 'Luis', location: 'Tecnológico',
      fecha: '09/07/2025', horaInicio: '07:30', horaFin: '09:00',
      productos: [
        { id: 1, lineCode: 'GOB', numeroParte: '4567890', cantidad: '20', cantidadEsperada: '18' },
        { id: 2, lineCode: 'GOB', numeroParte: '4567891', cantidad: '10', cantidadEsperada: '10' }
      ]
    },
    { 
      id: 10, folio: 'TEC250002', ubicacion: 'TEC-Y-2-3-4', productosCapturasdos: 12, productosEnUbicacion: 12, usuario: 'Pedro', location: 'Tecnológico',
      fecha: '09/07/2025', horaInicio: '10:00', horaFin: '10:30',
      productos: [
        { id: 1, lineCode: 'SUS', numeroParte: '5678901', cantidad: '12', cantidadEsperada: '12' }
      ]
    },
    
    // Monterrey
    { 
      id: 11, folio: 'MTY250001', ubicacion: 'MTY-A-1-2-3', productosCapturasdos: 45, productosEnUbicacion: 45, usuario: 'Jorge', location: 'Monterrey',
      fecha: '09/07/2025', horaInicio: '08:15', horaFin: '10:30',
      productos: [
        { id: 1, lineCode: 'TRA', numeroParte: '6789012', cantidad: '25', cantidadEsperada: '25' },
        { id: 2, lineCode: 'TRA', numeroParte: '6789013', cantidad: '20', cantidadEsperada: '20' }
      ]
    },
    { 
      id: 12, folio: 'MTY250002', ubicacion: 'MTY-B-3-1-2', productosCapturasdos: 38, productosEnUbicacion: 40, usuario: 'Sofia', location: 'Monterrey',
      fecha: '09/07/2025', horaInicio: '11:00', horaFin: '12:45',
      productos: [
        { id: 1, lineCode: 'MOT', numeroParte: '7890123', cantidad: '18', cantidadEsperada: '20' },
        { id: 2, lineCode: 'MOT', numeroParte: '7890124', cantidad: '20', cantidadEsperada: '20' }
      ]
    },
    
    // CDMX
    { 
      id: 13, folio: 'CDX250001', ubicacion: 'CDX-A-4-2-1', productosCapturasdos: 55, productosEnUbicacion: 55, usuario: 'Roberto', location: 'CDMX',
      fecha: '09/07/2025', horaInicio: '09:00', horaFin: '11:30',
      productos: [
        { id: 1, lineCode: 'FRE', numeroParte: '8901234', cantidad: '30', cantidadEsperada: '30' },
        { id: 2, lineCode: 'FRE', numeroParte: '8901235', cantidad: '25', cantidadEsperada: '25' }
      ]
    },
    { 
      id: 14, folio: 'CDX250002', ubicacion: 'CDX-B-2-4-3', productosCapturasdos: 28, productosEnUbicacion: 30, usuario: 'Elena', location: 'CDMX',
      fecha: '09/07/2025', horaInicio: '13:00', horaFin: '14:15',
      productos: [
        { id: 1, lineCode: 'SUS', numeroParte: '9012345', cantidad: '15', cantidadEsperada: '16' },
        { id: 2, lineCode: 'SUS', numeroParte: '9012346', cantidad: '13', cantidadEsperada: '14' }
      ]
    }
  ]);

  // Filtrar registros por ubicación seleccionada
  const historyRecords = allHistoryRecords.filter(record => record.location === selectedLocation);

  // Filtrar códigos de barras
  const filteredBarCodes = barCodes.filter(barCode => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    switch (searchFilter) {
      case 'Codigo':
        return barCode.barCode.toLowerCase().includes(searchLower);
      case 'NoParte':
        return barCode.noParte.toLowerCase().includes(searchLower);
      default:
        return barCode.barCode.toLowerCase().includes(searchLower);
    }
  });

  const handleCheckIn = async () => {
    try {
      const result = await Swal.fire({
        title: 'Éxito',
        text: 'Se ha generado un folio con éxito',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#4F7FBF',
        background: '#ffffff',
        color: '#1f2937',
        customClass: {
          popup: 'rounded-lg shadow-xl',
          title: 'text-xl font-bold',
          content: 'text-gray-600',
          confirmButton: 'px-6 py-2 rounded-md font-medium'
        }
      });

      if (result.isConfirmed) {
        setIsCheckedIn(true);
      }
    } catch (error) {
      console.error('Error showing alert:', error);
    }
  };

  const handleFolioClick = (folio: string) => {
    setSelectedFolio(folio);
  };

  const handleInputChange = (id: number, field: keyof TableRow, value: string) => {
    setTableRows(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const addNewRow = () => {
    const newId = Math.max(...tableRows.map(row => row.id)) + 1;
    setTableRows(prev => [...prev, { id: newId, lineCode: '', numeroParte: '', cantidad: '', isEditable: true }]);
  };

  const deleteRow = (id: number) => {
    setTableRows(prev => prev.filter(row => row.id !== id));
  };

  const handleCaptureCount = async () => {
    try {
      const result = await Swal.fire({
        title: 'Éxito',
        text: 'Se ha capturado el conteo correctamente',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#4F7FBF',
        background: '#ffffff',
        color: '#1f2937',
        customClass: {
          popup: 'rounded-lg shadow-xl',
          title: 'text-xl font-bold',
          content: 'text-gray-600',
          confirmButton: 'px-6 py-2 rounded-md font-medium'
        }
      });

      if (result.isConfirmed) {
        // Eliminar el folio actual de la lista
        setFolios(prev => prev.filter(folio => folio !== selectedFolio));
        setSelectedFolio(null);
      }
    } catch (error) {
      console.error('Error showing alert:', error);
    }
  };

  const handleAddBarCode = async () => {
    if (!newBarCode.noParte || !newBarCode.barCode || !newBarCode.lineCode || !newBarCode.cantidad) {
      await Swal.fire({
        title: 'Error',
        text: 'Todos los campos son obligatorios',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#4F7FBF'
      });
      return;
    }

    try {
      const result = await Swal.fire({
        title: 'Éxito',
        text: editingBarCode ? 'Código de barras actualizado correctamente' : 'Código de barras agregado correctamente',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#4F7FBF',
        background: '#ffffff',
        color: '#1f2937',
        customClass: {
          popup: 'rounded-lg shadow-xl',
          title: 'text-xl font-bold',
          content: 'text-gray-600',
          confirmButton: 'px-6 py-2 rounded-md font-medium'
        }
      });

      if (result.isConfirmed) {
        if (editingBarCode) {
          // Actualizar código existente
          setBarCodes(prev => prev.map(bc => 
            bc.id === editingBarCode.id 
              ? { ...bc, ...newBarCode, cantidad: parseInt(newBarCode.cantidad) }
              : bc
          ));
        } else {
          // Agregar nuevo código
          const newId = Math.max(...barCodes.map(bc => bc.id)) + 1;
          setBarCodes(prev => [...prev, {
            id: newId,
            ...newBarCode,
            cantidad: parseInt(newBarCode.cantidad)
          }]);
        }
        
        // Limpiar formulario y cerrar modal
        setNewBarCode({ barCode: '', lineCode: '', noParte: '', cantidad: '' });
        setEditingBarCode(null);
        setShowBarCodeModal(false);
      }
    } catch (error) {
      console.error('Error showing alert:', error);
    }
  };

  const handleEditBarCode = (barCode: BarCode) => {
    setEditingBarCode(barCode);
    setNewBarCode({
      barCode: barCode.barCode,
      lineCode: barCode.lineCode,
      noParte: barCode.noParte,
      cantidad: barCode.cantidad.toString()
    });
    setShowBarCodeModal(true);
  };

  const handleDeleteBarCode = async (id: number) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        setBarCodes(prev => prev.filter(bc => bc.id !== id));
        
        await Swal.fire({
          title: 'Eliminado',
          text: 'El código de barras ha sido eliminado',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#4F7FBF'
        });
      }
    } catch (error) {
      console.error('Error showing alert:', error);
    }
  };

  const handleRefreshBarCodes = async () => {
    setIsRefreshing(true);
    
    // Simular una actualización de datos
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      await Swal.fire({
        title: 'Actualizado',
        text: 'La tabla de códigos de barras ha sido actualizada',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#4F7FBF',
        timer: 2000,
        timerProgressBar: true,
        background: '#ffffff',
        color: '#1f2937',
        customClass: {
          popup: 'rounded-lg shadow-xl',
          title: 'text-xl font-bold',
          content: 'text-gray-600',
          confirmButton: 'px-6 py-2 rounded-md font-medium'
        }
      });
    } catch (error) {
      console.error('Error showing alert:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filtrar product trackers
  const filteredProductTrackers = productTrackers.filter(tracker => {
    if (!trackerSearchTerm) return true;
    
    const searchLower = trackerSearchTerm.toLowerCase();
    
    switch (trackerSearchFilter) {
      case 'Operacion':
        return tracker.operationNo.toLowerCase().includes(searchLower);
      case 'Bin':
        return tracker.subLocation.toLowerCase().includes(searchLower);
      case 'PartNo':
        return tracker.partNumber.toLowerCase().includes(searchLower);
      default:
        return tracker.operationNo.toLowerCase().includes(searchLower);
    }
  });

  const handleRefreshProductTracker = async () => {
    setIsRefreshingTracker(true);
    
    // Simular una actualización de datos
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      await Swal.fire({
        title: 'Actualizado',
        text: 'La tabla de ProductTracker ha sido actualizada',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#4F7FBF',
        timer: 2000,
        timerProgressBar: true,
        background: '#ffffff',
        color: '#1f2937',
        customClass: {
          popup: 'rounded-lg shadow-xl',
          title: 'text-xl font-bold',
          content: 'text-gray-600',
          confirmButton: 'px-6 py-2 rounded-md font-medium'
        }
      });
    } catch (error) {
      console.error('Error showing alert:', error);
    } finally {
      setIsRefreshingTracker(false);
    }
  };

  const goBack = () => {
    setSelectedFolio(null);
  };

  const goBackToCheckIn = () => {
    setIsCheckedIn(false);
    setSelectedFolio(null);
  };

  const handleViewDetails = (record: HistoryRecord) => {
    setSelectedHistoryRecord(record);
    setCurrentView('folio-details');
  };

  const handleUserSelection = (userId: number) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, selected: !user.selected } : user
    ));
  };

  const handleAssignLocation = async () => {
    const selectedUsers = users.filter(user => user.selected);
    
    if (selectedUsers.length === 0) {
      await Swal.fire({
        title: 'Error',
        text: 'Debe seleccionar al menos un usuario',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#4F7FBF'
      });
      return;
    }

    try {
      const result = await Swal.fire({
        title: 'Éxito',
        text: 'Se ha asignado la ubicación para el usuario el día de mañana',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#4F7FBF',
        background: '#ffffff',
        color: '#1f2937',
        customClass: {
          popup: 'rounded-lg shadow-xl',
          title: 'text-xl font-bold',
          content: 'text-gray-600',
          confirmButton: 'px-6 py-2 rounded-md font-medium'
        }
      });

      if (result.isConfirmed) {
        // Limpiar selecciones y cerrar modal
        setUsers(prev => prev.map(user => ({ ...user, selected: false })));
        setShowAssignModal(false);
      }
    } catch (error) {
      console.error('Error showing alert:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden lg:flex w-64 bg-gradient-to-b from-blue-800 to-blue-900 text-white flex-col">
        {/* Header */}
        <div className="p-4 border-b border-blue-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-800 font-bold text-sm">FN</span>
            </div>
            <span className="font-semibold">Frontera Net</span>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="font-medium">Rodolfo Ramirez</div>
              <div className="text-blue-200 text-sm">Usuario</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-colors duration-200 ${
                currentView === 'dashboard' ? 'bg-blue-700' : 'hover:bg-blue-700'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            
            <button
              onClick={() => setCurrentView('history')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-colors duration-200 ${
                currentView === 'history' ? 'bg-blue-700' : 'hover:bg-blue-700'
              }`}
            >
              <History className="w-5 h-5" />
              <span>Historial</span>
            </button>
            
            <button
              onClick={() => setCurrentView('barcodes')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-colors duration-200 ${
                currentView === 'barcodes' ? 'bg-blue-700' : 'hover:bg-blue-700'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>BarCodes</span>
            </button>
            
            <button
              onClick={() => setCurrentView('product-tracker')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-colors duration-200 ${
                currentView === 'product-tracker' ? 'bg-blue-700' : 'hover:bg-blue-700'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>ProductTracker</span>
            </button>
            
            <div className="text-blue-200 text-sm font-medium mt-4 mb-2">Facturación</div>
            
            <div className="text-blue-200 text-sm font-medium mt-4 mb-2">Cuentas x Cobrar</div>
            
            <div className="text-blue-200 text-sm font-medium mt-4 mb-2">OkAutoPartes</div>
            
            <div className="text-blue-200 text-sm font-medium mt-4 mb-2">WMS</div>
            <div className="ml-4 space-y-1">
              <div className="text-blue-200 text-sm px-3 py-1">• INB EMBARQUES</div>
              <div className="text-blue-200 text-sm px-3 py-1">• INB TRASPASOS</div>
              <div className="text-blue-200 text-sm px-3 py-1">• INVENTARIO</div>
              <div className="text-blue-200 text-sm px-3 py-1">• OUT TRASPASOS</div>
              <div className="text-blue-200 text-sm px-3 py-1">• OUT VENTAS</div>
              <div className="text-blue-200 text-sm px-3 py-1">• OPERADOR</div>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Menu className="w-6 h-6 text-gray-600" />
              <h1 className="text-lg sm:text-xl font-semibold text-gray-800">WMS - Menu</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                11
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 sm:p-6 bg-gray-50 overflow-auto">
          {currentView === 'folio-details' && selectedHistoryRecord ? (
            // Folio Details from History Screen
            <div className="max-w-7xl mx-auto">
              <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={() => setCurrentView('history')}
                  className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al historial
                </button>
                <h2 className="text-lg sm:text-2xl font-bold text-gray-800">Detalles del Folio - {selectedHistoryRecord.folio}</h2>
                </div>
                
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium whitespace-nowrap"
                >
                  Asignar ubicación
                </button>
              </div>
              
              {/* Form Fields */}
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Folio:</label>
                    <input
                      type="text"
                      value={selectedHistoryRecord.folio}
                      readOnly
                      className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">BIN:</label>
                    <input
                      type="text"
                      value={selectedHistoryRecord.ubicacion}
                      readOnly
                      className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Fecha:</label>
                    <input
                      type="text"
                      value={selectedHistoryRecord.fecha}
                      readOnly
                      className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Locación:</label>
                    <input
                      type="text"
                      value={selectedHistoryRecord.location}
                      readOnly
                      className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Hora de inicio:</label>
                    <input
                      type="time"
                      value={selectedHistoryRecord.horaInicio}
                      readOnly
                      className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Hora de fin:</label>
                    <input
                      type="time"
                      value={selectedHistoryRecord.horaFin}
                      readOnly
                      className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Usuario:</label>
                    <input
                      type="text"
                      value={selectedHistoryRecord.usuario}
                      readOnly
                      className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Productos Capturados:</label>
                    <input
                      type="text"
                      value={selectedHistoryRecord.productosCapturasdos.toString()}
                      readOnly
                      className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Productos en Ubicación:</label>
                    <input
                      type="text"
                      value={selectedHistoryRecord.productosEnUbicacion.toString()}
                      readOnly
                      className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Detalles de Productos</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Line Code</th>
                        <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Número de parte</th>
                        <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Cantidad</th>
                        <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Cantidad esperada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedHistoryRecord.productos.map((producto) => (
                        <tr key={producto.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3">
                            <span className="text-xs sm:text-sm text-gray-700">{producto.lineCode}</span>
                          </td>
                          <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3">
                            <span className="text-xs sm:text-sm text-gray-700">{producto.numeroParte}</span>
                          </td>
                          <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3">
                            <span className="text-xs sm:text-sm text-gray-700">{producto.cantidad}</span>
                          </td>
                          <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3">
                            <span className="text-xs sm:text-sm text-gray-700">{producto.cantidadEsperada}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Status indicator */}
                <div className="mt-4 sm:mt-6 flex justify-center">
                  <div className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-lg text-center ${
                    selectedHistoryRecord.productosCapturasdos === selectedHistoryRecord.productosEnUbicacion
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {selectedHistoryRecord.productosCapturasdos === selectedHistoryRecord.productosEnUbicacion ? (
                      <>
                        <CheckCircle className="w-5 h-5 inline mr-2" />
                        Conteo Correcto - Los productos coinciden
                      </>
                    ) : (
                      <>
                        ⚠ Diferencia Detectada - Revisar conteo
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : currentView === 'history' ? (
            // History Screen
            <div className="max-w-7xl mx-auto">
              <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2">Historial de Inventario</h2>
                  <p className="text-sm sm:text-base text-gray-600">Registro de todas las operaciones de inventario realizadas</p>
                </div>
                
                <div className="flex flex-col">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Ubicación:</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 min-w-[150px] sm:min-w-[200px]"
                  >
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700 border-b">Folio</th>
                        <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700 border-b hidden sm:table-cell">Ubicación</th>
                        <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700 border-b">Prod. Cap.</th>
                        <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700 border-b hidden md:table-cell">Prod. en Ubic.</th>
                        <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700 border-b hidden lg:table-cell">Usuario</th>
                        <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700 border-b">Estado</th>
                        <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700 border-b">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {historyRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-xs sm:text-sm font-medium text-gray-900">{record.folio}</td>
                          <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-700 hidden sm:table-cell">{record.ubicacion}</td>
                          <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-700 text-center">{record.productosCapturasdos}</td>
                          <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-700 text-center hidden md:table-cell">{record.productosEnUbicacion}</td>
                          <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-700 hidden lg:table-cell">{record.usuario}</td>
                          <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-xs sm:text-sm">
                            {record.productosCapturasdos === record.productosEnUbicacion ? (
                              <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✓ Coincide
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                ⚠ Diferencia
                              </span>
                            )}
                          </td>
                          <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-xs sm:text-sm">
                            <button
                              onClick={() => handleViewDetails(record)}
                              className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors duration-200"
                              title="Ver detalles"
                            >
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : currentView === 'barcodes' ? (
            // BarCodes Screen
            <div className="max-w-7xl mx-auto">
              <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2">Gestión de Códigos de Barras</h2>
                  <p className="text-sm sm:text-base text-gray-600">Administra todos los códigos de barras del sistema</p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 font-medium whitespace-nowrap flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Exportar
                  </button>
                  <button
                    onClick={() => {
                      setEditingBarCode(null);
                      setNewBarCode({ noParte: '', barCode: '', lineCode: '', cantidad: '' });
                      setShowBarCodeModal(true);
                    }}
                    className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium whitespace-nowrap flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Código
                  </button>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Buscar:</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar códigos de barras..."
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="sm:w-48">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Filtrar por:</label>
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <select
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value as 'Codigo' | 'NoParte')}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        <option value="Codigo">Código</option>
                        <option value="NoParte">No. Parte</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="sm:w-auto">
                    <button
                      onClick={handleRefreshBarCodes}
                      disabled={isRefreshing}
                      className="w-full sm:w-auto px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 font-medium flex items-center justify-center gap-2"
                      title="Actualizar tabla con filtros aplicados"
                    >
                      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline">Actualizar</span>
                    </button>
                  </div>
                </div>
                
                {searchTerm && (
                  <div className="mt-3 text-sm text-gray-600">
                    Mostrando {filteredBarCodes.length} de {barCodes.length} resultados
                    {` (filtrado por ${searchFilter})`}
                    {isRefreshing && (
                      <span className="ml-2 text-green-600 font-medium">
                        - Actualizando datos...
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* BarCodes Table */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700 border-b">Código de Barras</th>
                        <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700 border-b">Line Code</th>
                        <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700 border-b">No. Parte</th>
                        <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700 border-b">Cantidad</th>
                        <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700 border-b">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredBarCodes.length > 0 ? (
                        filteredBarCodes.map((barCode) => (
                          <tr key={barCode.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-700 font-mono">{barCode.barCode}</td>
                            <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-700">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {barCode.lineCode}
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-xs sm:text-sm font-medium text-gray-900">{barCode.noParte}</td>
                            <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-700 text-center font-semibold">{barCode.cantidad}</td>
                            <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-xs sm:text-sm">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEditBarCode(barCode)}
                                  className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors duration-200"
                                  title="Editar"
                                >
                                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteBarCode(barCode.id)}
                                  className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors duration-200"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center">
                              <BarChart3 className="w-12 h-12 text-gray-300 mb-4" />
                              <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {searchTerm ? 'No se encontraron resultados' : 'No hay códigos de barras'}
                              </h3>
                              <p className="text-gray-500 mb-4">
                                {searchTerm 
                                  ? 'Intenta con otros términos de búsqueda' 
                                  : 'Comienza agregando tu primer código de barras'
                                }
                              </p>
                              {!searchTerm && (
                                <button
                                  onClick={() => {
                                    setEditingBarCode(null);
                                    setNewBarCode({ barCode: '', lineCode: '', noParte: '', cantidad: '' });
                                    setShowBarCodeModal(true);
                                  }}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                                >
                                  <Plus className="w-4 h-4" />
                                  Agregar Código
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : currentView === 'product-tracker' ? (
            // ProductTracker Screen
            <div className="max-w-7xl mx-auto">
              <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2">ProductTracker</h2>
                  <p className="text-sm sm:text-base text-gray-600">Seguimiento de cambios en inventario de productos</p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 font-medium whitespace-nowrap flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Exportar
                  </button>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Buscar:</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={trackerSearchTerm}
                        onChange={(e) => setTrackerSearchTerm(e.target.value)}
                        placeholder="Buscar en ProductTracker..."
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="sm:w-48">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Filtrar por:</label>
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <select
                        value={trackerSearchFilter}
                        onChange={(e) => setTrackerSearchFilter(e.target.value as 'Operacion' | 'Bin' | 'PartNo')}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        <option value="Operacion">Operacion</option>
                        <option value="Bin">Bin</option>
                        <option value="PartNo">PartNo</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="sm:w-auto">
                    <button
                      onClick={handleRefreshProductTracker}
                      disabled={isRefreshingTracker}
                      className="w-full sm:w-auto px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 font-medium flex items-center justify-center gap-2"
                      title="Actualizar tabla con filtros aplicados"
                    >
                      <RefreshCw className={`w-4 h-4 ${isRefreshingTracker ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline">Actualizar</span>
                    </button>
                  </div>
                </div>
                
                {trackerSearchTerm && (
                  <div className="mt-3 text-sm text-gray-600">
                    Mostrando {filteredProductTrackers.length} de {productTrackers.length} resultados
                    {` (filtrado por ${trackerSearchFilter})`}
                    {isRefreshingTracker && (
                      <span className="ml-2 text-green-600 font-medium">
                        - Actualizando datos...
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* ProductTracker Table */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700 border-b">Operacion</th>
                        <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700 border-b">Código Línea</th>
                        <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700 border-b">No. Parte</th>
                        <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700 border-b hidden sm:table-cell">Ubicacion</th>
                        <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700 border-b hidden md:table-cell">Cant. Antes</th>
                        <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700 border-b hidden md:table-cell">Cant. Después</th>
                        <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700 border-b">Cambio Cant.</th>
                        <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700 border-b hidden xl:table-cell">Total</th>
                        <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700 border-b hidden lg:table-cell">Tipo Movimiento</th>
                        <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700 border-b hidden lg:table-cell">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredProductTrackers.length > 0 ? (
                        filteredProductTrackers.map((tracker) => (
                          <tr key={tracker.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-xs sm:text-sm font-medium text-gray-900">{tracker.operationNo}</td>
                            <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-700">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {tracker.lineCode}
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-xs sm:text-sm font-medium text-gray-900">{tracker.partNumber}</td>
                            <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-700 hidden sm:table-cell">{tracker.subLocation}</td>
                            <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-700 text-center font-semibold hidden md:table-cell">{tracker.qtyBefore}</td>
                            <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-700 text-center font-semibold hidden md:table-cell">{tracker.qtyAfter}</td>
                            <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-xs sm:text-sm text-center font-semibold">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                tracker.qtyChange > 0 
                                  ? 'bg-green-100 text-green-800' 
                                  : tracker.qtyChange < 0 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-gray-100 text-gray-800'
                              }`}>
                                {tracker.qtyChange > 0 ? '+' : ''}{tracker.qtyChange}
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-xs sm:text-sm font-bold text-gray-900 hidden xl:table-cell">{tracker.total.toLocaleString()}</td>
                            <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-700 hidden lg:table-cell">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                tracker.movementType === 'Entrada' 
                                  ? 'bg-green-100 text-green-800' 
                                  : tracker.movementType === 'Salida' 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {tracker.movementType}
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-700 hidden lg:table-cell">{tracker.fecha}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={10} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center">
                              <BarChart3 className="w-12 h-12 text-gray-300 mb-4" />
                              <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {trackerSearchTerm ? 'No se encontraron resultados' : 'No hay registros de seguimiento de productos'}
                              </h3>
                              <p className="text-gray-500 mb-4">
                                {trackerSearchTerm 
                                  ? 'Intenta con otros términos de búsqueda' 
                                  : 'Los registros de seguimiento de productos aparecerán aquí'
                                }
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : !isCheckedIn ? (
            // Check-in Screen
            <div className="flex items-center justify-center h-full">
              <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center max-w-sm sm:max-w-md w-full mx-4">
                <div className="mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Sistema de Check-in</h2>
                  <p className="text-sm sm:text-base text-gray-600">Presiona el botón para generar tu folio</p>
                </div>
                
                <button
                  onClick={handleCheckIn}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 text-sm sm:text-base rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  Check-in
                </button>
              </div>
            </div>
          ) : selectedFolio ? (
            // Folio Details Screen
            <div className="max-w-7xl mx-auto">
              <div className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-4">
                <button
                  onClick={goBack}
                  className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver a folios
                </button>
                <h2 className="text-lg sm:text-2xl font-bold text-gray-800">Detalles del Folio</h2>
              </div>
              
              {/* Form Fields */}
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Folio:</label>
                    <input
                      type="text"
                      value={selectedFolio}
                      readOnly
                      className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">BIN:</label>
                    <input
                      type="text"
                      value="TEC-C-19-5"
                      readOnly
                      className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Fecha:</label>
                    <input
                      type="text"
                      value="09/07/2025"
                      readOnly
                      className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Locación:</label>
                    <input
                      type="text"
                      value="Valentin"
                      readOnly
                      className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Hora de inicio:</label>
                    <input
                      type="time"
                      value={horaInicio}
                      onChange={(e) => setHoraInicio(e.target.value)}
                      className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Hora de fin:</label>
                    <input
                      type="time"
                      value={horaFin}
                      onChange={(e) => setHoraFin(e.target.value)}
                      className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Detalles de Productos</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Line Code</th>
                        <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Número de parte</th>
                        <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Cantidad</th>
                        <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableRows.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3">
                            {row.isEditable ? (
                              <input
                                type="text"
                                value={row.lineCode}
                                onChange={(e) => handleInputChange(row.id, 'lineCode', e.target.value)}
                                placeholder="Agregar Linea"
                                maxLength={3}
                                className="w-full px-1 sm:px-2 py-1 text-xs sm:text-sm border-0 focus:ring-2 focus:ring-blue-500 rounded"
                              />
                            ) : (
                              <span className="text-xs sm:text-sm text-gray-700">{row.lineCode}</span>
                            )}
                          </td>
                          <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3">
                            {row.isEditable ? (
                              <input
                                type="text"
                                value={row.numeroParte}
                                onChange={(e) => handleInputChange(row.id, 'numeroParte', e.target.value)}
                                placeholder="Agregar numero de parte"
                                maxLength={100}
                                className="w-full px-1 sm:px-2 py-1 text-xs sm:text-sm border-0 focus:ring-2 focus:ring-blue-500 rounded"
                              />
                            ) : (
                              <span className="text-xs sm:text-sm text-gray-700">{row.numeroParte}</span>
                            )}
                          </td>
                          <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3">
                            <input
                              type="number"
                              value={row.cantidad}
                              onChange={(e) => handleInputChange(row.id, 'cantidad', e.target.value)}
                              className="w-full px-1 sm:px-2 py-1 text-xs sm:text-sm border-0 focus:ring-2 focus:ring-blue-500 rounded"
                              placeholder="Ingrese cantidad"
                              min="0"
                              step="1"
                            />
                          </td>
                          <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3">
                            {row.isEditable && (
                              <button
                                onClick={() => deleteRow(row.id)}
                                className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors duration-200"
                                title="Eliminar fila"
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex justify-center">
                  <button
                    onClick={addNewRow}
                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    Agregar fila
                  </button>
                </div>

                <div className="mt-4 sm:mt-6 flex justify-center">
                  <button
                    onClick={handleCaptureCount}
                    className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center gap-1 sm:gap-2"
                  >
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    Capturar conteo
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Folios List Screen
            <div className="max-w-4xl mx-auto">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2">Folios Disponibles</h2>
                <p className="text-sm sm:text-base text-gray-600">Selecciona uno de los folios generados</p>
              </div>
              
              {folios.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {folios.map((folio) => (
                    <button
                      key={folio}
                      onClick={() => handleFolioClick(folio)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg font-medium"
                    >
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                      {folio}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">¡Excelente trabajo!</h3>
                  <p className="text-sm sm:text-base text-gray-600">Haz capturado todos tus folios del dia</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Asignar Ubicación */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Asignar Ubicación</h3>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Ubicación:</span> {selectedLocation}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Selecciona los usuarios que trabajarán en esta ubicación mañana
                </p>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 flex flex-col min-h-0 p-4 sm:p-6">
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Usuarios disponibles ({users.filter(u => u.selected).length} seleccionados)
                </p>
              </div>
                
              <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg min-h-0">
                <div className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <label 
                      key={user.id} 
                      className="flex items-center p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                    >
                      <input
                        type="checkbox"
                        checked={user.selected}
                        onChange={() => handleUserSelection(user.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">{user.name}</span>
                          {user.selected && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Seleccionado
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">Usuario del sistema</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
              
            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-gray-200 flex-shrink-0">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="text-xs text-gray-500">
                  {users.filter(u => u.selected).length > 0 ? (
                    `${users.filter(u => u.selected).length} usuario(s) seleccionado(s)`
                  ) : (
                    'Ningún usuario seleccionado'
                  )}
                </div>
                <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 font-medium rounded-lg transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAssignLocation}
                  disabled={users.filter(u => u.selected).length === 0}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Asignar
                </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Agregar/Editar Código de Barras */}
      {showBarCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  {editingBarCode ? 'Editar Código de Barras' : 'Agregar Código de Barras'}
                </h3>
                <button
                  onClick={() => {
                    setShowBarCodeModal(false);
                    setEditingBarCode(null);
                    setNewBarCode({ barCode: '', lineCode: '', noParte: '', cantidad: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Código de Barras *</label>
                  <input
                    type="text"
                    value={newBarCode.barCode}
                    onChange={(e) => setNewBarCode(prev => ({ ...prev, barCode: e.target.value }))}
                    placeholder="Ingrese el código de barras"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Line Code *</label>
                  <input
                    type="text"
                    value={newBarCode.lineCode}
                    onChange={(e) => setNewBarCode(prev => ({ ...prev, lineCode: e.target.value.toUpperCase() }))}
                    placeholder="Ej: GOB, MOT, FRE"
                    maxLength={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">No. Parte *</label>
                  <input
                    type="text"
                    value={newBarCode.noParte}
                    onChange={(e) => setNewBarCode(prev => ({ ...prev, noParte: e.target.value }))}
                    placeholder="Ingrese el número de parte"
                    disabled={editingBarCode !== null}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad *</label>
                  <input
                    type="number"
                    value={newBarCode.cantidad}
                    onChange={(e) => setNewBarCode(prev => ({ ...prev, cantidad: e.target.value }))}
                    placeholder="Ingrese la cantidad"
                    min="0"
                    step="1"
                    disabled={editingBarCode !== null}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>
            </div>
              
            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-gray-200">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowBarCodeModal(false);
                    setEditingBarCode(null);
                    setNewBarCode({ barCode: '', lineCode: '', noParte: '', cantidad: '' });
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 font-medium rounded-lg transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddBarCode}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  {editingBarCode ? 'Actualizar' : 'Agregar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
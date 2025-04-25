import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';

interface Measurement {
  _id: string;
  name: string;
  values: Record<string, number>;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Standard measurement fields
const MEASUREMENT_FIELDS = {
  chest: { label: 'Chest', unit: 'in' },
  waist: { label: 'Waist', unit: 'in' },
  hips: { label: 'Hips', unit: 'in' },
  inseam: { label: 'Inseam', unit: 'in' },
  shoulder: { label: 'Shoulder Width', unit: 'in' },
  sleeve: { label: 'Sleeve Length', unit: 'in' },
  neck: { label: 'Neck', unit: 'in' },
  thigh: { label: 'Thigh', unit: 'in' },
  height: { label: 'Height', unit: 'in' },
  weight: { label: 'Weight', unit: 'lbs' }
};

const MeasurementsManager: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentMeasurement, setCurrentMeasurement] = useState<Measurement | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    values: Record<string, number | string>;
    isDefault: boolean;
  }>({
    name: '',
    values: Object.keys(MEASUREMENT_FIELDS).reduce((acc, key) => {
      acc[key] = '';
      return acc;
    }, {} as Record<string, string>),
    isDefault: false
  });
  const [measurementUnit, setMeasurementUnit] = useState<'imperial' | 'metric'>('imperial');
  
  // Fetch measurements on component mount
  useEffect(() => {
    const fetchMeasurements = async () => {
      if (!isAuthenticated) {
        navigate('/login?redirect=/buyer/measurements');
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`${API_URL}/api/measurements`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data.success) {
          setMeasurements(response.data.data);
        } else {
          setError('Failed to fetch measurements');
        }
      } catch (err) {
        console.error('Error fetching measurements:', err);
        setError('An error occurred while fetching your measurements');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMeasurements();
  }, [isAuthenticated, navigate]);
  
  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else if (name.startsWith('measurement_')) {
      const fieldName = name.replace('measurement_', '');
      setFormData({
        ...formData,
        values: {
          ...formData.values,
          [fieldName]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // Handle unit toggle
  const handleUnitToggle = () => {
    setMeasurementUnit(prev => prev === 'imperial' ? 'metric' : 'imperial');
    
    // Convert values when toggling
    const convertedValues = { ...formData.values };
    
    Object.keys(convertedValues).forEach(key => {
      const value = parseFloat(convertedValues[key] as string);
      if (!isNaN(value)) {
        if (key === 'weight') {
          // Convert weight (lbs to kg or vice versa)
          convertedValues[key] = measurementUnit === 'imperial' 
            ? (value / 2.20462).toFixed(1) // lbs to kg
            : (value * 2.20462).toFixed(1); // kg to lbs
        } else {
          // Convert length (inches to cm or vice versa)
          convertedValues[key] = measurementUnit === 'imperial'
            ? (value * 2.54).toFixed(1) // inches to cm
            : (value / 2.54).toFixed(1); // cm to inches
        }
      }
    });
    
    setFormData({
      ...formData,
      values: convertedValues
    });
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      values: Object.keys(MEASUREMENT_FIELDS).reduce((acc, key) => {
        acc[key] = '';
        return acc;
      }, {} as Record<string, string>),
      isDefault: false
    });
    setCurrentMeasurement(null);
  };
  
  // Handle add measurement form submission
  const handleAddMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      setError('Please provide a name for this measurement set');
      return;
    }
    
    // Validate required fields and convert string values to numbers
    const numericValues: Record<string, number> = {};
    Object.keys(formData.values).forEach(key => {
      const value = parseFloat(formData.values[key] as string);
      if (!isNaN(value)) {
        numericValues[key] = value;
      }
    });
    
    if (Object.keys(numericValues).length === 0) {
      setError('Please provide at least one measurement value');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const measurementData = {
        name: formData.name,
        values: numericValues,
        isDefault: formData.isDefault,
        unit: measurementUnit
      };
      
      const response = await axios.post(
        `${API_URL}/api/measurements`,
        measurementData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        // Add new measurement to list
        setMeasurements([...measurements, response.data.data]);
        // Reset form and hide it
        resetForm();
        setShowAddForm(false);
      } else {
        setError('Failed to add measurement');
      }
    } catch (err) {
      console.error('Error adding measurement:', err);
      setError('An error occurred while adding the measurement');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle edit measurement
  const handleEditMeasurement = (measurement: Measurement) => {
    setCurrentMeasurement(measurement);
    
    // Convert stored numeric values to strings for the form
    const stringValues: Record<string, string> = {};
    Object.keys(measurement.values).forEach(key => {
      stringValues[key] = measurement.values[key].toString();
    });
    
    // Fill in empty values for fields not in the measurement
    Object.keys(MEASUREMENT_FIELDS).forEach(key => {
      if (!stringValues[key]) {
        stringValues[key] = '';
      }
    });
    
    setFormData({
      name: measurement.name,
      values: stringValues,
      isDefault: measurement.isDefault
    });
    
    setShowEditForm(true);
  };
  
  // Handle update measurement form submission
  const handleUpdateMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentMeasurement) return;
    
    if (!formData.name) {
      setError('Please provide a name for this measurement set');
      return;
    }
    
    // Validate required fields and convert string values to numbers
    const numericValues: Record<string, number> = {};
    Object.keys(formData.values).forEach(key => {
      const value = parseFloat(formData.values[key] as string);
      if (!isNaN(value)) {
        numericValues[key] = value;
      }
    });
    
    if (Object.keys(numericValues).length === 0) {
      setError('Please provide at least one measurement value');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const measurementData = {
        name: formData.name,
        values: numericValues,
        isDefault: formData.isDefault,
        unit: measurementUnit
      };
      
      const response = await axios.put(
        `${API_URL}/api/measurements/${currentMeasurement._id}`,
        measurementData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        // Update measurement in list
        setMeasurements(measurements.map(m => 
          m._id === currentMeasurement._id ? response.data.data : m
        ));
        // Reset form and hide it
        resetForm();
        setShowEditForm(false);
      } else {
        setError('Failed to update measurement');
      }
    } catch (err) {
      console.error('Error updating measurement:', err);
      setError('An error occurred while updating the measurement');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle delete measurement
  const handleDeleteMeasurement = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this measurement set?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.delete(
        `${API_URL}/api/measurements/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        // Remove measurement from list
        setMeasurements(measurements.filter(m => m._id !== id));
      } else {
        setError('Failed to delete measurement');
      }
    } catch (err) {
      console.error('Error deleting measurement:', err);
      setError('An error occurred while deleting the measurement');
    } finally {
      setLoading(false);
    }
  };
  
  // Set as default measurement
  const handleSetDefault = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.put(
        `${API_URL}/api/measurements/${id}/default`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        // Update measurements list to reflect new default
        setMeasurements(measurements.map(m => ({
          ...m,
          isDefault: m._id === id
        })));
      } else {
        setError('Failed to set default measurement');
      }
    } catch (err) {
      console.error('Error setting default measurement:', err);
      setError('An error occurred while setting the default measurement');
    } finally {
      setLoading(false);
    }
  };
  
  // Get unit label
  const getUnitLabel = (fieldName: string) => {
    if (measurementUnit === 'metric') {
      return fieldName === 'weight' ? 'kg' : 'cm';
    } else {
      return MEASUREMENT_FIELDS[fieldName as keyof typeof MEASUREMENT_FIELDS].unit;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Measurements</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {/* Add Measurement Button */}
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => {
              resetForm();
              setShowAddForm(!showAddForm);
              setShowEditForm(false);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {showAddForm ? 'Cancel' : 'Add New Measurements'}
          </button>
          
          <div className="text-sm">
            <span className="mr-2">Units:</span>
            <button
              onClick={handleUnitToggle}
              className={`px-3 py-1 rounded-l-md ${
                measurementUnit === 'imperial' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Imperial (in/lbs)
            </button>
            <button
              onClick={handleUnitToggle}
              className={`px-3 py-1 rounded-r-md ${
                measurementUnit === 'metric' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Metric (cm/kg)
            </button>
          </div>
        </div>
        
        {/* Add Measurement Form */}
        {showAddForm && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Measurements</h2>
              
              <form onSubmit={handleAddMeasurement}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Measurement Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., My Measurements, Formal Suit, etc."
                  />
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Measurement Values</h3>
                  <p className="text-xs text-gray-500 mb-4">Enter the measurements in {measurementUnit === 'imperial' ? 'inches/pounds' : 'centimeters/kilograms'}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(MEASUREMENT_FIELDS).map(([key, { label }]) => (
                      <div key={key}>
                        <label htmlFor={`measurement_${key}`} className="block text-sm text-gray-600 mb-1">
                          {label} ({getUnitLabel(key)})
                        </label>
                        <input
                          id={`measurement_${key}`}
                          name={`measurement_${key}`}
                          type="number"
                          step="0.1"
                          value={formData.values[key] || ''}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          placeholder={`Enter ${label.toLowerCase()}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      id="isDefault"
                      name="isDefault"
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600"
                    />
                    <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                      Set as default measurements
                    </label>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                  >
                    {loading ? 'Saving...' : 'Save Measurements'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Edit Measurement Form */}
        {showEditForm && currentMeasurement && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Measurements</h2>
              
              <form onSubmit={handleUpdateMeasurement}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Measurement Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Measurement Values</h3>
                  <p className="text-xs text-gray-500 mb-4">Enter the measurements in {measurementUnit === 'imperial' ? 'inches/pounds' : 'centimeters/kilograms'}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(MEASUREMENT_FIELDS).map(([key, { label }]) => (
                      <div key={key}>
                        <label htmlFor={`measurement_${key}`} className="block text-sm text-gray-600 mb-1">
                          {label} ({getUnitLabel(key)})
                        </label>
                        <input
                          id={`measurement_${key}`}
                          name={`measurement_${key}`}
                          type="number"
                          step="0.1"
                          value={formData.values[key] || ''}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          placeholder={`Enter ${label.toLowerCase()}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      id="isDefault"
                      name="isDefault"
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600"
                    />
                    <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                      Set as default measurements
                    </label>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setShowEditForm(false);
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                  >
                    {loading ? 'Saving...' : 'Update Measurements'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Measurements List */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {loading && !showAddForm && !showEditForm ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : measurements.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No measurements found</h3>
              <p className="text-gray-600 mb-6">
                Add your measurements to make the ordering process faster and ensure perfect fits.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Measurements
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Key Measurements
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {measurements.map((measurement) => (
                    <tr key={measurement._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{measurement.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {Object.entries(measurement.values)
                            .slice(0, 3) // Show first 3 measurements
                            .map(([key, value]) => (
                              <div key={key}>
                                {MEASUREMENT_FIELDS[key as keyof typeof MEASUREMENT_FIELDS]?.label}: {value} 
                                {getUnitLabel(key)}
                              </div>
                            ))}
                          {Object.keys(measurement.values).length > 3 && (
                            <div className="text-gray-400">+{Object.keys(measurement.values).length - 3} more</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(measurement.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {measurement.isDefault ? (
                          <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                            Default
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetDefault(measurement._id)}
                            className="text-sm text-blue-600 hover:text-blue-900"
                          >
                            Set as Default
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditMeasurement(measurement)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        
                        <button
                          onClick={() => handleDeleteMeasurement(measurement._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeasurementsManager; 
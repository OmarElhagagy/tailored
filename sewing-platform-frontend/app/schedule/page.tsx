'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/FormElements';
import Link from 'next/link';

// Mock data for calendar events
const MOCK_APPOINTMENTS = [
  {
    id: 'appt-1',
    title: 'Suit Fitting',
    tailorName: 'James Thompson',
    date: '2023-06-15',
    startTime: '10:00',
    endTime: '11:00',
    status: 'confirmed'
  },
  {
    id: 'appt-2',
    title: 'Dress Alteration',
    tailorName: 'Emma Davis',
    date: '2023-06-18',
    startTime: '14:00',
    endTime: '15:00',
    status: 'pending'
  },
  {
    id: 'appt-3',
    title: 'Measurement Session',
    tailorName: 'Michael Chen',
    date: '2023-06-22',
    startTime: '16:30',
    endTime: '17:30',
    status: 'confirmed'
  }
];

// Available time slots for bookings
const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

export default function SchedulePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTailor, setSelectedTailor] = useState('');
  const [view, setView] = useState('list'); // 'list' or 'calendar'
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Calculate dates for next 14 days for the date selector
  const nextTwoWeeks = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Authentication and data loading check
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle appointment cancellation
  const handleCancelAppointment = (appointmentId) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      setAppointments(appointments.filter(appt => appt.id !== appointmentId));
    }
  };

  // Handle booking new appointment
  const handleBookAppointment = (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const newAppointment = {
      id: `appt-${Date.now()}`,
      title: formData.get('appointmentType'),
      tailorName: formData.get('tailor'),
      date: formData.get('date'),
      startTime: formData.get('time'),
      endTime: calculateEndTime(formData.get('time')),
      status: 'pending'
    };
    
    setAppointments([...appointments, newAppointment]);
    setShowBookingModal(false);
    e.target.reset();
  };

  // Calculate end time (1 hour after start)
  const calculateEndTime = (startTime) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endDate = new Date();
    endDate.setHours(hours + 1, minutes);
    return `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Appointment Schedule
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage your appointments with tailors
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <div className="flex rounded-md">
                <button
                  onClick={() => setView('list')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                    view === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setView('calendar')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                    view === 'calendar'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  Calendar
                </button>
              </div>
              <Button
                variant="primary"
                onClick={() => setShowBookingModal(true)}
              >
                Book Appointment
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-4">
            <div className="w-full sm:w-auto">
              <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filter by date
              </label>
              <select
                id="date-filter"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-auto rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">All dates</option>
                {nextTwoWeeks.map(date => (
                  <option key={date} value={date}>
                    {formatDate(date)}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-auto">
              <label htmlFor="tailor-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filter by tailor
              </label>
              <select
                id="tailor-filter"
                value={selectedTailor}
                onChange={(e) => setSelectedTailor(e.target.value)}
                className="w-full sm:w-auto rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">All tailors</option>
                <option value="James Thompson">James Thompson</option>
                <option value="Emma Davis">Emma Davis</option>
                <option value="Michael Chen">Michael Chen</option>
              </select>
            </div>
          </div>

          {/* List View */}
          {view === 'list' && (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {appointments
                .filter(appt => !selectedDate || appt.date === selectedDate)
                .filter(appt => !selectedTailor || appt.tailorName === selectedTailor)
                .sort((a, b) => new Date(`${a.date} ${a.startTime}`) - new Date(`${b.date} ${b.startTime}`))
                .map(appointment => (
                  <div key={appointment.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {appointment.title}
                          </h3>
                          <span className={`ml-3 inline-flex text-xs px-2.5 py-0.5 rounded-full ${
                            appointment.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          }`}>
                            {appointment.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          with {appointment.tailorName}
                        </p>
                      </div>
                      <div className="mt-3 md:mt-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(appointment.date)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {appointment.startTime} - {appointment.endTime}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end space-x-3">
                      <Link href={`/messages/${appointment.id}`}>
                        <Button variant="outline" size="sm">
                          Message
                        </Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
              
              {appointments
                .filter(appt => !selectedDate || appt.date === selectedDate)
                .filter(appt => !selectedTailor || appt.tailorName === selectedTailor)
                .length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    No appointments found for the selected filters.
                  </p>
                  <Button
                    variant="primary"
                    className="mt-4"
                    onClick={() => setShowBookingModal(true)}
                  >
                    Book New Appointment
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Calendar View */}
          {view === 'calendar' && (
            <div className="p-6">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  June 2023
                </h2>
              </div>
              <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2 text-sm">
                {Array.from({ length: 35 }).map((_, i) => {
                  const day = i - 3; // Start from May 29 (3 days before June)
                  const date = new Date(2023, 5, day);
                  const dateString = date.toISOString().split('T')[0];
                  const isCurrentMonth = date.getMonth() === 5;
                  const hasAppointment = appointments.some(appt => appt.date === dateString);
                  
                  return (
                    <div
                      key={i}
                      className={`
                        p-2 h-24 border rounded-md relative 
                        ${isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750 text-gray-400 dark:text-gray-500'}
                        ${hasAppointment ? 'ring-2 ring-blue-200 dark:ring-blue-900' : ''}
                      `}
                    >
                      <div className="font-medium">{date.getDate()}</div>
                      {appointments
                        .filter(appt => appt.date === dateString)
                        .slice(0, 2)
                        .map(appt => (
                          <div 
                            key={appt.id}
                            className={`
                              mt-1 px-1 py-0.5 text-xs rounded truncate
                              ${appt.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                              }
                            `}
                          >
                            {appt.startTime} {appt.title}
                          </div>
                        ))}
                      {appointments.filter(appt => appt.date === dateString).length > 2 && (
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          +{appointments.filter(appt => appt.date === dateString).length - 2} more
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Book New Appointment
                </h2>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <form onSubmit={handleBookAppointment} className="p-6 space-y-4">
              <div>
                <label htmlFor="appointmentType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Appointment Type *
                </label>
                <select
                  id="appointmentType"
                  name="appointmentType"
                  required
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select appointment type</option>
                  <option value="Initial Consultation">Initial Consultation</option>
                  <option value="Measurement Session">Measurement Session</option>
                  <option value="Suit Fitting">Suit Fitting</option>
                  <option value="Dress Fitting">Dress Fitting</option>
                  <option value="Alterations">Alterations</option>
                  <option value="Final Fitting">Final Fitting</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="tailor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Tailor *
                </label>
                <select
                  id="tailor"
                  name="tailor"
                  required
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select a tailor</option>
                  <option value="James Thompson">James Thompson</option>
                  <option value="Emma Davis">Emma Davis</option>
                  <option value="Michael Chen">Michael Chen</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date *
                </label>
                <select
                  id="date"
                  name="date"
                  required
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select a date</option>
                  {nextTwoWeeks.map(date => (
                    <option key={date} value={date}>
                      {formatDate(date)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time *
                </label>
                <select
                  id="time"
                  name="time"
                  required
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select a time</option>
                  {TIME_SLOTS.map(time => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  placeholder="Add any special requests or details for the tailor"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                ></textarea>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBookingModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                >
                  Book Appointment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

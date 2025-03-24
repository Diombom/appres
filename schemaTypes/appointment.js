export default {
    name: 'appointment',
    title: 'Appointment',
    type: 'document',
    fields: [
      { name: 'fullName', title: 'Full Name', type: 'string' },
      { name: 'email', title: 'Email', type: 'string' },
      { name: 'phone', title: 'Phone', type: 'string' },
      { name: 'currentDate', title: 'Current Date', type: 'datetime' },
      { name: 'newDate', title: 'New Date', type: 'datetime' },
      { name: 'time', title: 'Time', type: 'string' },
      { name: 'location', title: 'Location', type: 'string' }
    ]
  }
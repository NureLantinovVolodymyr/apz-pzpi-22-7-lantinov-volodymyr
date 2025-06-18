export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatNumber = (number, decimals = 1) => {
  return Number(number).toFixed(decimals)
}

export const formatPercent = (number) => {
  return `${Number(number).toFixed(1)}%`
}

export const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${meters.toFixed(0)} m`
  }
  return `${(meters / 1000).toFixed(1)} km`
}

export const formatDuration = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}

export const getStatusColor = (status) => {
  switch (status) {
    case 'online':
    case 'active':
    case 'running':
      return '#D8F1A0'
    case 'offline':
    case 'inactive':
    case 'stopped':
      return '#878E88'
    case 'warning':
      return '#EFCEFA'
    case 'error':
    case 'emergency':
      return '#FE5E41'
    default:
      return '#403D58'
  }
}

export const getSeverityColor = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'critical':
      return '#FE5E41'
    case 'high':
      return '#FE5E41'
    case 'medium':
      return '#EFCEFA'
    case 'low':
      return '#D8F1A0'
    default:
      return '#878E88'
  }
}
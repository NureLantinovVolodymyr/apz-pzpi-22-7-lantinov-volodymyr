import { motion } from 'framer-motion'

const LoadingSpinner = ({ size = 'large' }) => {
  const sizes = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <motion.div
        className={`${sizes[size]} border-4 border-gray-300 border-t-4 border-t-coral rounded-full`}
        style={{
          borderTopColor: '#FE5E41'
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    </div>
  )
}

export default LoadingSpinner
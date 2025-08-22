import React from 'react'

const Loader = () => {
  return (
         <div>
          <div className="flex items-center mb-4 text-purple-600 min-h-screen justify-center ">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-600 border-t-transparent mr-2"></div>
          </div>

        </div>
  )
}

export default Loader

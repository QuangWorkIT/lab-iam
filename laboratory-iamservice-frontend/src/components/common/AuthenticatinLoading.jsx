import { motion } from "motion/react"


function AuthenticatinLoading() {
  return (
    <motion.div
        initial={{ opacity: 0}}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, repeat: Infinity}}
        className="h-screen w-screen flex items-center justify-center"
    >
      <p style={{margin: 0, color:"#777777"}}>Authenticating...</p>
    </motion.div>
  )
}

export default AuthenticatinLoading

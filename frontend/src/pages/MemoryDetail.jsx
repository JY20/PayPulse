import { useParams, useNavigate } from 'react-router-dom'
import memoriesData from '../data/memories.json'

const MemoryDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const memories = memoriesData.memories

  const currentMemory = memories.find(m => m.id === parseInt(id))

  if (!currentMemory) {
    return (
      <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at center, #1a0a1f 0%, #0a0510 50%, #000000 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <h2>Memory not found</h2>
          <button onClick={() => navigate('/')} style={{ marginTop: '20px', padding: '10px 20px', background: '#ec4899', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const currentIndex = memories.findIndex(m => m.id === parseInt(id))
  const nextMemory = currentIndex < memories.length - 1 ? memories[currentIndex + 1] : memories[0]
  const prevMemory = currentIndex > 0 ? memories[currentIndex - 1] : memories[memories.length - 1]

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'radial-gradient(ellipse at center, #1a0a1f 0%, #0a0510 50%, #000000 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Subtle glow effect */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '800px',
        height: '800px',
        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Content */}
      <div style={{ 
        maxWidth: '900px', 
        width: '100%',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Image */}
        <img
          src={currentMemory.image}
          alt="Memory"
          style={{
            width: '100%',
            maxHeight: '70vh',
            objectFit: 'contain',
            borderRadius: '16px',
            boxShadow: '0 25px 80px rgba(236, 72, 153, 0.4), 0 10px 40px rgba(0, 0, 0, 0.5)',
            marginBottom: '30px'
          }}
        />

        {/* Date */}
        <div style={{ 
          fontSize: '16px',
          color: '#ec4899',
          marginBottom: '20px',
          fontWeight: '500',
          textShadow: '0 2px 10px rgba(236, 72, 153, 0.5)'
        }}>
          {currentMemory.date}
        </div>

        {/* Quote */}
        <p style={{ 
          fontSize: '28px', 
          fontStyle: 'italic', 
          color: '#fecdd3',
          lineHeight: '1.6',
          maxWidth: '700px',
          margin: '0 auto',
          textShadow: '0 2px 20px rgba(0, 0, 0, 0.8)'
        }}>
          "{currentMemory.quote}"
        </p>
      </div>
    </div>
  )
}

export default MemoryDetail

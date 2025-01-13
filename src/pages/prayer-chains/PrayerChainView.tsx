import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import api from '@/services/api'
import { PrayerChainsState, PrayerChain } from '@/store/slices/prayerChainsSlice'

export default function PrayerChainView() {
  const { chainId } = useParams()
  const [chain, setChain] = useState<PrayerChain | null>(null)
  const [loading, setLoading] = useState(true)
  const userChains = useSelector((state: RootState) => (state.prayerChains as PrayerChainsState).userChains)

  const isParticipant = userChains.includes(chainId!)

  useEffect(() => {
    const fetchChain = async () => {
      try {
        const response = await api.get(`/prayer-chains/${chainId}`)
        setChain(response.data)
      } catch (error) {
        console.error('Failed to fetch prayer chain:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchChain()
  }, [chainId])

  const handleJoin = async () => {
    try {
      await api.post(`/prayer-chains/${chainId}/join`)
      // Refresh chain data
      const response = await api.get(`/prayer-chains/${chainId}`)
      setChain(response.data)
    } catch (error) {
      console.error('Failed to join prayer chain:', error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!chain) {
    return <div>Prayer chain not found</div>
  }

  return (
    <div>
      <h1>{chain.title}</h1>
      <p>{chain.description}</p>
      {!isParticipant && (
        <button onClick={handleJoin}>Join Prayer Chain</button>
      )}
    </div>
  )
} 

'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type Job = {
  id: string
  title: string
  description: string
  location: string
  job_type: string
  salary_range: string
  created_at: string
  profiles?: { company_name: string }
}

const JOB_TYPES = ['All', 'full-time', 'part-time', 'contract', 'remote']

export default function CandidateDashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [jobs, setJobs] = useState<Job[]>([])
  const [filtered, setFiltered] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [jobType, setJobType] = useState('All')
  const [applying, setApplying] = useState<string | null>(null)
  const [applied, setApplied] = useState<string[]>([])
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data } = await supabase
        .from('jobs')
        .select('*, profiles(company_name)')
        .eq('status', 'open')
        .order('created_at', { ascending: false })

      if (data) {
        setJobs(data)
        setFiltered(data)
        if (data.length > 0) setSelectedJob(data[0])
      }

      if (user) {
        const { data: apps } = await supabase
          .from('applications')
          .select('job_id')
          .eq('candidate_id', user.id)
        if (apps) setApplied(apps.map((a: any) => a.job_id))
      }

      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    let result = jobs
    if (search) result = result.filter(j =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.profiles?.company_name?.toLowerCase().includes(search.toLowerCase())
    )
    if (locationFilter) result = result.filter(j =>
      j.location?.toLowerCase().includes(locationFilter.toLowerCase())
    )
    if (jobType !== 'All') result = result.filter(j => j.job_type === jobType)
    setFiltered(result)
    if (result.length > 0) setSelectedJob(result[0])
  }, [search, locationFilter, jobType, jobs])

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleApply = async (job: Job) => {
    if (!user) {
      router.push('/login/candidate')
      return
    }
    setApplying(job.id)
    const { error } = await supabase.from('applications').insert({
      job_id: job.id,
      candidate_id: user.id,
      status: 'applied',
    })
    if (error) {
      showToast('Failed to apply. Please try again.', 'error')
    } else {
      setApplied(prev => [...prev, job.id])
      showToast(`Successfully applied for "${job.title}"!`)
    }
    setApplying(null)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const timeAgo = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000 / 60)
    if (diff < 60) return `${diff}m ago`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
    return `${Math.floor(diff / 1440)}d ago`
  }

  const getInitials = (name: string) => name?.slice(0, 2).toUpperCase() ?? 'CB'

  const avatarColors = [
    '#4f6aff', '#059669', '#d97706', '#7c3aed', '#db2777', '#0891b2'
  ]
  const getColor = (name: string) => avatarColors[(name?.charCodeAt(0) ?? 0) % avatarColors.length]

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#f8faff', minHeight: '100vh' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 999,
          background: toast.type === 'success' ? '#1e3a8a' : '#dc2626',
          color: '#fff', padding: '12px 20px', borderRadius: 12,
          fontSize: 13, fontWeight: 500, boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
        }}>
          {toast.msg}
        </div>
      )}

      {/* Navbar */}
      <nav style={{
        background: '#fff', borderBottom: '1px solid #e5e7eb',
        position: 'sticky', top: 0, zIndex: 40,
        padding: '0 32px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span style={{ fontSize: 22, color: '#4f6aff' }}>◈</span>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#1e3a8a', letterSpacing: '-0.02em' }}>CareerBonus</span>
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {user ? (
            <>
              <span style={{ fontSize: 13, color: '#6b7280' }}>
                Hi, {user.user_metadata?.full_name?.split(' ')[0] ?? 'there'} 👋
              </span>
              <button
                onClick={handleLogout}
                style={{
                  fontSize: 13, border: '1px solid #e5e7eb', padding: '7px 16px',
                  borderRadius: 8, color: '#374151', background: '#fff',
                  cursor: 'pointer', fontWeight: 500
                }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <a href="/login/candidate" style={{
                fontSize: 13, color: '#4f6aff', fontWeight: 600,
                textDecoration: 'none', padding: '7px 16px',
                border: '1px solid #e0e7ff', borderRadius: 8
              }}>Sign in</a>
              <a href="/signup/candidate" style={{
                fontSize: 13, color: '#fff', fontWeight: 600,
                textDecoration: 'none', padding: '7px 16px',
                background: '#4f6aff', borderRadius: 8
              }}>Register</a>
            </>
          )}
        </div>
      </nav>

      {/* Hero Search Bar */}
      <div style={{
        background: 'linear-gradient(135deg, #eef2ff 0%, #e8f0fe 100%)',
        padding: '36px 32px'
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h1 style={{
            fontSize: 26, fontWeight: 800, color: '#1e3a8a',
            marginBottom: 6, letterSpacing: '-0.02em'
          }}>
            Find Your Next Career Move
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
            {jobs.length} open positions · Get rewarded when hired
          </p>

          {/* Search row */}
          <div style={{
            background: '#fff', borderRadius: 16, padding: 8,
            display: 'flex', gap: 8, boxShadow: '0 4px 24px rgba(79,106,255,0.1)',
            border: '1px solid #e0e7ff', flexWrap: 'wrap'
          }}>
            {/* Title search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 160, padding: '4px 12px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Job title or company"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  flex: 1, fontSize: 13, border: 'none', outline: 'none',
                  color: '#374151', background: 'transparent'
                }}
              />
            </div>

            <div style={{ width: 1, background: '#e5e7eb', margin: '4px 0' }}/>

            {/* Location */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 140, padding: '4px 12px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <input
                type="text"
                placeholder="Location"
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                style={{
                  flex: 1, fontSize: 13, border: 'none', outline: 'none',
                  color: '#374151', background: 'transparent'
                }}
              />
            </div>

            <button style={{
              background: 'linear-gradient(135deg, #4f6aff, #3b5bdb)',
              color: '#fff', border: 'none', borderRadius: 10,
              padding: '10px 28px', fontSize: 13, fontWeight: 700, cursor: 'pointer'
            }}>
              Search
            </button>
          </div>

          {/* Job type filter pills */}
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            {JOB_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setJobType(type)}
                style={{
                  fontSize: 12, padding: '6px 14px', borderRadius: 20,
                  border: jobType === type ? 'none' : '1px solid #e0e7ff',
                  background: jobType === type ? '#4f6aff' : '#fff',
                  color: jobType === type ? '#fff' : '#6b7280',
                  fontWeight: jobType === type ? 600 : 400,
                  cursor: 'pointer', transition: 'all 0.15s', textTransform: 'capitalize'
                }}
              >
                {type === 'All' ? 'All Types' : type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Two-Panel Layout */}
      <div style={{ maxWidth: 1100, margin: '24px auto', padding: '0 24px', display: 'flex', gap: 20 }}>

        {/* Left: Job List */}
        <div style={{ width: 380, flexShrink: 0 }}>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 14 }}>
            <strong style={{ color: '#1e3a8a' }}>{filtered.length}</strong> jobs found
          </p>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{
                  background: '#e5e7eb', borderRadius: 16, height: 110,
                  animation: 'pulse 1.5s ease infinite'
                }}/>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              background: '#fff', borderRadius: 16, padding: 40,
              textAlign: 'center', border: '2px dashed #e5e7eb'
            }}>
              <p style={{ color: '#9ca3af', fontSize: 14 }}>No jobs found</p>
              <p style={{ color: '#d1d5db', fontSize: 12, marginTop: 4 }}>Try adjusting your filters</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 'calc(100vh - 280px)', overflowY: 'auto', paddingRight: 4 }}>
              {filtered.map(job => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  style={{
                    background: selectedJob?.id === job.id ? '#eef2ff' : '#fff',
                    border: selectedJob?.id === job.id ? '1.5px solid #4f6aff' : '1.5px solid #f3f4f6',
                    borderRadius: 16, padding: '16px 18px', cursor: 'pointer',
                    transition: 'all 0.15s',
                    boxShadow: selectedJob?.id === job.id ? '0 4px 20px rgba(79,106,255,0.1)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    {/* Avatar */}
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      background: getColor(job.profiles?.company_name ?? ''),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: 14
                    }}>
                      {getInitials(job.profiles?.company_name ?? 'CB')}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#1e3a8a', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {job.title}
                      </p>
                      <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                        {job.profiles?.company_name ?? 'Company'}
                      </p>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {job.location && (
                          <span style={{ fontSize: 11, background: '#f3f4f6', color: '#6b7280', padding: '3px 8px', borderRadius: 6 }}>
                            📍 {job.location}
                          </span>
                        )}
                        {job.job_type && (
                          <span style={{ fontSize: 11, background: '#eef2ff', color: '#4f6aff', padding: '3px 8px', borderRadius: 6, textTransform: 'capitalize' }}>
                            {job.job_type}
                          </span>
                        )}
                        {job.salary_range && (
                          <span style={{ fontSize: 11, background: '#f0fdf4', color: '#059669', padding: '3px 8px', borderRadius: 6 }}>
                            {job.salary_range}
                          </span>
                        )}
                      </div>
                    </div>

                    <span style={{ fontSize: 11, color: '#d1d5db', flexShrink: 0 }}>
                      {timeAgo(job.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Job Detail Panel */}
        <div style={{ flex: 1 }}>
          {selectedJob ? (
            <div style={{
              background: '#fff', borderRadius: 20, padding: 32,
              border: '1px solid #e5e7eb', position: 'sticky', top: 80
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 14,
                    background: getColor(selectedJob.profiles?.company_name ?? ''),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 800, fontSize: 20
                  }}>
                    {getInitials(selectedJob.profiles?.company_name ?? 'CB')}
                  </div>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1e3a8a', letterSpacing: '-0.02em' }}>
                      {selectedJob.title}
                    </h2>
                    <p style={{ fontSize: 14, color: '#6b7280', marginTop: 2 }}>
                      {selectedJob.profiles?.company_name ?? 'Company'}
                    </p>
                  </div>
                </div>

                {/* Apply button */}
                {applied.includes(selectedJob.id) ? (
                  <div style={{
                    background: '#f0fdf4', border: '1px solid #bbf7d0',
                    color: '#059669', padding: '10px 24px', borderRadius: 12,
                    fontSize: 14, fontWeight: 600
                  }}>
                    ✓ Applied
                  </div>
                ) : (
                  <button
                    onClick={() => handleApply(selectedJob)}
                    disabled={applying === selectedJob.id}
                    style={{
                      background: 'linear-gradient(135deg, #4f6aff, #3b5bdb)',
                      color: '#fff', border: 'none', padding: '12px 28px',
                      borderRadius: 12, fontSize: 14, fontWeight: 700,
                      cursor: applying === selectedJob.id ? 'not-allowed' : 'pointer',
                      opacity: applying === selectedJob.id ? 0.7 : 1,
                      boxShadow: '0 4px 16px rgba(79,106,255,0.3)'
                    }}
                  >
                    {applying === selectedJob.id ? 'Applying...' : user ? 'Apply Now' : 'Sign in to Apply'}
                  </button>
                )}
              </div>

              {/* Tags row */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
                {selectedJob.location && (
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: 13, background: '#f8faff', border: '1px solid #e0e7ff',
                    color: '#4b5563', padding: '6px 14px', borderRadius: 10
                  }}>
                    📍 {selectedJob.location}
                  </span>
                )}
                {selectedJob.job_type && (
                  <span style={{
                    fontSize: 13, background: '#eef2ff', border: '1px solid #c7d2fe',
                    color: '#4f6aff', padding: '6px 14px', borderRadius: 10,
                    textTransform: 'capitalize', fontWeight: 500
                  }}>
                    {selectedJob.job_type}
                  </span>
                )}
                {selectedJob.salary_range && (
                  <span style={{
                    fontSize: 13, background: '#f0fdf4', border: '1px solid #bbf7d0',
                    color: '#059669', padding: '6px 14px', borderRadius: 10, fontWeight: 500
                  }}>
                    💰 {selectedJob.salary_range}
                  </span>
                )}
                <span style={{
                  fontSize: 13, background: '#fafafa', border: '1px solid #e5e7eb',
                  color: '#9ca3af', padding: '6px 14px', borderRadius: 10
                }}>
                  🕐 Posted {timeAgo(selectedJob.created_at)}
                </span>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: '#f3f4f6', marginBottom: 24 }}/>

              {/* Description */}
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e3a8a', marginBottom: 12 }}>
                  Job Description
                </h3>
                <p style={{
                  fontSize: 14, color: '#4b5563', lineHeight: 1.8,
                  whiteSpace: 'pre-line'
                }}>
                  {selectedJob.description}
                </p>
              </div>

              {/* Reward notice */}
              <div style={{
                marginTop: 28, background: 'linear-gradient(135deg, #eef2ff, #faf5ff)',
                border: '1px solid #e0e7ff', borderRadius: 14, padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: 12
              }}>
                <span style={{ fontSize: 24 }}>🎁</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#4f6aff' }}>CareerBonus Reward</p>
                  <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    Get rewarded when you are confirmed hired for this position!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              background: '#fff', borderRadius: 20, padding: 60,
              border: '2px dashed #e5e7eb', textAlign: 'center'
            }}>
              <p style={{ fontSize: 15, color: '#9ca3af' }}>Select a job to view details</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e0e7ff; border-radius: 4px; }
      `}</style>
    </div>
  )
}

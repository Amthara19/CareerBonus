'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type Profile = {
  id: string
  full_name: string
  role: string
  status: string
  company_name: string
  phone: string
  created_at: string
}

type Job = {
  id: string
  title: string
  status: string
  created_at: string
  location: string
  profiles?: { company_name: string }
}

type Application = {
  id: string
  status: string
  applied_at: string
  jobs?: { title: string }
  profiles?: { full_name: string }
}

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'clients' | 'candidates' | 'jobs' | 'applications'>('pending')
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const [pendingClients, setPendingClients] = useState<Profile[]>([])
  const [allClients, setAllClients] = useState<Profile[]>([])
  const [allCandidates, setAllCandidates] = useState<Profile[]>([])
  const [allJobs, setAllJobs] = useState<Job[]>([])
  const [allApplications, setAllApplications] = useState<Application[]>([])

  const [stats, setStats] = useState({
    pending: 0, clients: 0, candidates: 0, jobs: 0, applications: 0
  })

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login/admin'); return }
      setUser(user)

      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user.id).single()

      if (!profile || profile.role !== 'admin') {
        await supabase.auth.signOut()
        router.push('/login/admin')
        return
      }

      await loadAll()
      setLoading(false)
    }
    init()
  }, [])

  const loadAll = async () => {
    // Pending clients
    const { data: pending } = await supabase
      .from('profiles').select('*')
      .eq('role', 'client').eq('status', 'pending')
      .order('created_at', { ascending: false })

    // All clients
    const { data: clients } = await supabase
      .from('profiles').select('*')
      .eq('role', 'client')
      .order('created_at', { ascending: false })

    // All candidates
    const { data: candidates } = await supabase
      .from('profiles').select('*')
      .eq('role', 'candidate')
      .order('created_at', { ascending: false })

    // All jobs
    const { data: jobs } = await supabase
      .from('jobs').select('*, profiles(company_name)')
      .order('created_at', { ascending: false })

    // All applications
    const { data: applications } = await supabase
      .from('applications').select('*, jobs(title), profiles(full_name)')
      .order('applied_at', { ascending: false })

    setPendingClients(pending ?? [])
    setAllClients(clients ?? [])
    setAllCandidates(candidates ?? [])
    setAllJobs(jobs ?? [])
    setAllApplications(applications ?? [])

    setStats({
      pending: pending?.length ?? 0,
      clients: clients?.length ?? 0,
      candidates: candidates?.length ?? 0,
      jobs: jobs?.length ?? 0,
      applications: applications?.length ?? 0,
    })
  }

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleClientStatus = async (id: string, status: 'active' | 'rejected') => {
    const { error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', id)

    if (error) {
      showToast('Failed to update status', 'error')
    } else {
      showToast(status === 'active' ? '✓ Client approved! They can now login.' : 'Client rejected.')
      await loadAll()
    }
  }

  const handleJobStatus = async (id: string, status: string) => {
    await supabase.from('jobs').update({ status }).eq('id', id)
    showToast(`Job marked as ${status}`)
    await loadAll()
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

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; color: string }> = {
      active:      { bg: '#f0fdf4', color: '#059669' },
      pending:     { bg: '#fffbeb', color: '#d97706' },
      rejected:    { bg: '#fef2f2', color: '#dc2626' },
      open:        { bg: '#eef2ff', color: '#4f6aff' },
      closed:      { bg: '#f3f4f6', color: '#9ca3af' },
      applied:     { bg: '#eef2ff', color: '#4f6aff' },
      reviewing:   { bg: '#fffbeb', color: '#d97706' },
      shortlisted: { bg: '#f0fdf4', color: '#059669' },
      hired:       { bg: '#dcfce7', color: '#16a34a' },
    }
    const s = map[status] ?? { bg: '#f3f4f6', color: '#6b7280' }
    return (
      <span style={{
        fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 600,
        textTransform: 'capitalize', background: s.bg, color: s.color
      }}>
        {status}
      </span>
    )
  }

  const TABS = [
    { key: 'pending',      label: 'Pending Approval', count: stats.pending, alert: stats.pending > 0 },
    { key: 'clients',      label: 'All Clients',      count: stats.clients },
    { key: 'candidates',   label: 'Candidates',       count: stats.candidates },
    { key: 'jobs',         label: 'Jobs',             count: stats.jobs },
    { key: 'applications', label: 'Applications',     count: stats.applications },
  ]

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#fffbeb' }}>
      <p style={{ color: '#6b7280', fontSize: 14 }}>Loading admin panel...</p>
    </div>
  )

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#fffbeb', minHeight: '100vh' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 999,
          background: toast.type === 'success' ? '#1e3a8a' : '#dc2626',
          color: '#fff', padding: '12px 20px', borderRadius: 12,
          fontSize: 13, fontWeight: 500, boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22, color: '#d97706' }}>◈</span>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#78350f', letterSpacing: '-0.02em' }}>CareerBonus</span>
          <span style={{
            fontSize: 11, background: '#fef3c7', color: '#d97706',
            padding: '2px 10px', borderRadius: 20, marginLeft: 8, fontWeight: 700
          }}>
            ADMIN
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {stats.pending > 0 && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fca5a5',
              color: '#dc2626', fontSize: 12, fontWeight: 700,
              padding: '4px 12px', borderRadius: 20
            }}>
              🔴 {stats.pending} pending approval
            </div>
          )}
          <button onClick={handleLogout} style={{
            fontSize: 13, border: '1px solid #e5e7eb', padding: '7px 16px',
            borderRadius: 8, color: '#374151', background: '#fff', cursor: 'pointer'
          }}>Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

        {/* Page Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#78350f', letterSpacing: '-0.02em' }}>
            Admin Dashboard
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
            Manage clients, candidates, jobs and applications
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Pending', value: stats.pending, color: '#dc2626', bg: '#fef2f2', icon: '⏳' },
            { label: 'Clients', value: stats.clients, color: '#059669', bg: '#f0fdf4', icon: '🏢' },
            { label: 'Candidates', value: stats.candidates, color: '#4f6aff', bg: '#eef2ff', icon: '👤' },
            { label: 'Jobs', value: stats.jobs, color: '#d97706', bg: '#fffbeb', icon: '📋' },
            { label: 'Applications', value: stats.applications, color: '#7c3aed', bg: '#faf5ff', icon: '📨' },
          ].map(s => (
            <div key={s.label} style={{
              background: '#fff', border: '1px solid #e5e7eb',
              borderRadius: 16, padding: '18px 20px',
              display: 'flex', alignItems: 'center', gap: 14
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: s.bg, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 20
              }}>
                {s.icon}
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#f3f4f6', padding: 4, borderRadius: 12, width: 'fit-content', flexWrap: 'wrap' }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600,
                background: activeTab === tab.key ? '#fff' : 'transparent',
                color: activeTab === tab.key ? '#78350f' : '#9ca3af',
                boxShadow: activeTab === tab.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                display: 'flex', alignItems: 'center', gap: 6, position: 'relative'
              }}
            >
              {tab.label}
              <span style={{
                fontSize: 11, background: activeTab === tab.key ? (tab.alert ? '#fef2f2' : '#fef3c7') : '#e5e7eb',
                color: activeTab === tab.key ? (tab.alert ? '#dc2626' : '#d97706') : '#9ca3af',
                padding: '1px 7px', borderRadius: 20, fontWeight: 700
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── PENDING APPROVAL TAB ── */}
        {activeTab === 'pending' && (
          <div>
            {pendingClients.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', padding: 60, textAlign: 'center' }}>
                <p style={{ fontSize: 36, marginBottom: 12 }}>✅</p>
                <p style={{ color: '#059669', fontSize: 16, fontWeight: 700 }}>All caught up!</p>
                <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 4 }}>No clients pending approval</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {pendingClients.map(client => (
                  <div key={client.id} style={{
                    background: '#fff', borderRadius: 20,
                    border: '2px solid #fef3c7',
                    padding: '24px 28px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    boxShadow: '0 4px 20px rgba(217,119,6,0.08)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      {/* Avatar */}
                      <div style={{
                        width: 52, height: 52, borderRadius: 14,
                        background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 800, fontSize: 20
                      }}>
                        {(client.company_name?.[0] ?? client.full_name?.[0] ?? 'C').toUpperCase()}
                      </div>

                      <div>
                        <p style={{ fontSize: 16, fontWeight: 700, color: '#1e3a8a' }}>
                          {client.company_name ?? 'No Company Name'}
                        </p>
                        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                          Contact: {client.full_name}
                        </p>
                        <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                          <span style={{ fontSize: 11, color: '#9ca3af' }}>
                            📅 Registered {timeAgo(client.created_at)}
                          </span>
                          {statusBadge(client.status)}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={() => handleClientStatus(client.id, 'rejected')}
                        style={{
                          padding: '10px 20px', borderRadius: 12,
                          border: '1px solid #fca5a5', color: '#dc2626',
                          background: '#fff5f5', cursor: 'pointer',
                          fontSize: 13, fontWeight: 700
                        }}
                      >
                        ✕ Reject
                      </button>
                      <button
                        onClick={() => handleClientStatus(client.id, 'active')}
                        style={{
                          padding: '10px 24px', borderRadius: 12,
                          border: 'none', color: '#fff',
                          background: 'linear-gradient(135deg, #059669, #047857)',
                          cursor: 'pointer', fontSize: 13, fontWeight: 700,
                          boxShadow: '0 4px 12px rgba(5,150,105,0.3)'
                        }}
                      >
                        ✓ Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ALL CLIENTS TAB ── */}
        {activeTab === 'clients' && (
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
                  {['Company', 'Contact', 'Status', 'Registered', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', fontSize: 12, fontWeight: 700, color: '#6b7280', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allClients.map((client, i) => (
                  <tr key={client.id} style={{ borderBottom: i < allClients.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#1e3a8a' }}>{client.company_name ?? '—'}</p>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#6b7280' }}>{client.full_name}</td>
                    <td style={{ padding: '14px 16px' }}>{statusBadge(client.status)}</td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: '#9ca3af' }}>{timeAgo(client.created_at)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {client.status !== 'active' && (
                          <button onClick={() => handleClientStatus(client.id, 'active')} style={{
                            fontSize: 11, padding: '5px 12px', borderRadius: 8,
                            border: 'none', background: '#059669', color: '#fff', cursor: 'pointer', fontWeight: 600
                          }}>Approve</button>
                        )}
                        {client.status !== 'rejected' && (
                          <button onClick={() => handleClientStatus(client.id, 'rejected')} style={{
                            fontSize: 11, padding: '5px 12px', borderRadius: 8,
                            border: '1px solid #fca5a5', background: '#fff5f5', color: '#dc2626', cursor: 'pointer', fontWeight: 600
                          }}>Reject</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── CANDIDATES TAB ── */}
        {activeTab === 'candidates' && (
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
                  {['Name', 'Phone', 'Status', 'Registered'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', fontSize: 12, fontWeight: 700, color: '#6b7280', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allCandidates.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: i < allCandidates.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: '#1e3a8a' }}>{c.full_name || '—'}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#6b7280' }}>{c.phone || '—'}</td>
                    <td style={{ padding: '14px 16px' }}>{statusBadge(c.status)}</td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: '#9ca3af' }}>{timeAgo(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── JOBS TAB ── */}
        {activeTab === 'jobs' && (
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
                  {['Job Title', 'Company', 'Location', 'Status', 'Posted', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', fontSize: 12, fontWeight: 700, color: '#6b7280', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allJobs.map((job, i) => (
                  <tr key={job.id} style={{ borderBottom: i < allJobs.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: '#1e3a8a' }}>{job.title}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#6b7280' }}>{job.profiles?.company_name ?? '—'}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#6b7280' }}>{job.location ?? '—'}</td>
                    <td style={{ padding: '14px 16px' }}>{statusBadge(job.status)}</td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: '#9ca3af' }}>{timeAgo(job.created_at)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      {job.status === 'open' ? (
                        <button onClick={() => handleJobStatus(job.id, 'closed')} style={{
                          fontSize: 11, padding: '5px 12px', borderRadius: 8,
                          border: '1px solid #fca5a5', background: '#fff5f5', color: '#dc2626', cursor: 'pointer', fontWeight: 600
                        }}>Close</button>
                      ) : (
                        <button onClick={() => handleJobStatus(job.id, 'open')} style={{
                          fontSize: 11, padding: '5px 12px', borderRadius: 8,
                          border: 'none', background: '#059669', color: '#fff', cursor: 'pointer', fontWeight: 600
                        }}>Reopen</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── APPLICATIONS TAB ── */}
        {activeTab === 'applications' && (
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
                  {['Candidate', 'Job Title', 'Status', 'Applied'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', fontSize: 12, fontWeight: 700, color: '#6b7280', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allApplications.map((app, i) => (
                  <tr key={app.id} style={{ borderBottom: i < allApplications.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: '#1e3a8a' }}>{app.profiles?.full_name ?? '—'}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#6b7280' }}>{app.jobs?.title ?? '—'}</td>
                    <td style={{ padding: '14px 16px' }}>{statusBadge(app.status)}</td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: '#9ca3af' }}>{timeAgo(app.applied_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');`}</style>
    </div>
  )
}

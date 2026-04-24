'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const JOB_FUNCTIONS = [
  'Finance & Accounting (HCSFA)',
  'Admin & Office Support (HCSAO)',
  'General Management (HCSGM)',
  'HR & Recruitment (HCSHR)',
  'Marketing & Communications (HCSMC)',
  'Sales & Business Development (HCSSB)',
  'Project Management (HCSPM)',
  'Administrative & Ancillary (HCSAA)',
  'Medical (HCSMD)',
  'Allied Healthcare Professionals (HCSAP)',
  'Healthcare Assistance (HCSHA)',
  'Nursing (HCSNS)',
  'Helpdesk & Support (OHS)',
  'Network Administration (ONA)',
  'Programming (OPG)',
  'Software Development (OSD)',
  'Web Development (OWD)',
  'Cybersecurity (OCS)',
  'Education & Training (OET)',
  'Farming, Animals & Conservation',
  'Customer Service & Relations (HCCSR)',
  'Retail & Consumer Products (HCSRCP)',
  'Food Services (HCSFS)',
  'Front Office (HCSFO)',
  'Housekeeping (HCSHK)',
  'Supply Chain Management (SCMS)',
  'Freight Forwarding (SCMFF)',
  'Warehouse (SCMWH)',
  'Transportation (SCMTP)',
  'Engineers (CMEEG)',
  'Technicians (CMETC)',
  'Production (CMEPD)',
  'Foreign Workers (CME)',
  'Research & Development (CMERD)',
  'Others',
]

const ORDER_TYPES = [
  'Temporary/Contract',
  'Business Process Outsourcing (BPO)',
  'Recruitment Process Outsourcing (RPO)',
]

type Job = {
  id: string
  title: string
  order_type: string
  job_function: string
  number_of_positions: number
  salary_min: number
  salary_max: number
  location: string
  job_type: string
  status: string
  created_at: string
}

export default function ClientDashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications'>('jobs')

  // Form state
  const [form, setForm] = useState({
    order_type: '',
    job_function: '',
    title: '',
    number_of_positions: 1,
    remarks: '',
    salary_min: '',
    salary_max: '',
    work_hours: '',
    working_days: '',
    education_qualification: '',
    work_experience: '',
    location: '',
    job_type: 'full-time',
    client_requirements: '',
    description: '',
  })

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login/client'); return }
      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'client' || profile.status !== 'active') {
        await supabase.auth.signOut()
        router.push('/login/client')
        return
      }
      setProfile(profile)
      await fetchJobs(user.id)
      setLoading(false)
    }
    init()
  }, [])

  const fetchJobs = async (clientId: string) => {
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
    if (data) setJobs(data)
  }

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const { error } = await supabase.from('jobs').insert({
      client_id: user.id,
      order_type: form.order_type,
      job_function: form.job_function,
      title: form.title,
      number_of_positions: Number(form.number_of_positions),
      remarks: form.remarks,
      salary_min: form.salary_min ? Number(form.salary_min) : null,
      salary_max: form.salary_max ? Number(form.salary_max) : null,
      salary_range: form.salary_min && form.salary_max
        ? `$${form.salary_min} - $${form.salary_max}`
        : form.salary_min ? `From $${form.salary_min}` : null,
      work_hours: form.work_hours,
      working_days: form.working_days,
      education_qualification: form.education_qualification,
      work_experience: form.work_experience,
      location: form.location,
      job_type: form.job_type,
      client_requirements: form.client_requirements,
      description: form.description,
      status: 'open',
    })

    if (error) {
      showToast('Failed to post job. Please try again.', 'error')
    } else {
      showToast('Job posted successfully!')
      setShowForm(false)
      setForm({
        order_type: '', job_function: '', title: '', number_of_positions: 1,
        remarks: '', salary_min: '', salary_max: '', work_hours: '',
        working_days: '', education_qualification: '', work_experience: '',
        location: '', job_type: 'full-time', client_requirements: '', description: '',
      })
      await fetchJobs(user.id)
    }
    setSubmitting(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleCloseJob = async (jobId: string) => {
    await supabase.from('jobs').update({ status: 'closed' }).eq('id', jobId)
    await fetchJobs(user.id)
    showToast('Job closed successfully')
  }

  const s = (obj: React.CSSProperties) => obj

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8faff' }}>
      <p style={{ color: '#6b7280', fontSize: 14 }}>Loading...</p>
    </div>
  )

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#f8faff', minHeight: '100vh' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 999,
          background: toast.type === 'success' ? '#064e3b' : '#dc2626',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22, color: '#059669' }}>◈</span>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#064e3b', letterSpacing: '-0.02em' }}>CareerBonus</span>
          <span style={{ fontSize: 12, background: '#f0fdf4', color: '#059669', padding: '2px 10px', borderRadius: 20, marginLeft: 8, fontWeight: 600 }}>
            Client
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: '#6b7280' }}>
            {profile?.company_name ?? user?.email}
          </span>
          <button onClick={handleLogout} style={{
            fontSize: 13, border: '1px solid #e5e7eb', padding: '7px 16px',
            borderRadius: 8, color: '#374151', background: '#fff', cursor: 'pointer'
          }}>Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#064e3b', letterSpacing: '-0.02em' }}>
              {profile?.company_name ?? 'Client'} Dashboard
            </h1>
            <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Manage your job postings and applications</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: 'linear-gradient(135deg, #059669, #047857)',
              color: '#fff', border: 'none', padding: '11px 22px',
              borderRadius: 12, fontSize: 14, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 4px 16px rgba(5,150,105,0.3)'
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Post New Job
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Total Jobs Posted', value: jobs.length, color: '#059669', bg: '#f0fdf4' },
            { label: 'Open Positions', value: jobs.filter(j => j.status === 'open').length, color: '#4f6aff', bg: '#eef2ff' },
            { label: 'Closed Jobs', value: jobs.filter(j => j.status === 'closed').length, color: '#d97706', bg: '#fffbeb' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16,
              padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: stat.bg, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 22, fontWeight: 800, color: stat.color
              }}>
                {stat.value}
              </div>
              <p style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#f3f4f6', padding: 4, borderRadius: 12, width: 'fit-content' }}>
          {(['jobs', 'applications'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '8px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
              background: activeTab === tab ? '#fff' : 'transparent',
              color: activeTab === tab ? '#064e3b' : '#9ca3af',
              boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}>{tab}</button>
          ))}
        </div>

        {/* Jobs Table */}
        {activeTab === 'jobs' && (
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            {jobs.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center' }}>
                <p style={{ fontSize: 32, marginBottom: 12 }}>📋</p>
                <p style={{ color: '#6b7280', fontSize: 15, fontWeight: 600 }}>No jobs posted yet</p>
                <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 4 }}>Click "Post New Job" to get started</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
                    {['Job Title', 'Function', 'Type', 'Positions', 'Location', 'Salary Range', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '14px 16px', fontSize: 12, fontWeight: 700, color: '#6b7280', textAlign: 'left', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job, i) => (
                    <tr key={job.id} style={{ borderBottom: i < jobs.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#1e3a8a' }}>{job.title}</p>
                        <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                          {new Date(job.created_at).toLocaleDateString()}
                        </p>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: '#6b7280', maxWidth: 160 }}>
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {job.job_function ?? '—'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          fontSize: 11, padding: '4px 10px', borderRadius: 8,
                          background: '#eef2ff', color: '#4f6aff', fontWeight: 600, textTransform: 'capitalize'
                        }}>
                          {job.job_type}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 14, color: '#374151', textAlign: 'center' }}>
                        {job.number_of_positions ?? 1}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: '#6b7280' }}>{job.location ?? '—'}</td>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: '#059669', fontWeight: 600 }}>
                        {job.salary_min && job.salary_max
                          ? `$${job.salary_min} - $${job.salary_max}`
                          : '—'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 600,
                          background: job.status === 'open' ? '#f0fdf4' : '#f3f4f6',
                          color: job.status === 'open' ? '#059669' : '#9ca3af'
                        }}>
                          {job.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {job.status === 'open' && (
                          <button
                            onClick={() => handleCloseJob(job.id)}
                            style={{
                              fontSize: 12, padding: '5px 12px', borderRadius: 8,
                              border: '1px solid #fca5a5', color: '#dc2626',
                              background: '#fff5f5', cursor: 'pointer', fontWeight: 600
                            }}
                          >
                            Close
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'applications' && (
          <ApplicationsTab clientId={user?.id} supabase={supabase} showToast={showToast} />
        )}
      </div>

      {/* Post Job Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          zIndex: 100, display: 'flex', alignItems: 'flex-start',
          justifyContent: 'center', overflowY: 'auto', padding: '32px 16px'
        }}>
          <div style={{
            background: '#fff', borderRadius: 24, width: '100%', maxWidth: 720,
            boxShadow: '0 24px 80px rgba(0,0,0,0.2)', overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '24px 32px', borderBottom: '1px solid #f3f4f6',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'linear-gradient(135deg, #f0fdf4, #fff)'
            }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#064e3b' }}>Post New Job Order</h2>
                <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Fill in the details below</p>
              </div>
              <button onClick={() => setShowForm(false)} style={{
                width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb',
                background: '#fff', cursor: 'pointer', fontSize: 18, color: '#9ca3af',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>×</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: 32 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

                {/* Order Type */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Type of Job Order *</label>
                  <select name="order_type" required value={form.order_type} onChange={handleChange} style={selectStyle}>
                    <option value="">Select order type</option>
                    {ORDER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Job Function */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Job Function *</label>
                  <select name="job_function" required value={form.job_function} onChange={handleChange} style={selectStyle}>
                    <option value="">Select job function</option>
                    {JOB_FUNCTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                {/* Job Position Title */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Job Position Title *</label>
                  <input name="title" required value={form.title} onChange={handleChange}
                    placeholder="e.g. Senior Software Engineer" style={inputStyle} />
                </div>

                {/* Number of Positions */}
                <div>
                  <label style={labelStyle}>Number of Positions *</label>
                  <input name="number_of_positions" type="number" min={1} required
                    value={form.number_of_positions} onChange={handleChange} style={inputStyle} />
                </div>

                {/* Job Type */}
                <div>
                  <label style={labelStyle}>Employment Type *</label>
                  <select name="job_type" value={form.job_type} onChange={handleChange} style={selectStyle}>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>

                {/* Salary Min */}
                <div>
                  <label style={labelStyle}>Salary Range (Min) $</label>
                  <input name="salary_min" type="number" value={form.salary_min} onChange={handleChange}
                    placeholder="e.g. 3000" style={inputStyle} />
                </div>

                {/* Salary Max */}
                <div>
                  <label style={labelStyle}>Salary Range (Max) $</label>
                  <input name="salary_max" type="number" value={form.salary_max} onChange={handleChange}
                    placeholder="e.g. 5000" style={inputStyle} />
                </div>

                {/* Work Hours */}
                <div>
                  <label style={labelStyle}>Work Hours</label>
                  <input name="work_hours" value={form.work_hours} onChange={handleChange}
                    placeholder="e.g. 9am - 6pm" style={inputStyle} />
                </div>

                {/* Working Days */}
                <div>
                  <label style={labelStyle}>Working Days</label>
                  <input name="working_days" value={form.working_days} onChange={handleChange}
                    placeholder="e.g. Mon - Fri" style={inputStyle} />
                </div>

                {/* Work Location */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Work Location</label>
                  <input name="location" value={form.location} onChange={handleChange}
                    placeholder="e.g. Singapore, Central" style={inputStyle} />
                </div>

                {/* Education Qualification */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Education Qualification</label>
                  <input name="education_qualification" value={form.education_qualification} onChange={handleChange}
                    placeholder="e.g. Diploma or Degree in relevant field" style={inputStyle} />
                </div>

                {/* Work Experience */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Work Experience</label>
                  <input name="work_experience" value={form.work_experience} onChange={handleChange}
                    placeholder="e.g. Min 2 years in similar role" style={inputStyle} />
                </div>

                {/* Job Details / Description */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Job Details *</label>
                  <textarea name="description" required value={form.description} onChange={handleChange}
                    rows={4} placeholder="Describe the role, responsibilities and what you're looking for..."
                    style={{ ...inputStyle, resize: 'vertical' as const }} />
                </div>

                {/* Client Requirements */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Client Requirements</label>
                  <textarea name="client_requirements" value={form.client_requirements} onChange={handleChange}
                    rows={3} placeholder="Any specific requirements from your company..."
                    style={{ ...inputStyle, resize: 'vertical' as const }} />
                </div>

                {/* Remarks */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Remarks</label>
                  <textarea name="remarks" value={form.remarks} onChange={handleChange}
                    rows={2} placeholder="Any additional notes..."
                    style={{ ...inputStyle, resize: 'vertical' as const }} />
                </div>

              </div>

              {/* Form Actions */}
              <div style={{ display: 'flex', gap: 12, marginTop: 28, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  padding: '11px 24px', borderRadius: 12, border: '1px solid #e5e7eb',
                  background: '#fff', color: '#6b7280', fontSize: 14, fontWeight: 600, cursor: 'pointer'
                }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} style={{
                  padding: '11px 28px', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  opacity: submitting ? 0.7 : 1
                }}>
                  {submitting ? 'Posting...' : 'Post Job Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');`}</style>
    </div>
  )
}

// ── Applications sub-component ─────────────────────────────
function ApplicationsTab({ clientId, supabase, showToast }: any) {
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('applications')
        .select(`
          *,
          jobs(title, location),
          profiles(full_name, phone)
        `)
        .in('job_id',
          (await supabase.from('jobs').select('id').eq('client_id', clientId)).data?.map((j: any) => j.id) ?? []
        )
        .order('applied_at', { ascending: false })
      if (data) setApps(data)
      setLoading(false)
    }
    fetch()
  }, [])

  const updateStatus = async (appId: string, status: string) => {
    await supabase.from('applications').update({ status }).eq('id', appId)
    setApps(prev => prev.map(a => a.id === appId ? { ...a, status } : a))
    showToast(`Application marked as ${status}`)
  }

  const statusColors: Record<string, { bg: string; color: string }> = {
    applied:     { bg: '#eef2ff', color: '#4f6aff' },
    reviewing:   { bg: '#fffbeb', color: '#d97706' },
    shortlisted: { bg: '#f0fdf4', color: '#059669' },
    hired:       { bg: '#dcfce7', color: '#16a34a' },
    rejected:    { bg: '#fef2f2', color: '#dc2626' },
  }

  if (loading) return <p style={{ color: '#9ca3af', fontSize: 13, padding: 20 }}>Loading...</p>

  if (apps.length === 0) return (
    <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', padding: 60, textAlign: 'center' }}>
      <p style={{ fontSize: 32, marginBottom: 12 }}>👥</p>
      <p style={{ color: '#6b7280', fontSize: 15, fontWeight: 600 }}>No applications yet</p>
      <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 4 }}>Applications will appear here once candidates apply</p>
    </div>
  )

  return (
    <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
            {['Candidate', 'Job Title', 'Location', 'Applied', 'Status', 'Actions'].map(h => (
              <th key={h} style={{ padding: '14px 16px', fontSize: 12, fontWeight: 700, color: '#6b7280', textAlign: 'left' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {apps.map((app, i) => (
            <tr key={app.id} style={{ borderBottom: i < apps.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
              <td style={{ padding: '14px 16px' }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#1e3a8a' }}>{app.profiles?.full_name ?? '—'}</p>
                <p style={{ fontSize: 11, color: '#9ca3af' }}>{app.profiles?.phone ?? ''}</p>
              </td>
              <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151' }}>{app.jobs?.title ?? '—'}</td>
              <td style={{ padding: '14px 16px', fontSize: 13, color: '#6b7280' }}>{app.jobs?.location ?? '—'}</td>
              <td style={{ padding: '14px 16px', fontSize: 12, color: '#9ca3af' }}>
                {new Date(app.applied_at).toLocaleDateString()}
              </td>
              <td style={{ padding: '14px 16px' }}>
                <span style={{
                  fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 600, textTransform: 'capitalize',
                  ...statusColors[app.status]
                }}>
                  {app.status}
                </span>
              </td>
              <td style={{ padding: '14px 16px' }}>
                <select
                  value={app.status}
                  onChange={e => updateStatus(app.id, e.target.value)}
                  style={{
                    fontSize: 12, padding: '6px 10px', borderRadius: 8,
                    border: '1px solid #e5e7eb', color: '#374151',
                    background: '#fff', cursor: 'pointer'
                  }}
                >
                  <option value="applied">Applied</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="hired">Hired</option>
                  <option value="rejected">Rejected</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Shared styles
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: '#374151', marginBottom: 6
}
const inputStyle: React.CSSProperties = {
  width: '100%', border: '1px solid #e5e7eb', borderRadius: 10,
  padding: '10px 14px', fontSize: 13, color: '#374151',
  background: '#fafafa', outline: 'none', fontFamily: 'inherit'
}
const selectStyle: React.CSSProperties = {
  ...inputStyle, cursor: 'pointer', appearance: 'auto' as any
}

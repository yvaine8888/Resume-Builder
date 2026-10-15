import { useEffect, useState } from 'react'
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import sections from './data.json'
import './App.css'

const STORAGE_KEY = 'forme.resumes.v1'
const LEGACY_STORAGE_KEY = 'forme.resume.v1'

const initialResume = {
  name: '',
  email: '',
  phone: '',
  address: '',
  summary: '',
  education: [{ school: '', degree: '', location: '', dates: '', details: '' }],
  experience: [{ role: '', organization: '', location: '', dates: '', details: '' }],
  activities: [{ name: '', role: '', dates: '', details: '' }],
  awards: [{ name: '', organization: '', date: '', details: '' }],
  skills: '',
}

const entryConfigs = {
  education: {
    title: 'Education',
    entryLabel: 'Education',
    description: 'Add schools, degrees, courses, or other learning experiences.',
    addLabel: 'Add education',
    fields: [
      ['school', 'School or institution', 'e.g. University of California'],
      ['degree', 'Degree or area of study', 'e.g. B.A. in English'],
      ['location', 'Location', 'City, State'],
      ['dates', 'Dates attended', 'e.g. 2022 – 2026'],
    ],
    detailsLabel: 'Details',
    detailsPlaceholder: 'Relevant coursework, honors, or a detail you’d like to include',
  },
  experience: {
    title: 'Experience',
    entryLabel: 'Experience',
    description: 'Include jobs, internships, freelance work, or volunteer experience.',
    addLabel: 'Add experience',
    fields: [
      ['role', 'Job title', 'e.g. Marketing intern'],
      ['organization', 'Organization', 'Company or organization'],
      ['location', 'Location', 'City, State'],
      ['dates', 'Dates', 'e.g. Jun 2024 – Aug 2024'],
    ],
    detailsLabel: 'What did you do?',
    detailsPlaceholder: 'Describe your responsibilities, projects, or impact',
  },
  activities: {
    title: 'Activities & leadership',
    entryLabel: 'Activity',
    description: 'Showcase clubs, organizations, volunteering, and things you do beyond work.',
    addLabel: 'Add activity',
    fields: [
      ['name', 'Activity or organization', 'e.g. Campus newspaper'],
      ['role', 'Role or position', 'e.g. Section editor'],
      ['dates', 'Dates', 'e.g. 2023 – Present'],
    ],
    detailsLabel: 'Details',
    detailsPlaceholder: 'Share your contributions, projects, or leadership experience',
  },
  awards: {
    title: 'Awards & recognition',
    entryLabel: 'Award',
    description: 'Add scholarships, honors, certifications, or other recognition.',
    addLabel: 'Add award',
    fields: [
      ['name', 'Award or recognition', 'e.g. Dean’s List'],
      ['organization', 'Awarded by', 'School or organization'],
      ['date', 'Date received', 'e.g. May 2025'],
    ],
    detailsLabel: 'Details',
    detailsPlaceholder: 'Add context about this recognition',
  },
}

function makeInitialResume() {
  return JSON.parse(JSON.stringify(initialResume))
}

function normalizeResume(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError('Saved resume data must be an object.')
  }

  const getText = (key) => typeof value[key] === 'string' ? value[key] : ''
  const normalizeEntries = (key, fields) => {
    const savedEntries = value[key]
    if (!Array.isArray(savedEntries)) {
      return makeInitialResume()[key]
    }

    const validEntries = savedEntries.filter((entry) => entry && typeof entry === 'object' && !Array.isArray(entry))
    return validEntries.length
      ? validEntries.map((entry) => Object.fromEntries(fields.map((field) => [
        field,
        typeof entry[field] === 'string' ? entry[field] : '',
      ])))
      : makeInitialResume()[key]
  }

  return {
    name: getText('name'),
    email: getText('email'),
    phone: getText('phone'),
    address: getText('address'),
    summary: getText('summary'),
    education: normalizeEntries('education', ['school', 'degree', 'location', 'dates', 'details']),
    experience: normalizeEntries('experience', ['role', 'organization', 'location', 'dates', 'details']),
    activities: normalizeEntries('activities', ['name', 'role', 'dates', 'details']),
    awards: normalizeEntries('awards', ['name', 'organization', 'date', 'details']),
    skills: getText('skills'),
  }
}

function readSavedResumes() {
  try {
    const storedResumes = window.localStorage.getItem(STORAGE_KEY)
    if (storedResumes !== null) {
      const parsedResumes = JSON.parse(storedResumes)
      if (!Array.isArray(parsedResumes)) {
        throw new TypeError('Saved resumes must be a list.')
      }

      return {
        resumes: parsedResumes.map((item) => {
          if (!item || typeof item.id !== 'string' || !item.id || !item.data) {
            throw new TypeError('A saved resume is missing its ID or data.')
          }
          return { id: item.id, data: normalizeResume(item.data) }
        }),
        error: '',
      }
    }

    const legacyResume = window.localStorage.getItem(LEGACY_STORAGE_KEY)
    if (legacyResume === null) {
      return { resumes: [], error: '' }
    }

    const resumes = [{ id: 'resume-legacy', data: normalizeResume(JSON.parse(legacyResume)) }]
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes))
    } catch (error) {
      console.error('Could not migrate the saved resume to the new storage format.', error)
      return {
        resumes,
        error: 'Your saved resume was loaded, but could not be migrated in this browser.',
      }
    }
    return {
      resumes,
      error: '',
    }
  } catch (error) {
    console.warn('Could not restore saved resumes from this browser.', error)
    return {
      resumes: [],
      error: 'Saved resumes could not be read. Changes may not be saved on this device.',
    }
  }
}

function TextField({ label, name, value, onChange, placeholder, type = 'text', required = false }) {
  return (
    <label className="field">
      <span className="field-label">
        {label}
        {required && <span className="required-mark" aria-label="required"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
    </label>
  )
}

function TextArea({ label, name, value, onChange, placeholder, rows = 3 }) {
  return (
    <label className="field">
      <span className="field-label">{label}<span className="optional-label">Optional</span></span>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
      />
    </label>
  )
}

function SectionHeading({ icon, eyebrow, title, description }) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <span className="section-illustration" aria-hidden="true">{icon}</span>
    </div>
  )
}

function EntryGroup({ section, entries, onChange, onAdd, onRemove }) {
  const config = entryConfigs[section]

  return (
    <section className="form-section">
      <SectionHeading
        icon={sections.find((item) => item.id === section)?.icon}
        eyebrow={section === 'activities' ? 'BEYOND THE CLASSROOM' : section.toUpperCase()}
        title={config.title}
        description={config.description}
      />
      <div className="entry-list">
        {entries.map((entry, index) => (
          <div className="entry-card" key={`${section}-${index}`}>
            <div className="entry-card-heading">
              <span>{config.entryLabel} {String(index + 1).padStart(2, '0')}</span>
              {entries.length > 1 && (
                <button
                  type="button"
                  className="text-button remove-button"
                  onClick={() => onRemove(index)}
                  aria-label={`Remove ${config.title.toLowerCase()} entry ${index + 1}`}
                >
                  Remove
                </button>
              )}
            </div>
            <div className="fields-grid">
              {config.fields.map(([name, label, placeholder]) => (
                <TextField
                  key={name}
                  label={label}
                  name={name}
                  value={entry[name]}
                  onChange={(event) => onChange(index, name, event.target.value)}
                  placeholder={placeholder}
                />
              ))}
              <TextArea
                label={config.detailsLabel}
                name="details"
                value={entry.details}
                onChange={(event) => onChange(index, 'details', event.target.value)}
                placeholder={config.detailsPlaceholder}
              />
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="add-button" onClick={onAdd}>
        <span aria-hidden="true">+</span> {config.addLabel}
      </button>
    </section>
  )
}

function PageActions({ previous, next, onFinish, isLast = false, submit = false }) {
  return (
    <div className="form-actions">
      <p><span>*</span> Required fields are only needed to continue from Personal Details.</p>
      <div className="page-action-buttons">
        {previous && <Link className="secondary-button" to={previous.path}>← <span>Previous</span></Link>}
        {submit
          ? <button className="primary-button" type="submit">Next: {next.title} <span aria-hidden="true">→</span></button>
          : isLast
          ? <button className="primary-button" type="button" onClick={onFinish}>Done for now <span aria-hidden="true">✓</span></button>
          : <Link className="primary-button" to={next.path}>Next: {next.title} <span aria-hidden="true">→</span></Link>}
      </div>
    </div>
  )
}

function PersonalPage({ resume, onChange, onNext, next }) {
  return (
    <form
      className="section-form"
      onSubmit={(event) => {
        event.preventDefault()
        onNext()
      }}
    >
      <section className="form-section personal-section">
        <SectionHeading
          eyebrow="THE IMPORTANT BITS"
          title="Personal details"
          description="How should people get in touch with you?"
          icon="✳"
        />
        <div className="entry-card">
          <div className="fields-grid">
            <TextField label="Full name" name="name" value={resume.name} onChange={onChange} placeholder="e.g. Alex Morgan" required />
            <TextField label="Email address" name="email" value={resume.email} onChange={onChange} placeholder="you@example.com" type="email" required />
            <TextField label="Phone number" name="phone" value={resume.phone} onChange={onChange} placeholder="(555) 123-4567" type="tel" required />
            <TextField label="Mailing address" name="address" value={resume.address} onChange={onChange} placeholder="Street, city, state, ZIP code" required />
            <TextArea label="A little about you" name="summary" value={resume.summary} onChange={onChange} placeholder="Optional — a short introduction, what you’re looking for, or what makes you you." />
          </div>
          <p className="privacy-note"><span aria-hidden="true">♧</span> Your contact details are only for your resume.</p>
        </div>
      </section>
      <PageActions next={next} submit />
    </form>
  )
}

function ResumePreview({ resume }) {
  return (
    <aside className="preview-column" aria-label="Resume overview">
      <div className="preview-label"><span className="preview-label-dot" /> YOUR RESUME</div>
      <div className="resume-preview">
        <div className="preview-topline" />
        <div className="preview-content">
          <span className="preview-overline">CURRICULUM VITAE</span>
          <h2>{resume.name || 'Your name'}<span>.</span></h2>
          <div className="preview-rule" />
          <div className="preview-contact">
            {resume.address && <span>{resume.address}</span>}
            {resume.email && <span>{resume.email}</span>}
            {resume.phone && <span>{resume.phone}</span>}
            {!resume.address && !resume.email && !resume.phone && <span>Your contact details will appear here</span>}
          </div>
          {resume.summary && (
            <div className="preview-section">
              <span className="preview-section-title">PROFILE</span>
              <p>{resume.summary}</p>
            </div>
          )}
          {resume.education.some((entry) => entry.school || entry.degree) && (
            <div className="preview-section">
              <span className="preview-section-title">EDUCATION</span>
              {resume.education.filter((entry) => entry.school || entry.degree).map((entry, index) => (
                <p key={index}><strong>{entry.school || entry.degree}</strong><br />{entry.degree && entry.school ? entry.degree : entry.dates}</p>
              ))}
            </div>
          )}
          {resume.experience.some((entry) => entry.role || entry.organization) && (
            <div className="preview-section">
              <span className="preview-section-title">EXPERIENCE</span>
              {resume.experience.filter((entry) => entry.role || entry.organization).map((entry, index) => (
                <p key={index}><strong>{entry.role || entry.organization}</strong><br />{entry.organization && entry.role ? entry.organization : entry.dates}</p>
              ))}
            </div>
          )}
          <div className="preview-placeholder">
            <span>✳</span>
            <p>Your resume takes shape<br />as you fill things in.</p>
          </div>
        </div>
      </div>
      <div className="preview-caption"><span>✧</span> A little preview of what’s to come</div>
      <div className="optional-card">
        <span className="optional-icon">♡</span>
        <div><strong>Make it yours</strong><p>Every section is optional except your name and contact details. Skip what doesn’t fit.</p></div>
      </div>
    </aside>
  )
}

function ResumeHome({ resumes, storageError, onAdd, onOpen, onRemove }) {
  return (
    <div className="home-shell">
      <header className="topbar">
        <Link to="/" className="brand" aria-label="Forme home">
          <span className="brand-mark">f</span>
          <span>forme<span className="brand-period">.</span></span>
        </Link>
        <div className={`topbar-note${storageError ? ' storage-error' : ''}`}>
          <span className="save-dot" />
          {storageError || 'Your resumes stay on this device'}
        </div>
        <span className="home-top-label">YOUR WORKSPACE</span>
      </header>
      <main className="home-main">
        <div className="home-heading">
          <div>
            <span className="sidebar-kicker">YOUR NEXT CHAPTER STARTS HERE</span>
            <h1>Your resumes<span>.</span></h1>
            <p>Pick up where you left off, or start with a blank page.</p>
          </div>
          <button type="button" className="primary-button home-add-button" onClick={onAdd}>
            <span aria-hidden="true">+</span> Add a resume
          </button>
        </div>

        {storageError && <p className="home-storage-error" role="status">{storageError}</p>}

        {resumes.length > 0 ? (
          <div className="resume-list" aria-label="Saved resumes">
            {resumes.map((item, index) => (
              <article key={item.id} className="resume-card">
                <span className="resume-card-icon" aria-hidden="true">▤</span>
                <span className="resume-card-content">
                  <span className="resume-card-kicker">RESUME {String(index + 1).padStart(2, '0')}</span>
                  <button
                    type="button"
                    className="resume-card-name"
                    onClick={() => onOpen(item.id)}
                    aria-label={`Open ${item.data.name.trim() || 'untitled resume'}`}
                  >
                    {item.data.name.trim() || 'Untitled resume'}
                  </button>
                  <span className="resume-card-contact">{item.data.email || 'Continue editing your saved resume'}</span>
                </span>
                <div className="resume-card-actions" aria-label={`Actions for ${item.data.name.trim() || 'untitled resume'}`}>
                  <button
                    type="button"
                    className="card-action-button"
                    onClick={() => onOpen(item.id)}
                    aria-label={`Edit ${item.data.name.trim() || 'untitled resume'}`}
                    title="Edit resume"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="card-action-button"
                    aria-label={`Download ${item.data.name.trim() || 'untitled resume'} (not available yet)`}
                    title="Download (coming soon)"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <path d="m7 10 5 5 5-5" />
                      <path d="M12 15V3" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="card-action-button remove-card-action"
                    onClick={() => onRemove(item.id, item.data.name.trim() || 'Untitled resume')}
                    aria-label={`Remove ${item.data.name.trim() || 'untitled resume'}`}
                    title="Remove resume"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="m19 6-1 14H6L5 6" />
                      <path d="M10 11v5M14 11v5" />
                    </svg>
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <section className="home-empty-state">
            <span className="empty-state-icon" aria-hidden="true">✧</span>
            <h2>A fresh start.</h2>
            <p>Your saved resumes will show up here. Use the button above to open a blank builder.</p>
            <button type="button" className="secondary-button" onClick={onAdd}>Go to the builder <span aria-hidden="true">→</span></button>
          </section>
        )}

        <div className="home-footer-note"><span>✳</span> Your resume data is stored privately in this browser.</div>
      </main>
    </div>
  )
}

function ResumeBuilder({ resume, isDraft, storageError, onUpdate, onCreate }) {
  const { resumeId, sectionId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [finalizationError, setFinalizationError] = useState('')
  const currentSection = sections.find((section) => section.id === sectionId)
  const activeStep = currentSection ? sections.indexOf(currentSection) + 1 : 0

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  if (!currentSection || !resume) {
    return <Navigate to="/" replace />
  }

  const sectionPath = (section) => isDraft
    ? `/resume/new/${section.id}`
    : `/resume/${resumeId}/${section.id}`
  const previousSection = sections[activeStep - 2]
  const nextSection = sections[activeStep]
  const previous = previousSection ? { ...previousSection, path: sectionPath(previousSection) } : undefined
  const next = nextSection ? { ...nextSection, path: sectionPath(nextSection) } : undefined

  const updateResume = (getUpdatedResume) => {
    onUpdate(getUpdatedResume)
    setFinalizationError('')
  }

  const updateField = (event) => {
    const { name, value } = event.target
    updateResume((current) => ({ ...current, [name]: value }))
  }

  const updateEntry = (section, index, field, value) => {
    updateResume((current) => ({
      ...current,
      [section]: current[section].map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [field]: value } : entry,
      ),
    }))
  }

  const addEntry = (section, fields) => {
    updateResume((current) => ({
      ...current,
      [section]: [...current[section], Object.fromEntries(fields.map((field) => [field, '']))],
    }))
  }

  const removeEntry = (section, index) => {
    updateResume((current) => ({
      ...current,
      [section]: current[section].filter((_, entryIndex) => entryIndex !== index),
    }))
  }

  const handleFinish = () => {
    if (!isDraft) {
      navigate('/')
      return
    }

    const requiredValues = [resume.name, resume.email, resume.phone, resume.address]
    const emailInput = document.createElement('input')
    emailInput.type = 'email'
    emailInput.value = resume.email
    const hasRequiredDetails = requiredValues.every((value) => value.trim()) && emailInput.checkValidity()

    if (!hasRequiredDetails) {
      setFinalizationError('Add your name, a valid email address, phone number, and mailing address before saving this resume.')
      navigate(sectionPath(sections[0]))
      return
    }

    const created = onCreate(resume)
    if (!created) {
      setFinalizationError('This resume could not be saved. Your draft is still open; please try again.')
      return
    }

    navigate('/')
  }

  const entryProps = (section, fields) => ({
    section,
    entries: resume[section],
    onChange: (index, field, value) => updateEntry(section, index, field, value),
    onAdd: () => addEntry(section, fields),
    onRemove: (index) => removeEntry(section, index),
  })

  const renderSection = () => {
    if (currentSection.id === 'personal') {
      return (
        <PersonalPage
          resume={resume}
          onChange={updateField}
          onNext={() => navigate(next.path)}
          next={next}
        />
      )
    }

    if (currentSection.id === 'skills') {
      return (
        <>
          <section className="form-section personal-section">
            <SectionHeading
              eyebrow="YOUR TOOLKIT"
              title="Skills"
              description="What are you good at? Include tools, languages, or strengths."
              icon={currentSection.icon}
            />
            <div className="entry-card">
              <TextArea
                label="Skills"
                name="skills"
                value={resume.skills}
                onChange={updateField}
                placeholder="e.g. Project planning, Figma, Spanish, public speaking"
              />
              <span className="field-hint">Separate skills with commas. This section is optional.</span>
            </div>
          </section>
          <PageActions
            previous={previous}
            isLast
            onFinish={handleFinish}
          />
        </>
      )
    }

    const config = entryConfigs[currentSection.id]
    if (!config) return <Navigate to="/" replace />

    return (
      <>
        <EntryGroup {...entryProps(currentSection.id, config.fields.map(([field]) => field))} />
        <PageActions
          previous={previous}
          next={next}
          isLast={!next}
          onFinish={handleFinish}
        />
      </>
    )
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand" aria-label="Forme home">
          <span className="brand-mark">f</span>
          <span>forme<span className="brand-period">.</span></span>
        </Link>
        <div className={`topbar-note${storageError ? ' storage-error' : ''}`}>
          <span className="save-dot" />
          {storageError || (isDraft ? 'Temporary blank draft · not saved' : 'Edits save automatically on this device')}
        </div>
        <Link className="topbar-help" to="/">← <span>My resumes</span></Link>
      </header>

      <main className="workspace">
        <aside className="sidebar">
          <div className="sidebar-top">
            <span className="sidebar-kicker">RESUME WORKSPACE</span>
            <h1>Let’s build<br />your story.</h1>
            <p>A few details at a time. You can skip anything that doesn’t apply.</p>
            <div className="progress-wrap">
              <div className="progress-label"><span>YOUR PROGRESS</span><span>{String(activeStep).padStart(2, '0')} <i>/</i> 06</span></div>
              <div className="progress-track"><span style={{ width: `${activeStep / sections.length * 100}%` }} /></div>
            </div>
          </div>
          <nav className="section-nav" aria-label="Resume sections">
            {sections.map((section) => (
              <NavLink
                key={section.id}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                to={sectionPath(section)}
              >
                <span className="nav-number">{section.number}</span>
                <span className="nav-title">{section.title}</span>
                <span className="nav-icon" aria-hidden="true">{section.icon}</span>
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-tip">
            <span className="tip-sparkle">✳</span>
            <p><strong>A little tip</strong><br />Use short, specific details. You can always polish your wording later.</p>
          </div>
          <div className="sidebar-footer">MADE FOR YOUR NEXT CHAPTER <span>✳</span></div>
        </aside>

        <div className="form-column">
          <div className="page-heading">
            <div>
              <div className="breadcrumb"><Link to="/">MY RESUMES</Link> <span>/</span> {currentSection.title.toUpperCase()}</div>
              <h2>{currentSection.heading}<span className="heading-period">.</span></h2>
              <p>{currentSection.description}</p>
            </div>
            <span className="step-pill"><span /> STEP {activeStep} OF {sections.length}</span>
          </div>

          {finalizationError && (
            <div className="finalization-error" role="alert">
              <span>{finalizationError}</span>
              {location.pathname !== sectionPath(sections[0]) && (
                <Link to={sectionPath(sections[0])}>Go to personal details</Link>
              )}
            </div>
          )}

          {renderSection()}
        </div>

        <ResumePreview resume={resume} />
      </main>
    </div>
  )
}

function App() {
  const [savedState] = useState(readSavedResumes)
  const [resumes, setResumes] = useState(savedState.resumes)
  const [draft, setDraft] = useState(makeInitialResume)
  const [storageError, setStorageError] = useState(savedState.error)
  const navigate = useNavigate()

  const saveResumes = (nextResumes) => {
    setResumes(nextResumes)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextResumes))
      setStorageError('')
    } catch (error) {
      console.error('Could not save resumes to this browser.', error)
      setStorageError('Your changes could not be saved in this browser. Check available storage and privacy settings.')
    }
  }

  const updateSavedResume = (resumeId, getUpdatedResume) => {
    const nextResumes = resumes.map((item) => item.id === resumeId
      ? { ...item, data: getUpdatedResume(item.data) }
      : item)
    saveResumes(nextResumes)
  }

  const createResume = (resume) => {
    const id = window.crypto?.randomUUID
      ? `resume-${window.crypto.randomUUID()}`
      : `resume-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const nextResumes = [...resumes, { id, data: normalizeResume(resume) }]

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextResumes))
      setResumes(nextResumes)
      setStorageError('')
      return true
    } catch (error) {
      console.error('Could not save the completed resume to this browser.', error)
      setStorageError('Your resume could not be saved in this browser. Check available storage and privacy settings.')
      return false
    }
  }

  const removeResume = (resumeId, resumeName) => {
    if (!window.confirm(`Remove "${resumeName}" from your resumes? This cannot be undone.`)) {
      return
    }

    const nextResumes = resumes.filter((item) => item.id !== resumeId)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextResumes))
      setResumes(nextResumes)
      setStorageError('')
    } catch (error) {
      console.error('Could not remove the resume from this browser.', error)
      setStorageError('This resume could not be removed because the change could not be saved. Please try again.')
    }
  }

  const openNewDraft = () => {
    setDraft(makeInitialResume())
    navigate('/resume/new/personal')
  }

  return (
    <Routes>
      <Route
        path="/"
        element={(
          <ResumeHome
            resumes={resumes}
            storageError={storageError}
            onAdd={openNewDraft}
            onOpen={(resumeId) => navigate(`/resume/${resumeId}/personal`)}
            onRemove={removeResume}
          />
        )}
      />
      <Route
        path="/resume/new/:sectionId"
        element={(
          <ResumeBuilder
            resume={draft}
            isDraft
            storageError={storageError}
            onUpdate={(getUpdatedResume) => setDraft((current) => getUpdatedResume(current))}
            onCreate={createResume}
          />
        )}
      />
      <Route
        path="/resume/:resumeId/:sectionId"
        element={<SavedResumeRoute resumes={resumes} storageError={storageError} onUpdate={updateSavedResume} />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function SavedResumeRoute({ resumes, storageError, onUpdate }) {
  const { resumeId } = useParams()
  const resumeItem = resumes.find((item) => item.id === resumeId)
  if (!resumeItem) return <Navigate to="/" replace />

  return (
    <ResumeBuilder
      key={resumeItem.id}
      resume={resumeItem.data}
      resumeId={resumeItem.id}
      isDraft={false}
      storageError={storageError}
      onUpdate={(getUpdatedResume) => onUpdate(resumeItem.id, getUpdatedResume)}
    />
  )
}

export default App

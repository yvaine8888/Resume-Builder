import { useEffect, useState } from 'react'
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import sections from './data.json'
import './App.css'

const STORAGE_KEY = 'forme.resume.v1'

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

function readSavedResume() {
  try {
    const savedResume = window.localStorage.getItem(STORAGE_KEY)
    return {
      resume: savedResume ? normalizeResume(JSON.parse(savedResume)) : makeInitialResume(),
      error: '',
    }
  } catch (error) {
    console.warn('Could not restore the saved resume from this browser.', error)
    return {
      resume: makeInitialResume(),
      error: 'A saved resume could not be read. Your new changes will still be saved on this device.',
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

function PersonalPage({ resume, onChange, onNext }) {
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
      <PageActions next={sections.find((section) => section.id === 'education')} submit />
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

function App() {
  const [savedState] = useState(readSavedResume)
  const [resume, setResume] = useState(savedState.resume)
  const [storageError, setStorageError] = useState(savedState.error)
  const [finishedPath, setFinishedPath] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const currentSection = sections.find((section) => section.path === location.pathname) || sections[0]
  const activeStep = sections.indexOf(currentSection) + 1
  const previousSection = sections[activeStep - 2]
  const nextSection = sections[activeStep]
  const renderSection = (section) => {
    if (section.id === 'personal') {
      return <PersonalPage resume={resume} onChange={updateField} onNext={() => navigate(nextSection.path)} />
    }

    if (section.id === 'skills') {
      return (
        <>
          <section className="form-section personal-section">
            <SectionHeading
              eyebrow="YOUR TOOLKIT"
              title="Skills"
              description="What are you good at? Include tools, languages, or strengths."
              icon={section.icon}
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
            previous={previousSection}
            isLast
            onFinish={() => setFinishedPath(location.pathname)}
          />
        </>
      )
    }

    const config = entryConfigs[section.id]
    if (!config) {
      return <Navigate to={sections[0].path} replace />
    }

    return renderEntryPage(section.id, config.fields.map(([field]) => field))
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  const updateResume = (getUpdatedResume) => {
    const updatedResume = getUpdatedResume(resume)
    setResume(updatedResume)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedResume))
      setStorageError('')
    } catch (error) {
      console.error('Could not save the resume to this browser.', error)
      setStorageError('Your changes could not be saved in this browser. Check available storage and privacy settings.')
    }
    setFinishedPath('')
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

  const entryProps = (section, fields) => ({
    section,
    entries: resume[section],
    onChange: (index, field, value) => updateEntry(section, index, field, value),
    onAdd: () => addEntry(section, fields),
    onRemove: (index) => removeEntry(section, index),
  })

  const renderEntryPage = (section, fields) => (
    <>
      <EntryGroup {...entryProps(section, fields)} />
      <PageActions
        previous={previousSection}
        next={nextSection}
        isLast={!nextSection}
        onFinish={() => setFinishedPath(location.pathname)}
      />
    </>
  )

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to={sections[0].path} className="brand" aria-label="Forme home">
          <span className="brand-mark">f</span>
          <span>forme<span className="brand-period">.</span></span>
        </Link>
        <div className={`topbar-note${storageError ? ' storage-error' : ''}`}>
          <span className="save-dot" />
          {storageError || 'Edits save automatically on this device'}
        </div>
        <Link className="topbar-help" to={sections[0].path}>Need a hand? <span>Start here ↗</span></Link>
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
                to={section.path}
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
              <div className="breadcrumb">MY RESUME <span>/</span> {currentSection.title.toUpperCase()}</div>
              <h2>{currentSection.heading}<span className="heading-period">.</span></h2>
              <p>{currentSection.description}</p>
            </div>
            <span className="step-pill"><span /> STEP {activeStep} OF {sections.length}</span>
          </div>

          {finishedPath === location.pathname && (
            <div className="success-message" role="status">
              <span aria-hidden="true">✓</span>
              You’re all set for now. Your changes are saved on this device.
            </div>
          )}

          <Routes>
            {sections.map((section) => (
              <Route
                key={section.id}
                path={section.path}
                element={renderSection(section)}
              />
            ))}
            <Route path="/" element={<Navigate to={sections[0].path} replace />} />
            <Route path="*" element={<Navigate to={sections[0].path} replace />} />
          </Routes>
        </div>

        <ResumePreview resume={resume} />
      </main>
    </div>
  )
}

export default App

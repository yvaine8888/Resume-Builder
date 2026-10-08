import { useState } from 'react'
import './App.css'

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

const sections = [
  { id: 'personal', number: '01', title: 'Personal details', icon: '✳' },
  { id: 'education', number: '02', title: 'Education', icon: '▤' },
  { id: 'experience', number: '03', title: 'Experience', icon: '▧' },
  { id: 'activities', number: '04', title: 'Activities', icon: '✣' },
  { id: 'awards', number: '05', title: 'Awards', icon: '✧' },
  { id: 'skills', number: '06', title: 'Skills', icon: '⌘' },
]

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

function EntryGroup({ section, entries, onChange, onAdd, onRemove }) {
  const config = {
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
  }[section]

  return (
    <section className="form-section" id={section}>
      <div className="section-heading">
        <div>
          <span className="eyebrow">{section === 'activities' ? 'BEYOND THE CLASSROOM' : section.toUpperCase()}</span>
          <h2>{config.title}</h2>
          <p>{config.description}</p>
        </div>
        <span className="section-illustration" aria-hidden="true">{sections.find((item) => item.id === section)?.icon}</span>
      </div>
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

function App() {
  const [resume, setResume] = useState(initialResume)
  const [activeSection, setActiveSection] = useState('personal')
  const [submitted, setSubmitted] = useState(false)
  const activeStep = sections.findIndex((section) => section.id === activeSection) + 1

  const updateField = (event) => {
    const { name, value } = event.target
    setResume((current) => ({ ...current, [name]: value }))
    setSubmitted(false)
  }

  const updateEntry = (section, index, field, value) => {
    setResume((current) => ({
      ...current,
      [section]: current[section].map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [field]: value } : entry,
      ),
    }))
  }

  const addEntry = (section, fields) => {
    setResume((current) => ({
      ...current,
      [section]: [...current[section], Object.fromEntries(fields.map((field) => [field, '']))],
    }))
  }

  const removeEntry = (section, index) => {
    setResume((current) => ({
      ...current,
      [section]: current[section].filter((_, entryIndex) => entryIndex !== index),
    }))
  }

  const goToSection = (event, id) => {
    event.preventDefault()
    setActiveSection(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
    setActiveSection('personal')
    document.getElementById('personal')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a href="#top" className="brand" aria-label="Forme home">
          <span className="brand-mark">f</span>
          <span>forme<span className="brand-period">.</span></span>
        </a>
        <div className="topbar-note"><span className="save-dot" /> Your progress is on this page</div>
        <a className="topbar-help" href="#personal">Need a hand? <span>Start here ↗</span></a>
      </header>

      <main id="top" className="workspace">
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
              <a
                key={section.id}
                className={`nav-item${activeSection === section.id ? ' active' : ''}`}
                href={`#${section.id}`}
                onClick={(event) => goToSection(event, section.id)}
              >
                <span className="nav-number">{section.number}</span>
                <span className="nav-title">{section.title}</span>
                <span className="nav-icon" aria-hidden="true">{section.icon}</span>
              </a>
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
              <div className="breadcrumb">MY RESUME <span>/</span> BUILD</div>
              <h2>Tell us about yourself<span className="heading-period">.</span></h2>
              <p>Start with the essentials. The rest is entirely up to you.</p>
            </div>
            <span className="step-pill"><span /> STEP {activeStep} OF 6</span>
          </div>

          {submitted && (
            <div className="success-message" role="status">
              <span aria-hidden="true">✓</span>
              Your essential details are in. You can keep adding to your resume whenever you’re ready.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <section className="form-section personal-section" id="personal">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">THE IMPORTANT BITS</span>
                  <h2>Personal details</h2>
                  <p>How should people get in touch with you?</p>
                </div>
                <span className="section-illustration" aria-hidden="true">✳</span>
              </div>
              <div className="entry-card">
                <div className="fields-grid">
                  <TextField label="Full name" name="name" value={resume.name} onChange={updateField} placeholder="e.g. Alex Morgan" required />
                  <TextField label="Email address" name="email" value={resume.email} onChange={updateField} placeholder="you@example.com" type="email" required />
                  <TextField label="Phone number" name="phone" value={resume.phone} onChange={updateField} placeholder="(555) 123-4567" type="tel" required />
                  <TextField label="Mailing address" name="address" value={resume.address} onChange={updateField} placeholder="Street, city, state, ZIP code" required />
                  <TextArea label="A little about you" name="summary" value={resume.summary} onChange={updateField} placeholder="Optional — a short introduction, what you’re looking for, or what makes you you." />
                </div>
                <p className="privacy-note"><span aria-hidden="true">♧</span> Your contact details are only for your resume.</p>
              </div>
            </section>

            <EntryGroup
              section="education"
              entries={resume.education}
              onChange={(index, field, value) => updateEntry('education', index, field, value)}
              onAdd={() => addEntry('education', ['school', 'degree', 'location', 'dates', 'details'])}
              onRemove={(index) => removeEntry('education', index)}
            />
            <EntryGroup
              section="experience"
              entries={resume.experience}
              onChange={(index, field, value) => updateEntry('experience', index, field, value)}
              onAdd={() => addEntry('experience', ['role', 'organization', 'location', 'dates', 'details'])}
              onRemove={(index) => removeEntry('experience', index)}
            />
            <EntryGroup
              section="activities"
              entries={resume.activities}
              onChange={(index, field, value) => updateEntry('activities', index, field, value)}
              onAdd={() => addEntry('activities', ['name', 'role', 'dates', 'details'])}
              onRemove={(index) => removeEntry('activities', index)}
            />
            <EntryGroup
              section="awards"
              entries={resume.awards}
              onChange={(index, field, value) => updateEntry('awards', index, field, value)}
              onAdd={() => addEntry('awards', ['name', 'organization', 'date', 'details'])}
              onRemove={(index) => removeEntry('awards', index)}
            />

            <section className="form-section" id="skills">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">YOUR TOOLKIT</span>
                  <h2>Skills</h2>
                  <p>What are you good at? Include tools, languages, or strengths.</p>
                </div>
                <span className="section-illustration" aria-hidden="true">⌘</span>
              </div>
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

            <div className="form-actions">
              <p><span>*</span> Required to get started. Everything else is optional.</p>
              <button className="primary-button" type="submit">Looks good <span aria-hidden="true">→</span></button>
            </div>
          </form>
        </div>

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
      </main>
    </div>
  )
}

export default App

import { useState } from 'react'
import { submitFullName, ApiError } from '../services/api.js'

const MAX_LENGTH = 150

// status drives the small terminal-style indicator dot and message tone
const STATUS = {
  idle: 'idle',
  submitting: 'submitting',
  success: 'success',
  error: 'error',
}

function NameForm() {
  const [fullName, setFullName] = useState('')
  const [status, setStatus] = useState(STATUS.idle)
  const [message, setMessage] = useState('')
  const [validationError, setValidationError] = useState('')

  const isSubmitting = status === STATUS.submitting

  function validate(value) {
    if (value.trim().length === 0) {
      return 'Full name is required.'
    }
    if (value.trim().length > MAX_LENGTH) {
      return `Full name must be ${MAX_LENGTH} characters or fewer.`
    }
    return ''
  }

  function handleChange(event) {
    setFullName(event.target.value)
    // Clear a stale validation message as soon as the user starts fixing it.
    if (validationError) setValidationError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (isSubmitting) return // guard against double submits

    const trimmed = fullName.trim()
    const error = validate(fullName)

    if (error) {
      setValidationError(error)
      setStatus(STATUS.idle)
      setMessage('')
      return
    }

    setValidationError('')
    setStatus(STATUS.submitting)
    setMessage('')

    try {
      const result = await submitFullName(trimmed)
      setStatus(STATUS.success)
      setMessage(result.message)
      setFullName('')
    } catch (err) {
      setStatus(STATUS.error)
      if (err instanceof ApiError) {
        setMessage(err.message)
      } else {
        setMessage('Something went wrong. Please try again.')
      }
    }
  }

  return (
    <form className="name-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="full_name">Full Name</label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          autoComplete="name"
          maxLength={MAX_LENGTH}
          value={fullName}
          onChange={handleChange}
          disabled={isSubmitting}
          aria-invalid={Boolean(validationError)}
          aria-describedby="full_name_validation"
          placeholder="e.g. John Smith"
        />
        <div id="full_name_validation" className="validation" role="alert">
          {validationError}
        </div>
      </div>

      <button type="submit" className="submit-button" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : 'Submit'}
      </button>

      <div className={`status-line status-line--${status}`} role="status">
        <span className="status-dot" aria-hidden="true" />
        <span className="status-text">
          {status === STATUS.idle && 'Awaiting input.'}
          {status === STATUS.submitting && 'Sending to API…'}
          {status === STATUS.success && message}
          {status === STATUS.error && message}
        </span>
      </div>
    </form>
  )
}

export default NameForm

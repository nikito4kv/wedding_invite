'use client'

import { useState } from 'react'
import type { AlcoholPreference, AttendanceValue, GuestFormatValue } from '@/lib/constants/rsvp'
import { useLocale } from '@/lib/i18n/locale-context'
import { validateCanonicalRsvpPayload } from '@/lib/rsvp/schema'
import type { RsvpErrorField, RsvpFieldErrors, RsvpRouteResponse } from '@/lib/rsvp/types'
import styles from './rsvp-section.module.css'

type SubmissionState = 'idle' | 'pending' | 'success' | 'error'

interface RsvpFormDraft {
  fullName: string;
  attendance: AttendanceValue;
  guestMode: GuestFormatValue;
  plusOneName: string;
  alcoholPreferences: AlcoholPreference[];
  alcoholPreferenceOther: string;
}

const fallbackMessage = 'Не удалось отправить RSVP прямо сейчас. Попробуйте ещё раз немного позже.'
const otherAlcoholPreference: AlcoholPreference = 'Другое'

const fieldErrorIds: Record<RsvpErrorField, string> = {
  body: 'rsvp-form-error',
  fullName: 'rsvp-full-name-error',
  attendance: 'rsvp-attendance-error',
  guestMode: 'rsvp-guest-mode-error',
  plusOneName: 'rsvp-plus-one-name-error',
  alcoholPreferences: 'rsvp-alcohol-preferences-error',
  alcoholPreferenceOther: 'rsvp-alcohol-preference-other-error'
}

const isPlusOneNameEnabled = (
  attendance: AttendanceValue,
  guestMode: GuestFormatValue,
  enabledWhen: { attendanceIs: AttendanceValue; guestFormatIs: GuestFormatValue }
) => {
  return attendance === enabledWhen.attendanceIs && guestMode === enabledWhen.guestFormatIs
}

const buildErrorAttributes = (field: keyof Omit<typeof fieldErrorIds, 'body'>, error?: string) => {
  if (!error) {
    return undefined
  }

  return fieldErrorIds[field]
}

export function RsvpSection() {
  const { content: inviteContent, ui, translateValidationMessage } = useLocale()
  const {
    attendanceOptions,
    guestFormatOptions,
    plusOneNameField,
    alcoholPreferenceOptions,
    alcoholPreferenceLabels,
    sectionTitle,
    sectionLead,
    noteCard,
    successState,
    failureState,
    submitButton
  } = inviteContent.rsvp
  const organizerContacts = [inviteContent.organizers.primary, inviteContent.organizers.backup]
  const localizedFallbackMessage = translateValidationMessage(fallbackMessage) ?? fallbackMessage
  const [values, setValues] = useState<RsvpFormDraft>(() => ({
    fullName: '',
    attendance: attendanceOptions[0].value,
    guestMode: guestFormatOptions[0].value,
    plusOneName: '',
    alcoholPreferences: [],
    alcoholPreferenceOther: ''
  }))
  const [fieldErrors, setFieldErrors] = useState<RsvpFieldErrors>({})
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const localizedFieldErrors = Object.fromEntries(
    Object.entries(fieldErrors).map(([field, message]) => [field, translateValidationMessage(message)])
  ) as RsvpFieldErrors
  const isPending = submissionState === 'pending'
  const isSuccess = submissionState === 'success'
  const showPlusOneName = isPlusOneNameEnabled(values.attendance, values.guestMode, plusOneNameField.enabledWhen)
  const showAlcoholPreferenceOther = values.alcoholPreferences.includes(otherAlcoholPreference)

  const clearErrors = (...fields: RsvpErrorField[]) => {
    setFieldErrors((current) => {
      let hasChanges = false
      const next = { ...current }

      for (const field of fields) {
        if (field in next) {
          delete next[field]
          hasChanges = true
        }
      }

      return hasChanges ? next : current
    })
  }

  const resetFeedback = (fieldsToClear: RsvpErrorField[] = ['body']) => {
    clearErrors(...fieldsToClear)

    if (submissionState !== 'idle') {
      setSubmissionState('idle')
    }

    if (statusMessage) {
      setStatusMessage(null)
    }
  }

  const handleAlcoholToggle = (option: AlcoholPreference) => {
    resetFeedback(['alcoholPreferences', 'alcoholPreferenceOther', 'body'])
    setValues((current) => {
      const isSelected = current.alcoholPreferences.includes(option)

      return {
        ...current,
        alcoholPreferences: isSelected
          ? current.alcoholPreferences.filter((value) => value !== option)
          : [...current.alcoholPreferences, option],
        alcoholPreferenceOther: isSelected && option === otherAlcoholPreference ? '' : current.alcoholPreferenceOther
      }
    })
  }

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault()

    if (isPending) {
      return
    }

    const validationResult = validateCanonicalRsvpPayload({
      fullName: values.fullName,
      attendance: values.attendance,
      guestMode: values.guestMode,
      plusOneName: values.plusOneName,
      alcoholPreferences: values.alcoholPreferences,
      alcoholPreferenceOther: values.alcoholPreferenceOther
    })

    if (!validationResult.success) {
      setFieldErrors(validationResult.error.fieldErrors)
      setSubmissionState('idle')
      setStatusMessage(translateValidationMessage(validationResult.error.fieldErrors.body) ?? null)
      return
    }

    setFieldErrors({})
    setSubmissionState('pending')
    setStatusMessage(null)

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validationResult.data)
      })

      const result = (await response.json()) as RsvpRouteResponse

      if (result.ok) {
        setSubmissionState('success')
        setStatusMessage(ui.rsvpSuccessMessage)
        return
      }

      if (result.error.type === 'validation') {
        setFieldErrors(result.error.fieldErrors)
        setSubmissionState('idle')
        setStatusMessage(translateValidationMessage(result.error.fieldErrors.body) ?? null)
        return
      }

      setSubmissionState('error')
      setStatusMessage(translateValidationMessage(result.error.message) ?? result.error.message)
    } catch {
      setSubmissionState('error')
      setStatusMessage(localizedFallbackMessage)
    }
  }

  return (
    <section className={styles.section} aria-labelledby="rsvp-title">
      <div className="content-frame">
        <div className={`surface-panel ${styles.panel}`}>
          <div className={styles.copyBlock}>
            <h2 id="rsvp-title" className={styles.title}>
              {sectionTitle}
            </h2>
            <p className={styles.lead}>{sectionLead}</p>
            <div className={styles.noteCard}>
              <p className={styles.noteTitle}>{noteCard.title}</p>
              <p className={styles.noteText}>{noteCard.text}</p>
            </div>
          </div>

          <form
            className={styles.formCard}
            data-testid="rsvp-form"
            noValidate
            onSubmit={handleSubmit}
            aria-busy={isPending}
          >
            {isSuccess ? (
              <div
                className={`${styles.statusCard} ${styles.statusCardSuccess}`}
                aria-live="polite"
                data-testid="rsvp-success-state"
              >
                <p className={styles.statusEyebrow}>{successState.eyebrow}</p>
                <h3 className={styles.statusTitle}>{successState.title}</h3>
                <p className={styles.statusText}>{statusMessage}</p>
              </div>
            ) : (
              <>
                <fieldset className={styles.fields} disabled={isPending}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="rsvp-full-name">
                      {ui.fullNameLabel}
                    </label>
                    <input
                      id="rsvp-full-name"
                      name="fullName"
                      className={styles.input}
                      type="text"
                      value={values.fullName}
                      onChange={(event) => {
                        resetFeedback(['fullName', 'body'])
                        setValues((current) => ({ ...current, fullName: event.target.value }))
                      }}
                      placeholder={ui.fullNamePlaceholder}
                      autoComplete="name"
                      aria-invalid={fieldErrors.fullName ? 'true' : 'false'}
                      aria-describedby={buildErrorAttributes('fullName', fieldErrors.fullName)}
                    />
                    {fieldErrors.fullName ? (
                      <p id={fieldErrorIds.fullName} className={styles.errorText} role="alert">
                        {localizedFieldErrors.fullName}
                      </p>
                    ) : null}
                  </div>

                  <fieldset
                    className={styles.choiceGroup}
                    aria-describedby={buildErrorAttributes('attendance', fieldErrors.attendance)}
                  >
                    <legend className={styles.legend}>{ui.attendanceLegend}</legend>
                    <div className={styles.choiceGrid}>
                      {attendanceOptions.map((option) => (
                        <label key={option.value} className={styles.choiceCard}>
                          <input
                            className={styles.choiceInput}
                            type="radio"
                            name="attendance"
                            value={option.value}
                            checked={values.attendance === option.value}
                            onChange={() => {
                              resetFeedback(['attendance', 'plusOneName', 'body'])
                              setValues((current) => ({
                                ...current,
                                attendance: option.value,
                                plusOneName:
                                  option.value === plusOneNameField.enabledWhen.attendanceIs
                                    ? current.plusOneName
                                    : ''
                              }))
                            }}
                          />
                          <span className={styles.choiceLabel}>{option.label}</span>
                        </label>
                      ))}
                    </div>
                    {fieldErrors.attendance ? (
                      <p id={fieldErrorIds.attendance} className={styles.errorText} role="alert">
                        {localizedFieldErrors.attendance}
                      </p>
                    ) : null}
                  </fieldset>

                  <fieldset
                    className={styles.choiceGroup}
                    aria-describedby={buildErrorAttributes('guestMode', fieldErrors.guestMode)}
                  >
                    <legend className={styles.legend}>{ui.guestModeLegend}</legend>
                    <div className={styles.choiceGrid}>
                      {guestFormatOptions.map((option) => (
                        <label key={option.value} className={styles.choiceCard}>
                          <input
                            className={styles.choiceInput}
                            type="radio"
                            name="guestMode"
                            value={option.value}
                            checked={values.guestMode === option.value}
                            onChange={() => {
                              resetFeedback(['guestMode', 'plusOneName', 'body'])
                              setValues((current) => ({
                                ...current,
                                guestMode: option.value,
                                plusOneName: isPlusOneNameEnabled(current.attendance, option.value, plusOneNameField.enabledWhen)
                                  ? current.plusOneName
                                  : ''
                              }))
                            }}
                          />
                          <span className={styles.choiceLabel}>{option.label}</span>
                        </label>
                      ))}
                    </div>
                    {fieldErrors.guestMode ? (
                      <p id={fieldErrorIds.guestMode} className={styles.errorText} role="alert">
                        {localizedFieldErrors.guestMode}
                      </p>
                    ) : null}
                  </fieldset>

                  {showPlusOneName ? (
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="rsvp-plus-one-name">
                        {ui.plusOneLabel}
                      </label>
                      <input
                        id="rsvp-plus-one-name"
                        name="plusOneName"
                        className={styles.input}
                        type="text"
                        value={values.plusOneName}
                        onChange={(event) => {
                          resetFeedback(['plusOneName', 'body'])
                          setValues((current) => ({ ...current, plusOneName: event.target.value }))
                        }}
                        placeholder={plusOneNameField.placeholder}
                        autoComplete="name"
                        aria-invalid={fieldErrors.plusOneName ? 'true' : 'false'}
                        aria-describedby={buildErrorAttributes('plusOneName', fieldErrors.plusOneName)}
                      />
                      {fieldErrors.plusOneName ? (
                        <p id={fieldErrorIds.plusOneName} className={styles.errorText} role="alert">
                          {localizedFieldErrors.plusOneName}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  <fieldset
                    className={styles.choiceGroup}
                    aria-describedby={buildErrorAttributes(
                      'alcoholPreferences',
                      fieldErrors.alcoholPreferences
                    )}
                  >
                    <legend className={styles.legend}>{ui.drinksLegend}</legend>
                    <p className={styles.helperText}>{ui.drinksHelper}</p>
                    <div className={styles.checkboxGrid}>
                      {alcoholPreferenceOptions.map((option, index) => {
                        const optionId = `rsvp-alcohol-${index}`

                        return (
                          <label key={option} className={styles.checkboxCard} htmlFor={optionId}>
                            <input
                              id={optionId}
                              className={styles.checkboxInput}
                              type="checkbox"
                              name="alcoholPreferences"
                              value={option}
                              checked={values.alcoholPreferences.includes(option)}
                              onChange={() => handleAlcoholToggle(option)}
                            />
                            <span className={styles.checkboxLabel}>{alcoholPreferenceLabels[option]}</span>
                          </label>
                        )
                      })}
                    </div>
                    {showAlcoholPreferenceOther ? (
                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="rsvp-alcohol-preference-other">
                          {ui.otherDrinkLabel}
                        </label>
                        <input
                          id="rsvp-alcohol-preference-other"
                          name="alcoholPreferenceOther"
                          className={styles.input}
                          type="text"
                          value={values.alcoholPreferenceOther}
                          onChange={(event) => {
                            resetFeedback(['alcoholPreferenceOther', 'body'])
                            setValues((current) => ({
                              ...current,
                              alcoholPreferenceOther: event.target.value
                            }))
                          }}
                          placeholder={ui.otherDrinkPlaceholder}
                          aria-invalid={fieldErrors.alcoholPreferenceOther ? 'true' : 'false'}
                          aria-describedby={buildErrorAttributes(
                            'alcoholPreferenceOther',
                            fieldErrors.alcoholPreferenceOther
                          )}
                        />
                        {fieldErrors.alcoholPreferenceOther ? (
                          <p id={fieldErrorIds.alcoholPreferenceOther} className={styles.errorText} role="alert">
                            {localizedFieldErrors.alcoholPreferenceOther}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                    {fieldErrors.alcoholPreferences ? (
                      <p id={fieldErrorIds.alcoholPreferences} className={styles.errorText} role="alert">
                        {localizedFieldErrors.alcoholPreferences}
                      </p>
                    ) : null}
                  </fieldset>
                </fieldset>

                {submissionState === 'error' ? (
                  <div
                    className={`${styles.statusCard} ${styles.statusCardError}`}
                    aria-live="polite"
                    data-testid="rsvp-failure-state"
                  >
                    <p className={styles.statusEyebrow}>{failureState.eyebrow}</p>
                    <h3 className={styles.statusTitle}>{failureState.title}</h3>
                    <p className={styles.statusText}>{statusMessage ?? localizedFallbackMessage}</p>
                    <p className={styles.statusText}>{failureState.detail}</p>
                    <ul className={styles.contactList}>
                      {organizerContacts.map((contact) => (
                        <li key={contact.telegram} className={styles.contactItem}>
                          <span className={styles.contactName}>{contact.role} — {contact.name}</span>
                          <a
                            className={styles.contactLink}
                            href={`https://t.me/${contact.telegram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {contact.telegram}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {fieldErrors.body ? (
                  <p id={fieldErrorIds.body} className={styles.errorText} role="alert">
                    {localizedFieldErrors.body}
                  </p>
                ) : null}

                <button
                  className={styles.submitButton}
                  type="submit"
                  disabled={isPending}
                  data-testid="rsvp-submit"
                >
                  {isPending ? submitButton.pending : submitButton.idle}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}

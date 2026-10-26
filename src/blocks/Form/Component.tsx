'use client'
import type {
  Form as FormType,
  FormFieldBlock,
  TextField,
} from '@payloadcms/plugin-form-builder/types'

import { Check, Send } from 'lucide-react'

import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useForm, FormProvider, type UseFormReturn } from 'react-hook-form'
import RichText from '@/components/RichText'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import { fields } from './fields'
import { getClientSideURL } from '@/utilities/getURL'
import { widthToColSpan } from './widthToColSpan'

type SupportedFormField = FormFieldBlock | (Omit<TextField, 'blockType'> & { blockType: 'number' })
function renderField(field: SupportedFormField, methods: UseFormReturn<Record<string, unknown>>) {
  switch (field.blockType) {
    case 'checkbox':
      return <fields.checkbox {...field} {...methods} errors={methods.formState.errors} />
    case 'country':
      return <fields.country {...field} {...methods} errors={methods.formState.errors} />
    case 'email':
      return <fields.email {...field} {...methods} errors={methods.formState.errors} />
    case 'number':
      return <fields.number {...field} {...methods} errors={methods.formState.errors} />
    case 'select':
      return <fields.select {...field} {...methods} errors={methods.formState.errors} />
    case 'state':
      return <fields.state {...field} {...methods} errors={methods.formState.errors} />
    case 'text':
      return <fields.text {...field} {...methods} errors={methods.formState.errors} />
    case 'textarea':
      return <fields.textarea {...field} {...methods} errors={methods.formState.errors} />
    case 'message':
      return 'root' in field.message ? (
        <fields.message message={field.message as DefaultTypedEditorState} />
      ) : null
    default:
      return null
  }
}

export type FormBlockType = {
  blockName?: string
  blockType?: 'formBlock'
  enableIntro: boolean
  form: FormType
  introContent?: DefaultTypedEditorState
}

export const FormBlock: React.FC<
  {
    id?: string
  } & FormBlockType
> = (props) => {
  const {
    enableIntro,
    form: formFromProps,
    form: { id: formID, confirmationMessage, confirmationType, redirect, submitButtonLabel } = {},
    introContent,
  } = props

  const formMethods = useForm<Record<string, unknown>>({
    defaultValues: Object.fromEntries(
      (formFromProps.fields || []).flatMap((field) =>
        'name' in field && field.name
          ? [
              [
                field.name,
                'defaultValue' in field
                  ? (field.defaultValue ?? (field.blockType === 'checkbox' ? false : ''))
                  : '',
              ],
            ]
          : [],
      ),
    ),
  })
  const { handleSubmit } = formMethods

  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState<boolean>()
  const [error, setError] = useState<{ message: string; status?: string } | undefined>()
  const router = useRouter()
  const honeypotID = useId()
  const statusRef = useRef<HTMLDivElement>(null)
  const submitting = useRef(false)
  useEffect(() => {
    if (error || hasSubmitted) statusRef.current?.focus({ preventScroll: true })
  }, [error, hasSubmitted])

  const onSubmit = useCallback(
    (data: Record<string, unknown>, event?: React.BaseSyntheticEvent) => {
      if (submitting.current) return
      submitting.current = true
      const website =
        event?.target instanceof HTMLFormElement
          ? (event.target.querySelector<HTMLInputElement>('[data-form-honeypot]')?.value ?? '')
          : ''
      const submitForm = async () => {
        setError(undefined)
        setIsLoading(true)

        const dataToSend = Object.entries(data).map(([name, value]) => ({
          field: name,
          value: value == null ? '' : String(value),
        }))

        try {
          const req = await fetch(`${getClientSideURL()}/api/form-submissions`, {
            body: JSON.stringify({
              form: formID,
              website,
              submissionData: dataToSend,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
          })

          if (req.status >= 400) {
            setIsLoading(false)

            setError({
              message:
                req.status === 429
                  ? 'Du hast zu viele Anfragen gesendet. Bitte warte kurz und versuche es erneut.'
                  : 'Die Nachricht konnte nicht gesendet werden. Bitte prüfe deine Angaben und versuche es erneut.',
              status: String(req.status),
            })

            return
          }

          setIsLoading(false)
          setHasSubmitted(true)

          if (confirmationType === 'redirect' && redirect) {
            const { url } = redirect

            const redirectUrl = url

            if (redirectUrl) router.push(redirectUrl)
          }
        } catch (err) {
          console.warn(err)
          setIsLoading(false)
          setError({
            message:
              'Die Verbindung ist fehlgeschlagen. Deine Angaben bleiben erhalten. Bitte versuche es erneut.',
          })
        } finally {
          submitting.current = false
        }
      }

      void submitForm()
    },
    [router, formID, redirect, confirmationType],
  )

  return (
    <div className="min-w-0 bg-secondary-background border border-white/10 p-5 sm:p-8 md:p-10 rounded-3xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-[60px] pointer-events-none" />
      {enableIntro && introContent && !hasSubmitted && (
        <RichText className="mb-8 lg:mb-12" data={introContent} enableGutter={false} />
      )}
      <FormProvider {...formMethods}>
        {!isLoading && hasSubmitted && (
          <div
            ref={statusRef}
            tabIndex={-1}
            role="status"
            className="flex items-center justify-center outline-hidden"
          >
            <div className="min-w-0 text-center [overflow-wrap:anywhere]">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="relative flex items-center justify-center w-full h-full bg-accent rounded-full text-white">
                  <Check className="w-10 h-10" aria-hidden="true" />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold mb-4">
                Nachricht gesendet!
              </h2>
              {confirmationType === 'message' && confirmationMessage && (
                <RichText data={confirmationMessage} enableGutter={false} />
              )}
            </div>
          </div>
        )}
        {error && (
          <div
            ref={statusRef}
            tabIndex={-1}
            role="alert"
            className="relative mb-6 rounded-xl border border-red-400/50 bg-red-400/10 p-4 text-sm text-red-300 [overflow-wrap:anywhere] outline-hidden"
          >
            {error.message}
          </div>
        )}
        {!hasSubmitted && (
          <form
            id={formID}
            noValidate
            aria-busy={isLoading}
            onSubmit={(event) => {
              void handleSubmit(onSubmit)(event)
            }}
          >
            {/* Keep the bot trap outside the CMS fields and keyboard/accessibility flow. */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: '-10000px',
                width: 1,
                height: 1,
                overflow: 'hidden',
              }}
            >
              <label htmlFor={honeypotID}>Website – bitte leer lassen</label>
              <input
                data-form-honeypot
                id={honeypotID}
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
            <div className="relative z-10 grid min-w-0 grid-cols-1 sm:grid-cols-12 gap-6">
              {formFromProps?.fields?.map((field, index) => {
                const colSpan = widthToColSpan('width' in field ? field.width : undefined)

                return (
                  <div key={'name' in field ? field.name : index} className={`min-w-0 ${colSpan}`}>
                    {renderField(field, formMethods)}
                  </div>
                )
              })}
            </div>

            <div className="mt-6">
              <button
                form={formID}
                type="submit"
                disabled={isLoading}
                className="w-full min-h-12 bg-accent-contrast hover:bg-accent-contrast/90 text-white font-bold px-4 py-4 rounded-xl transition-colors duration-150 flex items-center justify-center gap-2 group focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span
                      className="w-5 h-5 shrink-0 border-2 border-current/30 border-t-current rounded-full animate-spin motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                    <span>Wird gesendet …</span>
                  </>
                ) : (
                  <>
                    <span className="[overflow-wrap:anywhere]">
                      {submitButtonLabel || 'Nachricht senden'}
                    </span>
                    <Send className="w-4 h-4 shrink-0" aria-hidden="true" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </FormProvider>
    </div>
  )
}

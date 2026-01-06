'use client'
import type {
	FormFieldBlock,
	Form as FormType
} from '@payloadcms/plugin-form-builder/types'

import { Check, Send } from 'lucide-react'

import { useRouter } from 'next/navigation'
import React, { useCallback, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import RichText from '@/components/RichText'
import { Button } from '@/components/ui/button'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import { fields } from './fields'
import { getClientSideURL } from '@/utilities/getURL'
import { widthToColSpan } from './widthToColSpan'

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
		form: {
			id: formID,
			confirmationMessage,
			confirmationType,
			redirect,
			submitButtonLabel
		} = {},
		introContent
	} = props

	const formMethods = useForm({
		defaultValues: formFromProps.fields
	})
	const {
		control,
		formState: { errors },
		handleSubmit,
		register
	} = formMethods

	const [isLoading, setIsLoading] = useState(false)
	const [hasSubmitted, setHasSubmitted] = useState<boolean>()
	const [error, setError] = useState<
		{ message: string; status?: string } | undefined
	>()
	const router = useRouter()

	const onSubmit = useCallback(
		(data: FormFieldBlock[]) => {
			const submitForm = async () => {
				setError(undefined)
				setIsLoading(true)

				const dataToSend = Object.entries(data).map(([name, value]) => ({
					field: name,
					value
				}))

				try {
					const req = await fetch(
						`${getClientSideURL()}/api/form-submissions`,
						{
							body: JSON.stringify({
								form: formID,
								submissionData: dataToSend
							}),
							headers: {
								'Content-Type': 'application/json'
							},
							method: 'POST'
						}
					)

					const res = await req.json()

					if (req.status >= 400) {
						setIsLoading(false)

						setError({
							message: res.errors?.[0]?.message || 'Internal Server Error',
							status: res.status
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
						message: 'Something went wrong.'
					})
				}
			}

			void submitForm()
		},
		[router, formID, redirect, confirmationType]
	)

	return (
		<div className="bg-secondary-background border border-white/5 p-8 md:p-10 rounded-3xl backdrop-blur-sm relative overflow-hidden shadow-2xl">
			<div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-[60px] pointer-events-none" />
			{enableIntro && introContent && !hasSubmitted && (
				<RichText
					className="mb-8 lg:mb-12"
					data={introContent}
					enableGutter={false}
				/>
			)}
			<FormProvider {...formMethods}>
				{!isLoading && hasSubmitted && confirmationType === 'message' && (
					<div className="flex items-center justify-center px-6">
						<div className="text-center animate-in zoom-in duration-500">
							<div className="relative w-32 h-32 mx-auto mb-8">
								<div className="absolute inset-0 bg-accent/20 rounded-full animate-ping" />
								<div className="relative flex items-center justify-center w-full h-full bg-accent rounded-full text-white shadow-lg shadow-accent/40">
									<Check className="w-16 h-16" />
								</div>
							</div>
							<h2 className="text-4xl font-display font-bold mb-4">
								Nachricht gesendet!
							</h2>
							<RichText data={confirmationMessage} />
						</div>
					</div>
				)}
				{error && (
					<div>{`${error.status || '500'}: ${error.message || ''}`}</div>
				)}
				{!hasSubmitted && (
					<form id={formID} onSubmit={handleSubmit(onSubmit)}>
						<div className="relative z-10 grid grid-cols-12 gap-6">
							{formFromProps?.fields?.map((field, index) => {
								const Field: React.FC<any> =
									fields?.[field.blockType as keyof typeof fields]

								if (!Field) return null

								const colSpan = widthToColSpan((field as any).width)

								return (
									<div key={(field as any).name ?? index} className={colSpan}>
										<Field
											form={formFromProps}
											{...field}
											{...formMethods}
											control={control}
											errors={errors}
											register={register}
										/>
									</div>
								)
							})}
						</div>

						<div className="mt-6">
							<button
								form={formID}
								type="submit"
								disabled={isLoading}
								className="w-full bg-accent hover:bg-accent-dark text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isLoading ? (
									<div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
								) : (
									<>
										{submitButtonLabel}{' '}
										<Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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

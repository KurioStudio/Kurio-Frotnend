import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { Alert, Box, Button, FormControlLabel, IconButton, Radio, RadioGroup, Snackbar, TextField, Typography } from '@mui/material'
import { IoClose } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import Header from '../../../components/home/Header'
import SidebarMenu from '../../../components/navigation/SidebarMenu'
import '../../../styles/UploadModelPage.css'
import { subirPost, type Post } from '../../../utils/peticiones'
import { useTranslation } from 'react-i18next'

const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) {
        return `${sizeInBytes} B`
    }

    if (sizeInBytes < 1024 * 1024) {
        return `${(sizeInBytes / 1024).toFixed(1)} KB`
    }

    return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`
}

const isAllowedModelFile = (file: unknown): boolean => {
    if (!(file instanceof File)) return false
    const normalizedName = (file.name ?? '').toLowerCase()
    return normalizedName.endsWith('.stl') || normalizedName.endsWith('.3mf')
}

function UploadModelPage() {
    const navigate = useNavigate()
    const { t } = useTranslation()

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [license, setLicense] = useState('')
    const [selectedImages, setSelectedImages] = useState<File[]>([])
    const [modelFile, setModelFile] = useState<File | null>(null)
    const imagesInputRef = useRef<HTMLInputElement | null>(null)
    const modelInputRef = useRef<HTMLInputElement | null>(null)
    const [errors, setErrors] = useState<{ title?: string; description?: string; images?: string; model?: string; license?: string }>({})
    const [feedbackOpen, setFeedbackOpen] = useState(false)
    const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success')
    const [feedbackMessage, setFeedbackMessage] = useState('')
    const feedbackTimerRef = useRef<number | null>(null)

    const imagePreviewUrls = useMemo(
        () => selectedImages.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })),
        [selectedImages]
    )

    useEffect(() => {
        return () => {
            imagePreviewUrls.forEach((preview) => {
                URL.revokeObjectURL(preview.url)
            })
        }
    }, [imagePreviewUrls])

    useEffect(() => {
        return () => {
            if (feedbackTimerRef.current) {
                window.clearTimeout(feedbackTimerRef.current)
            }
        }
    }, [])

    const startFeedbackTimer = (type: 'success' | 'error') => {
        if (feedbackTimerRef.current) {
            window.clearTimeout(feedbackTimerRef.current)
        }

        feedbackTimerRef.current = window.setTimeout(() => {
            setFeedbackOpen(false)
            if (type === 'success') {
                navigate('/')
            }
        }, 10000)
    }

    const closeFeedback = () => {
        if (feedbackTimerRef.current) {
            window.clearTimeout(feedbackTimerRef.current)
        }
        setFeedbackOpen(false)

        if (feedbackType === 'success') {
            navigate('/')
        }
    }

    const handleSelectImages = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files ? Array.from(event.target.files) : []
        setSelectedImages(files)
        event.target.value = ''
    }

    const removeImage = (index: number) => {
        setSelectedImages((prev) => prev.filter((_, i) => i !== index))
    }

    const handleSelectModelFile = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null
        if (file && isAllowedModelFile(file)) {
            setModelFile(file)
            setErrors((prev) => ({ ...prev, model: undefined }))
        } else {
            setModelFile(null)
            setErrors((prev) => ({ ...prev, model: file ? t('upload.errors.selectModel') : prev.model }))
        }
        event.target.value = ''
    }

    const handlePublicarPost = async () => {
        const newErrors: { title?: string; description?: string; images?: string; model?: string; license?: string } = {}

        if (!title.trim()) newErrors.title = t('upload.errors.completeFields')
        if (!description.trim() || description.trim().length < 5) newErrors.description = t('upload.errors.completeFields')
        if (selectedImages.length === 0) newErrors.images = t('upload.errors.selectImages')
        if (!modelFile) newErrors.model = t('upload.errors.selectModel')
        if (modelFile && !isAllowedModelFile(modelFile)) newErrors.model = t('upload.errors.selectModel')
        if (!license) newErrors.license = t('upload.errors.selectLicense')

        setErrors(newErrors)

        if (Object.keys(newErrors).length === 0) {
            const post: Post = {
                id: '',
                titulo: title,
                descripcion: description,
                imagenes: selectedImages,
                cantComentarios: 0,
                user: {
                    id: '',
                    username: '',
                    avatarImg: '',
                    email: ''
                },
                likedBy: [],
                oid: '',
                licencia: license,
                file: modelFile ? modelFile : new File([], ''),
                createdAt: ""
            }

            subirPost(post).then(() => {
                setTitle('')
                setDescription('')
                setLicense('')
                setSelectedImages([])
                setModelFile(null)
                setFeedbackType('success')
                setFeedbackMessage(t('upload.success'))
                setFeedbackOpen(true)
                startFeedbackTimer('success')
            }).catch((error) => {
                console.error('Error al subir la publicación:', error)
                setFeedbackType('error')
                setFeedbackMessage(t('upload.error'))
                setFeedbackOpen(true)
                startFeedbackTimer('error')
            })
        }
    }

    return (
        <Box className="upload-page">
            <SidebarMenu />

            <Box className="upload-page__content">
                <Header />

                <Box className="upload-page__workspace">
                    <Box className="upload-page__form-shell">
                        <Box className="upload-page__form-panel">
                            <Box className="upload-page__section">
                                <Typography className="upload-page__section-label">{t('upload.modelTitle')}*</Typography>
                                <TextField
                                    value={title}
                                    onChange={(event) => setTitle(event.target.value)}
                                    placeholder={t('upload.modelTitle')}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    className="upload-page__text-input"
                                    error={Boolean(errors.title)}
                                    helperText={errors.title}
                                />
                            </Box>

                            <Box className="upload-page__section">
                                <Typography className="upload-page__section-label">{t('upload.modelDescription')}*</Typography>
                                <TextField
                                    value={description}
                                    onChange={(event) => setDescription(event.target.value)}
                                    placeholder={t('upload.modelDescription')}
                                    variant="outlined"
                                    multiline
                                    minRows={3}
                                    fullWidth
                                    className="upload-page__text-input upload-page__text-input--multiline"
                                    error={Boolean(errors.description)}
                                    helperText={errors.description}
                                />
                            </Box>

                            <Box className="upload-page__section">
                                <Typography className="upload-page__section-label">{t('upload.selectImages')}*</Typography>
                                <Box className={`upload-page__dropzone ${selectedImages.length > 0 ? 'upload-page__dropzone--filled' : ''} ${errors.images ? 'upload-page__dropzone--error' : ''}`}>
                                    <input
                                        ref={imagesInputRef}
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="upload-page__hidden-input"
                                        onChange={handleSelectImages}
                                    />
                                    {selectedImages.length === 0 ? (
                                        <Typography className="upload-page__dropzone-title">{t('upload.selectImages')}</Typography>
                                    ) : (
                                        <Box className="upload-page__preview-grid">
                                            {imagePreviewUrls.map((preview, idx) => (
                                                <Box key={`${preview.name}-${preview.url}-${idx}`} className="upload-page__preview-item">
                                                    <Box
                                                        component="img"
                                                        src={preview.url}
                                                        alt={preview.name}
                                                        className="upload-page__preview-image"
                                                    />
                                                    <IconButton className="upload-page__preview-remove" size="small" onClick={() => removeImage(idx)} aria-label={`Eliminar ${preview.name}`} sx={{ color: '#ff4444' }}>
                                                        <IoClose size={22} />
                                                    </IconButton>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                    <Box className="upload-page__dropzone-controls">
                                        <Button
                                            variant="contained"
                                            className="upload-page__action-button"
                                            onClick={() => imagesInputRef.current?.click()}
                                        >
                                            {t('upload.selectImages')}
                                        </Button>
                                    </Box>
                                    {errors.images && <Typography className="upload-page__error-text">{errors.images}</Typography>}
                                </Box>
                            </Box>

                            <Box className="upload-page__section">
                                <Typography className="upload-page__section-label">{t('upload.selectModel')}*</Typography>
                                <Box className={`upload-page__dropzone ${modelFile ? 'upload-page__dropzone--filled' : ''} ${errors.model ? 'upload-page__dropzone--error' : ''}`}>
                                    <input
                                        ref={modelInputRef}
                                        type="file"
                                        accept=".stl,.3mf"
                                        className="upload-page__hidden-input"
                                        onChange={handleSelectModelFile}
                                    />
                                    {modelFile ? (
                                        <Box className="upload-page__model-file-info">
                                            <Typography className="upload-page__model-file-name">{modelFile.name}</Typography>
                                            <Typography className="upload-page__model-file-size">{formatFileSize(modelFile.size)}</Typography>
                                        </Box>
                                    ) : (
                                        <Typography className="upload-page__dropzone-title">{t('upload.selectModel')}</Typography>
                                    )}
                                    <Button
                                        variant="contained"
                                        className="upload-page__action-button"
                                        onClick={() => modelInputRef.current?.click()}
                                    >
                                        {t('upload.selectModel')}
                                    </Button>
                                </Box>
                                {errors.model && <Typography className="upload-page__error-text">{errors.model}</Typography>}
                            </Box>

                            <Box className="upload-page__section upload-page__section--license">
                                <Typography className="upload-page__section-label">{t('upload.selectLicense')}*</Typography>
                                <Box className="upload-page__license-list">
                                    <RadioGroup
                                        value={license}
                                        onChange={(event) => setLicense(event.target.value)}
                                        name="upload-license"
                                    >
                                        <FormControlLabel
                                            value="sdfl"
                                            control={<Radio />}
                                            label={t('upload.license.sdfl')}
                                        />
                                        <FormControlLabel
                                            value="personal"
                                            control={<Radio />}
                                            label={t('upload.license.personal')}
                                        />
                                    </RadioGroup>
                                    {errors.license && <Typography className="upload-page__error-text">{errors.license}</Typography>}
                                </Box>
                            </Box>

                            <Box className="upload-page__footer">
                                <Button
                                    variant="contained"
                                    className="upload-page__publish-button"
                                    onClick={() => handlePublicarPost()}
                                >
                                    {t('upload.submit')}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Snackbar
                open={feedbackOpen}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                onClose={(_, reason) => {
                    if (reason === 'clickaway') {
                        return
                    }
                    closeFeedback()
                }}
            >
                <Alert
                    icon={false}
                    severity={feedbackType === 'success' ? 'success' : 'error'}
                    variant="filled"
                    className={`upload-page__feedback-toast upload-page__feedback-toast--${feedbackType}`}
                    action={
                        <IconButton
                            size="small"
                            className="upload-page__feedback-close"
                            aria-label="Cerrar mensaje"
                            onClick={closeFeedback}
                        >
                            <IoClose />
                        </IconButton>
                    }
                >
                    <Typography className="upload-page__feedback-title">
                        {feedbackType === 'success' ? t('upload.success') : t('upload.error')}
                    </Typography>
                    <Typography className="upload-page__feedback-text">{feedbackMessage}</Typography>
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default UploadModelPage
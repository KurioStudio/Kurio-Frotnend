import { useState } from 'react'
import { Box, Button, ButtonBase, IconButton, InputBase, Typography, Stack, Paper } from '@mui/material'
import {
	IoChevronBackOutline,
	IoChevronForwardOutline,
	IoCubeOutline,
	IoDownloadOutline,
	IoSendOutline,
	IoThumbsUpOutline,
	IoChatbubblesOutline,
	IoShareSocialOutline,
	IoBookmarkOutline,
} from 'react-icons/io5'
import { FaRegCircleUser } from 'react-icons/fa6'
import Header from '../../../components/home/Header'
import SidebarMenu from '../../../components/navigation/SidebarMenu'
import type { comentarios } from '../services/detailService'

const [comentarios, setComentarios] = useState<comentarios[]>([])

type ModelComment = {
	id: string
	author: string
	text: string
}

const galleryImages = [
	'https://images.unsplash.com/photo-1618005198919-d3d4b5a92eee?auto=format&fit=crop&w=1200&q=80',
	'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
	'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=1200&q=80',
]

const comments: ModelComment[] = [
	{
		id: '1',
		author: 'Pablo Ruiz',
		text: 'Muy buen modelo, la malla está limpia y se imprime sin soportes en PLA.',
	},
	{
		id: '2',
		author: 'Laura Mena',
		text: 'Probado en 0.2 mm y quedó genial. Una versión más pequeña sería ideal.',
	},
]

function ModelDetail() {
	const [imageIndex, setImageIndex] = useState(0)
	const [commentValue, setCommentValue] = useState('')

	const currentImage = galleryImages[imageIndex]

	return (
		<Box sx={{
			minHeight: '100vh',
			background: 'radial-gradient(circle at 88% 8%, rgba(215, 164, 73, 0.14), transparent 34%), radial-gradient(circle at 12% 92%, rgba(32, 58, 97, 0.48), transparent 38%), var(--kurio-bg)',
			marginLeft: 'var(--kurio-sidebar-width)',
			padding: 'calc(var(--kurio-header-height) + 30px) 16px 24px'
		}}>
			<SidebarMenu />
			<Header />

			<Stack spacing={2} sx={{ width: '100%', minHeight: 'calc(100vh - var(--kurio-header-height) - 56px)' }}>

				<Box sx={{
					display: 'grid',
					gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.4fr) minmax(320px, 0.95fr)' },
					alignItems: 'start',
					gap: 2
				}}>

					<Paper elevation={0} sx={{
						flex: '1.4',
						p: 1.5,
						display: 'grid',
						gap: 1.5,
						background: 'rgba(18, 24, 35, 0.62)',
						border: '1px solid var(--kurio-border)',
						borderRadius: '14px',
						boxShadow: '0 18px 32px rgba(0, 0, 0, 0.18)'
					}}>

						<Box sx={{
							position: 'relative',
							width: '100%',
							aspectRatio: '16 / 10',
							borderRadius: '10px',
							overflow: 'hidden',
							background: 'rgba(255, 255, 255, 0.06)'
						}}>
							<Box component="img" src={currentImage} alt="Modelo 3D" sx={{
								width: '100%',
								height: '100%',
								objectFit: 'cover',
								display: 'block'
							}} />

							<Button sx={{
								position: 'absolute',
								left: 16,
								bottom: 16,
								borderRadius: '8px',
								background: 'var(--kurio-accent)',
								color: '#fff',
								textTransform: 'none',
								fontWeight: 700,
								'&:hover': { background: 'var(--kurio-accent-hover)' }
							}} startIcon={<IoCubeOutline />}>
								Vista previa en 3D
							</Button>
						</Box>


						<Box sx={{
							position: 'relative',
							display: 'grid',
							gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
							gap: 1.25
						}} role="list" aria-label="Miniaturas del modelo">
							<IconButton onClick={() => setImageIndex((prevIndex) => (prevIndex - 1 + galleryImages.length) % galleryImages.length)} sx={{
								position: 'absolute',
								left: 8,
								top: '50%',
								transform: 'translateY(-50%)',
								width: 38,
								height: 38,
								zIndex: 2,
								borderRadius: '999px',
								background: 'rgba(10, 14, 22, 0.68)',
								border: '1px solid rgba(255, 255, 255, 0.2)',
								color: '#fff',
								'& svg': { color: '#fff' },
								'&:hover': { background: 'rgba(15, 23, 35, 0.86)' }
							}} aria-label="Imagen anterior">
								<IoChevronBackOutline />
							</IconButton>

							{galleryImages.map((image, idx) => (
								<ButtonBase key={`${image}-${idx}`} onClick={() => setImageIndex(idx)} sx={{
									width: '100%',
									borderRadius: '8px',
									overflow: 'hidden',
									border: imageIndex === idx ? '2px solid #15c21a' : '2px solid transparent',
									opacity: imageIndex === idx ? 1 : 0.88,
									transition: 'border-color 150ms ease, opacity 150ms ease, transform 150ms ease',
									'&:hover': { opacity: 1, transform: 'translateY(-1px)' }
								}}>
									<Box component="img" src={image} alt={`Miniatura ${idx + 1}`} sx={{
										width: '100%',
										aspectRatio: '4 / 3',
										objectFit: 'cover',
										display: 'block'
									}} />
								</ButtonBase>
							))}

							<IconButton onClick={() => setImageIndex((prevIndex) => (prevIndex + 1) % galleryImages.length)} sx={{
								position: 'absolute',
								right: 8,
								top: '50%',
								transform: 'translateY(-50%)',
								width: 38,
								height: 38,
								zIndex: 2,
								borderRadius: '999px',
								background: 'rgba(10, 14, 22, 0.68)',
								border: '1px solid rgba(255, 255, 255, 0.2)',
								color: '#fff',
								'& svg': { color: '#fff' },
								'&:hover': { background: 'rgba(15, 23, 35, 0.86)' }
							}} aria-label="Imagen siguiente">
								<IoChevronForwardOutline />
							</IconButton>
						</Box>


						<Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 1.5 }}>
							<Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1, color: 'var(--kurio-text-soft)' }}>
								<FaRegCircleUser style={{ fontSize: '1.8rem' }} />
								<Typography sx={{ fontSize: '0.95rem' }}>Usuario Kurio</Typography>
								<Button sx={{
									minWidth: 92,
									height: 32,
									marginLeft: 0.75,
									borderRadius: '999px',
									border: '1px solid var(--kurio-accent)',
									color: 'var(--kurio-accent)',
									textTransform: 'none',
									fontWeight: 700,
									background: 'rgba(215, 164, 73, 0.08)',
									'&:hover': { color: '#fff', background: 'var(--kurio-accent)' }
								}}>Seguir</Button>
							</Box>

							<Box sx={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: 0.75,
								padding: '8px 14px',
								borderRadius: '999px',
								color: '#fff',
								background: 'linear-gradient(135deg, rgba(215, 164, 73, 0.92), rgba(160, 119, 45, 0.92))'
							}}>
								<IoThumbsUpOutline />
								<Typography>12345</Typography>
							</Box>
						</Box>
					</Paper>


					<Paper elevation={0} sx={{
						flex: '0.95',
						minWidth: 320,
						p: 2.75,
						display: 'grid',
						alignContent: 'start',
						height: 'fit-content',
						gap: 2,
						background: 'rgba(18, 24, 35, 0.62)',
						border: '1px solid var(--kurio-border)',
						borderRadius: '14px',
						boxShadow: '0 18px 32px rgba(0, 0, 0, 0.18)'
					}}>
						<Typography sx={{ color: 'var(--kurio-text-muted)', fontSize: '0.84rem', letterSpacing: '0.04em', justifySelf: 'end', textAlign: 'right' }}>
							Fecha publicación:
						</Typography>
						<Typography sx={{ color: 'var(--kurio-text)', fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>
							Titulo
						</Typography>
						<Typography sx={{ color: 'var(--kurio-text-soft)', lineHeight: 1.45 }}>
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris non lorem pharetra, feugiat dolor sed, sodales dui. Fusce fermentum et nisl nec consequat. Ut a ligula viverra, euismod metus nec, dapibus elit.
						</Typography>

						<Button sx={{
							minWidth: 190,
							marginTop: 0.5,
							justifySelf: 'center',
							borderRadius: '8px',
							padding: '10px 26px',
							color: '#fff',
							textTransform: 'none',
							fontWeight: 700,
							background: 'linear-gradient(135deg, rgba(215, 164, 73, 0.96), rgba(176, 126, 42, 0.96))',
							'&:hover': { background: 'linear-gradient(135deg, rgba(226, 173, 79, 1), rgba(191, 137, 50, 1))' }
						}} startIcon={<IoDownloadOutline />}>
							Descargar
						</Button>


						<Box sx={{
							display: 'grid',
							gridTemplateColumns: 'repeat(4, 1fr)',
							gap: 1,
							padding: '12px 0',
							borderTop: '1px solid rgba(255, 255, 255, 0.06)',
							borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
							marginTop: 1
						}}>
							{[{ icon: IoThumbsUpOutline, label: 'Me gusta', num: '610' }, { icon: IoBookmarkOutline, label: 'Guardar', num: '1371' }, { icon: IoChatbubblesOutline, label: 'Comentarios', num: '28' }, { icon: IoShareSocialOutline, label: 'Compartir', num: undefined }].map((stat) => (
								<IconButton key={stat.label} sx={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									gap: 0.75,
									height: 36,
									borderRadius: '6px',
									color: 'var(--kurio-text-soft)',
									background: 'transparent',
									border: '1px solid rgba(255, 255, 255, 0.08)',
									padding: '0 8px',
									'&:hover': { background: 'rgba(215, 164, 73, 0.15)', color: 'var(--kurio-accent)', borderColor: 'var(--kurio-accent)' }
								}} aria-label={stat.label}>
									<stat.icon />
									{stat.num && <Typography component="span" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{stat.num}</Typography>}
								</IconButton>
							))}
						</Box>
					</Paper>
				</Box>


				<Paper elevation={0} sx={{
					p: 1.5,
					display: 'grid',
					gap: 1.75,
					background: 'rgba(18, 24, 35, 0.62)',
					border: '1px solid var(--kurio-border)',
					borderRadius: '14px',
					boxShadow: '0 18px 32px rgba(0, 0, 0, 0.18)'
				}}>
					<Box sx={{
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						gap: 1.25,
						background: 'rgba(255, 255, 255, 0.04)',
						border: '1px solid rgba(255, 255, 255, 0.08)',
						borderRadius: '12px',
						padding: '8px 10px'
					}}>
						<FaRegCircleUser style={{ color: 'var(--kurio-text-soft)', fontSize: '1.5rem' }} />
						<InputBase value={commentValue} onChange={(event) => setCommentValue(event.target.value)} placeholder="Anade un comentario" sx={{
							color: 'var(--kurio-text)',
							flex: 1,
							'& input::placeholder': { color: 'var(--kurio-text-muted)', opacity: 1 }
						}} />
						<Button sx={{
							borderRadius: '999px',
							textTransform: 'none',
							fontWeight: 700,
							color: '#fff',
							background: 'var(--kurio-accent)',
							'&:hover': { background: 'var(--kurio-accent-hover)' }
						}} endIcon={<IoSendOutline />}>
							Enviar
						</Button>
					</Box>

					<Box sx={{ display: 'grid', gap: 1.5 }}>
						{comments.map((item) => (
							<Box key={item.id} sx={{
								display: 'flex',
								flexDirection: 'row',
								gap: 1.25,
								padding: 1.25,
								borderRadius: '10px',
								background: 'rgba(255, 255, 255, 0.03)'
							}}>
								<FaRegCircleUser style={{ color: 'var(--kurio-text-soft)', fontSize: '1.5rem' }} />
								<Box sx={{ display: 'grid', gap: 0.5 }}>
									<Typography sx={{ color: 'var(--kurio-text)', fontSize: '0.9rem', fontWeight: 700 }}>{item.author}</Typography>
									<Typography sx={{ color: 'var(--kurio-text-soft)', lineHeight: 1.4 }}>{item.text}</Typography>
								</Box>
							</Box>
						))}
					</Box>
				</Paper>
			</Stack>
		</Box>
	)
}

export default ModelDetail

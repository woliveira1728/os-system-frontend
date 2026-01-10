'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Container, Typography, Card, CardContent, Stack, TextField, Button, CircularProgress, Checkbox, IconButton,
  Dialog, DialogContent, DialogTitle, DialogActions, ButtonBase,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrdersContext';
import { Order, ChecklistItem, Photo } from '@/types/interfaces';
import { checklistCreateSchema, type ChecklistCreateForm } from '@/schemas/checklist.schema';
import { orderCreateSchema, type OrderCreateForm } from '@/schemas/order.schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Navbar from '@/components/Navbar';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { getOrder, fetchChecklist, addChecklistItem, toggleChecklistItem, deleteChecklistItem } = useOrders();

  const [order, setOrder] = useState<Order | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [photoPreview, setPhotoPreview] = useState<{ src: string; title?: string } | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { handleSubmit, register, formState: { errors }, reset } = useForm<ChecklistCreateForm>({
    resolver: zodResolver(checklistCreateSchema),
  });

  const { handleSubmit: handleEditSubmit, register: registerEdit, formState: { errors: editErrors, isSubmitting }, reset: resetEdit, setValue } = useForm<OrderCreateForm>({
    resolver: zodResolver(orderCreateSchema),
  });

  const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL as string).replace('/api', '');
  const resolvePhotoSrc = (p: Photo) => {
    if (p?.url) return p.url.startsWith('http') ? p.url : `${API_ORIGIN}${p.url}`;
    if (p?.path) return p.path.startsWith('http') ? p.path : `${API_ORIGIN}${p.path}`;
    if (p?.filename) return `${API_ORIGIN}/uploads/${p.filename}`;
    return '';
  };

  // Ordenação estável: primeiro por "order", depois por "createdAt"
  const sortChecklist = useMemo(
    () => (items: any[]) =>
      [...(items || [])].sort((a, b) => {
        const ao = Number(a.order ?? 0);
        const bo = Number(b.order ?? 0);
        if (ao !== bo) return ao - bo;
        const ac = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bc = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return ac - bc;
      }),
    []
  );

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const o = await getOrder(id);
        setOrder(o);

        try {
          const c = await fetchChecklist(id);
          setChecklist(sortChecklist(c || []));
        } catch (err) {
          console.warn('Erro ao carregar checklist:', err);
          setChecklist([]);
        }
      } catch (error) {
        console.error('Erro ao carregar a ordem:', error);
        toast.error('Erro ao carregar a ordem');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user && id) {
      load();
    } else if (!authLoading && !user) {
      router.push('/');
    }
  }, [id, user, authLoading, router, getOrder, fetchChecklist, sortChecklist]);

  const onAddChecklist = async (data: ChecklistCreateForm) => {
    if (!id) return;
    try {
      await addChecklistItem(id, data.title);
      const c = await fetchChecklist(id);
      setChecklist(sortChecklist(c || []));
      reset();
      toast.success('Item adicionado!');
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      toast.error('Erro ao adicionar item');
    }
  };

  const onToggle = async (itemId: string) => {
    if (!id) return;
    try {
      await toggleChecklistItem(itemId);
      const c = await fetchChecklist(id);
      setChecklist(sortChecklist(c || []));
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      toast.error('Erro ao atualizar item');
    }
  };

  const onDelete = async (itemId: string) => {
    if (!id) return;
    try {
      await deleteChecklistItem(itemId);
      const c = await fetchChecklist(id);
      setChecklist(sortChecklist(c || []));
      toast.success('Item removido!');
    } catch (error) {
      console.error('Erro ao deletar item:', error);
      toast.error('Erro ao deletar item');
    }
  };

  const uploadPhotoFile = async (file: File) => {
    if (!file || !id) return;
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('orderId', id);
      await api.post(`/photos/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Foto enviada com sucesso!');
      const updated = await getOrder(id);
      setOrder(updated);
    } catch (error) {
      console.error('Erro ao enviar foto:', error);
      toast.error('Erro ao enviar foto');
    }
  };

  const onUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadPhotoFile(file);
  };

  const openCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error('Câmera não suportada neste dispositivo');
      return;
    }
    setCameraOpen(true);
    try {
      setCameraLoading(true);
      // Tenta usar a câmera traseira
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
      setCameraStream(stream);
    } catch (err) {
      console.error('Erro ao acessar câmera:', err);
      toast.error('Não foi possível acessar a câmera');
      setCameraOpen(false);
    } finally {
      setCameraLoading(false);
    }
  };

  const closeCamera = () => {
    cameraStream?.getTracks().forEach((t) => t.stop());
    setCameraStream(null);
    setCameraOpen(false);
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `foto_${Date.now()}.jpg`, { type: 'image/jpeg' });
      await uploadPhotoFile(file);
      closeCamera();
    }, 'image/jpeg', 0.92);
  };

  // Quando a câmera abre e o stream está pronto, vincula ao vídeo
  useEffect(() => {
    const video = videoRef.current;
    if (cameraOpen && cameraStream && video) {
      video.srcObject = cameraStream;
      const play = () => {
        video.play().catch((e) => console.warn('Não conseguiu iniciar vídeo:', e));
      };
      if (video.readyState >= 2) {
        play();
      } else {
        const handler = () => {
          play();
          video.removeEventListener('loadedmetadata', handler);
        };
        video.addEventListener('loadedmetadata', handler);
      }
    }
  }, [cameraOpen, cameraStream]);

  const openPhoto = (p: Photo) => {
    const src = resolvePhotoSrc(p);
    if (!src) return;
    setPhotoPreview({ src, title: p.description || p.filename || 'Foto' });
  };

  const closePhoto = () => setPhotoPreview(null);

  const onDeletePhoto = async (photoId: string) => {
    if (!photoId || !id) return;
    try {
      await api.delete(`/photos/${photoId}`);
      toast.success('Foto removida!');
      const updated = await getOrder(id);
      setOrder(updated);
    } catch (error) {
      console.error('Erro ao deletar foto:', error);
      toast.error('Erro ao deletar foto');
    }
  };

  const openEditDialog = () => {
    if (order) {
      setValue('title', order.title);
      setValue('description', order.description);
      setEditDialogOpen(true);
    }
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    resetEdit();
  };

  const onEditOrder = async (data: OrderCreateForm) => {
    if (!id) return;
    try {
      await api.put(`/orders/${id}`, data);
      toast.success('Ordem atualizada com sucesso!');
      const updated = await getOrder(id);
      setOrder(updated);
      closeEditDialog();
    } catch (error) {
      console.error('Erro ao atualizar ordem:', error);
      toast.error('Erro ao atualizar ordem');
    }
  };

  const openDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const onDeleteOrder = async () => {
    if (!id) return;
    try {
      await api.delete(`/orders/${id}`);
      toast.success('Ordem excluída com sucesso!');
      router.push('/orders');
    } catch (error) {
      console.error('Erro ao deletar ordem:', error);
      toast.error('Erro ao deletar ordem');
      closeDeleteDialog();
    }
  };

  if (authLoading || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Navbar />
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Typography color="error">Ordem não encontrada.</Typography>
          <Button variant="contained" onClick={() => router.push('/orders')} sx={{ mt: 2 }}>
            ← Voltar para Ordens
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button onClick={() => router.push('/orders')} sx={{ mb: 2 }}>← Voltar</Button>
        
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" gutterBottom>{order.title}</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              OS #{order.id} - Status: {order.status}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <IconButton color="primary" onClick={openEditDialog} aria-label="Editar ordem">
              <EditIcon />
            </IconButton>
            <IconButton color="error" onClick={openDeleteDialog} aria-label="Deletar ordem">
              <DeleteIcon />
            </IconButton>
          </Stack>
        </Stack>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>Descrição</Typography>
            <Typography variant="body1">{order.description}</Typography>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>Checklist</Typography>
            <Stack spacing={1} sx={{ mb: 2 }}>
              {checklist.length === 0 ? (
                <Typography variant="body2" color="text.secondary">Nenhum item no checklist.</Typography>
              ) : (
                checklist.map((item) => (
                  <Stack key={item.id} direction="row" alignItems="center" spacing={1}>
                    <Checkbox 
                      checked={item.completed || false} 
                      onChange={() => onToggle(item.id)} 
                    />
                    <Typography 
                      flex={1} 
                      sx={{ textDecoration: item.completed ? 'line-through' : 'none' }}
                    >
                      {item.title}
                    </Typography>
                    <IconButton onClick={() => onDelete(item.id)} size="small">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))
              )}
            </Stack>
            <form onSubmit={handleSubmit(onAddChecklist)}>
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  label="Novo item"
                  fullWidth
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  {...register('title')}
                />
                <Button type="submit" variant="contained">Adicionar</Button>
              </Stack>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>Fotos</Typography>

            {order?.photos?.length ? (
              <Stack direction="row" flexWrap="wrap" gap={2}>
                {order.photos.map((p: any) => {
                  const src = resolvePhotoSrc(p);
                  if (!src) return null;
                  return (
                    <Box key={p.id || src} sx={{ position: 'relative' }}>
                      <ButtonBase
                        onClick={() => openPhoto(p)}
                        sx={{ borderRadius: 1, overflow: 'hidden' }}
                        aria-label={p.description || p.filename || 'Abrir foto'}
                      >
                        <Box sx={{ width: 160, height: 120, position: 'relative', borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                          <Image
                            src={src}
                            alt={p.description || p.filename || 'Foto'}
                            fill
                            sizes="160px"
                            style={{ objectFit: 'cover', cursor: 'pointer' }}
                            unoptimized
                          />
                        </Box>
                      </ButtonBase>
                      {p.id && (
                        <IconButton
                          size="small"
                          aria-label="Excluir foto"
                          onClick={(e) => { e.stopPropagation(); onDeletePhoto(p.id); }}
                          sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'background.paper' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  );
                })}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Nenhuma foto enviada.
              </Typography>
            )}

            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button variant="outlined" component="label">
                Escolher foto
                <input hidden accept="image/*" type="file" onChange={onUploadPhoto} />
              </Button>
              <Button variant="contained" onClick={openCamera} disabled={cameraLoading}>
                {cameraLoading ? 'Abrindo câmera...' : 'Tirar foto'}
              </Button>
            </Stack>
            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
              Formatos: JPG, PNG
            </Typography>
          </CardContent>
        </Card>
      </Container>

      {/* Modal de preview de foto */}
      <Dialog open={!!photoPreview} onClose={closePhoto} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {photoPreview?.title || 'Foto'}
          <IconButton aria-label="Fechar" onClick={closePhoto} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ position: 'relative', width: '100%', height: { xs: 320, sm: 520 }, bgcolor: 'black', borderRadius: 1 }}>
            {photoPreview?.src && (
              <Image
                src={photoPreview.src}
                alt={photoPreview?.title || 'Foto'}
                fill
                sizes="100vw"
                style={{ objectFit: 'contain' }}
                unoptimized
              />
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Modal de captura de foto pela câmera */}
      <Dialog open={cameraOpen} onClose={closeCamera} maxWidth="sm" fullWidth>
        <DialogTitle>Capturar foto</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ position: 'relative', width: '100%', height: { xs: 320, sm: 420 }, bgcolor: 'black', borderRadius: 1 }}>
            <video ref={videoRef} style={{ width: '100%', height: '100%' }} playsInline autoPlay />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCamera}>Cancelar</Button>
          <Button variant="contained" onClick={capturePhoto}>Capturar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de edição de ordem */}
      <Dialog open={editDialogOpen} onClose={closeEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Ordem de Serviço</DialogTitle>
        <form onSubmit={handleEditSubmit(onEditOrder)}>
          <DialogContent dividers>
            <Stack spacing={2}>
              <TextField
                label="Título"
                fullWidth
                {...registerEdit('title')}
                error={!!editErrors.title}
                helperText={editErrors.title?.message}
              />
              <TextField
                label="Descrição"
                fullWidth
                multiline
                rows={4}
                {...registerEdit('description')}
                error={!!editErrors.description}
                helperText={editErrors.description?.message}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeEditDialog}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir esta ordem de serviço? Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancelar</Button>
          <Button onClick={onDeleteOrder} variant="contained" color="error">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
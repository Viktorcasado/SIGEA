import React, { useState, useRef, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../services/supabaseClient';
import Icon from '../components/Icon';
import { Event } from '../types';

interface CreateEventScreenProps {
  onBack: () => void;
  eventToEdit?: Event | null;
}

const eventCategories = ['Palestra', 'Workshop', 'Congresso', 'Outro'] as const;
type EventCategory = typeof eventCategories[number];

const CreateEventScreen: React.FC<CreateEventScreenProps> = ({ onBack, eventToEdit }) => {
    const { user } = useUser();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isEditing = !!eventToEdit;

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('Marechal Deodoro (IFAL)');
    const [date, setDate] = useState('');
    const [category, setCategory] = useState<EventCategory>('Congresso');
    const [workload, setWorkload] = useState(4);
    
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

     const campuses = [
        "Arapiraca (IFAL)",
        "Arapiraca (UFAL)",
        "Batalha (IFAL)",
        "Coruripe (IFAL)",
        "Delmiro Gouveia (UFAL)",
        "Maceió (IFAL)",
        "Maceió - A.C. Simões (UFAL)",
        "Maragogi (IFAL)",
        "Marechal Deodoro (IFAL)",
        "Murici (IFAL)",
        "Palmeira dos Índios (IFAL)",
        "Penedo (IFAL)",
        "Piranhas (IFAL)",
        "Rio Largo (IFAL)",
        "Santana do Ipanema (IFAL)",
        "São Miguel dos Campos (IFAL)",
        "Satuba (IFAL)",
        "Viçosa (IFAL)"
    ].sort((a, b) => a.localeCompare(b));

    useEffect(() => {
        if (isEditing && eventToEdit) {
            setTitle(eventToEdit.title);
            setDescription(eventToEdit.description || '');
            setLocation(eventToEdit.location);
            setCategory(eventToEdit.category as EventCategory);
            setWorkload(eventToEdit.hours || 4);
            setPreviewUrl(eventToEdit.imageUrl);
            
            // Format date for datetime-local input
            try {
                const eventDate = new Date(eventToEdit.date);
                if (!isNaN(eventDate.getTime())) {
                    const year = eventDate.getFullYear();
                    const month = (eventDate.getMonth() + 1).toString().padStart(2, '0');
                    const day = eventDate.getDate().toString().padStart(2, '0');
                    const hours = eventDate.getHours().toString().padStart(2, '0');
                    const minutes = eventDate.getMinutes().toString().padStart(2, '0');
                    setDate(`${year}-${month}-${day}T${hours}:${minutes}`);
                }
            } catch (e) {
                console.error("Failed to parse date for editing:", e);
            }
        }
         return () => {
          if (previewUrl && !previewUrl.startsWith('http')) {
            URL.revokeObjectURL(previewUrl);
          }
        };
    }, [eventToEdit, isEditing]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setSelectedFile(file);
             if (previewUrl && !previewUrl.startsWith('http')) {
                URL.revokeObjectURL(previewUrl);
             }
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        if (!user) { setError("Usuário não autenticado."); return; }
        if (!title || !date) { setError("Título e Data são campos obrigatórios."); return; }
        
        setIsSaving(true);
        setError(null);
        
        try {
            let eventId = isEditing ? eventToEdit.id : null;
            let imageUrl = isEditing ? eventToEdit.imageUrl : null;
            
            const eventData = {
                organizer_id: user.id,
                title, description, location, date, category, workload,
            };

            // Step 1: Create or update event record (without image initially for new events)
            if (!isEditing) {
                const { data: newEvent, error: insertError } = await supabase
                    .from('events')
                    .insert({ ...eventData, image_url: null })
                    .select('id')
                    .single();
                if (insertError) throw insertError;
                eventId = newEvent.id;
            } else {
                // For editing, we can update text fields first.
                const { error: updateError } = await supabase.from('events').update(eventData).match({ id: eventId });
                if (updateError) throw updateError;
            }

            // Step 2: Upload image if selected (now that we have an eventId)
            if (selectedFile && eventId) {
                setIsUploading(true);
                const fileExt = selectedFile.name.split('.').pop();
                const filePath = `event_banner_${eventId}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('event-banners')
                    .upload(filePath, selectedFile, { upsert: true });

                setIsUploading(false);
                if (uploadError) throw uploadError;
                
                const { data: urlData } = supabase.storage.from('event-banners').getPublicUrl(filePath);
                const cleanUrl = urlData.publicUrl.split('?')[0];
                imageUrl = `${cleanUrl}?t=${Date.now()}`;

                // Step 3: Update event with the new image URL
                const { error: imageUpdateError } = await supabase
                    .from('events')
                    .update({ image_url: imageUrl })
                    .match({ id: eventId });
                if (imageUpdateError) throw imageUpdateError;
            }

            if (navigator.vibrate) navigator.vibrate(50);
            onBack();
        } catch (err: any) {
            setError(`Falha ao salvar evento: ${err.message}`);
        } finally {
            setIsSaving(false);
            setIsUploading(false);
        }
    };
    
    const workloadPresets = [4, 8, 20, 40];

    return (
        <div className="h-screen flex flex-col bg-[#F2F2F7] dark:bg-black">
            <PageHeader title={isEditing ? "Editar Evento" : "Criar Novo Evento"} onBack={onBack} />
            <main className="flex-grow p-6 space-y-4 overflow-y-auto">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Banner do Evento</label>
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/png, image/jpeg" />
                    <div className="relative w-full h-48 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview do banner" className="w-full h-full object-cover" />
                        ) : (
                             <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                                <Icon name="camera" className="w-8 h-8" />
                                <span className="mt-1 text-sm font-semibold">Selecionar Banner</span>
                            </button>
                        )}
                        {(isSaving && isUploading) && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
                            </div>
                        )}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título do Evento</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-300 dark:border-gray-700" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-300 dark:border-gray-700" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
                    <div className="flex w-full bg-gray-200 dark:bg-gray-700/50 rounded-xl p-1 space-x-1">
                        {eventCategories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${category === cat ? 'bg-white dark:bg-gray-900 text-ifal-green shadow' : 'text-gray-600 dark:text-gray-400'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Localização (Campus)</label>
                     <select 
                        value={location} 
                        onChange={e => setLocation(e.target.value)} 
                        className="w-full bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-300 dark:border-gray-700 appearance-none"
                    >
                        {campuses.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data e Hora</label>
                    <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-300 dark:border-gray-700" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Carga Horária</label>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-300 dark:border-gray-700 space-y-4">
                        <div className="flex items-center justify-between">
                            <button 
                                onClick={() => setWorkload(prev => Math.max(1, prev - 1))}
                                className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600 dark:text-gray-300 active:scale-90 transition-transform"
                            >
                                −
                            </button>
                            <div className="text-center">
                                <span className="text-4xl font-bold text-gray-900 dark:text-white">{workload}</span>
                                <span className="text-lg text-gray-500 dark:text-gray-400"> hora{workload > 1 ? 's' : ''}</span>
                            </div>
                             <button 
                                onClick={() => setWorkload(prev => prev + 1)}
                                className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600 dark:text-gray-300 active:scale-90 transition-transform"
                            >
                                +
                            </button>
                        </div>
                        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-200 dark:border-gray-700/50">
                            {workloadPresets.map(preset => (
                                <button 
                                    key={preset}
                                    onClick={() => setWorkload(preset)}
                                    className={`py-2 rounded-lg text-sm font-semibold transition-colors ${workload === preset ? 'bg-ifal-green text-white' : 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300'}`}
                                >
                                    {preset}h
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm">
                        {error}
                    </div>
                )}
            </main>
            <footer className="p-4 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-t border-black/5 dark:border-white/5">
                 <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-ifal-green text-white font-semibold py-3 rounded-xl flex items-center justify-center disabled:opacity-50"
                >
                     {isSaving ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (isEditing ? 'Salvar Alterações' : 'Salvar Evento')}
                </button>
            </footer>
        </div>
    );
};

export default CreateEventScreen;
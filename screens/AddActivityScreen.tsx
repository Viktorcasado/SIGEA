import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { supabase } from '../services/supabaseClient';
import ToggleSwitch from '../components/ToggleSwitch';
import { Activity } from '../types';

interface AddActivityScreenProps {
  onBack: () => void;
  eventId: number;
  activityToEdit?: Activity | null;
}

const activityTypes = ['Palestra', 'Minicurso', 'Workshop', 'Mesa Redonda', 'Outro'] as const;
type ActivityType = typeof activityTypes[number];

const campusLocations = ["Auditório", "Biblioteca", "Ginásio", "Lab. de Informática 1", "Lab. de Informática 2", "Lab. de Redes", "Sala de Videoconferência", "Pátio Central"];

// Helper para formatar a data para o input datetime-local
const formatDateTimeForInput = (date: Date): string => {
    try {
        if (isNaN(date.getTime())) return '';
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
        return '';
    }
};

const AddActivityScreen: React.FC<AddActivityScreenProps> = ({ onBack, eventId, activityToEdit }) => {
    const isEditing = !!activityToEdit;

    const [title, setTitle] = useState('');
    const [type, setType] = useState<ActivityType>('Palestra');
    const [hours, setHours] = useState(1);
    const [location, setLocation] = useState(campusLocations[0]);
    const [generatesCertificate, setGeneratesCertificate] = useState(true);
    
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (isEditing && activityToEdit) {
            setTitle(activityToEdit.title);
            setType(activityToEdit.type);
            setHours(activityToEdit.hours);
            setLocation(activityToEdit.location);
            setGeneratesCertificate(activityToEdit.generates_certificate);
            setStartTime(formatDateTimeForInput(new Date(activityToEdit.start_time)));
            setEndTime(formatDateTimeForInput(new Date(activityToEdit.end_time)));
        }
    }, [activityToEdit, isEditing]);

    const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStartTimeValue = e.target.value;
        setStartTime(newStartTimeValue);

        if (newStartTimeValue && !isEditing) { // Auto-set end time only when creating
            try {
                const startDate = new Date(newStartTimeValue);
                if (!isNaN(startDate.getTime())) {
                    const defaultEndDate = new Date(startDate.getTime() + 60 * 60 * 1000);
                    setEndTime(formatDateTimeForInput(defaultEndDate));
                }
            } catch {
                setEndTime('');
            }
        } else if (!newStartTimeValue) {
             setEndTime('');
        }
    };

    const handleSave = async () => {
        setError(null);
        if (!title.trim() || !startTime || !endTime) {
            setError('Título, horário de início e fim são obrigatórios.');
            return;
        }
        if (new Date(startTime) >= new Date(endTime)) {
            setError('O horário de fim deve ser posterior ao de início.');
            return;
        }

        setIsSaving(true);

        const activityData = {
            event_id: eventId,
            title: title.trim(),
            type,
            hours,
            location: location.trim(),
            start_time: new Date(startTime).toISOString(),
            end_time: new Date(endTime).toISOString(),
            date: new Date(startTime).toISOString().split('T')[0], // Envia apenas YYYY-MM-DD
            generates_certificate: generatesCertificate,
        };

        try {
            if (isEditing) {
                const { error: updateError } = await supabase.from('activities').update(activityData).match({ id: activityToEdit.id });
                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await supabase.from('activities').insert(activityData);
                if (insertError) throw insertError;
            }

            if (navigator.vibrate) navigator.vibrate(50);
            
            setShowSuccess(true);
            setTimeout(() => {
                onBack();
            }, 1500);

        } catch (err: any) {
            setError(`Falha ao salvar atividade: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };
    
    const hourOptions = Array.from({ length: 20 }, (_, i) => i + 1);
    const successMessage = isEditing ? 'Atividade atualizada!' : 'Atividade adicionada!';

    return (
        <div className="h-screen flex flex-col bg-[#F2F2F7] dark:bg-black">
            <PageHeader
                title={isEditing ? "Editar Atividade" : "Adicionar Atividade"}
                onBack={onBack}
                actionButton={
                    <button onClick={handleSave} disabled={isSaving} className="font-semibold text-ifal-green disabled:opacity-50 transition-opacity">
                        {isSaving ? 'Salvando...' : (isEditing ? 'Salvar' : 'Adicionar')}
                    </button>
                }
            />
            <main className="flex-grow p-4 space-y-6 overflow-y-auto">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm">
                        {error}
                    </div>
                )}
                
                <div>
                     <h2 className="px-4 pb-2 text-sm font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase">Informações Básicas</h2>
                     <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-none">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700/50">
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Título da Atividade</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-transparent text-base font-medium text-gray-900 dark:text-gray-100 focus:outline-none" placeholder="Ex: Oficina de Robótica" />
                        </div>
                         <div className="p-4">
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Tipo</label>
                            <div className="flex w-full bg-gray-100 dark:bg-gray-700/50 rounded-lg p-1 space-x-1 mt-2">
                                {activityTypes.map(cat => (
                                    <button key={cat} onClick={() => setType(cat)} className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all duration-300 ${type === cat ? 'bg-white dark:bg-gray-900 text-ifal-green shadow' : 'text-gray-600 dark:text-gray-400'}`}>
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="px-4 pb-2 text-sm font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase">Duração e Horário</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-none">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700/50">
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Carga Horária</label>
                            <select value={hours} onChange={e => setHours(Number(e.target.value))} className="w-full bg-transparent text-base font-medium text-gray-900 dark:text-gray-100 focus:outline-none appearance-none">
                                {hourOptions.map(h => <option key={h} value={h}>{h} hora{h > 1 ? 's' : ''}</option>)}
                            </select>
                        </div>
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700/50">
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Início</label>
                            <input type="datetime-local" value={startTime} onChange={handleStartTimeChange} className="w-full bg-transparent text-base font-medium text-gray-900 dark:text-gray-100 focus:outline-none" />
                        </div>
                         <div className="p-4 border-b border-gray-200 dark:border-gray-700/50">
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Fim</label>
                            <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-transparent text-base font-medium text-gray-900 dark:text-gray-100 focus:outline-none" />
                        </div>
                        <div className="p-4 flex justify-between items-center">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">Gera Certificado?</label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Participantes receberão certificado por esta atividade.</p>
                            </div>
                            <ToggleSwitch enabled={generatesCertificate} setEnabled={setGeneratesCertificate} />
                        </div>
                    </div>
                </div>

                 <div>
                     <h2 className="px-4 pb-2 text-sm font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase">Local</h2>
                     <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-none">
                        <div className="p-4">
                             <select value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-transparent text-base font-medium text-gray-900 dark:text-gray-100 focus:outline-none appearance-none">
                                {campusLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </main>
             <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 bg-ifal-green text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg transition-all duration-300 ${showSuccess ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                {successMessage}
            </div>
        </div>
    );
};

export default AddActivityScreen;
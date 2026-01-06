
import { supabase } from '../supabaseClient';

type ActionType = 'LOGIN' | 'LOGOUT' | 'PROFILE_UPDATE' | 'EVENT_REGISTER' | 'CERT_ISSUE' | 'CERT_DELETE' | 'CERT_DOWNLOAD' | 'CREATE_EVENT';

export const logActivity = async (
    userId: string,
    action: ActionType,
    description: string,
    metadata?: any
) => {
    try {
        const { error } = await supabase.from('activity_logs').insert({
            user_id: userId,
            action_type: action,
            description,
            metadata,
            created_at: new Date().toISOString()
        });

        if (error) {
            console.error('Failed to log activity:', error);
        }
    } catch (err) {
        console.error('Unexpected error logging activity:', err);
    }
};

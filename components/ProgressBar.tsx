import React from 'react';

interface ProgressBarProps {
    progress: number; // 0 to 100
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
    const progressWidth = Math.min(Math.max(progress, 0), 100);

    return (
        <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div 
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressWidth}%` }}
            ></div>
        </div>
    );
};

export default ProgressBar;

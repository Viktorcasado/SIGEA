import React, { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

declare global {
    interface Window {
        QRCodeStyling: any;
    }
}

interface QrCodeGeneratorProps {
  url: string;
  size: number;
  dotsColorOverride?: string;
  backgroundColorOverride?: string;
}

const QrCodeGenerator: React.FC<QrCodeGeneratorProps> = ({ url, size, dotsColorOverride, backgroundColorOverride }) => {
  const ref = useRef<HTMLDivElement>(null);
  const qrCodeInstanceRef = useRef<any>(null);
  const { theme } = useTheme();
  
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    if (!ref.current || !window.QRCodeStyling) return;

    const qrOptions = {
        width: size,
        height: size,
        data: url,
        dotsOptions: {
            color: dotsColorOverride || (isDarkMode ? "#2e7d32" : "#000000"),
            type: "rounded"
        },
        backgroundOptions: {
            color: backgroundColorOverride || "transparent",
        },
        cornersSquareOptions: {
            color: dotsColorOverride || (isDarkMode ? "#2e7d32" : "#000000"),
            type: "extra-rounded"
        },
        cornersDotOptions: {
            color: dotsColorOverride || (isDarkMode ? "#2e7d32" : "#000000"),
            type: "dot"
        }
    };

    try {
        if (!qrCodeInstanceRef.current) {
            qrCodeInstanceRef.current = new window.QRCodeStyling(qrOptions);
            qrCodeInstanceRef.current.append(ref.current);
        } else {
            qrCodeInstanceRef.current.update(qrOptions);
        }
    } catch (e) {
        console.warn("[SIGEA] Erro ao gerar QR Code:", e);
    }
    
    return () => {
        if (ref.current) {
            ref.current.innerHTML = '';
            qrCodeInstanceRef.current = null;
        }
    };
  }, [url, size, isDarkMode, dotsColorOverride, backgroundColorOverride]);

  return <div ref={ref} className="flex items-center justify-center min-h-[100px]" />;
};

export default QrCodeGenerator;
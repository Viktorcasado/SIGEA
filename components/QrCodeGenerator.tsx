import React, { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// Tell TypeScript that QRCodeStyling is available on the window object
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
    if (ref.current && window.QRCodeStyling) {
       const qrOptions = {
            width: size,
            height: size,
            data: url,
            dotsOptions: {
                color: dotsColorOverride || (isDarkMode ? "#00913F" : "#000000"),
                type: "rounded"
            },
            backgroundOptions: {
                color: backgroundColorOverride || "transparent",
            },
            cornersSquareOptions: {
                color: dotsColorOverride || (isDarkMode ? "#00913F" : "#000000"),
                type: "extra-rounded"
            },
            cornersDotOptions: {
                color: dotsColorOverride || (isDarkMode ? "#00913F" : "#000000"),
                type: "dot"
            }
        };

      if (!qrCodeInstanceRef.current) {
         qrCodeInstanceRef.current = new window.QRCodeStyling(qrOptions);
         qrCodeInstanceRef.current.append(ref.current);
      } else {
         qrCodeInstanceRef.current.update(qrOptions);
      }
    }
  }, [url, size, isDarkMode, dotsColorOverride, backgroundColorOverride]);

  return <div ref={ref} />;
};

export default QrCodeGenerator;
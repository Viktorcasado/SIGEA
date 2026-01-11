import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'br.edu.ifal.sigea',
    appName: 'SIGEA',
    webDir: 'dist',
    server: {
        androidScheme: 'https'
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 2000,
            launchAutoHide: true,
            backgroundColor: "#ffffffff",
            androidSplashResourceName: "splash",
            showSpinner: true,
            spinnerColor: "#999999"
        }
    }
};

export default config;

/**
 * Desenvolvido por Viktor Casado
 */

module.exports = {
    expo: {
        name: "AcneApp",
        slug: "acneapp",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/icon.png",
        userInterfaceStyle: "light",
        splash: {
            image: "./assets/images/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff"
        },
        assetBundlePatterns: [
            "**/*"
        ],
        ios: {
            supportsTablet: true,
            infoPlist: {
                NSCameraUsageDescription: "This app uses the camera to analyze your skin condition and provide personalized recommendations.",
                NSPhotoLibraryUsageDescription: "This app saves photos to provide personalized skin analysis."
            }
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/images/adaptive-icon.png",
                backgroundColor: "#ffffff"
            },
            permissions: ["CAMERA"]
        },
        extra: {
            // Add your OpenAI API key here for development
            // For production, use environment variables
            openAIApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || "",
        },
        plugins: [
            [
                "expo-camera",
                {
                    cameraPermission: "Allow $(PRODUCT_NAME) to access your camera to analyze your skin"
                }
            ]
        ],
        scheme: "acneapp", // Adding a URL scheme for deep linking
        newArchEnabled: true // Enabling new architecture
    }
};
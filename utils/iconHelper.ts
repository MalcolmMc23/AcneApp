// Icon Helper Utility for AcneApp
// Maps modern FontAwesome6 icon names to compatible FontAwesome5 names
// for use with @expo/vector-icons FontAwesome component

// Define the icon map type
type IconMapType = {
  [key: string]: string;
};

// Map of new icon names to compatible ones
export const FontAwesomeIconMap: IconMapType = {
  // Map the problematic icons to compatible alternatives
  "face-smile": "smile-o",         // Alternative for face-smile
  "chart-line": "line-chart",      // Alternative for chart-line
  "list-check": "tasks",           // Alternative for list-check
  
  // Add any other mappings as needed
};

// Helper function to get the compatible icon name
export const getCompatibleFAIcon = (iconName: string): string => {
  return FontAwesomeIconMap[iconName] || iconName;
}; 
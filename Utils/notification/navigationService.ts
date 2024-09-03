import { createNavigationContainerRef } from '@react-navigation/native';

//navigation service for impliment the navigation n app 

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params); // navihation to navigation component 
  }
}

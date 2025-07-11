interface UserLocation {
  lat: number;
  lng: number;
}

export const askUserLocation = (onSetLocation: (location: UserLocation | null) => void): void => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onSetLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.warn("Location access denied:", error);
        onSetLocation(null);
      }
    );
  } else {
    console.error("Geolocation not supported");
    onSetLocation(null);
  }
}; 
// @ts-nocheck
export const askUserLocation = (onSetLocation) => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                onSetLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                }); // Now correctly calls parent-provided function
            },
            (error) => {
                console.warn("Location access denied:", error);
                onSetLocation(null); // Pass `null` to indicate failure
            }
        );
    } else {
        console.error("Geolocation not supported");
        onSetLocation(null);
    }
};

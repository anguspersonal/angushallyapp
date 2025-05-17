const loadStravaApi = async () => {
    const StravaApiV3 = await import('strava_api_v3');
    return StravaApiV3.default || StravaApiV3; // Handle default export if necessary
  };
  
  const setupStrava = async () => {
    const StravaApiV3 = await loadStravaApi();
    
    const defaultClient = StravaApiV3.ApiClient.instance;
    const strava_oauth = defaultClient.authentications['strava_oauth'];
    strava_oauth.accessToken = null; // Will be set after authentication
  
    const api = new StravaApiV3.ActivitiesApi();
    
    return api;
  };
  
  export default setupStrava;
  
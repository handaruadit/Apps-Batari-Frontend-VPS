//===== (Imports) ======
import { GOOGLE_MAPS_API_KEY } from "@/config/api";
import { pickNumber, pickValue } from "../utils/apiData";
import { isFiniteCoordinate } from "../utils/chartData";
//===== (Weather Service) ======
//===== (buildGoogleGeocodeEndpoint) ======
export function buildGoogleGeocodeEndpoint(locationText) {
  return `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    locationText,
  )}&region=id&key=${GOOGLE_MAPS_API_KEY}`;
}

//===== (buildGoogleWeatherEndpoint) ======
export function buildGoogleWeatherEndpoint(latitude, longitude, languageCode = "id") {
  return `https://weather.googleapis.com/v1/currentConditions:lookup?key=${GOOGLE_MAPS_API_KEY}&location.latitude=${latitude}&location.longitude=${longitude}&unitsSystem=METRIC&languageCode=${languageCode}`;
}

//===== (getWeatherConditionText) ======
export function getWeatherConditionText(weather) {
  return pickValue(
    weather?.weatherCondition?.description?.text,
    weather?.weatherCondition?.type,
    weather?.weatherCondition?.description,
    null,
  );
}

//===== (getWeatherConditionType) ======
export function getWeatherConditionType(weather) {
  return pickValue(weather?.weatherCondition?.type, null);
}

//===== (getWeatherIconName) ======
export function getWeatherIconName(conditionType, isDaytime = true) {
  const type = String(conditionType || "").toUpperCase();

  if (type.includes("THUNDER")) {
    return "thunderstorm-outline";
  }

  if (type.includes("RAIN") || type.includes("DRIZZLE")) {
    return "rainy-outline";
  }

  if (type.includes("SNOW")) {
    return "snow-outline";
  }

  if (type.includes("CLOUD")) {
    return isDaytime ? "cloudy-outline" : "cloudy-night-outline";
  }

  if (type.includes("FOG") || type.includes("MIST") || type.includes("HAZE")) {
    return "cloud-outline";
  }

  return isDaytime ? "sunny-outline" : "moon-outline";
}

//===== (fetchGoogleWeatherForPlant) ======
export async function fetchGoogleWeatherForPlant({
  locationText,
  latitude,
  longitude,
  languageCode = "id",
}) {
  if (!GOOGLE_MAPS_API_KEY) {
    return null;
  }

  let resolvedLatitude = isFiniteCoordinate(latitude) ? Number(latitude) : null;
  let resolvedLongitude = isFiniteCoordinate(longitude)
    ? Number(longitude)
    : null;

  if (locationText) {
    const geocodeResponse = await fetch(
      buildGoogleGeocodeEndpoint(locationText),
    );
    const geocodeJson = await geocodeResponse.json().catch(() => null);
    const firstResult = geocodeJson?.results?.[0]?.geometry?.location;

    if (
      geocodeResponse.ok &&
      firstResult &&
      isFiniteCoordinate(firstResult.lat) &&
      isFiniteCoordinate(firstResult.lng)
    ) {
      resolvedLatitude = Number(firstResult.lat);
      resolvedLongitude = Number(firstResult.lng);
    }
  }

  if (
    !isFiniteCoordinate(resolvedLatitude) ||
    !isFiniteCoordinate(resolvedLongitude)
  ) {
    return null;
  }

  const weatherResponse = await fetch(
    buildGoogleWeatherEndpoint(
      resolvedLatitude,
      resolvedLongitude,
      languageCode,
    ),
  );
  const weatherJson = await weatherResponse.json().catch(() => null);

  if (!weatherResponse.ok || !weatherJson) {
    return null;
  }

  const currentTemperature = pickNumber(
    weatherJson?.temperature?.degrees,
    weatherJson?.currentTemperature?.degrees,
  );
  const maxTemperature = pickNumber(
    weatherJson?.currentConditionsHistory?.maxTemperature?.degrees,
    currentTemperature + 2,
  );
  const minTemperature = pickNumber(
    weatherJson?.currentConditionsHistory?.minTemperature?.degrees,
    currentTemperature - 2,
  );

  return {
    latitude: resolvedLatitude,
    longitude: resolvedLongitude,
    temperature: currentTemperature,
    high: maxTemperature,
    low: minTemperature,
    conditionText: getWeatherConditionText(weatherJson),
    conditionType: getWeatherConditionType(weatherJson),
    isDaytime: Boolean(weatherJson?.isDaytime),
  };
}


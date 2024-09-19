import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

function App() {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [address, setAddress] = useState("");
  const mapRef = useRef(null); // Use a ref to store the map instance
  const mapInitialized = useRef(false); // Use a ref to track map initialization

  // Initialize or update Yandex Map
  const initMap = (latitude, longitude) => {
    if (!window.ymaps || mapInitialized.current) return; // Check if map is already initialized

    window.ymaps.ready(() => {
      const newMap = new window.ymaps.Map("map", {
        center: [latitude, longitude],
        zoom: 10,
      });

      const userPlacemark = new window.ymaps.Placemark(
        [latitude, longitude],
        {
          balloonContent: "Your location",
        },
        {
          preset: "islands#icon",
          iconColor: "#0095b6",
        }
      );
      newMap.geoObjects.add(userPlacemark);
      mapRef.current = newMap; // Store the map instance in the ref
      mapInitialized.current = true; // Set the flag to true
    });
  };

  // Get the user's location and address
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          initMap(latitude, longitude);
          reverseGeocode(latitude, longitude);
        },
        (err) => {
          console.error("Error fetching location:", err);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  // Reverse Geocode to get the address from coordinates
  const reverseGeocode = async (latitude, longitude) => {
    try {
      const res = await axios.get(
        `https://geocode-maps.yandex.ru/1.x/?format=json&apikey=106bf830-3543-4935-903a-7e39d53a4fb7&geocode=${longitude},${latitude}`
      );
      const addressData = res.data.response.GeoObjectCollection.featureMember[0].GeoObject;
      setAddress(addressData.metaDataProperty.GeocoderMetaData.text);
    } catch (err) {
      console.error("Error fetching address:", err);
    }
  };

  // Send location to backend
  const sendLocationToBackend = async () => {
    try {
      await axios.post("http://localhost:5000/api/location", {
        latitude: location.latitude,
        longitude: location.longitude,
        address,
      });
      console.log("Location sent to the backend.");
    } catch (error) {
      console.error("Error sending location to the backend:", error);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  // useEffect(() => {
  //   if (mapRef.current && location.latitude && location.longitude) {
  //     mapRef.current.setCenter([location.latitude, location.longitude], 10);
  //   }
  // }, [location]);

  return (
    <div>
      <h1>Yandex Map with User Location</h1>
      {location.latitude && location.longitude ? (
        <div>
          <p>Your coordinates: {location.latitude}, {location.longitude}</p>
          <p>Your address: {address}</p>
        </div>
      ) : (
        <p>Fetching location...</p>
      )}
      <div id="map" style={{ width: "100%", height: "100vh" }}></div>
    </div>
  );
}

export default App;

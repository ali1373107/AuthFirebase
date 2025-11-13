import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TextInput, Button, Alert, Keyboard, Platform } from 'react-native';
import MapView, { Marker, Region, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';

const MapScreen = () => {
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const [markerLocation, setMarkerLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        const region = {
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setInitialRegion(region);
        setMarkerLocation({ latitude, longitude });
      } catch (error) {
        Alert.alert("Error", "Could not fetch location. Please make sure location services are enabled.");
        console.error("Error fetching location: ", error);
      }
    })();
  }, []);

  const handleSearch = async () => {
    Keyboard.dismiss();
    if (!searchQuery.trim()) {
      Alert.alert('Empty Search', 'Please enter a city name to search.');
      return;
    }

    try {
      // Using Nominatim for geocoding (city name to coordinates)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newRegion = {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        if (mapRef.current) {
          mapRef.current.animateToRegion(newRegion, 1000); // Animate over 1 second
        }
        // You could also add a new marker for the searched location if you wish
        // setSearchedMarker({ latitude: parseFloat(lat), longitude: parseFloat(lon) });
      } else {
        Alert.alert('Not Found', `Could not find the city "${searchQuery}".`);
      }
    } catch (error) {
      console.error('Error during geocoding:', error);
      Alert.alert('Search Error', 'An error occurred while searching.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a city..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch} // Allows searching by pressing 'return' on keyboard
        />
        <Button title="Search" onPress={handleSearch} />
      </View>
      {initialRegion ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={true} // This will show the default blue dot for user location
        >
          <UrlTile
            urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
            flipY={false} // on Android, this may need to be true
          />
          {markerLocation && (
            <Marker
              coordinate={markerLocation}
              title="Your Location"
              description="This is your current location"
            />
          )}
        </MapView>
      ) : (
        // You can show a loading indicator here while fetching location
        <View style={styles.loadingContainer}>
          {/* <ActivityIndicator size="large" /> */}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    // Add shadow for iOS and elevation for Android for better UI
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginRight:10,
    paddingHorizontal: 8,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MapScreen;

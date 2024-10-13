import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function BottomToolbar({ addSection, selectedSection, oneLevelDeeper, oneLevelUp, deleteSection, resetData }) {
  return (
    <View style={styles.toolbarContainer}>
      <TouchableOpacity
        style={styles.button}
        onPress={addSection}
        disabled={!selectedSection}
      >
        <Text style={styles.buttonText}>Add Section</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={oneLevelDeeper}
        disabled={!selectedSection}
      >
        <Text style={styles.buttonText}>Deeper</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={oneLevelUp}
        disabled={!selectedSection}
      >
        <Text style={styles.buttonText}>Up</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={deleteSection}
        disabled={!selectedSection}
      >
        <Text style={styles.buttonText}>Delete</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={resetData}
        disabled={!selectedSection}
      >
        <Text style={styles.buttonText}>Reset</Text>
      </TouchableOpacity>

      {/* Additional buttons for reordering and changing depth would go here */}
    </View>
  );
}

const styles = StyleSheet.create({
  toolbarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
});

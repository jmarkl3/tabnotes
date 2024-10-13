import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, BackHandler, KeyboardAvoidingView, Alert } from 'react-native';
import Section from './Section'; // Import the Section component
import BottomToolbar from './BottomToolbar'; // Import the BottomToolbar component
import { truncateText } from "./Functions.js";

/*
  A wasy it could work
  when clicking a section circle a function is called
  it looks for the path down to that section and adds each of those sections to the breadcrumb array
  there is a functino that gets the section data based on the dataObject and the section id
  that is called for each of the breadcrumb objects
  the breadcrumb objects behave like the circle and set the whole things to that
  when the breadcrumb array changes the display data object is updated to the last item in that array

  

*/

// Sample nested note structure
const initialData = {
  id: 1,
  content: 'base content',
  children: [
    {
      id: 2,
      content: 'Section 1 content',
      children: [
        { id: 3, content: 'Subsection 1.1 content', children: [] },
        { id: 4, content: 'Subsection 1.2 content', children: [] },
      ],
    },
    { id: 5, content: 'Section 2 content', children: [] },
  ],
};

export default function App() {
  const [data, setData] = useState(initialData);
  const [breadcrumb, setBreadcrumb] = useState([initialData]);
  const [currentView, setCurrentView] = useState(initialData);
  const [selectedSection, setSelectedSection] = useState(null);

  useEffect(() => {
    const backAction = () => {
      if (breadcrumb.length > 1) {
        const newBreadcrumb = breadcrumb.slice(0, -1);
        setBreadcrumb(newBreadcrumb);
        setCurrentView(newBreadcrumb[newBreadcrumb.length - 1]);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [breadcrumb]);

  useEffect(() => {
    console.log("selectedSection: ", selectedSection);
  }, [selectedSection]);

  // Set a section as breadcrumb and select it
  const toggleBreadcrumb = (section) => {
    const index = breadcrumb.findIndex((crumb) => crumb.id === section.id);
    if (index === -1) setBreadcrumb([...breadcrumb, section]);
    else setBreadcrumb(breadcrumb.slice(0, index + 1));
    
    setCurrentView(section);
    setSelectedSection(section); // Select the section
  };

  // This function displays an alert that says "Delete <section name with elipsis> with <n children> children?" and if the user presses yes it deletes the selectedSection
  function deleteSelectedSection() {
    // Check if there's a selected section
    if (!selectedSection) return;
  
    const sectionToDelete = findSectionById(data.children, selectedSection);
  
    if (sectionToDelete) {
      const sectionName = sectionToDelete.content;
      const childrenCount = sectionToDelete.children.length;
  
      // Display the confirmation alert
      Alert.alert(
        `Delete ${truncateText(sectionName)}... with ${childrenCount} children?`,
        'Are you sure you want to delete this section?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Yes', 
            onPress: () => {
              // Proceed with deletion
              setData(prevData => ({
                ...prevData,
                children: deleteSection(prevData.children, selectedSection),
              }));
            }
          },
        ],
        { cancelable: true }
      );
    }
  }
  
  // Helper function to delete a section by its ID
// Helper function to delete a section by its ID
function deleteSection(sections, sectionID) {
  return sections.reduce((acc, section) => {
    // If this section is the one to delete, skip it
    if (section.id === sectionID) {
      return acc;
    }

    // Recursively check and filter children
    const updatedChildren = deleteSection(section.children, sectionID);

    // Only include the section if it has children or it's not the one being deleted
    acc.push({ ...section, children: updatedChildren });

    return acc;
  }, []);
}


  const addSection = () => {
    const newSection = {
      id: Date.now(),
      content: 'New section',
      children: [],
    };

    // If there is not a selected section add to the base section
    if (!selectedSection){
      data.children = [...data.children, newSection]
    };

    const childrenContainSection = (sectionData, sectionID) => {
      if(!sectionData || !Array.isArray(sectionData.children)) return false
      let foundSectionID = false
      sectionData.children.forEach(childData => {
        if(childData.id == sectionID)
          foundSectionID = true
      })
      return foundSectionID
    }

    const addRecursive = (section) => {
      if(childrenContainSection(section, selectedSection)){
        const returnObject = {...section}
        returnObject.children = [...section.children, newSection]
        return returnObject
      }

      return { ...section, children: section.children.map(addRecursive) };
    };

    const updatedData = addRecursive(data);
    console.log("updatedData", updatedData)

    setData(updatedData);
    
    // Optionally, set the newly created section as the selected section
    // setSelectedSection(newSection.id);
  };
  const addSection2 = () => {
    const newSection = {
      id: Date.now(),
      content: 'New section',
      children: [],
    };

    // If there is not selected section add to the base section
    if (!selectedSection){
      data.children = [...data.children, newSection]
    };

    const addRecursive = (section) => {
      if (section.id === selectedSection) {
        console.log("found ", selectedSection)
        const returnObject = {...section}
        returnObject.children = [...section.children, newSection]
        return returnObject
      }
      return { ...section, children: section.children.map(addRecursive) };
    };

    const updatedData = addRecursive(data);
    console.log("updatedData", updatedData)

    setData(updatedData);
    
    // Optionally, set the newly created section as the selected section
    // setSelectedSection(newSection.id);
  };

  const updateContent = (sectionId, newContent) => {
    console.log("sectionId", sectionId, "newContent", newContent)

    const updateRecursive = (section) => {
      if (section.id === sectionId){
        let returnObject = {...section}
        returnObject.content = newContent
        console.log("found item ", sectionId, " updated: ", returnObject)
        return returnObject
      } 
      return { ...section, children: section.children.map(updateRecursive) };
    };
    const updatedData = updateRecursive(data);
    console.log("updatedData",updatedData)
    setData(updatedData);
    
    // Ensure the current view also gets updated if it's the selected section
    if (currentView.id === sectionId) {
      setCurrentView({ ...currentView, content: newContent });
    }
  };

  function resetData(){
    console.log("setting date to ", initialData)
    setData(initialData)
  }

// Moves the selected section into the children of the section before it in the array it's in
function oneLevelDeeper() {
  // Check if there's a selected section
  if (!selectedSection) return;

  const moveRecursive = (sections) => {
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];

      // Check if the current section is the one we want to move
      if (section.id === selectedSection) {
        // Ensure there's a preceding section
        if (i > 0) {
          const parentSection = sections[i - 1]; // The section before the selected one
          const sectionToMove = { ...section, children: [] }; // Create a copy of the section to move

          // Remove the section from its current array
          const updatedSections = sections.filter((s) => s.id !== selectedSection);

          // Ensure the parent section's children is an array
          if (!Array.isArray(parentSection.children)) {
            parentSection.children = [];
          }

          // Add the section to the previous section's children
          parentSection.children.push(sectionToMove);

          return [...updatedSections, parentSection]; // Return updated sections
        }
        return sections; // If it's the first section, do nothing
      }

      // Recursively check the children
      const updatedChildren = moveRecursive(Array.isArray(section.children) ? section.children : []);
      if (updatedChildren !== section.children) {
        return { ...section, children: updatedChildren };
      }
    }
    return sections; // Return sections if not found
  };

  const updatedData = moveRecursive(data.children);
  setData({ ...data, children: updatedData });
}

// Moves the section into the array that its parent is in
function oneLevelUp() {
  // Check if there's a selected section
  if (!selectedSection) return;

  const moveRecursive = (sections, parentID = null) => {
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];

      // Check if this is the section to move
      if (section.id === selectedSection) {
        // Remove the section from its current parent
        const updatedSections = sections.filter((s) => s.id !== selectedSection);

        // If it has a parent, find the parent section to which it will be moved
        if (parentID) {
          const parentSection = findSectionById(data.children, parentID);
          if (parentSection) {
            // Ensure the parent section's children is an array
            if (!Array.isArray(parentSection.children)) {
              parentSection.children = [];
            }
            parentSection.children.push(section); // Add the section to its parent
          }
        } else {
          // If there's no parent, add it back to the base section
          data.children.push(section);
        }

        // Return the updated sections without the moved section
        return updatedSections;
      }

      // Check the children recursively
      const updatedChildren = moveRecursive(section.children, section.id);
      if (updatedChildren !== section.children) {
        return { ...section, children: updatedChildren };
      }
    }
    return sections; // Return sections if not found
  };

  const updatedData = moveRecursive(data.children);
  setData({ ...data, children: updatedData });
}

// Helper function to find a section by ID
const findSectionById = (sections, sectionID) => {
  for (const section of sections) {
    if (section.id === sectionID) return section;

    const found = findSectionById(section.children, sectionID);
    if (found) return found;
  }
  return null; // Not found
};






  return (
    <>
    <KeyboardAvoidingView style={{ flex: 1, marginBottom: 70}} keyboardVerticalOffset={80}>

      <ScrollView style={styles.container}>
        {/* Breadcrumb */}
        <View style={styles.breadcrumbContainer}>
          {breadcrumb.map((crumb, index) => (
            <TouchableOpacity key={crumb.id} onPress={() => toggleBreadcrumb(crumb)}>
              <Text style={styles.breadcrumbText}>
                {index > 0 ? ' > ' : ''}
                {truncateText(crumb.content) || 'Untitled'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.contentContainer}>
          {/* Render Section Content */}

            <Section
              key={"base section"}
              section={data}
              breadcrumb={breadcrumb}
              toggleBreadcrumb={toggleBreadcrumb}
              setSelectedSection={setSelectedSection}
              updateContent={updateContent}

            />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>

      {/* Bottom Toolbar */}
      <BottomToolbar 
        addSection={addSection}
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
        oneLevelUp={oneLevelUp}
        oneLevelDeeper={oneLevelDeeper}
        deleteSection={deleteSelectedSection}
        resetData={resetData}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f4f4',
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    marginTop: 20,
  },
  breadcrumbText: {
    fontSize: 16,
    color: '#007AFF',
    marginRight: 5,
    padding: 5,
    backgroundColor: "lightblue",
    borderRadius: 10,
    display: "inlineBlock",
  },
  contentContainer: {
    marginVertical: 20,
  },
  contentText: {
    fontSize: 16,
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
  },
});

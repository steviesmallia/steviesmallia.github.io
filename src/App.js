import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const OCDChecklistApp = () => {
  const [sections, setSections] = useState(() => {
    const savedSections = localStorage.getItem("sections");
    return savedSections
      ? JSON.parse(savedSections)
      : {
          Kitchen: ["Stove", "Sink Faucet", "Fridge Door"],
          LivingRoom: ["Main Door Lock", "Windows Closed"],
          Bedroom: ["Closet Door", "Window Closed", "Nightstand Clear"],
          Office: ["Computer Shut Down", "Lights Off", "Door Locked"],
          Bathroom: ["Faucet Off", "Shower Off", "Toilet Lid Closed"],
        };
  });

  const [checkedItems, setCheckedItems] = useState(() => {
    const savedCheckedItems = localStorage.getItem("checkedItems");
    return savedCheckedItems ? JSON.parse(savedCheckedItems) : {};
  });

  const [newSection, setNewSection] = useState("");
  const [customSection, setCustomSection] = useState({ name: "", items: [] });
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    localStorage.setItem("sections", JSON.stringify(sections));
  }, [sections]);

  useEffect(() => {
    localStorage.setItem("checkedItems", JSON.stringify(checkedItems));
  }, [checkedItems]);

  const toggleCheck = (section, item) => {
    setCheckedItems((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [item]: !prev[section]?.[item],
      },
    }));
  };

  const addSection = () => {
    if (newSection) {
      setSections((prev) => ({ ...prev, [newSection]: [] }));
      setNewSection("");
    }
  };

  const removeSection = (section) => {
    setSections((prev) => {
      const updatedSections = { ...prev };
      delete updatedSections[section];
      return updatedSections;
    });
    setCheckedItems((prev) => {
      const updatedCheckedItems = { ...prev };
      delete updatedCheckedItems[section];
      return updatedCheckedItems;
    });
  };

  const addItem = (section) => {
    if (newItem) {
      setSections((prev) => ({
        ...prev,
        [section]: [...prev[section], newItem],
      }));
      setNewItem("");
    }
  };

  const removeItem = (section, item) => {
    setSections((prev) => ({
      ...prev,
      [section]: prev[section].filter((i) => i !== item),
    }));
    setCheckedItems((prev) => {
      const updatedSection = { ...prev[section] };
      delete updatedSection[item];
      return { ...prev, [section]: updatedSection };
    });
  };

  const addCustomSection = () => {
    if (customSection.name) {
      setSections((prev) => ({
        ...prev,
        [customSection.name]: customSection.items,
      }));
      setCustomSection({ name: "", items: [] });
    }
  };

  const clearChecks = () => {
    setCheckedItems({});
  };

  const allItemsChecked = (section) => {
    const items = sections[section];
    return items.every((item) => checkedItems[section]?.[item]);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    const sectionOrder = Object.keys(sections);
    const [removed] = sectionOrder.splice(source.index, 1);
    sectionOrder.splice(destination.index, 0, removed);

    const reorderedSections = {};
    sectionOrder.forEach((key) => {
      reorderedSections[key] = sections[key];
    });
    setSections(reorderedSections);
  };

  return (
    <div className="p-4 space-y-4 bg-gradient-to-b from-gray-100 to-gray-200 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 drop-shadow-lg">OCD Checklist App</h1>
        <Button
          className="bg-red-500 text-white shadow-md hover:shadow-lg active:shadow-none rounded-lg px-4 py-2"
          onClick={clearChecks}
        >
          Clear All
        </Button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {Object.entries(sections).map(([section, items], index) => (
                <Draggable key={section} draggableId={section} index={index}>
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`mb-4 bg-opacity-80 backdrop-blur-md shadow-2xl rounded-xl border border-gray-300`}
                      style={{
                        backgroundColor: allItemsChecked(section) ? "rgba(200, 200, 200, 0.7)" : "rgba(255, 255, 255, 0.8)",
                      }}
                    >
                      <CardContent>
                        <div className="flex justify-between items-center mb-2">
                          <h2 className="text-xl font-semibold text-gray-800 drop-shadow-md">{section}</h2>
                          <Button
                            className="text-gray-800 bg-opacity-20 hover:text-red-600 hover:bg-opacity-30 shadow-md rounded-full p-3 mt-2"
                            style={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
                            onClick={() => removeSection(section)}
                          >
                            <span className="material-icons">delete</span>
                          </Button>
                        </div>
                        <ul className="space-y-2">
                          {items.map((item) => (
                            <motion.li
                              key={item}
                              className={`flex items-center justify-between space-x-2 shadow-inner rounded-lg px-4 py-2 transition-colors duration-300 ${
                                checkedItems[section]?.[item] ? "bg-gray-300" : "bg-white"
                              }`}
                              animate={{ scale: checkedItems[section]?.[item] ? 1.05 : 1 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <div className="flex items-center space-x-2">
                                <motion.input
                                  type="checkbox"
                                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 shadow-sm"
                                  checked={!!checkedItems[section]?.[item]}
                                  onChange={() => toggleCheck(section, item)}
                                />
                                <span className="text-gray-700 font-medium">{item}</span>
                              </div>
                              <Button
                                className="text-gray-800 bg-opacity-20 hover:text-red-600 hover:bg-opacity-30 shadow-md rounded-full p-3"
                                style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
                                onClick={() => removeItem(section, item)}
                              >
                                <span className="material-icons">delete</span>
                              </Button>
                            </motion.li>
                          ))}
                        </ul>
                        <div className="flex space-x-2 mt-4">
                          <Input
                            className="border-gray-300 rounded-lg shadow-inner focus:ring-indigo-500"
                            placeholder="Add item"
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                          />
                          <Button
                            className="bg-indigo-500 text-white shadow-md hover:shadow-lg active:shadow-none rounded-lg px-4 py-2"
                            onClick={() => addItem(section)}
                          >
                            Add
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <Card className="mb-4 bg-gray-100 shadow-lg rounded-xl">
        <CardContent>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 drop-shadow-md">Add New Section</h2>
          <div className="flex space-x-2">
            <Input
              className="border-gray-300 rounded-lg shadow-inner focus:ring-indigo-500"
              placeholder="Section name"
              value={newSection}
              onChange={(e) => setNewSection(e.target.value)}
            />
            <Button
              className="bg-indigo-500 text-white shadow-md hover:shadow-lg active:shadow-none rounded-lg px-4 py-2"
              onClick={addSection}
            >
              Add Section
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-gray-100 shadow-lg rounded-xl">
        <CardContent>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 drop-shadow-md">Temporary Custom Section</h2>
          <div className="flex space-x-2 mb-2">
            <Input
              className="border-gray-300 rounded-lg shadow-inner focus:ring-indigo-500"
              placeholder="Custom section name"
              value={customSection.name}
              onChange={(e) =>
                setCustomSection((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <Button
              className="bg-indigo-500 text-white shadow-md hover:shadow-lg active:shadow-none rounded-lg px-4 py-2"
              onClick={addCustomSection}
            >
              Add Custom Section
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OCDChecklistApp;

import React, { useState } from "react";
import Summary from "./Summary";

export default function Calculator() {
  const [crew, setCrew] = useState([
    { name: "", trips: 0, innerCity: false, travel: false, total: 0 },
  ]);

  const [labour, setLabour] = useState([
    { name: "", trips: 0, innerCity: false, travel: false, total: 0 },
  ]);

  // --- Calculation logic ---
  const calculateTotal = (row) => {
    let base = row.trips * 100; // example: 100 per trip
    if (row.innerCity) {
      base += row.trips * 50; // extra 50 per trip if inner city
    }
    if (row.travel) {
      base += 200; // flat travel charge
    }
    return base;
  };

  const updateRow = (list, setList, index, field, value) => {
    const updated = [...list];
    updated[index][field] = value;

    // Fix: make sure trips always a number
    if (field === "trips" && value === "") updated[index].trips = 0;

    updated[index].total = calculateTotal(updated[index]);
    setList(updated);
  };

  const addRow = (list, setList) => {
    setList([...list, { name: "", trips: 0, innerCity: false, travel: false, total: 0 }]);
  };

  const crewTotal = crew.reduce((sum, row) => sum + row.total, 0);
  const labourTotal = labour.reduce((sum, row) => sum + row.total, 0);
  const grandTotal = crewTotal + labourTotal;

  return (
    <div className="space-y-8">
      {/* Crew Section */}
      <div>
        <h2 className="text-lg font-semibold border-b pb-2 mb-2">Crew</h2>
        {crew.map((row, i) => (
          <div key={i} className="grid grid-cols-5 gap-3 mb-2">
            <input
              type="text"
              placeholder="Name"
              value={row.name}
              onChange={(e) => updateRow(crew, setCrew, i, "name", e.target.value)}
              className="border p-2 rounded"
            />
            <input
              type="number"
              min="0"
              value={row.trips}
              onChange={(e) =>
                updateRow(crew, setCrew, i, "trips", parseInt(e.target.value || "0"))
              }
              className="border p-2 rounded"
            />
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={row.innerCity}
                onChange={(e) => updateRow(crew, setCrew, i, "innerCity", e.target.checked)}
              />
              <span>Inner City</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={row.travel}
                onChange={(e) => updateRow(crew, setCrew, i, "travel", e.target.checked)}
              />
              <span>Travel</span>
            </label>
            <div className="font-semibold p-2">{row.total}</div>
          </div>
        ))}
        <button
          onClick={() => addRow(crew, setCrew)}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          + Add Crew
        </button>
      </div>

      {/* Labour Section */}
      <div>
        <h2 className="text-lg font-semibold border-b pb-2 mb-2">Labour</h2>
        {labour.map((row, i) => (
          <div key={i} className="grid grid-cols-5 gap-3 mb-2">
            <input
              type="text"
              placeholder="Name"
              value={row.name}
              onChange={(e) => updateRow(labour, setLabour, i, "name", e.target.value)}
              className="border p-2 rounded"
            />
            <input
              type="number"
              min="0"
              value={row.trips}
              onChange={(e) =>
                updateRow(labour, setLabour, i, "trips", parseInt(e.target.value || "0"))
              }
              className="border p-2 rounded"
            />
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={row.innerCity}
                onChange={(e) => updateRow(labour, setLabour, i, "innerCity", e.target.checked)}
              />
              <span>Inner City</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={row.travel}
                onChange={(e) => updateRow(labour, setLabour, i, "travel", e.target.checked)}
              />
              <span>Travel</span>
            </label>
            <div className="font-semibold p-2">{row.total}</div>
          </div>
        ))}
        <button
          onClick={() => addRow(labour, setLabour)}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          + Add Labour
        </button>
      </div>

      {/* Summary */}
      <Summary crewTotal={crewTotal} labourTotal={labourTotal} grandTotal={grandTotal} />
    </div>
  );
}

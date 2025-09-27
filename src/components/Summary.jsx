import React from "react";

export default function Summary({ crewTotal, labourTotal, grandTotal }) {
  return (
    <div>
      <h2 className="text-lg font-semibold border-b pb-2 mb-2">Summary</h2>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Crew</span>
          <span className="font-semibold">{crewTotal}</span>
        </div>
        <div className="flex justify-between">
          <span>Labour</span>
          <span className="font-semibold">{labourTotal}</span>
        </div>
        <div className="flex justify-between border-t pt-2">
          <span>Grand Total</span>
          <span className="font-bold text-xl">{grandTotal}</span>
        </div>
      </div>
    </div>
  );
}

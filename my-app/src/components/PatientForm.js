import { useState } from "react";
import axios from "axios";

export default function PatientForm({ onAdd }) {
  const [form, setForm] = useState({
    uhid: "",
    name: "",
    discharge_time: "",
    summary_time: "",
    completeness: false,
    accuracy: false,
    delay_reason: ""
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.post("http://127.0.0.1:5000/patients", form);
    onAdd(res.data);
    setForm({
      uhid: "",
      name: "",
      discharge_time: "",
      summary_time: "",
      completeness: false,
      accuracy: false,
      delay_reason: ""
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-bold mb-4">Enter Patient Discharge Data</h2>

      <input type="text" name="uhid" placeholder="UHID"
        value={form.uhid} onChange={handleChange}
        className="border p-2 w-full mb-2" required /><br></br>

      <input type="text" name="name" placeholder="Patient Name"
        value={form.name} onChange={handleChange}
        className="border p-2 w-full mb-2" required /><br></br>

      <label className="block mb-2">Discharge Time</label>
      <input type="datetime-local" name="discharge_time"
        value={form.discharge_time} onChange={handleChange}
        className="border p-2 w-full mb-2" required /><br></br>

      <label className="block mb-2">Summary Handed Over Time</label>
      <input type="datetime-local" name="summary_time"
        value={form.summary_time} onChange={handleChange}
        className="border p-2 w-full mb-2" required /><br></br>

      <label className="flex items-center mb-2">
        <input type="checkbox" name="completeness"
          checked={form.completeness} onChange={handleChange} />
        <span className="ml-2">Completeness Check</span>
      </label><br></br>

      <label className="flex items-center mb-2">
        <input type="checkbox" name="accuracy"
          checked={form.accuracy} onChange={handleChange} />
        <span className="ml-2">Accuracy Check</span>
      </label><br></br>

      <input type="text" name="delay_reason" placeholder="Delay Reason (if any)"
        value={form.delay_reason} onChange={handleChange}
        className="border p-2 w-full mb-2" /><br></br>

      <button type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded">
        Submit
      </button>
    </form>
  );
}
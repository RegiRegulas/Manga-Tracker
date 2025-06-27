import React from "react";

const EditForm = ({ formData, onChange, onSubmit, onCancel, error }) => {
  return (
    <form
      onSubmit={onSubmit}
      className="max-w-md bg-gray-900 p-6 rounded-lg shadow-md mt-6 text-white"
    >
      <h2 className="text-xl font-semibold mb-4">Edit Manga</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}

      <div className="mb-4">
        <label className="block mb-1 text-gray-300">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={onChange}
          className="w-full border border-gray-700 rounded px-3 py-2 bg-gray-800 text-white"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 text-gray-300">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={onChange}
          className="w-full border border-gray-700 rounded px-3 py-2 bg-gray-800 text-white"
        >
          <option>Plan to Read</option>
          <option>Reading</option>
          <option>Completed</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-1 text-gray-300">Chapters Read</label>
        <input
          type="number"
          name="chaptersRead"
          min="0"
          value={formData.chaptersRead}
          onChange={onChange}
          className="w-full border border-gray-700 rounded px-3 py-2 bg-gray-800 text-white"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Save
        </button>
        <button
          type="button"
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EditForm;

// client/src/components/AddMangaForm.jsx
import React, { useState } from 'react';
import axios from 'axios';

const AddMangaForm = ({ onAdded }) => {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('Plan to Read');
  const [chaptersRead, setChaptersRead] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'https://manga-tracker-backend.onrender.com/api/manga',
        { title, status, chaptersRead },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTitle('');
      setStatus('Plan to Read');
      setChaptersRead(0);
      if (onAdded) onAdded(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add manga');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md bg-zinc-800 text-white p-6 rounded-lg shadow-md"
    >
      <h2 className="text-xl font-semibold mb-4">Add New Manga</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}

      <div className="mb-4">
        <label className="block mb-1">Title</label>
        <input
          type="text"
          className="w-full border border-gray-400 rounded px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Status</label>
        <select
          className="w-full border border-gray-400 rounded px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>Plan to Read</option>
          <option>Reading</option>
          <option>Completed</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-1">Chapters Read</label>
        <input
          type="number"
          min="0"
          className="w-full border border-gray-400 rounded px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={chaptersRead}
          onChange={(e) => setChaptersRead(Number(e.target.value))}
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Add Manga
      </button>
    </form>
  );
};

export default AddMangaForm;

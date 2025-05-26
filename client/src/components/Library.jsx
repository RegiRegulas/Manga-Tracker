// client/src/components/Library.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Library = ({ refreshFlag }) => {
  const [mangaList, setMangaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchManga = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/manga', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMangaList(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load manga');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManga();
  }, [refreshFlag]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4 flex flex-wrap gap-4">
      {mangaList.length === 0 ? (
        <p>No manga tracked yet.</p>
      ) : (
        mangaList.map((manga) => (
          <div
            key={manga.id}
            className="w-full sm:w-64 bg-white rounded-xl shadow-md p-4"
          >
            <h3 className="text-lg font-semibold">{manga.title}</h3>
            <p className="text-sm text-gray-600">Status: {manga.status}</p>
            <p className="text-sm text-gray-600">Chapters Read: {manga.chaptersRead}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default Library;

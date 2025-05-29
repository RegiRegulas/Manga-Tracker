import React, { useEffect, useState } from "react";
import axios from "axios";

const Library = ({ refreshFlag }) => {
  const [mangaList, setMangaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [filteredList, setFilteredList] = useState([]);
  const [editingManga, setEditingManga] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    status: "",
    chaptersRead: "",
  });

  const fetchManga = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/manga", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMangaList(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load manga");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManga();
  }, [refreshFlag]);

  useEffect(() => {
    let filtered = mangaList;

    if (statusFilter !== "All") {
      filtered = filtered.filter((manga) => manga.status === statusFilter);
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter((manga) =>
        manga.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredList(filtered);
  }, [searchTerm, statusFilter, mangaList]);

  const handleEditClick = (manga) => {
    setEditingManga(manga);
    setFormData({
      title: manga.title,
      status: manga.status,
      chaptersRead: manga.chaptersRead.toString(),
    });
    setError("");
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this manga?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/manga/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchManga();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete manga");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/manga/${editingManga.id}`,
        {
          title: formData.title,
          status: formData.status,
          chaptersRead: Number(formData.chaptersRead),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEditingManga(null);
      fetchManga();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update manga");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <p className="text-white">Loading...</p>;
  if (error && !editingManga) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white mb-4">My Library</h1>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
        <input
          type="text"
          placeholder="Search manga by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-md w-full sm:w-1/2 bg-gray-800 text-white placeholder-gray-400"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-md bg-gray-800 text-white"
        >
          <option className="text-black">All</option>
          <option className="text-black">Plan to Read</option>
          <option className="text-black">Reading</option>
          <option className="text-black">Completed</option>
        </select>
      </div>

      <div className="p-4 flex flex-wrap gap-4">
        {filteredList.length === 0 ? (
          <p className="text-white">No manga matched your search.</p>
        ) : (
          filteredList.map((manga) => (
            <div
              key={manga.id}
              className="w-full sm:w-64 bg-gray-800 rounded-xl shadow-md p-4 text-white"
            >
              <h3 className="text-lg font-semibold">{manga.title}</h3>
              <p className="text-sm text-gray-300">Status: {manga.status}</p>
              <p className="text-sm text-gray-300">
                Chapters Read: {manga.chaptersRead}
              </p>

              <div className="mt-3 flex gap-2">
                <button
                  className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded"
                  onClick={() => handleEditClick(manga)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  onClick={() => handleDeleteClick(manga.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {editingManga && (
        <form
          onSubmit={handleEditSubmit}
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
              onChange={handleInputChange}
              className="w-full border border-gray-700 rounded px-3 py-2 bg-gray-800 text-white"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-gray-300">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
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
              onChange={handleInputChange}
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
              onClick={() => {
                setEditingManga(null);
                setError("");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Library;
